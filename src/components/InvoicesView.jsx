import React, { useState, useEffect, useRef } from 'react';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';
import { NewInvoiceModal } from './NewInvoiceModal';
import { PrinterIcon, PlusIcon, ChevronDownIcon, CheckIcon } from './Icons';

export const InvoicesView = ({ invoices = [], catalog = [], onAddInvoice }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid', 'refund'
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Status options for the dropdown button
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'refund', label: 'Refund' }
  ];

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Compute count for each status
  const getStatusCount = (statusVal) => {
    if (statusVal === 'all') return invoices.length;
    const sLower = statusVal.toLowerCase();
    return invoices.filter((inv) => {
      const invStatus = (inv.status || '').toLowerCase();
      if (sLower === 'unpaid') {
        return invStatus === 'unpaid' || invStatus === 'pending';
      }
      if (sLower === 'refund') {
        return invStatus === 'refund' || invStatus === 'refunded';
      }
      if (sLower === 'paid') {
        return invStatus === 'paid';
      }
      return invStatus === sLower;
    }).length;
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      (inv.payment && inv.payment.toLowerCase().includes(q)) ||
      (inv.total && inv.total.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const f = filter.toLowerCase();
    if (f === 'all') return true;

    const invStatus = (inv.status || '').toLowerCase();
    if (f === 'unpaid') {
      return invStatus === 'unpaid' || invStatus === 'pending';
    }
    if (f === 'refund') {
      return invStatus === 'refund' || invStatus === 'refunded';
    }
    if (f === 'paid') {
      return invStatus === 'paid';
    }
    return invStatus === f;
  });

  // Current active option
  const activeOption = statusOptions.find(opt => opt.value === filter) || statusOptions[0];

  // Format status badge
  const renderStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    let badgeClass = 'status-badge';
    if (s === 'paid') {
      badgeClass += ' paid';
    } else if (s === 'unpaid' || s === 'pending') {
      badgeClass += ' unpaid';
    } else if (s === 'refund' || s === 'refunded') {
      badgeClass += ' refund';
    } else {
      badgeClass += ` ${s}`;
    }

    return (
      <span className={badgeClass}>
        {status}
      </span>
    );
  };

  const handleCreateInvoice = (newInv) => {
    if (onAddInvoice) {
      onAddInvoice(newInv);
    }
    // Optionally auto-open the receipt for newly generated invoice
    setSelectedInvoice(newInv);
  };

  return (
    <div className="dashboard-content-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-eyebrow">Billing & Transactions · Main boutique</span>
          <h1 className="dashboard-title">Invoices</h1>
        </div>

        <div className="header-actions">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pos-input header-search-input"
          />

          {/* Dropdown Button for 'all, paid, unpaid, refund' */}
          <div className="status-dropdown-wrapper" ref={dropdownRef}>
            <button
              type="button"
              className={`status-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              title="Filter invoices by status"
            >
              <div className="status-dropdown-trigger-content">
                <span className={`status-dot dot-${activeOption.value}`} />
                <span className="status-dropdown-label">
                  Status: <strong className="status-dropdown-val">{activeOption.label}</strong>
                </span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 chevron-indicator ${isDropdownOpen ? 'open' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="status-dropdown-menu">
                <div className="status-dropdown-header">Filter by Status</div>
                {statusOptions.map((opt) => {
                  const isSelected = filter.toLowerCase() === opt.value.toLowerCase();
                  const count = getStatusCount(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`status-dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setFilter(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="status-item-left">
                        <span className={`status-dot dot-${opt.value}`} />
                        <span className="status-item-name">{opt.label}</span>
                      </div>
                      <div className="status-item-right">
                        <span className="status-count-pill">{count}</span>
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 status-check-icon" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Invoice Button */}
          <button
            type="button"
            className="action-btn-primary"
            onClick={() => setIsNewInvoiceOpen(true)}
            title="Create a new boutique invoice"
            style={{
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </header>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="invoices-table billing-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th className="col-time">Time</th>
                <th>Customer</th>
                <th className="col-items">Items</th>
                <th>Total</th>
                <th className="col-payment">Payment</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
                    No invoices found matching status "<strong>{activeOption.label}</strong>"
                    {search ? ` and search "${search}"` : ''}.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td 
                      className="invoice-id-cell invoice-id-clickable"
                      title="Click to view receipt"
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      {inv.id}
                    </td>
                    <td className="invoice-time-cell col-time">{inv.time}</td>
                    <td className="invoice-customer-cell">{inv.customer}</td>
                    <td className="invoice-items-cell col-items">{inv.items}</td>
                    <td className="invoice-total-cell">{inv.total}</td>
                    <td className="invoice-payment-cell col-payment">{inv.payment}</td>
                    <td>
                      {renderStatusBadge(inv.status)}
                    </td>
                    <td>
                      <button 
                        className="action-btn-outline receipt-action-btn" 
                        style={{ padding: '5px 12px', fontSize: '11.5px' }}
                        onClick={() => setSelectedInvoice(inv)}
                        title={`Open receipt for ${inv.id}`}
                      >
                        <PrinterIcon className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Creation Modal Form */}
      {isNewInvoiceOpen && (
        <NewInvoiceModal
          isOpen={isNewInvoiceOpen}
          onClose={() => setIsNewInvoiceOpen(false)}
          catalog={catalog}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      {/* Invoice Receipt Preview & Print Modal */}
      <InvoiceReceiptModal
        isOpen={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
};
