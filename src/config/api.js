export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/users/login`,
  USERS: `${API_BASE_URL}/users`,
  RETOKEN: `${API_BASE_URL}/users/retoken`,
  BRANDS: `${API_BASE_URL}/brands`,
  PERFUMES: `${API_BASE_URL}/perfumes`
};

export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'pos_access_token',
  REFRESH_TOKEN: 'pos_refresh_token',
  USER_ID: 'pos_user_id',
  USER_DATA: 'aurelia_pos_user'
};

// Retrieve current access token
export const getAccessToken = () => {
  try {
    const direct = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    if (direct) return direct;
    const userStr = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_DATA);
    if (userStr) {
      const u = JSON.parse(userStr);
      return u?.accessToken || u?.access_token || '';
    }
  } catch {
    // fallback ignore
  }
  return '';
};

// Retrieve current refresh token
export const getRefreshToken = () => {
  try {
    const direct = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    if (direct) return direct;
    const userStr = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_DATA);
    if (userStr) {
      const u = JSON.parse(userStr);
      return u?.refreshToken || u?.refresh_token || '';
    }
  } catch {
    // fallback ignore
  }
  return '';
};

// Retrieve user ID (e.g. john@gmail.com.mm)
export const getUserId = () => {
  try {
    const direct = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_ID);
    if (direct) return direct;
    const userStr = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_DATA);
    if (userStr) {
      const u = JSON.parse(userStr);
      return u?.userid || u?.id || u?.email || '';
    }
  } catch {
    // fallback ignore
  }
  return '';
};

// Persist tokens across localStorage and active user object
export const saveAuthTokens = ({ accessToken, refreshToken, userid }) => {
  try {
    if (accessToken) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    if (userid) {
      localStorage.setItem(TOKEN_STORAGE_KEYS.USER_ID, userid);
    }

    const userStr = localStorage.getItem(TOKEN_STORAGE_KEYS.USER_DATA);
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (accessToken) {
          userObj.accessToken = accessToken;
          userObj.access_token = accessToken;
        }
        if (refreshToken) {
          userObj.refreshToken = refreshToken;
          userObj.refresh_token = refreshToken;
        }
        if (userid) {
          userObj.userid = userid;
        }
        localStorage.setItem(TOKEN_STORAGE_KEYS.USER_DATA, JSON.stringify(userObj));
      } catch {
        // ignore JSON parse issue
      }
    }

    // Broadcast token reissue to active app listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pos:token-reissued', {
          detail: { accessToken, refreshToken, userid }
        })
      );
    }
  } catch (err) {
    console.error('Error saving auth tokens:', err);
  }
};

// Clear all auth tokens
export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER_ID);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER_DATA);
  } catch (err) {
    console.error('Error clearing auth tokens:', err);
  }
};

// Decode JWT payload safely
export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Decode JWT and check if it is expired
export const isJwtExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  try {
    const parsed = decodeJwtPayload(token);
    if (!parsed || !parsed.exp) {
      return false;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return parsed.exp <= currentTime;
  } catch {
    return false;
  }
};

// Check if current stored refresh token is expired
export const isRefreshTokenExpired = () => {
  const token = getRefreshToken();
  if (!token) return true;
  return isJwtExpired(token);
};

// Force logout and trigger automatic redirection to login view
export const forceLogout = (reason = 'Your session has expired. Please sign in again.') => {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('pos:session-expired', {
        detail: { error: reason }
      })
    );
  }
};

// Mutex lock for handling concurrent 401 token refresh requests
let isRefreshing = false;
let refreshPromise = null;

/**
 * Calls localhost:5000/api/users/retoken with:
 * request body {
 *   "userid": "john@gmail.com.mm",
 *   "access_token": "{{json_web_token_02wa}}",
 *   "refresh_token": "{{json_web_token_0f4v}}"
 * }
 * and updates storage with newly reissued access_token.
 */
export const requestTokenRefresh = async () => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const userid = getUserId();
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!userid || !refreshToken) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Check if refresh token is expired on client side
      if (isJwtExpired(refreshToken)) {
        throw new Error('Your refresh token has expired. Please sign in again.');
      }

      const response = await fetch(API_ENDPOINTS.RETOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userid,
          access_token: accessToken || '',
          refresh_token: refreshToken
        }),
        _isRetokenCall: true
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && (data.access_token || data.data?.access_token)) {
        const newAccessToken = data.access_token || data.data?.access_token;
        const newRefreshToken = data.refresh_token || data.data?.refresh_token || refreshToken;
        const resolvedUserId = data.userid || data.data?.userid || userid;

        saveAuthTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          userid: resolvedUserId
        });

        return newAccessToken;
      } else {
        // Backend indicated invalid/expired refresh token or 401
        throw new Error(data.error || data.message || 'Your refresh token has expired. Please sign in again.');
      }
    } catch (err) {
      console.warn('Reissuing token failed:', err.message);
      forceLogout(err.message || 'Your refresh token has expired. Please sign in again.');
      throw err;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/**
 * Checks whether an HTTP response or payload indicates a 401 Unauthorized status:
 * {
 *   "success": false,
 *   "message_code": 401,
 *   "error": "Unauthorized"
 * }
 */
export const is401Response = async (response) => {
  if (!response) return false;
  if (response.status === 401) return true;

  try {
    const clone = response.clone();
    const data = await clone.json();
    if (
      data &&
      (data.message_code === 401 ||
       data.status === 401 ||
       (data.success === false && (data.error === 'Unauthorized' || data.message === 'Unauthorized')))
    ) {
      return true;
    }
  } catch {
    // If body cannot be cloned or parsed as JSON, rely on status code
  }

  return false;
};

/**
 * Authenticated API Fetch wrapper that:
 * 1. Attaches current Bearer access token
 * 2. Catches 401 Unauthorized response
 * 3. Calls POST /api/users/retoken
 * 4. Re-calls the failed API with the new access_token seamlessly
 */
export const apiFetch = async (url, options = {}) => {
  const isRetokenCall = options._isRetokenCall || String(url).includes('/users/retoken');
  const isLoginCall = String(url).includes('/users/login');
  const isRetry = options._isRetry || false;

  const headers = new Headers(options.headers || {});

  // Automatically attach Bearer token if not present
  if (!headers.has('Authorization')) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  // If already retrying, or calling login/retoken endpoints, don't intercept 401
  if (isRetokenCall || isLoginCall || isRetry) {
    return response;
  }

  const isUnauthorized = await is401Response(response);

  if (isUnauthorized) {
    try {
      // Reissue access token using POST /api/users/retoken
      const newAccessToken = await requestTokenRefresh();

      // Retry original request with the fresh access_token
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
      if (options.body && typeof options.body === 'string' && !retryHeaders.has('Content-Type')) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      return await fetch(url, {
        ...options,
        headers: retryHeaders,
        _isRetry: true
      });
    } catch (refreshErr) {
      console.warn('apiFetch retry after token refresh failed:', refreshErr);
      return response;
    }
  }

  return response;
};

/**
 * Global window.fetch interceptor:
 * Catches any direct fetch calls returning 401 or { success: false, message_code: 401 },
 * automatically requests retoken and retries with the new access_token.
 */
export const setupFetchInterceptor = () => {
  if (typeof window === 'undefined' || window.__POS_FETCH_INTERCEPTOR_ACTIVE__) {
    return;
  }

  const nativeFetch = window.fetch;
  window.__POS_FETCH_INTERCEPTOR_ACTIVE__ = true;

  window.fetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const isAppApi = url.includes('/api/') || url.startsWith(API_BASE_URL);

    // Skip intercepting non-app URLs, retoken calls, login, or explicit retries
    if (
      !isAppApi ||
      init._isRetokenCall ||
      init._isRetry ||
      url.includes('/users/retoken') ||
      url.includes('/users/login')
    ) {
      return nativeFetch.apply(this, arguments);
    }

    const response = await nativeFetch.apply(this, arguments);
    const isUnauthorized = await is401Response(response);

    if (isUnauthorized) {
      try {
        const newAccessToken = await requestTokenRefresh();

        const retryHeaders = new Headers(
          init.headers || (typeof input === 'object' && input.headers ? input.headers : {})
        );
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

        const retryInit = {
          ...init,
          headers: retryHeaders,
          _isRetry: true
        };

        return await nativeFetch.call(this, input, retryInit);
      } catch (err) {
        console.warn('Native fetch interceptor retoken failed:', err);
        return response;
      }
    }

    return response;
  };
};

// Initialize fetch interceptor automatically
setupFetchInterceptor();

/**
 * Fetches user profile from GET /api/users/:userid with Bearer token
 * Response shape:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "1c4acf99-101b-4719-b70e-e8ad3e840299",
 *     "userid": "johndoe",
 *     "name": "John Doe",
 *     "email": "johndoe@example.com",
 *     "role": "admin",
 *     "createdAt": "2026-10-19T17:02:23.893Z",
 *     "updatedAt": "2026-11-05T16:50:33.685Z"
 *   }
 * }
 */
export const getUserProfile = async (userid) => {
  const targetId = userid || getUserId();

  if (targetId && targetId !== 'userid') {
    const response = await apiFetch(`${API_ENDPOINTS.USERS}/${encodeURIComponent(targetId)}`, {
      method: 'GET'
    });

    // Fallback: If 404, try literal /api/users/userid
    if (response.status === 404) {
      return await apiFetch(`${API_ENDPOINTS.USERS}/userid`, {
        method: 'GET'
      });
    }
    return response;
  }

  return await apiFetch(`${API_ENDPOINTS.USERS}/userid`, {
    method: 'GET'
  });
};

/**
 * Resolves full user profile details (name, email, userid, role, createdAt)
 * by combining JWT claims, GET /api/users/:userid, and fallback matching against GET /api/users.
 */
export const fetchFullUserProfile = async (userOrId) => {
  const userObj = typeof userOrId === 'object' && userOrId !== null ? userOrId : {};
  const token = userObj.accessToken || userObj.access_token || getAccessToken();
  const jwtClaims = decodeJwtPayload(token) || {};
  const jwtUser = jwtClaims.user || jwtClaims.data || jwtClaims;

  const candidates = Array.from(
    new Set(
      [
        typeof userOrId === 'string' ? userOrId : null,
        userObj.userid,
        userObj.id && userObj.id !== 'usr-active' ? userObj.id : null,
        userObj.email,
        jwtUser?.userid,
        jwtUser?.id,
        jwtUser?.sub,
        jwtUser?.email,
        getUserId()
      ]
        .filter(Boolean)
        .map((v) => String(v).trim())
    )
  );

  let resolvedProfile = null;

  // 1. Try GET /api/users/:id for candidate identifiers
  for (const candidate of candidates) {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.USERS}/${encodeURIComponent(candidate)}`, {
        method: 'GET'
      });
      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        const record = resData.data || (resData.userid || resData.email || resData.name ? resData : null);
        if (record && typeof record === 'object' && !Array.isArray(record)) {
          resolvedProfile = record;
          if (record.name && record.email) break;
        }
      }
    } catch {
      // continue to next candidate or list fallback
    }
  }

  // 2. Fallback: Try GET /api/users list and match by userid, email, or id
  if (!resolvedProfile || !resolvedProfile.name || !resolvedProfile.email) {
    try {
      const listRes = await apiFetch(API_ENDPOINTS.USERS, { method: 'GET' });
      if (listRes.ok) {
        const listData = await listRes.json().catch(() => ({}));
        const usersList = Array.isArray(listData.data)
          ? listData.data
          : Array.isArray(listData)
            ? listData
            : [];

        const lowerCandidates = candidates.map((c) => c.toLowerCase());
        const matched = usersList.find((u) => {
          if (!u) return false;
          const uId = String(u.userid || '').toLowerCase();
          const uEmail = String(u.email || '').toLowerCase();
          const uUuid = String(u.id || '').toLowerCase();
          return (
            (uId && lowerCandidates.includes(uId)) ||
            (uEmail && lowerCandidates.includes(uEmail)) ||
            (uUuid && lowerCandidates.includes(uUuid))
          );
        });

        if (matched) {
          resolvedProfile = { ...(resolvedProfile || {}), ...matched };
        }
      }
    } catch {
      // ignore fallback error
    }
  }

  const merged = {
    ...(jwtUser && typeof jwtUser === 'object' ? jwtUser : {}),
    ...userObj,
    ...(resolvedProfile || {})
  };

  const finalName =
    resolvedProfile?.name ||
    jwtUser?.name ||
    (userObj.name && userObj.name !== 'Staff User' ? userObj.name : '') ||
    resolvedProfile?.userid ||
    userObj.userid ||
    'Staff User';

  const finalInitials = finalName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PS';

  return {
    ...merged,
    name: finalName,
    email: resolvedProfile?.email || jwtUser?.email || userObj.email || merged.userid || '',
    userid: resolvedProfile?.userid || jwtUser?.userid || userObj.userid || candidates[0] || '',
    role: resolvedProfile?.role || jwtUser?.role || (userObj.role && userObj.role !== 'Fragrance Specialist' ? userObj.role : '') || userObj.role || 'Staff',
    initials: finalInitials
  };
};

/**
 * Base64 encoding helper for passwords
 */
export const encodeBase64 = (str) => {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
};

/**
 * Updates user password via PUT /api/users/:userid
 * Request:
 * PUT localhost:5000/api/users/:userid
 * {
 *   "password": "dXNlckAxMjM="
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Password updated successfully",
 *   "data": {
 *     "id": "b3e34b22-801a-4c28-97c3-7e45b46e3119",
 *     "userid": "john_doe"
 *   }
 * }
 */
export const updateUserPassword = async (userid, encodedPassword) => {
  const targetId = userid || getUserId();

  if (targetId && targetId !== 'userid') {
    let response = await apiFetch(`${API_ENDPOINTS.USERS}/${encodeURIComponent(targetId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: encodedPassword
      })
    });

    // Fallback: If 404 and targetId wasn't literally 'userid', try /api/users/userid
    if (response.status === 404) {
      response = await apiFetch(`${API_ENDPOINTS.USERS}/userid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: encodedPassword
        })
      });
    }
    return response;
  }

  return await apiFetch(`${API_ENDPOINTS.USERS}/userid`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: encodedPassword
    })
  });
};
