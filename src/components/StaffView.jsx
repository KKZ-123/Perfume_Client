import React, { useState, useEffect, useCallback } from 'react';
import { UsersIcon, RefreshIcon, CheckIcon, PlusIcon, EyeIcon } from './Icons';
import { API_ENDPOINTS, apiFetch } from '../config/api';
import { NewStaffModal } from './NewStaffModal';
import { StaffDetailModal } from './StaffDetailModal';

export const StaffView = ({ currentUser }) => {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Fetch staff list from backend API (automatically handles token refresh on 401)
  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(API_ENDPOINTS.USERS, {
        method: 'GET'
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setStaffList(Array.isArray(resData.data) ? resData.data : []);
      } else {
        setError(
          resData.error ||
          resData.message ||
          `Failed to load staff list (HTTP ${response.status})`
        );
      }
    } catch (err) {
      console.error('Error fetching staff list:', err);
      setError(
        err.message?.includes('fetch')
          ? 'Cannot connect to backend server. Please verify the server is running.'
          : (err.message || 'Failed to load staff list.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleStaffCreated = (newUser) => {
    setSuccessToast(`Staff member "${newUser.name || 'New Staff'}" added successfully!`);
    setTimeout(() => setSuccessToast(null), 3800);
    fetchStaff();
  };

  // Format date helper (date only, no time)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return String(dateStr).split('T')[0].split(' ')[0];
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(dateStr).split('T')[0].split(' ')[0];
    }
  };

  // Distinct roles for filter pills
  const availableRoles = [
    'All',
    ...Array.from(new Set(staffList.map((s) => s.role).filter(Boolean)))
  ];

  // Filtered staff list
  const filteredStaff = staffList.filter((member) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (member.name && member.name.toLowerCase().includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q)) ||
      (member.userid && member.userid.toLowerCase().includes(q)) ||
      (member.role && member.role.toLowerCase().includes(q));

    const matchesRole =
      roleFilter === 'All' ||
      (member.role && member.role.toLowerCase() === roleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  // Role badge styling
  const getRoleBadgeStyle = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('owner') || r.includes('admin')) {
      return {
        background: 'linear-gradient(135deg, rgba(207, 162, 73, 0.16) 0%, rgba(223, 182, 100, 0.28) 100%)',
        color: '#9e6012',
        border: '1px solid rgba(207, 162, 73, 0.4)'
      };
    }
    if (r.includes('manager')) {
      return {
        background: 'var(--purple-light)',
        color: 'var(--purple-brand)',
        border: '1px solid rgba(107, 47, 138, 0.3)'
      };
    }
    return {
      background: 'var(--green-pill-bg)',
      color: 'var(--green-trend)',
      border: '1px solid rgba(27, 122, 61, 0.25)'
    };
  };

  return (
    <div className="dashboard-content-wrapper">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-eyebrow">Personnel & Store Access · Main boutique</span>
          <h1 className="dashboard-title">Staff Management</h1>
        </div>

        <div className="header-actions">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search staff by name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pos-input header-search-input"
          />

          {/* Role Filter Pills */}
          <div className="time-filter-group">
            {availableRoles.map((role) => (
              <button
                key={role}
                className={`time-pill ${roleFilter === role ? 'active' : ''}`}
                onClick={() => setRoleFilter(role)}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            className="action-btn-outline"
            onClick={fetchStaff}
            disabled={isLoading}
            title="Refresh staff list from server"
            style={{
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'spin-animation' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* New Staff Button */}
          <button
            type="button"
            className="action-btn-primary"
            onClick={() => setIsNewModalOpen(true)}
            title="Add new staff member"
            style={{
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Staff</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successToast && (
        <div
          style={{
            marginBottom: '18px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'var(--green-pill-bg)',
            color: 'var(--green-trend)',
            border: '1px solid rgba(27, 122, 61, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13.5px',
            fontWeight: 600
          }}
        >
          <CheckIcon className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          className="pos-auth-error-banner"
          style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchStaff}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--red-alert)',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Staff Table Card */}
      <div className="dashboard-card">
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div className="pos-auth-spinner" style={{ margin: '0 auto 16px auto', width: '28px', height: '28px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500 }}>Fetching staff records from server...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <UsersIcon size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No staff members found
            </p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>
              {search || roleFilter !== 'All'
                ? 'Try adjusting your search query or role filter.'
                : 'No registered personnel records returned from API.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="invoices-table staff-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '180px' }}>Staff Member</th>
                  <th className="col-userid">User ID</th>
                  <th className="col-email">Email</th>
                  <th className="col-role">Role</th>
                  <th className="col-joined">Joined Date</th>
                  <th className="col-status">Status</th>
                  <th style={{ textAlign: 'center' }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member, idx) => {
                  const initials = member.name
                    ? member.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'ST';

                  const isCurrent = currentUser?.userid === member.userid;

                  return (
                    <tr 
                      key={member.userid || member.id || idx}
                      onClick={() => setSelectedStaff(member)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view staff profile"
                    >
                      {/* Name & Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="user-avatar"
                            style={{
                              width: '38px',
                              height: '38px',
                              minWidth: '38px',
                              fontSize: '13px',
                              background:
                                member.role?.toLowerCase() === 'owner'
                                  ? 'linear-gradient(135deg, var(--gold-accent) 0%, var(--gold-accent-light) 100%)'
                                  : 'var(--purple-brand)',
                              color: '#ffffff',
                              fontWeight: 700,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                              {member.name || 'Unnamed Staff'}
                            </div>
                            {isCurrent && (
                              <span style={{ fontSize: '11px', color: 'var(--gold-accent)', fontWeight: 600 }}>
                                (Current Session)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="col-userid">
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: 'var(--purple-brand)',
                            background: 'var(--purple-light)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                        >
                          {member.userid || member.id || '—'}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="col-email" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {member.email || '—'}
                      </td>

                      {/* Role Badge */}
                      <td className="col-role">
                        <span
                          className="status-badge"
                          style={getRoleBadgeStyle(member.role)}
                        >
                          {member.role || 'Staff'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="col-joined" style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {formatDate(member.createdAt || member.createddate || member.createdDate || member.joinedDate)}
                      </td>

                      {/* Status */}
                      <td className="col-status">
                        <span
                          className="status-badge paid"
                          style={{
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'var(--green-trend)',
                              display: 'inline-block'
                            }}
                          />
                          Active
                        </span>
                      </td>

                      {/* Profile View Button */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="action-btn-outline"
                          style={{
                            padding: '4px 12px',
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedStaff(member)}
                          title="Open full staff profile"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Info Popup Box Modal */}
      <StaffDetailModal
        isOpen={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        staff={selectedStaff}
        currentUser={currentUser}
      />

      {/* New Staff Registration Popup Modal */}
      <NewStaffModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleStaffCreated}
        currentUser={currentUser}
      />
    </div>
  );
};
