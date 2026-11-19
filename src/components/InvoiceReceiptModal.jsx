import React, { useState } from 'react';
import { CloseIcon, PrinterIcon } from './Icons';
import logoImg from '../assets/logo.png';

const MOCK_INVOICE_ITEMS = {
  'INV-2026-01284': [
    { name: 'Noir Santal', size: 'EDP 50 ml', qty: 2, price: 128.00, total: 256.00 },
    { name: 'Jasmin Soleil', size: 'EDP 50 ml', qty: 1, price: 60.26, total: 60.26 },
  ],
  'INV-2026-01283': [
    { name: 'Noir Santal', size: 'EDP 50 ml', qty: 1, price: 128.00, total: 128.00 },
  ],
  'INV-2026-01282': [
    { name: 'Rose Éclat', size: 'EDP 30 ml', qty: 1, price: 74.00, total: 74.00 },
    { name: 'Amber Dusk', size: 'EDT 100 ml', qty: 1, price: 96.00, total: 96.00 },
  ],
  'INV-2026-01281': [
    { name: 'Velvet Iris', size: 'Extrait 50 ml', qty: 1, price: 145.00, total: 145.00 },
    { name: 'Rose Éclat', size: 'EDP 30 ml', qty: 2, price: 34.75, total: 69.50 },
  ],
  'INV-2026-01280': [
    { name: 'Rose Éclat', size: 'EDP 30 ml', qty: 1, price: 74.00, total: 74.00 },
  ],
};

