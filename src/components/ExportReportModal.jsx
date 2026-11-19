import React from 'react';
import { CloseIcon, DownloadReportIcon } from './Icons';

export const ExportReportModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Invoice,Time,Customer,Items,Total,Payment,Status\n"
      + data.recentInvoices.map(e => `${e.id},${e.time},${e.customer},${e.items},${e.total},${e.payment},${e.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Prestige_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Export Sales Report</h2>
            <p className="card-subtitle">Generate boutique summary statement</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div className="pos-cart-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Boutique:</span>
              <span style={{ fontWeight: 600 }}>Prestige Perfume Studio · Main boutique</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Reporting Period:</span>
              <span style={{ fontWeight: 600 }}>Wednesday, 28 October 2026</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Daily Revenue:</span>
              <span style={{ fontWeight: 700, color: 'var(--green-trend)' }}>$4,820.50</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Completed Transactions:</span>
              <span style={{ fontWeight: 600 }}>36 invoices</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stock Alerts:</span>
              <span style={{ fontWeight: 600, color: 'var(--red-alert)' }}>5 items require reorder</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="action-btn-outline" onClick={onClose}>
            Close
          </button>
          <button 
            type="button" 
            className="action-btn-primary" 
            onClick={handleDownloadCSV}
            style={{ padding: '10px 22px' }}
          >
            <DownloadReportIcon className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
