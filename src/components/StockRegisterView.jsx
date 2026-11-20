import React, { useState } from 'react';
import { PlusIcon, BoxStockIcon } from './Icons';
import { StockRegisterModal } from './StockRegisterModal';

export const StockRegisterView = ({ catalog = [], onRestock, onRegisterStock }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Stock Register Modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('new'); // 'new' or 'restock'
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  const lowStockCount = catalog.filter(
    (item) => Number(item.stock ?? 0) <= Number(item.reorderLevel ?? 0)
  ).length;

  const filteredCatalog = catalog.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.gender && item.gender.toLowerCase().includes(q));

    if (filter === 'low') {
      return matchesSearch && Number(item.stock ?? 0) <= Number(item.reorderLevel ?? 0);
    }
    return matchesSearch;
  });

  const handleOpenRegisterModal = (mode = 'new', item = null) => {
    setModalMode(mode);
    setSelectedItemForModal(item);
    setIsRegisterModalOpen(true);
  };

  const handleStockSubmitted = (stockData) => {
    if (onRegisterStock) {
      onRegisterStock(stockData);
    } else if (stockData.isExisting && onRestock) {
      onRestock(stockData.existingId, stockData.stock);
    }
  };

  return (
    <div className="dashboard-content-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-eyebrow">Inventory Management · Main boutique</span>
          <h1 className="dashboard-title">Stock</h1>
        </div>

        <div className="header-actions">
          {/* Search perfume, SKU, category */}
          <input
            type="text"
            placeholder="Search perfume, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pos-input header-search-input"
          />

          {/* Filter Pills */}
          <div className="time-filter-group">
            <button
              type="button"
              className={`time-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All items ({catalog.length})
            </button>
            <button
              type="button"
              className={`time-pill ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              Low stock ({lowStockCount})
            </button>
          </div>

          {/* Register Stock Button */}
          <button 
            type="button"
            className="action-btn-primary"
            onClick={() => handleOpenRegisterModal('new')}
            title="Register new fragrance or receive inventory batch"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>
      </header>

      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="invoices-table stock-table">
            <thead>
              <tr>
                <th>Fragrance</th>
                <th className="col-sku">SKU</th>
                <th className="col-concentration">Concentration</th>
                <th className="col-size">Size</th>
                <th>Price</th>
                <th className="col-stock">In Stock</th>
                <th className="col-reorder">Reorder Level</th>
                <th className="col-status">Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <BoxStockIcon className="w-8 h-8" style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>
                        No inventory items found
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        {search
                          ? `No perfumes matching "${search}"`
                          : filter === 'low'
                            ? 'All fragrances are currently above their reorder level.'
                            : 'Your stock register has no registered items yet.'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRegisterModal('new')}
                        className="action-btn-primary"
                        style={{ marginTop: '6px', fontSize: '12px', padding: '6px 16px' }}
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>Register First Fragrance</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((item) => {
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock <= item.reorderLevel;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{item.name}</span>
                            {item.brand && (
                              <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', background: '#ede9fe', color: 'var(--purple-brand)', fontWeight: 600 }}>
                                {item.brand}
                              </span>
                            )}
                            {item.gender && (
                              <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', background: '#f3eef8', color: 'var(--purple-brand)', fontWeight: 600 }}>
                                {item.gender}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="col-sku" style={{ fontFamily: 'monospace', color: 'var(--purple-brand)', fontWeight: 600 }}>
                        {item.sku}
                      </td>
                      <td className="col-concentration">{item.concentration || '—'}</td>
                      <td className="col-size">{item.size || '—'}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>${Number(item.price || 0).toFixed(2)}</div>
                        {item.originalPrice !== undefined && Number(item.originalPrice) > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Orig: ${Number(item.originalPrice).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="col-stock" style={{ fontWeight: 700, fontSize: '14px' }}>
                        <span style={{ color: isOutOfStock ? 'var(--red-alert)' : isLowStock ? 'var(--amber-badge-text)' : 'inherit' }}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="col-reorder" style={{ color: 'var(--text-muted)' }}>{item.reorderLevel} units</td>
                      <td className="col-status">
                        {isOutOfStock ? (
                          <span className="stock-tag out">Out of stock</span>
                        ) : isLowStock ? (
                          <span className="stock-tag low">{item.stock} left</span>
                        ) : (
                          <span className="status-badge paid" style={{ fontSize: '11px' }}>In Stock</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenRegisterModal('restock', item)}
                          className="action-btn-outline"
                          style={{ padding: '4px 12px', fontSize: '11.5px' }}
                          title={`Restock inventory for ${item.name}`}
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Register Modal */}
      <StockRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        catalog={catalog}
        onRegisterStock={handleStockSubmitted}
        initialMode={modalMode}
        initialItem={selectedItemForModal}
      />
    </div>
  );
};
