import React, { useState } from 'react';
import { CloseIcon, CheckIcon } from './Icons';

export const NewSaleModal = ({ isOpen, onClose, catalog, onCompleteSale }) => {
  const [customer, setCustomer] = useState('Walk-in');
  const [selectedPerfumeId, setSelectedPerfumeId] = useState(catalog[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Card');

  if (!isOpen) return null;

  const selectedItem = catalog.find((p) => p.id === selectedPerfumeId) || catalog[0];
  const total = (selectedItem ? selectedItem.price * quantity : 0).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    onCompleteSale({
      customer: customer || 'Walk-in',
      item: selectedItem,
      quantity: Number(quantity),
      total: Number(total),
      payment: paymentMethod
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New POS Transaction</h2>
            <p className="card-subtitle">Ring up customer fragrance order</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pos-form-group">
            <label className="pos-label">Customer Name</label>
            <input
              type="text"
              className="pos-input"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Walk-in, Hnin Wai, etc."
              required
            />
          </div>

          <div className="pos-form-group">
            <label className="pos-label">Select Fragrance</label>
            <select
              className="pos-select"
              value={selectedPerfumeId}
              onChange={(e) => setSelectedPerfumeId(e.target.value)}
            >
              {catalog.map((item) => (
                <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                  {item.name} {item.concentration.split(' ')[0]} {item.size} — ${item.price.toFixed(2)} ({item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-grid-2">
            <div className="pos-form-group">
              <label className="pos-label">Quantity</label>
              <input
                type="number"
                min="1"
                max={selectedItem?.stock || 10}
                className="pos-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="pos-form-group">
              <label className="pos-label">Payment Method</label>
              <select
                className="pos-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Mobile pay">Mobile Pay (KBZPay / Wave)</option>
              </select>
            </div>
          </div>

          <div className="pos-cart-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fragrance Item:</span>
              <span style={{ fontWeight: 600 }}>{selectedItem?.name} ({selectedItem?.size})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Unit Price:</span>
              <span>${selectedItem?.price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8e2ee', paddingTop: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Amount:</span>
              <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--purple-brand)' }}>${total}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="action-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="action-btn-primary" style={{ padding: '10px 24px' }}>
              <CheckIcon className="w-4 h-4" />
              <span>Complete Sale (${total})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
