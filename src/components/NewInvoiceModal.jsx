import React, { useState } from 'react';
import { CloseIcon, CheckIcon, PlusIcon, TrashIcon } from './Icons';

// Helper to generate random invoice ID
const generateInvoiceId = () => {
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return `INV-2026-0${randomSeq}`;
};

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDisplayDate = (issueDate) => {
  try {
    if (issueDate) {
      const parts = issueDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
  } catch {
    // fallback
  }
  const now = new Date();
  return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const NewInvoiceModal = ({ isOpen, onClose, catalog = [], onCreateInvoice }) => {
  const [invoiceId, setInvoiceId] = useState(generateInvoiceId);
  const [customer, setCustomer] = useState('Walk-in');
  const [customerContact, setCustomerContact] = useState('');
  const [issueDate, setIssueDate] = useState(getTodayDate);
  const [issueTime, setIssueTime] = useState(getCurrentTime);
  const [status, setStatus] = useState('Paid'); // 'Paid', 'Unpaid', 'Refund'
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [notes, setNotes] = useState('');

  // Items list
  const [items, setItems] = useState(() => [
    {
      id: 1,
      perfumeId: catalog[0]?.id || '',
      qty: 1,
      price: catalog[0]?.price || 0
    }
  ]);

  if (!isOpen) return null;

  // Add line item
  const handleAddItem = () => {
    const availablePerfume = catalog.find(p => p.stock > 0) || catalog[0];
    setItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        perfumeId: availablePerfume?.id || '',
        qty: 1,
        price: availablePerfume?.price || 0
      }
    ]);
  };

  // Remove line item
  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // Update line item perfume
  const handlePerfumeChange = (id, perfumeId) => {
    const selected = catalog.find(p => p.id === perfumeId);
    setItems(prev => prev.map(it => {
      if (it.id === id) {
        return {
          ...it,
          perfumeId: perfumeId,
          price: selected ? selected.price : it.price
        };
      }
      return it;
    }));
  };

  // Update item quantity
  const handleQtyChange = (id, qty) => {
    const validQty = Math.max(1, parseInt(qty, 10) || 1);
    setItems(prev => prev.map(it => it.id === id ? { ...it, qty: validQty } : it));
  };

  // Update item price
  const handlePriceChange = (id, price) => {
    const validPrice = Math.max(0, parseFloat(price) || 0);
    setItems(prev => prev.map(it => it.id === id ? { ...it, price: validPrice } : it));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, it) => sum + (it.qty * it.price), 0);
  const tax = subtotal * 0.05; // 5% commercial tax
  const total = subtotal; // boutique price is tax-inclusive or standard
  const totalItemsCount = items.reduce((sum, it) => sum + it.qty, 0);

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.trim()) return;

    // Prepare line items
    const lineItems = items.map(it => {
      const perf = catalog.find(p => p.id === it.perfumeId) || {};
      const concentration = perf.concentration ? perf.concentration.split(' ')[0] : 'EDP';
      return {
        perfumeId: it.perfumeId,
        name: perf.name || 'Custom Fragrance',
        size: `${concentration} ${perf.size || '50 ml'}`,
        qty: it.qty,
        price: it.price,
        total: +(it.qty * it.price).toFixed(2)
      };
    });

    // Format display date
    const displayDate = formatDisplayDate(issueDate);

    const newInvoice = {
      id: invoiceId.trim() || generateInvoiceId(),
      time: issueTime || getCurrentTime(),
      date: displayDate,
      customer: customer.trim(),
      customerContact: customerContact.trim(),
      items: totalItemsCount,
      total: `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawTotal: total,
      subtotal: subtotal,
      tax: tax,
      payment: paymentMethod,
      status: status, // 'Paid', 'Unpaid', or 'Refund'
      notes: notes.trim(),
      lineItems: lineItems
    };

    if (onCreateInvoice) {
      onCreateInvoice(newInvoice);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div 
        className="modal-card new-invoice-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="header-eyebrow" style={{ fontSize: '11px' }}>Boutique Sales · Invoicing</span>
            <h2 className="modal-title" style={{ fontSize: '20px', marginTop: '2px' }}>New Invoice</h2>
            <p className="card-subtitle">Generate and register customer sales invoice</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Top Invoice Metadata Grid */}
          <div className="modal-form-grid-3">
            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Invoice Number</label>
              <input
                type="text"
                className="pos-input"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="INV-2026-0XXXX"
                required
                style={{ fontWeight: 600, fontFamily: 'monospace' }}
              />
            </div>

            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Invoice Date</label>
              <input
                type="date"
                className="pos-input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Time</label>
              <input
                type="time"
                className="pos-input"
                value={issueTime}
                onChange={(e) => setIssueTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Customer Details */}
          <div className="modal-form-grid-2">
            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="pos-label">Customer Name</label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomer('Walk-in')}
                    className="time-pill"
                    style={{ padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Walk-in
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomer('VIP Client')}
                    className="time-pill"
                    style={{ padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    VIP
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="pos-input"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Daw Thin, Walk-in, Ko Zaw"
                required
              />
            </div>

            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Phone / Contact (Optional)</label>
              <input
                type="text"
                className="pos-input"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="09... or email"
              />
            </div>
          </div>

          {/* Status & Payment Method */}
          <div className="modal-form-grid-2">
            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Payment Status</label>
              <select
                className="pos-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Paid">✓ Paid</option>
                <option value="Unpaid">⏳ Unpaid</option>
                <option value="Refund">↩ Refund</option>
              </select>
            </div>

            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label">Payment Method</label>
              <select
                className="pos-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Mobile pay">Mobile Pay (KBZPay / Wave)</option>
                <option value="Bank transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="pos-label" style={{ marginBottom: 0 }}>Fragrance Items</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="action-btn-outline"
                style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="invoice-items-table-wrapper" style={{ border: '1px solid #ebe6f0', borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '440px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#faf8fc', borderBottom: '1px solid #ebe6f0', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Fragrance</th>
                    <th style={{ padding: '8px 8px', width: '80px', fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: '8px 8px', width: '90px', fontWeight: 600 }}>Price ($)</th>
                    <th style={{ padding: '8px 12px', width: '90px', fontWeight: 600, textAlign: 'right' }}>Total</th>
                    <th style={{ padding: '8px 8px', width: '36px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const selectedPerf = catalog.find(p => p.id === item.perfumeId);
                    const lineTotal = (item.qty * item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f2edf6' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <select
                            className="pos-select"
                            value={item.perfumeId}
                            onChange={(e) => handlePerfumeChange(item.id, e.target.value)}
                            style={{ padding: '6px 10px', fontSize: '13px' }}
                          >
                            {catalog.length === 0 ? (
                              <option value="" disabled>No fragrances registered</option>
                            ) : (
                              catalog.map((perf) => (
                                <option key={perf.id} value={perf.id}>
                                  {perf.name} ({perf.size}) - ${Number(perf.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} [{Number(perf.stock || 0).toLocaleString('en-US')} in stock]
                                </option>
                              ))
                            )}
                          </select>
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <input
                            type="number"
                            min="1"
                            max={selectedPerf?.stock > 0 ? selectedPerf.stock : 99}
                            className="pos-input"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                            style={{ padding: '6px 8px', fontSize: '13px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pos-input"
                            value={item.price}
                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                          ${lineTotal}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--red-alert)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                              }}
                              title="Remove item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes field */}
          <div className="pos-form-group" style={{ marginBottom: '16px' }}>
            <label className="pos-label">Notes / Remarks (Optional)</label>
            <input
              type="text"
              className="pos-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Gift packaging requested, customer discount, etc."
            />
          </div>

          {/* Financial Summary Card */}
          <div className="pos-cart-list" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Fragrance Items:</span>
              <span style={{ fontWeight: 600 }}>{Number(totalItemsCount).toLocaleString('en-US')} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Commercial Tax (5% Incl.):</span>
              <span>${tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e8e2ee', paddingTop: '10px', marginTop: '6px' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '16px', display: 'block' }}>Invoice Total</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Status: {status} · Method: {paymentMethod}</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '22px', color: 'var(--purple-brand)' }}>
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="action-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="action-btn-primary" style={{ padding: '10px 24px' }}>
              <CheckIcon className="w-4 h-4" />
              <span>Create Invoice (${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
