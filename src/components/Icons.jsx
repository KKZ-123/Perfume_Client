import React from 'react';

export const PerfumeBottleIcon = ({ className = "", color = "currentColor", size = 22 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    {/* Cap */}
    <rect x="9" y="2" width="6" height="4" rx="1" fill={color} fillOpacity="0.25" />
    {/* Neck */}
    <line x1="10" y1="6" x2="14" y2="6" />
    {/* Bottle Body */}
    <rect x="5" y="7" width="14" height="14" rx="4" fill={color} fillOpacity="0.15" />
    {/* Label outline inside bottle */}
    <rect x="8" y="11" width="8" height="6" rx="1.5" strokeDasharray="1 1" strokeWidth="1.2" />
  </svg>
);

export const DashboardIcon = ({ className = "", size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
  </svg>
);

export const BoxStockIcon = ({ className = "", size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export const InvoiceIcon = ({ className = "", size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

export const ProfileIcon = ({ className = "", size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

export const ArrowUpTrend = ({ className = "", size = 14 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export const ArrowDownTrend = ({ className = "", size = 14 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const AlertWarning = ({ className = "", size = 14 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
  </svg>
);

export const DownloadReportIcon = ({ className = "", size = 15 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const LogoutIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const ArrowRightIcon = ({ className = "", size = 14 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const PlusIcon = ({ className = "", size = 15 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CheckIcon = ({ className = "", size = 15 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CloseIcon = ({ className = "", size = 15 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const LockIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const KeyIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="m21 2-2 2m-1.5 1.5L14 9a5 5 0 1 0 3 3l5.5-5.5a1.5 1.5 0 0 0 0-2.12l-.38-.38a1.5 1.5 0 0 0-2.12 0Z" />
    <circle cx="7.5" cy="15.5" r="1.5" />
  </svg>
);

export const EyeIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const ShieldCheckIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const PrinterIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
export const UsersIcon = ({ className = "", size = 18 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const RefreshIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export const ChevronDownIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const TrashIcon = ({ className = "", size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    className={`icon-svg ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.9" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const MenuIcon = ({ className = "", size = 18 }) => (
  <svg
    width={size}
    height={size}
    className={`icon-svg ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const PanelLeftCloseIcon = ({ className = "", size = 18 }) => (
  <svg
    width={size}
    height={size}
    className={`icon-svg ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <path d="m16 15-3-3 3-3" />
  </svg>
);

export const PanelLeftOpenIcon = ({ className = "", size = 18 }) => (
  <svg
    width={size}
    height={size}
    className={`icon-svg ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <path d="m14 9 3 3-3 3" />
  </svg>
);

export const CopyIcon = ({ className = "", size = 15 }) => (
  <svg
    width={size}
    height={size}
    className={`icon-svg ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` }}
  >
    <rect x="9" y="9" width="13" height="13" rx="2.5" ry="2.5" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
