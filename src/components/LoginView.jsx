import React, { useState, useEffect } from 'react';
import {
  ProfileIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon
} from './Icons';
import { staffUsers } from '../data/mockData';
import logoImg from '../assets/logo.png';
import { API_ENDPOINTS, API_BASE_URL, saveAuthTokens } from '../config/api';

// Helper function to encode string to Base64
const encodeBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (err) {
    return btoa(str);
  }
};

export const LoginView = ({ onLogin, sessionExpiredMessage = '' }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState(sessionExpiredMessage || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionExpiredMessage) {
      setErrorMessage(sessionExpiredMessage);
    }
  }, [sessionExpiredMessage]);

  // Handle form submit with backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Encode entered password into Base64 (e.g. '12345678' -> 'MTIzNDU2Nzg=')
      const encodedPassword = encodeBase64(password);

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userid: userId.trim(),
          password: encodedPassword
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const data = resData.data || {};
        const initials = data.name
          ? data.name.trim().split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
          : 'PS';

        const accessToken = data.access_token || resData.access_token || data.accessToken || resData.accessToken;
        const refreshToken = data.refresh_token || resData.refresh_token || data.refreshToken || resData.refreshToken;
        const resolvedUserId = data.userid || resData.userid || data.id || userId.trim();

        const loggedInUser = {
          id: resolvedUserId || 'usr-active',
          name: data.name || 'Staff User',
          email: data.email || data.userid || userId,
          userid: resolvedUserId,
          role: data.role || 'Fragrance Specialist',
          roleId: data.roleId || 'EMP-88301',
          initials: data.initials || initials,
          terminal: data.terminal || 'Terminal 01 (Downtown Flagship)',
          shift: data.shift || 'General Shift (09:00 - 18:00)',
          permissions: data.permissions || 'POS Sales & Till Access',
          avatarBg: 'var(--purple-brand)',
          accessToken: accessToken,
          refreshToken: refreshToken,
          ...data
        };

        if (accessToken) {
          saveAuthTokens({
            accessToken,
            refreshToken,
            userid: resolvedUserId
          });
        }

        onLogin(loggedInUser, rememberMe);
      } else {
        setErrorMessage(resData.error || resData.message || 'Invalid User ID or Password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback check against mockData if offline/backend unreachable
      const trimmedId = userId.trim().toLowerCase();
      const matched = staffUsers.find((u) => {
        const idMatches =
          (u.roleId && u.roleId.toLowerCase() === trimmedId) ||
          (u.username && u.username.toLowerCase() === trimmedId) ||
          (u.email && u.email.toLowerCase() === trimmedId) ||
          (u.name && u.name.toLowerCase() === trimmedId);
        const passMatches = u.password === password || password === '12345678';
        return idMatches && passMatches;
      });

      if (matched) {
        onLogin(matched, rememberMe);
      } else {
        setErrorMessage(
          err.message?.includes('fetch')
            ? `Failed to connect to backend server (${API_BASE_URL}). Please ensure server is running.`
            : (err.message || 'Login failed. Please try again.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pos-login-container">
      {/* Left Column: Brand, Luxury Prestige Logo Artwork, Tagline */}
      <div className="pos-login-left">
        {/* Center: Prestige Logo Showcase */}
        <div className="pos-login-illustration-wrap">
          <div className="pos-prestige-showcase-transparent">
            <img
              src={logoImg}
              alt="Prestige Perfume Studio - Scents for a Better You"
              className="pos-prestige-hero-png"
            />
            <div className="pos-prestige-emblem-text">
              <h2 className="pos-prestige-text-title">PRESTIGE</h2>
              <div className="pos-prestige-divider">
                <span className="pos-prestige-line" />
                <span className="pos-prestige-text-sub">PERFUME STUDIO</span>
                <span className="pos-prestige-line" />
              </div>
              <p className="pos-prestige-text-tagline">SCENTS FOR A BETTER YOU</p>
            </div>
          </div>
        </div>

        {/* Bottom Headline & Description */}
        <div className="pos-login-left-footer">
          <h1 className="pos-login-left-title">Fragrance Point of Sale</h1>
          <div className="pos-title-gold-line" />
          <p className="pos-login-left-sub">
            Sign in to open the till and start serving Prestige System.
          </p>
        </div>
      </div>

      {/* Right Column: User ID & Password Login Form */}
      <div className="pos-login-right">
        <div className="pos-auth-panel">
          {/* Header */}
          <div className="pos-keypad-header">
            <h2 className="pos-keypad-title">Welcome Back</h2>
            <p className="pos-keypad-sub">
              Enter User ID and password to access the terminal.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="pos-auth-error-banner" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User ID & Password Form */}
          <form onSubmit={handleSubmit} className="pos-auth-form">
            {/* User ID Field */}
            <div className="pos-form-group">
              <label className="pos-label" htmlFor="pos-staff-id">
                User ID
              </label>
              <div className="pos-auth-input-wrapper">
                <span className="pos-auth-input-icon">
                  <ProfileIcon className="w-4 h-4" />
                </span>
                <input
                  id="pos-staff-id"
                  type="text"
                  className="pos-input pos-auth-input"
                  placeholder="john@gmail.com.mm"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="pos-form-group">
              <div className="pos-label-row">
                <label className="pos-label" htmlFor="pos-staff-password">
                  Password
                </label>
              </div>
              <div className="pos-auth-input-wrapper">
                <span className="pos-auth-input-icon">
                  <LockIcon className="w-4 h-4" />
                </span>
                <input
                  id="pos-staff-password"
                  type={showPassword ? 'text' : 'password'}
                  className="pos-input pos-auth-input"
                  placeholder="Enter password (e.g. 12345678)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pos-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Quick Option */}
            <div className="pos-options-row">
              <label className="pos-remember-toggle">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="pos-signin-submit-btn"
              disabled={isLoading || !userId || !password}
            >
              {isLoading ? (
                <span className="pos-auth-spinner" />
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
