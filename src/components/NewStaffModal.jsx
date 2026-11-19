import React, { useState, useEffect } from 'react';
import { CloseIcon, LockIcon, ProfileIcon, EyeIcon, EyeOffIcon, ChevronDownIcon } from './Icons';
import { API_ENDPOINTS, apiFetch } from '../config/api';

// Helper function to encode password into Base64
const encodeBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (err) {
    return btoa(str);
  }
};

export const NewStaffModal = ({ isOpen, onClose, onSuccess, currentUser }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Cashier');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setName('');
    setUserId('');
    setEmail('');
    setPassword('');
    setRole('Cashier');
    setErrorMessage('');
    setShowPassword(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const encodedPassword = encodeBase64(password);

      const response = await apiFetch(API_ENDPOINTS.USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          userid: userId.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password: encodedPassword,
          role
        })
      });

      const resData = await response.json();

      if (response.ok && (resData.success || resData.id || resData.userid)) {
        resetForm();
        onSuccess(resData.data || resData);
        onClose();
      } else {
        setErrorMessage(
          resData.error ||
          resData.message ||
          'Failed to create staff member. Please check your inputs.'
        );
      }
    } catch (err) {
      console.error('Error creating staff member:', err);
      setErrorMessage(
        err.message?.includes('fetch')
          ? 'Failed to connect to backend server. Please verify backend is running.'
          : (err.message || 'Error creating staff member.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', width: '92%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--purple-light)',
                color: 'var(--purple-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ProfileIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '20px' }}>Add New Staff Member</h2>
              <p className="card-subtitle">Create POS terminal operator credentials</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div 
            className="pos-auth-error-banner" 
            style={{ margin: '14px 24px 0 24px', borderRadius: '8px' }}
          >
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} autoComplete="off" style={{ padding: '24px' }}>
          {/* Full Name */}
          <div className="pos-form-group" style={{ marginBottom: '16px' }}>
            <label className="pos-label" htmlFor="staff-name">
              Full Name
            </label>
            <input
              id="staff-name"
              type="text"
              className="pos-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* User ID & Role Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label" htmlFor="staff-userid">
                User ID (Login ID)
              </label>
              <input
                id="staff-userid"
                type="text"
                className="pos-input"
                autoComplete="off"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>

            <div className="pos-form-group" style={{ marginBottom: 0 }}>
              <label className="pos-label" htmlFor="staff-role">
                Assigned Role
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  id="staff-role"
                  className="pos-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    paddingRight: '36px',
                    cursor: 'pointer',
                    background: '#ffffff'
                  }}
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Fragrance Specialist">Fragrance Specialist</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                  <option value="Owner">Owner</option>
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    pointerEvents: 'none',
                    color: 'var(--text-muted, #78716c)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="pos-form-group" style={{ marginBottom: '16px' }}>
            <label className="pos-label" htmlFor="staff-email">
              Email Address
            </label>
            <input
              id="staff-email"
              type="email"
              className="pos-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="pos-form-group" style={{ marginBottom: '24px' }}>
            <label className="pos-label" htmlFor="staff-password">
              Initial Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="staff-password"
                type={showPassword ? 'text' : 'password'}
                className="pos-input"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="pos-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="action-btn-primary"
              disabled={isLoading || !name || !userId || !email || !password}
              style={{ padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isLoading ? (
                <>
                  <span className="pos-auth-spinner" style={{ width: '16px', height: '16px' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
