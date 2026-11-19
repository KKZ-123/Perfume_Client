import React, { useState } from 'react';
import { 
  ArrowUpTrend, 
  ArrowDownTrend, 
  AlertWarning, 
  DownloadReportIcon, 
  ArrowRightIcon,
  PlusIcon
} from './Icons';

export const DashboardView = ({ 
  data, 
  onOpenStock, 
  onOpenInvoices, 
  onNewSale, 
  onExportReport 
}) => {
  const [activeTimeRange, setActiveTimeRange] = useState('Today');
  const [selectedDay, setSelectedDay] = useState('Wed');

  // Handle switching time filter with realistic dynamic data adjustments
  const timeMultipliers = {
    'Today': { sales: '$4,820.50', invoices: '36', avg: '$133.90', reorder: '14' },
    '7 days': { sales: '$28,568.50', invoices: '214', avg: '$133.50', reorder: '14' },
    '30 days': { sales: '$118,940.00', invoices: '890', avg: '$133.64', reorder: '14' }
  };

  const currentStats = timeMultipliers[activeTimeRange] || timeMultipliers['Today'];

  return (
    <div className="dashboard-content-wrapper">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-eyebrow">
            {data.header.date} · {data.header.location}
          </span>
          <h1 className="dashboard-title">{data.header.title}</h1>
        </div>

        <div className="header-actions">
          {/* Time range pills */}
          <div className="time-filter-group">
            {['Today', '7 days', '30 days'].map((range) => (
              <button
                key={range}
                className={`time-pill ${activeTimeRange === range ? 'active' : ''}`}
                onClick={() => setActiveTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export Report Pill Button */}
          <button 
            className="action-btn-outline"
            onClick={onExportReport}
            title="Download sales report"
          >
            <DownloadReportIcon className="w-4 h-4" />
            <span>Export report</span>
          </button>

          {/* Quick POS New Sale Button */}
          <button 
            className="action-btn-primary"
            onClick={onNewSale}
            title="Ring up a new sale"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New sale</span>
          </button>
        </div>
      </header>

      {/* KPI 4 Cards Grid */}
      <section className="metrics-grid">
        {/* Today's Sales */}
        <div className="metric-card">
          <span className="metric-label">
            {activeTimeRange === 'Today' ? "Today's sales" : `${activeTimeRange} sales`}
          </span>
          <div className="metric-value">{currentStats.sales}</div>
          <div className="metric-indicator trend-up">
            <ArrowUpTrend className="w-3.5 h-3.5" />
            <span>12.4% vs yesterday</span>
          </div>
        </div>

        {/* Invoices */}
        <div className="metric-card">
          <span className="metric-label">Invoices</span>
          <div className="metric-value">{currentStats.invoices}</div>
          <div className="metric-indicator trend-up">
            <ArrowUpTrend className="w-3.5 h-3.5" />
            <span>4 more than yesterday</span>
          </div>
        </div>

        {/* Average basket */}
        <div className="metric-card">
          <span className="metric-label">Average basket</span>
          <div className="metric-value">{currentStats.avg}</div>
          <div className="metric-indicator trend-down">
            <ArrowDownTrend className="w-3.5 h-3.5" />
            <span>0.1% vs yesterday</span>
          </div>
        </div>

        {/* Needs reorder */}
        <div className="metric-card" onClick={onOpenStock} style={{ cursor: 'pointer' }}>
          <span className="metric-label">Needs reorder</span>
          <div className="metric-value">{data.metrics.needsReorder.value}</div>
          <div className="metric-indicator trend-alert">
            <AlertWarning className="w-3.5 h-3.5" />
            <span>{data.metrics.needsReorder.alert}</span>
          </div>
        </div>
      </section>

      {/* Middle Row: Sales 7-days Chart & Top Sellers Today */}
      <section className="dashboard-row-grid">
        {/* Sales, last 7 days */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">{data.salesChart.title}</h2>
              <p className="card-subtitle">{data.salesChart.subtitle}</p>
            </div>
            <div className="card-header-right">
              <div className="stat-label-small">{data.salesChart.totalLabel}</div>
              <div className="stat-value-large">{data.salesChart.totalValue}</div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="chart-container">
            {data.salesChart.days.map((item) => {
              const isActive = selectedDay === item.day || (selectedDay === '' && item.active);
              return (
                <div 
                  key={item.day} 
                  className={`chart-bar-column ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedDay(item.day)}
                  title={`${item.day}: ${item.amount} revenue`}
                >
                  <span className="chart-bar-amount">{item.amount}</span>
                  <div className="chart-bar-track">
                    <div 
                      className={`chart-bar-fill ${isActive ? 'active' : ''}`}
                      style={{ height: `${item.heightPercent}%` }}
                    />
                  </div>
                  <span className="chart-day-label">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top sellers today */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Top sellers today</h2>
              <p className="card-subtitle">By revenue</p>
            </div>
          </div>

          <div className="top-sellers-list">
            {data.topSellers.map((item) => (
              <div key={item.id} className="top-seller-item">
                <div className="top-seller-info-row">
                  <span className="top-seller-name">{item.name}</span>
                  <span className="top-seller-revenue">{item.revenue}</span>
                </div>
                <div className="top-seller-units">{item.units} units</div>
                <div className="top-seller-bar-track">
                  <div 
                    className="top-seller-bar-fill"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Row: Recent Invoices & Low Stock Alerts */}
      <section className="dashboard-row-grid">
        {/* Recent Invoices Table */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Recent invoices</h2>
            </div>
            <button 
              className="card-header-link" 
              onClick={onOpenInvoices}
              style={{ background: 'none', border: 'none' }}
            >
              View all
            </button>
          </div>

          <div className="table-responsive">
            <table className="invoices-table dashboard-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th className="col-time">Time</th>
                  <th>Customer</th>
                  <th className="col-items">Items</th>
                  <th>Total</th>
                  <th className="col-payment">Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="invoice-id-cell">{inv.id}</td>
                    <td className="invoice-time-cell col-time">{inv.time}</td>
                    <td className="invoice-customer-cell">{inv.customer}</td>
                    <td className="invoice-items-cell col-items">{inv.items}</td>
                    <td className="invoice-total-cell">{inv.total}</td>
                    <td className="invoice-payment-cell col-payment">{inv.payment}</td>
                    <td>
                      <span className={`status-badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="dashboard-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Low stock alerts</h2>
              <p className="card-subtitle">Below reorder level</p>
            </div>
          </div>

          <div className="low-stock-list">
            {data.lowStockAlerts.map((item) => (
              <div key={item.id} className="low-stock-item">
                <div className="low-stock-info">
                  <span className="low-stock-name">{item.name}</span>
                  <span className="low-stock-reorder">Reorder at {item.reorderAt}</span>
                </div>
                <span className={`stock-tag ${item.badgeType}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button className="card-footer-action" onClick={onOpenStock}>
            <span>Open stock register</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
