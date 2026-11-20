import React, { useState, useEffect, useCallback } from 'react';
import { 
  DashboardIcon, 
  BoxStockIcon, 
  InvoiceIcon, 
  UsersIcon,
  CheckIcon,
  ChevronDownIcon
} from './components/Icons';
import { DashboardView } from './components/DashboardView';
import { StockRegisterView } from './components/StockRegisterView';
import { InvoicesView } from './components/InvoicesView';
import { StaffView } from './components/StaffView';
import { StaffDetailModal } from './components/StaffDetailModal';
import { ProfilePopover } from './components/ProfilePopover';
import { NewSaleModal } from './components/NewSaleModal';
import { ExportReportModal } from './components/ExportReportModal';
import { LogoutModal } from './components/LogoutModal';
import { LoginView } from './components/LoginView';
import { initialDashboardData, perfumeCatalog } from './data/mockData';
import { clearAuthTokens, getRefreshToken, isJwtExpired, forceLogout, fetchFullUserProfile } from './config/api';
import logoImg from './assets/logo.png';

export default function App() {
  // Authentication state (automatically checks if refresh token is expired on app load)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aurelia_pos_user');
      if (saved && saved !== 'null' && saved !== 'logged_out') {
        const user = JSON.parse(saved);
        const refreshToken =
          user?.refreshToken ||
          user?.refresh_token ||
          localStorage.getItem('pos_refresh_token');

        // If refresh token exists and is expired, auto logout immediately
        if (refreshToken && isJwtExpired(refreshToken)) {
          clearAuthTokens();
          return null;
        }
        return user;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [sessionExpiredReason, setSessionExpiredReason] = useState(null);
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [catalog, setCatalog] = useState(perfumeCatalog);
  
  // Modals state
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const [profileAnchorRect, setProfileAnchorRect] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [openPasswordDirectly, setOpenPasswordDirectly] = useState(false);

  // Sidebar compact (icon-only) & adjustable width state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('prestige_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    try {
      const saved = parseInt(localStorage.getItem('prestige_sidebar_width'), 10);
      if (!Number.isNaN(saved) && saved >= 200 && saved <= 340) {
        return saved;
      }
      return 250;
    } catch {
      return 250;
    }
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsProfilePopoverOpen(false);
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('prestige_sidebar_collapsed', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const handleBrandClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      toggleSidebarCollapsed();
    } else {
      setCurrentNav('dashboard');
    }
  }, [toggleSidebarCollapsed]);

  const handleSidebarResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (moveEvent.clientX < 140) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
        const clampedWidth = Math.min(340, Math.max(200, moveEvent.clientX));
        setSidebarWidth(clampedWidth);
      }
    };

    const handleMouseUp = (upEvent) => {
      setIsResizingSidebar(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const collapsed = upEvent.clientX < 140;
      try {
        localStorage.setItem('prestige_sidebar_collapsed', String(collapsed));
        if (!collapsed) {
          const finalWidth = Math.min(340, Math.max(200, upEvent.clientX));
          localStorage.setItem('prestige_sidebar_width', String(finalWidth));
        }
      } catch {
        // ignore storage errors
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Sync full user profile info (Name, Email, User ID, Role, Initials) from backend
  const handleUserProfileSynced = React.useCallback((updatedData) => {
    if (!updatedData) return;
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updatedData };
      try {
        const saved = localStorage.getItem('aurelia_pos_user');
        if (saved && saved !== 'null' && saved !== 'logged_out') {
          localStorage.setItem('aurelia_pos_user', JSON.stringify(nextUser));
        }
      } catch {
        // ignore storage errors
      }
      return nextUser;
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    fetchFullUserProfile(currentUser).then((fullData) => {
      if (active && fullData) {
        handleUserProfileSynced(fullData);
      }
    });
    return () => {
      active = false;
    };
  }, [currentUser?.userid]);

  const handleToggleProfilePopover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setProfileAnchorRect(rect);
    setIsProfilePopoverOpen((prev) => !prev);
  };
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Sync user state on token refresh or session expiration
  useEffect(() => {
    const handleTokenReissued = (event) => {
      const newToken = event.detail?.accessToken;
      if (newToken) {
        setCurrentUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            accessToken: newToken,
            access_token: newToken
          };
        });
      }
    };

    // Auto logout and show login page when session/refresh token expires
    const handleSessionExpired = (event) => {
      setIsLogoutModalOpen(false);
      setIsSaleModalOpen(false);
      setIsExportModalOpen(false);
      setIsProfilePopoverOpen(false);
      setIsProfileModalOpen(false);
      clearAuthTokens();
      setCurrentUser(null);
      setCurrentNav('dashboard');
      const reason = event.detail?.error || 'Your refresh token has expired. Please sign in again.';
      setSessionExpiredReason(reason);
      showToast(reason);
    };

    window.addEventListener('pos:token-reissued', handleTokenReissued);
    window.addEventListener('pos:session-expired', handleSessionExpired);

    // Background interval check for refresh token expiration (every 15 seconds)
    const expiryInterval = setInterval(() => {
      const currentRefresh = getRefreshToken();
      if (currentRefresh && isJwtExpired(currentRefresh)) {
        forceLogout('Your refresh token has expired. Please sign in again.');
      }
    }, 15000);

    return () => {
      clearInterval(expiryInterval);
      window.removeEventListener('pos:token-reissued', handleTokenReissued);
      window.removeEventListener('pos:session-expired', handleSessionExpired);
    };
  }, []);

  // Login handler
  const handleLogin = (user, remember) => {
    setCurrentUser(user);
    setCurrentNav('dashboard'); // Always display dashboard as default page upon successful login
    setSessionExpiredReason(null);
    if (remember) {
      localStorage.setItem('aurelia_pos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aurelia_pos_user');
    }
    showToast(`Welcome back, ${user.name}! Terminal active.`);
  };

  // Logout handler
  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    setIsProfilePopoverOpen(false);
    setIsProfileModalOpen(false);
    setCurrentUser(null);
    setCurrentNav('dashboard');
    clearAuthTokens();
    showToast('Signed out of POS session safely.');
  };

  // Handler for completing a sale in the POS
  const handleCompleteSale = ({ customer, item, quantity, total, payment }) => {
    // 1. Update stock in catalog
    setCatalog(prev => prev.map(p => {
      if (p.id === item.id) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));

    // 2. Format invoice ID
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const newInvoiceId = `INV-2026-0${randomSeq}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newInvoice = {
      id: newInvoiceId,
      time: timeStr,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customer: customer || 'Walk-in',
      items: quantity,
      total: `$${total.toFixed(2)}`,
      rawTotal: total,
      payment: payment,
      status: 'Paid',
      lineItems: [
        {
          name: item.name,
          size: `${item.concentration ? item.concentration.split(' ')[0] : 'EDP'} ${item.size || '50 ml'}`,
          qty: quantity,
          price: item.price,
          total: total
        }
      ]
    };


    // 3. Update dashboard metrics & recent invoices
    setDashboardData(prev => {
      const currentSalesNum = parseFloat(prev.metrics.todaySales.value.replace(/[^0-9.-]+/g, ""));
      const newTotalSales = currentSalesNum + total;
      const currentInvoicesNum = parseInt(prev.metrics.invoices.value, 10);
      const newTotalInvoices = currentInvoicesNum + 1;

      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          todaySales: {
            ...prev.metrics.todaySales,
            value: `$${newTotalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          },
          invoices: {
            ...prev.metrics.invoices,
            value: String(newTotalInvoices)
          }
        },
        recentInvoices: [newInvoice, ...prev.recentInvoices.slice(0, 4)]
      };
    });

    showToast(`Transaction complete! ${quantity}x ${item.name} ($${total.toFixed(2)})`);
  };

  // Handler for creating a new boutique invoice from Invoices view
  const handleAddInvoice = (newInvoiceData) => {
    // 1. Update stock in catalog for any lineItems
    if (Array.isArray(newInvoiceData.lineItems)) {
      setCatalog(prev => prev.map(p => {
        const line = newInvoiceData.lineItems.find(li => li.perfumeId === p.id || li.name === p.name);
        if (line && line.qty > 0) {
          return { ...p, stock: Math.max(0, p.stock - line.qty) };
        }
        return p;
      }));
    }

    const totalNum = typeof newInvoiceData.rawTotal === 'number'
      ? newInvoiceData.rawTotal
      : (typeof newInvoiceData.total === 'number' 
          ? newInvoiceData.total 
          : parseFloat(String(newInvoiceData.total || '').replace(/[^0-9.-]+/g, '')) || 0);

    // 2. Update dashboard metrics & prepend invoice
    setDashboardData(prev => {
      const currentSalesNum = parseFloat(prev.metrics.todaySales.value.replace(/[^0-9.-]+/g, "")) || 0;
      const isPaid = (newInvoiceData.status || '').toLowerCase() === 'paid';
      const newTotalSales = isPaid ? currentSalesNum + totalNum : currentSalesNum;
      const currentInvoicesNum = parseInt(prev.metrics.invoices.value, 10) || 0;
      const newTotalInvoices = currentInvoicesNum + 1;

      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          todaySales: {
            ...prev.metrics.todaySales,
            value: `$${newTotalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          },
          invoices: {
            ...prev.metrics.invoices,
            value: String(newTotalInvoices)
          }
        },
        recentInvoices: [newInvoiceData, ...prev.recentInvoices]
      };
    });

    showToast(`Invoice ${newInvoiceData.id} created successfully (${newInvoiceData.status})!`);
  };

  // Handler for restocking
  const handleRestock = (itemId, count = 10) => {
    setCatalog(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: item.stock + count };
      }
      return item;
    }));
    showToast(`Restocked +${count} units successfully!`);
  };

  // Handler for registering new stock or receiving incoming stock batch
  const handleRegisterStock = (stockData) => {
    if (stockData.isExisting && stockData.existingId) {
      const addedQty = parseInt(stockData.stock, 10) || 0;
      setCatalog(prev => prev.map(item => {
        if (item.id === stockData.existingId) {
          return {
            ...item,
            stock: item.stock + addedQty,
            originalPrice: stockData.originalPrice !== undefined && stockData.originalPrice !== '' ? parseFloat(stockData.originalPrice) : item.originalPrice,
            price: stockData.price !== undefined && stockData.price !== '' ? parseFloat(stockData.price) : item.price,
            reorderLevel: stockData.reorderLevel !== undefined && stockData.reorderLevel !== '' ? parseInt(stockData.reorderLevel, 10) : item.reorderLevel
          };
        }
        return item;
      }));
      showToast(`Stock updated: +${addedQty} units added to ${stockData.name}!`);
    } else {
      const newId = stockData.id || `perf-${Date.now()}`;
      const newItem = {
        id: newId,
        syskey: stockData.syskey || '',
        name: stockData.name.trim(),
        brand: stockData.brand || '',
        brand_syskey: stockData.brand_syskey || '',
        concentration: stockData.concentration || stockData.type || 'EDP',
        type: stockData.type || stockData.concentration || 'EDP',
        size: stockData.size || `${stockData.size_ml || 100} ml`,
        size_ml: stockData.size_ml || 100,
        sku: stockData.sku?.trim() || stockData.code || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        code: stockData.code || stockData.sku?.trim(),
        originalPrice: stockData.original_price !== undefined ? parseFloat(stockData.original_price) : (stockData.originalPrice !== undefined && stockData.originalPrice !== '' ? parseFloat(stockData.originalPrice) : 0),
        price: stockData.sell_price !== undefined ? parseFloat(stockData.sell_price) : (parseFloat(stockData.price) || 0),
        sell_price: stockData.sell_price !== undefined ? parseFloat(stockData.sell_price) : (parseFloat(stockData.price) || 0),
        stock: stockData.qty !== undefined ? parseInt(stockData.qty, 10) : (parseInt(stockData.stock, 10) || 0),
        qty: stockData.qty !== undefined ? parseInt(stockData.qty, 10) : (parseInt(stockData.stock, 10) || 0),
        reorderLevel: parseInt(stockData.reorderLevel, 10) || 6,
        discount_percent: stockData.discount_percent || 0,
        category: stockData.category || 'Woody / Oriental',
        gender: stockData.gender || 'Male',
        status: stockData.status || 'Active',
        notes: stockData.notes?.trim() || 'Signature boutique fragrance'
      };
      setCatalog(prev => [newItem, ...prev]);
      showToast(`Registered "${newItem.name}" (${newItem.stock} units) into stock catalog!`);
    }
  };

  // If not logged in, render the luxury login screen
  if (!currentUser) {
    return (
      <>
        <LoginView onLogin={handleLogin} sessionExpiredMessage={sessionExpiredReason} />
        {toastMessage && (
          <div className="toast-notification">
            <CheckIcon className="w-5 h-5" style={{ color: 'var(--gold-accent)' }} />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`app-container ${isSidebarCollapsed ? 'sidebar-is-collapsed' : ''} ${isResizingSidebar ? 'is-resizing-sidebar' : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      {/* Dark Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-top-container">
          <div className="sidebar-brand-section">
            {/* Brand Logo & Name (click to expand/collapse sidebar on desktop) */}
            <div
              className="brand-wrapper"
              onClick={handleBrandClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBrandClick();
                }
              }}
              role="button"
              tabIndex={0}
              title={isSidebarCollapsed ? 'Click logo to expand menu' : 'Click logo to collapse menu'}
            >
              <div className="brand-icon-box prestige-sidebar-logo-box">
                <img src={logoImg} alt="Prestige Logo" className="brand-logo-img" />
              </div>
              <div className="brand-text">
                <span className="brand-name">Prestige</span>
                <span className="brand-sub">PERFUME STUDIO</span>
              </div>
            </div>

            {/* Mobile / Tablet Header User Bar */}
            <div className="mobile-header-user">
              <div 
                className="user-avatar" 
                data-profile-trigger="true"
                style={{ background: currentUser.avatarBg || 'var(--purple-brand)' }}
                onClick={handleToggleProfilePopover}
                title="View user profile"
              >
                {currentUser.initials || 'AC'}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${currentNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentNav('dashboard')}
              title="Dashboard"
            >
              <DashboardIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${currentNav === 'stock' ? 'active' : ''}`}
              onClick={() => setCurrentNav('stock')}
              title="Stock (4 low)"
            >
              <BoxStockIcon className="w-5 h-5" />
              <span>Stock</span>
              <span className="nav-badge">4 low</span>
            </button>

            <button
              className={`nav-item ${currentNav === 'invoices' ? 'active' : ''}`}
              onClick={() => setCurrentNav('invoices')}
              title="Invoices"
            >
              <InvoiceIcon className="w-5 h-5" />
              <span>Invoices</span>
            </button>

            <button
              className={`nav-item ${currentNav === 'staff' ? 'active' : ''}`}
              onClick={() => setCurrentNav('staff')}
              title="Staff"
            >
              <UsersIcon className="w-5 h-5" />
              <span>Staff</span>
            </button>
          </nav>
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="sidebar-footer">
          <div 
            className={`user-profile-card ${isProfilePopoverOpen ? 'active' : ''}`}
            data-profile-trigger="true"
            onClick={handleToggleProfilePopover}
            style={{ cursor: 'pointer' }}
            title="Click to view user profile info"
          >
            <div className="user-info-group">
              <div 
                className="user-avatar" 
                style={{ background: currentUser.avatarBg || 'var(--purple-brand)' }}
              >
                {currentUser.initials || 'AC'}
              </div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </div>
            <span className={`user-profile-chevron ${isProfilePopoverOpen ? 'open' : ''}`}>
              <ChevronDownIcon size={15} />
            </span>
          </div>
        </div>
      </aside>

      {/* Desktop Drag-to-Resize / Collapse Handle */}
      <div
        className={`sidebar-resize-handle ${isResizingSidebar ? 'active' : ''}`}
        onMouseDown={handleSidebarResizeStart}
        onDoubleClick={toggleSidebarCollapsed}
        title="Drag to adjust menu width · Double-click to collapse/expand"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />

      {/* Main Content View Container */}
      <main className="main-content">
        {currentNav === 'dashboard' && (
          <DashboardView
            data={dashboardData}
            onOpenStock={() => setCurrentNav('stock')}
            onOpenInvoices={() => setCurrentNav('invoices')}
            onNewSale={() => setIsSaleModalOpen(true)}
            onExportReport={() => setIsExportModalOpen(true)}
          />
        )}

        {currentNav === 'stock' && (
          <StockRegisterView
            catalog={catalog}
            onRestock={handleRestock}
            onRegisterStock={handleRegisterStock}
          />
        )}

        {currentNav === 'invoices' && (
          <InvoicesView
            invoices={dashboardData.recentInvoices}
            catalog={catalog}
            onAddInvoice={handleAddInvoice}
          />
        )}

        {currentNav === 'staff' && (
          <StaffView currentUser={currentUser} />
        )}
      </main>

      {/* Compact Profile Info Popover */}
      <ProfilePopover
        isOpen={isProfilePopoverOpen}
        onClose={() => setIsProfilePopoverOpen(false)}
        anchorRect={profileAnchorRect}
        user={currentUser}
        onUserUpdated={handleUserProfileSynced}
        onOpenChangePassword={() => {
          setOpenPasswordDirectly(true);
          setIsProfileModalOpen(true);
        }}
        onSignOut={() => setIsLogoutModalOpen(true)}
      />

      {/* User Profile / Change Password Modal */}
      <StaffDetailModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setOpenPasswordDirectly(false);
        }}
        staff={currentUser}
        currentUser={currentUser}
        title="User Profile"
        initialChangePassword={openPasswordDirectly}
        onUserUpdated={handleUserProfileSynced}
      />

      {/* New Sale POS Ring-up Modal */}
      <NewSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        catalog={catalog}
        onCompleteSale={handleCompleteSale}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={dashboardData}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        user={currentUser}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckIcon className="w-5 h-5" style={{ color: 'var(--gold-accent)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