export const InvoiceReceiptModal = ({ isOpen, onClose, invoice }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !invoice) return null;

  // Derive raw numeric total
  const rawTotal = invoice.rawTotal 
    ? Number(invoice.rawTotal) 
    : parseFloat(String(invoice.total || '').replace(/[^0-9.-]+/g, '')) || 0;

  // Subtotal and tax calculation (5% commercial tax included or broken down)
  const taxAmount = +(rawTotal * 0.05).toFixed(2);
  const subtotal = +(rawTotal - taxAmount).toFixed(2);

  // Line items
  const items = invoice.lineItems || MOCK_INVOICE_ITEMS[invoice.id] || [
    {
      name: 'Prestige Fragrance Flacon',
      size: '50 ml Eau de Parfum',
      qty: invoice.items || 1,
      price: +(rawTotal / (invoice.items || 1)).toFixed(2),
      total: rawTotal,
    }
  ];

  const handlePrint = () => {
    setIsPrinting(true);
    const receiptElement = document.getElementById('printable-pos-receipt');
    if (!receiptElement) {
      window.print();
      setIsPrinting(false);
      return;
    }

    // Direct isolated iframe printing ensures zero layout clipping or blank pages
    let printFrame = document.getElementById('pos-print-iframe');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'pos-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${invoice.id}</title>
          <style>
            @page {
              margin: 6mm;
              size: auto;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1a101f;
              background: #ffffff;
              padding: 12px;
              display: flex;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .printable-receipt-card {
              width: 100%;
              max-width: 360px;
              background: #fff;
              color: #1a101f;
            }
            .receipt-paper-header {
              text-align: center;
              margin-bottom: 12px;
            }
            .receipt-paper-logo-box {
              width: 44px;
              height: 44px;
              border-radius: 12px;
              border: 1.5px solid #cfa249;
              background: transparent;
              padding: 4px;
              margin: 0 auto 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .receipt-paper-logo {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .receipt-brand-title {
              font-family: Georgia, serif;
              font-size: 19px;
              font-weight: 700;
              letter-spacing: 0.15em;
              color: #1a101f;
              margin-bottom: 2px;
            }
            .receipt-brand-subtitle {
              font-size: 9.5px;
              font-weight: 700;
              letter-spacing: 0.2em;
              color: #cfa249;
              margin-bottom: 6px;
            }
            .receipt-store-address {
              font-size: 10.5px;
              line-height: 1.45;
              color: #4a4055;
            }
            .receipt-perforated-line {
              border-top: 1.5px dashed #cccccc;
              margin: 12px 0;
            }
            .receipt-meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 12px;
              font-size: 11px;
            }
            .receipt-meta-item {
              display: flex;
              flex-direction: column;
            }
            .receipt-meta-label {
              font-size: 9px;
              font-weight: 700;
              color: #777777;
            }
            .receipt-meta-value {
              font-weight: 600;
              color: #1a101f;
            }
            .receipt-invoice-number {
              font-family: inherit;
              color: #6b2f8a;
              font-weight: 700;
            }
            .receipt-status-bold {
              color: #1b7a3d;
              font-weight: 700;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }
            .receipt-table th {
              font-size: 9px;
              font-weight: 700;
              text-align: left;
              color: #666666;
              border-bottom: 1px solid #d5cbdc;
              padding-bottom: 4px;
            }
            .receipt-th-qty { text-align: center; }
            .receipt-th-price, .receipt-th-total { text-align: right; }
            .receipt-table td {
              padding: 6px 0;
              border-bottom: 1px dashed #e8e2ee;
              vertical-align: top;
            }
            .receipt-td-desc { text-align: left; }
            .receipt-item-name { font-weight: 600; color: #1a101f; }
            .receipt-item-sub { font-size: 9.5px; color: #666666; }
            .receipt-td-qty { text-align: center; color: #444444; }
            .receipt-td-price { text-align: right; color: #444444; }
            .receipt-td-total { text-align: right; font-weight: 700; color: #1a101f; }
            .receipt-totals-section {
              display: flex;
              flex-direction: column;
              gap: 4px;
              font-size: 11.5px;
            }
            .receipt-total-row {
              display: flex;
              justify-content: space-between;
              color: #4a4055;
            }
            .receipt-grand-total {
              padding: 6px 0;
              margin: 4px 0;
              border-top: 1.5px solid #1a101f;
              border-bottom: 1.5px solid #1a101f;
              font-size: 13.5px;
              font-weight: 800;
              color: #1a101f;
            }
            .receipt-paid-row { font-weight: 600; color: #1a101f; }
            .receipt-change-row { font-size: 10.5px; color: #777777; }
            .receipt-paper-footer {
              text-align: center;
              margin-top: 10px;
            }
            .receipt-barcode-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 6px 0;
            }
            .receipt-barcode {
              width: 190px;
              height: 36px;
            }
            .receipt-barcode-text {
              font-family: monospace;
              font-size: 10.5px;
              letter-spacing: 0.12em;
              color: #555555;
              margin-top: 2px;
            }
            .receipt-farewell-text {
              font-size: 10px;
              font-style: italic;
              color: #555555;
              line-height: 1.35;
              margin-bottom: 4px;
            }
            .receipt-policy-notice {
              font-size: 8.5px;
              color: #888888;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          ${receiptElement.outerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    // Allow iframe to load and render content before invoking print dialog
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setIsPrinting(false);
    }, 250);
  };

  return (
    <div className="modal-overlay receipt-modal-overlay" onClick={onClose}>
      <div 
        className="modal-card receipt-modal-window" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="receipt-modal-nav">
          <div className="receipt-modal-title-group">
            <span className="receipt-eyebrow">Official Receipt Preview</span>
            <h2 className="receipt-heading">Invoice #{invoice.id}</h2>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close invoice preview"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Printable Paper Sheet */}
        <div className="receipt-paper-wrapper">
          <article className="printable-receipt-card" id="printable-pos-receipt">
            {/* Boutique Top Crest / Branding */}
            <div className="receipt-paper-header">
              <div className="receipt-paper-logo-box">
                <img src={logoImg} alt="Prestige" className="receipt-paper-logo" />
              </div>
              <h1 className="receipt-brand-title">PRESTIGE</h1>
              <p className="receipt-brand-subtitle">PERFUME STUDIO</p>
              <p className="receipt-store-address">
                Boutique 01 · Downtown Flagship<br />
                Sule Square, 148 Merchant Rd, Yangon<br />
                Tel: +95 (0) 9 770 123 456
              </p>
            </div>

            {/* Perforated Gold Decorative Divider */}
            <div className="receipt-perforated-line" />

            {/* Receipt Meta Details */}
            <div className="receipt-meta-grid">
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">INVOICE NO:</span>
                <span className="receipt-meta-value receipt-invoice-number">{invoice.id}</span>
              </div>
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">DATE & TIME:</span>
                <span className="receipt-meta-value">
                  {invoice.date || '28 Oct 2026'} · {invoice.time}
                </span>
              </div>
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">CUSTOMER:</span>
                <span className="receipt-meta-value">{invoice.customer || 'Walk-in Guest'}</span>
              </div>
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">CASHIER:</span>
                <span className="receipt-meta-value">Staff (Terminal 01)</span>
              </div>
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">PAYMENT:</span>
                <span className="receipt-meta-value">{invoice.payment}</span>
              </div>
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">STATUS:</span>
                <span className="receipt-meta-value receipt-status-bold">
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="receipt-perforated-line" />

            {/* Itemized Fragrance List */}
            <div className="receipt-items-section">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th className="receipt-th-desc">ITEM</th>
                    <th className="receipt-th-qty">QTY</th>
                    <th className="receipt-th-price">PRICE</th>
                    <th className="receipt-th-total">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="receipt-td-desc">
                        <div className="receipt-item-name">{line.name}</div>
                        {line.size && <div className="receipt-item-sub">{line.size}</div>}
                      </td>
                      <td className="receipt-td-qty">{line.qty}</td>
                      <td className="receipt-td-price">${Number(line.price).toFixed(2)}</td>
                      <td className="receipt-td-total">
                        ${(Number(line.price) * line.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Perforated Divider */}
            <div className="receipt-perforated-line" />

            {/* Total & Tax Summary */}
            <div className="receipt-totals-section">
              <div className="receipt-total-row">
                <span>Subtotal (Net):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row">
                <span>Commercial Tax / VAT (5%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row receipt-grand-total">
                <span>TOTAL DUE:</span>
                <span>${rawTotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row receipt-paid-row">
                <span>Payment Method ({invoice.payment}):</span>
                <span>${rawTotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row receipt-change-row">
                <span>Balance / Change:</span>
                <span>$0.00</span>
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="receipt-perforated-line" />

            {/* Barcode & Signature Scent Note */}
            <div className="receipt-paper-footer">
              <div className="receipt-barcode-wrapper">
                {/* SVG Simulated Boutique Barcode */}
                <svg className="receipt-barcode" viewBox="0 0 240 48" preserveAspectRatio="none">
                  <rect x="0" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="6" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="11" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="18" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="22" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="28" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="33" y="0" width="5" height="48" fill="#1a101f" />
                  <rect x="42" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="47" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="54" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="59" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="65" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="69" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="76" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="81" y="0" width="5" height="48" fill="#1a101f" />
                  <rect x="89" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="95" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="100" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="107" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="111" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="117" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="124" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="129" y="0" width="5" height="48" fill="#1a101f" />
                  <rect x="137" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="141" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="147" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="154" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="159" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="165" y="0" width="5" height="48" fill="#1a101f" />
                  <rect x="173" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="178" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="185" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="189" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="195" y="0" width="5" height="48" fill="#1a101f" />
                  <rect x="203" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="208" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="215" y="0" width="2" height="48" fill="#1a101f" />
                  <rect x="220" y="0" width="3" height="48" fill="#1a101f" />
                  <rect x="226" y="0" width="1" height="48" fill="#1a101f" />
                  <rect x="230" y="0" width="4" height="48" fill="#1a101f" />
                  <rect x="237" y="0" width="3" height="48" fill="#1a101f" />
                </svg>
                <div className="receipt-barcode-text">*{invoice.id}*</div>
              </div>

              <div className="receipt-farewell-text">
                Thank you for choosing Prestige Perfume Studio.<br />
                We hope your signature scent brings you elegance and confidence.
              </div>

              <div className="receipt-policy-notice">
                Unopened fragrances in original sealed cellophane packaging may be exchanged within 14 days of purchase upon presentation of this valid receipt.
              </div>
            </div>
          </article>
        </div>

        {/* Modal Bottom Action */}
        <div className="receipt-modal-footer">
          <button type="button" className="action-btn-primary" onClick={handlePrint} style={{ width: '100%', justifyContent: 'center' }}>
            <PrinterIcon className="w-4 h-4" />
            <span>Print Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
