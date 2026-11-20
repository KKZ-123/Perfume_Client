import React, { useState, useEffect, useRef } from 'react';
import { KeyIcon, LogoutIcon } from './Icons';
import { fetchFullUserProfile } from '../config/api';

export const ProfilePopover = ({
  isOpen,
  onClose,
  anchorRect,
  user,
  onUserUpdated,
  onOpenChangePassword,
  onSignOut
}) => {
  const [profile, setProfile] = useState(user || {});
  const popoverRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({ ...prev, ...user }));
    }
  }, [user]);

  // Sync live user profile from API whenever popover opens
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    fetchFullUserProfile(user).then((fullData) => {
      if (isMounted && fullData) {
        setProfile((prev) => ({ ...prev, ...fullData }));
        if (onUserUpdated) {
          onUserUpdated(fullData);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        // Ignore clicks on the avatar/profile trigger itself so toggle works cleanly
        if (e.target.closest('[data-profile-trigger="true"]')) {
          return;
        }
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isBottomHalf =
    anchorRect && typeof window !== 'undefined'
      ? anchorRect.top > window.innerHeight / 2
      : false;

  // Compute smart position anchored near the clicked profile element
  const getPopoverStyle = () => {
    const popoverWidth = 210;
    const baseStyle = {
      position: 'fixed',
      zIndex: 1300,
      width: `${popoverWidth}px`,
      maxWidth: 'calc(100vw - 24px)',
      background: '#261b30',
      borderRadius: '14px',
      border: '1px solid rgba(255, 255, 255, 0.09)',
      boxShadow: '0 18px 42px rgba(0, 0, 0, 0.48), 0 4px 14px rgba(0, 0, 0, 0.28)',
      padding: '14px',
      color: '#ffffff',
      animation: 'dropdownFadeIn 0.16s cubic-bezier(0.16, 1, 0.3, 1)'
    };

    if (!anchorRect || typeof window === 'undefined') {
      return {
        ...baseStyle,
        top: '64px',
        right: '16px'
      };
    }

    if (isBottomHalf) {
      // Triggered from desktop sidebar footer (bottom-left)
      return {
        ...baseStyle,
        bottom: `${Math.max(14, window.innerHeight - anchorRect.top + 12)}px`,
        left: `${Math.max(12, Math.min(anchorRect.left, window.innerWidth - (popoverWidth + 12)))}px`
      };
    }

    // Triggered from mobile/tablet top header (top-right)
    return {
      ...baseStyle,
      top: `${Math.max(12, anchorRect.bottom + 12)}px`,
      right: `${Math.max(12, window.innerWidth - anchorRect.right)}px`
    };
  };

  const displayName = profile?.name || 'Staff User';
  const displayUserId = profile?.userid || profile?.email || '—';

  return (
    <div
      ref={popoverRef}
      style={getPopoverStyle()}
      role="dialog"
      aria-label="User profile information"
    >
      {/* Pointer arrow toward trigger */}
      <div
        aria-hidden="true"
        style={
          isBottomHalf
            ? {
                position: 'absolute',
                bottom: '-6px',
                left: '22px',
                width: '12px',
                height: '12px',
                background: '#261b30',
                borderRight: '1px solid rgba(255, 255, 255, 0.09)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
                transform: 'rotate(45deg)'
              }
            : {
                position: 'absolute',
                top: '-6px',
                right: '16px',
                width: '12px',
                height: '12px',
                background: '#261b30',
                borderLeft: '1px solid rgba(255, 255, 255, 0.09)',
                borderTop: '1px solid rgba(255, 255, 255, 0.09)',
                transform: 'rotate(45deg)'
              }
        }
      />

      {/* Simple User Info: Name & User ID */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '2px 4px' }}>
        <div
          style={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}
        >
          {displayName}
        </div>
        <div
          title={displayUserId}
          style={{
            fontSize: '12.5px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.72)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {displayUserId}
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.08)',
          margin: '10px 0 6px 0'
        }}
      />

      {/* Change Password Action */}
      {onOpenChangePassword && (
        <div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChangePassword();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 10px',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.92)',
              fontSize: '13.5px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.92)';
            }}
          >
            <KeyIcon size={15} />
            <span>Change password</span>
          </button>
        </div>
      )}

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.08)',
          margin: '6px 0 10px 0'
        }}
      />

      {/* Sign Out Action */}
      {onSignOut && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignOut();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '9px 10px',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: '13.5px',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s ease, color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.24)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#f87171';
          }}
        >
          <LogoutIcon size={15} />
          <span>Sign out</span>
        </button>
      )}
    </div>
  );
};
