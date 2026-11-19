import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, LockIcon, KeyIcon, EyeIcon, EyeOffIcon, CheckIcon } from './Icons';
import { getUserProfile, updateUserPassword, encodeBase64, getUserId, apiFetch, API_ENDPOINTS } from '../config/api';

export const StaffDetailModal = ({ isOpen, onClose, staff, currentUser, title = 'Staff Profile' }) => {
  const [profileData, setProfileData] = useState(staff || null);
  const [apiSynced, setApiSynced] = useState(false);

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Determine target User ID
  const targetUserId =
    profileData?.userid ||
    staff?.userid ||
    profileData?.id ||
    staff?.id ||
    (typeof staff === 'string' ? staff : null) ||
    currentUser?.userid ||
    currentUser?.id ||
    getUserId();

  // Fetch user profile quietly in the background
  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await getUserProfile(targetUserId);
      const resData = await response.json().catch(() => ({}));

      if (response.ok && resData.success && resData.data) {
        setProfileData((prev) => ({
          ...prev,
          ...resData.data
        }));
        setApiSynced(true);
      } else if (response.ok && (resData.userid || resData.id)) {
        setProfileData((prev) => ({
          ...prev,
          ...resData
        }));
        setApiSynced(true);
      }
    } catch (err) {
      console.warn('Could not fetch user profile from backend API:', err.message);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!isOpen) return;

    if (staff && typeof staff === 'object') {
      setProfileData(staff);
    }
    setApiSynced(false);
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPassError('');
    setPassSuccess('');

    fetchProfile();
  }, [isOpen, staff, fetchProfile]);

  // Handler for updating password via PUT localhost:5000/api/users/:userid
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!newPassword) {
      setPassError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);

    try {
      // Encode password to Base64 (e.g. 'user@123' -> 'dXNlckAxMjM=')
      const encodedPassword = encodeBase64(newPassword);

      // Call PUT /api/users/:userid with { "password": encodedPassword }
      const res = await updateUserPassword(targetUserId, encodedPassword);
      const resData = await res.json().catch(() => ({}));

      if (res.ok && (resData.success !== false)) {
        const successMessage = resData.message || 'Password updated successfully';
        setPassSuccess(successMessage);

        // Update active profile state if backend returned updated user data
        if (resData.data) {
          setProfileData((prev) => ({
            ...prev,
            ...resData.data
          }));
        }

        // If updating current logged-in user, also update localStorage
        try {
          const savedUserStr = localStorage.getItem('aurelia_pos_user');
          if (savedUserStr) {
            const userObj = JSON.parse(savedUserStr);
            if (userObj.userid === targetUserId || userObj.id === targetUserId) {
              userObj.password = encodedPassword;
              localStorage.setItem('aurelia_pos_user', JSON.stringify(userObj));
            }
          }
        } catch {
          // Ignore storage errors
        }

        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsChangingPassword(false);
          setPassSuccess('');
        }, 1800);
      } else {
        const errorMsg = resData.message || resData.error || `Failed to update password (HTTP ${res.status})`;
        setPassError(errorMsg);
      }
    } catch (err) {
      console.warn('Change password error:', err);
      setPassError(err.message || 'Failed to update password. Server connection error.');
    } finally {
      setPassLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDisplay = profileData || staff || {};

  const initials = currentDisplay.name
    ? currentDisplay.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PS';

  const role = currentDisplay.role || 'Staff';
  const roleLower = role.toLowerCase();

  // Role badge & avatar styling
  let avatarBg = 'var(--purple-brand)';
  let roleBadgeStyle = {
    background: 'var(--green-pill-bg)',
    color: 'var(--green-trend)',
    border: '1px solid rgba(27, 122, 61, 0.25)'
  };

  if (roleLower.includes('owner') || roleLower.includes('admin')) {
    avatarBg = 'linear-gradient(135deg, var(--gold-accent) 0%, #b8860b 100%)';
    roleBadgeStyle = {
      background: 'linear-gradient(135deg, rgba(207, 162, 73, 0.16) 0%, rgba(223, 182, 100, 0.28) 100%)',
      color: '#9e6012',
      border: '1px solid rgba(207, 162, 73, 0.4)'
    };
  } else if (roleLower.includes('manager')) {
    avatarBg = 'linear-gradient(135deg, #6b2f8a 0%, #4a1d63 100%)';
    roleBadgeStyle = {
      background: 'var(--purple-light)',
      color: 'var(--purple-brand)',
      border: '1px solid rgba(107, 47, 138, 0.3)'
    };
  }

  // Format date helper (date only, no time)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr.split('T')[0].split(' ')[0];
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const createdDateFormatted = formatDate(
    currentDisplay.createdAt ||
    currentDisplay.createddate ||
    currentDisplay.createdDate ||
    currentDisplay.created_at ||
    currentDisplay.joinedDate
  );

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '540px', 
          width: '94%', 
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.28)',
          border: '1px solid rgba(207, 162, 73, 0.22)',
          overflow: 'hidden'
        }}
      >
        {/* Luxury Top Header Banner */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            padding: '24px 24px 20px 24px',
            color: '#ffffff',
            position: 'relative',
            borderBottom: '1px solid rgba(207, 162, 73, 0.2)'
          }}
        >
          {/* Header Action Controls */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center' }}>
            <button 
              className="modal-close-btn" 
              onClick={onClose} 
              aria-label="Close modal"
              style={{ 
                color: '#dc2626',
                background: '#fee2e2',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                minWidth: '58px',
                borderRadius: '50%',
                background: avatarBg,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.18)'
              }}
            >
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingRight: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 
                  style={{ 
                    fontFamily: 'Playfair Display, Georgia, serif', 
                    fontSize: '22px', 
                    fontWeight: 700, 
                    color: '#fefefe', 
                    margin: 0,
                    letterSpacing: '0.02em'
                  }}
                >
                  {currentDisplay.name || 'User Profile'}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span className="status-badge" style={{ ...roleBadgeStyle, fontSize: '11.5px', padding: '3px 10px' }}>
                  {role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body / Info Grid */}
        <div style={{ padding: '22px 24px', background: 'var(--bg-main, #faf7f2)' }}>
          {/* Primary Profile Attributes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {/* 1. User ID Field */}
            <div 
              style={{
                background: '#ffffff',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                User ID
              </div>
              <div 
                style={{ 
                  marginTop: '4px', 
                  fontSize: '13.5px', 
                  fontFamily: 'monospace', 
                  fontWeight: 700, 
                  color: 'var(--purple-brand)',
                  wordBreak: 'break-all'
                }}
              >
                {currentDisplay.userid || currentDisplay.id || '—'}
              </div>
            </div>

            {/* 2. Full Name Field */}
            <div 
              style={{
                background: '#ffffff',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Name
              </div>
              <div 
                style={{ 
                  marginTop: '4px', 
                  fontSize: '13.5px', 
                  fontWeight: 600, 
                  color: 'var(--text-main)',
                  wordBreak: 'break-all'
                }}
              >
                {currentDisplay.name || '—'}
              </div>
            </div>

            {/* 3. Email Field */}
            <div 
              style={{
                background: '#ffffff',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Email
              </div>
              <div 
                style={{ 
                  marginTop: '4px', 
                  fontSize: '13px', 
                  fontWeight: 500, 
                  color: 'var(--text-main)',
                  wordBreak: 'break-all'
                }}
              >
                {currentDisplay.email || '—'}
              </div>
            </div>

            {/* 4. Created Date Field */}
            <div 
              style={{
                background: '#ffffff',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Joined Date
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-main)', marginTop: '3px', fontWeight: 600 }}>
                {createdDateFormatted}
              </div>
            </div>
          </div>

          {/* Secondary Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Expandable Change Password Form Card */}
            {isChangingPassword && (
              <div 
                style={{
                  background: '#ffffff',
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(207, 162, 73, 0.4)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  marginTop: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: 'var(--purple-brand)' }}>
                    <KeyIcon className="w-4 h-4" style={{ color: 'var(--gold-accent)' }} />
                    <span>Change Account Password</span>
                  </div>
                </div>

                {passError && (
                  <div 
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      background: 'rgba(217, 83, 79, 0.1)', 
                      color: 'var(--red-alert)', 
                      fontSize: '12px', 
                      marginBottom: '12px', 
                      border: '1px solid rgba(217, 83, 79, 0.25)' 
                    }}
                  >
                    {passError}
                  </div>
                )}

                {passSuccess && (
                  <div 
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      background: 'rgba(27, 122, 61, 0.1)', 
                      color: 'var(--green-trend)', 
                      fontSize: '12px', 
                      marginBottom: '12px', 
                      border: '1px solid rgba(27, 122, 61, 0.25)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        className="pos-input"
                        placeholder="Enter new password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '36px', height: '38px', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        tabIndex={-1}
                        title={showNewPass ? 'Hide password' : 'Show password'}
                      >
                        {showNewPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="pos-input"
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '36px', height: '38px', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        tabIndex={-1}
                        title={showConfirmPass ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPass ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="action-btn-outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPassError('');
                        setPassSuccess('');
                      }}
                      style={{ padding: '7px 15px', fontSize: '12.5px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="action-btn-primary"
                      disabled={passLoading || !newPassword || !confirmPassword}
                      style={{ padding: '7px 18px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {passLoading ? (
                        <>
                          <span className="pos-auth-spinner" style={{ width: '13px', height: '13px', borderWidth: '2px' }} />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal Actions Footer Bar (shows when password form is not open) */}
            {!isChangingPassword && (
              <div 
                style={{
                  marginTop: '10px',
                  paddingTop: '14px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <button
                  type="button"
                  className="action-btn-outline"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setPassError('');
                    setPassSuccess('');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderColor: 'rgba(207, 162, 73, 0.45)',
                    color: 'var(--purple-brand)',
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}
                >
                  <LockIcon className="w-4 h-4" style={{ color: 'var(--gold-accent)' }} />
                  <span>Change Password</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileModal = StaffDetailModal;
