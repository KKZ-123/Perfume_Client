import React from 'react';
import { LogoutIcon, CloseIcon } from './Icons';

export const LogoutModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card logout-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logout-modal-icon-badge">
              <LogoutIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '20px' }}>Sign Out of POS</h2>
              <p className="card-subtitle">End current cashier shift</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="logout-modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '18px' }}>
            Are you sure you want to log out, <strong>{user?.name || 'Aye Chan'}</strong>? Your register shift session will be closed safely.
          </p>

          <div className="pos-cart-list" style={{ padding: '12px 14px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Logged In As:</span>
              <span style={{ fontWeight: 600 }}>{user?.name} ({user?.role})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Terminal:</span>
              <span style={{ fontWeight: 600 }}>{user?.terminal || 'POS-REG-01'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              className="action-btn-outline" 
              onClick={onClose}
              style={{ padding: '10px 18px' }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="action-btn-logout-confirm"
              onClick={onConfirm}
            >
              <LogoutIcon className="w-4 h-4" />
              <span>Confirm Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
