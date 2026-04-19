// src/utils/versionControl.ts

export const APP_VERSION = '3.0.0'; // Match the version in index.html

const SESSION_KEYS = {
  APP_VERSION: 'footnfts_app_version',
  AUTH_TOKEN: 'footnfts_auth_token',
  USER_ID: 'footnfts_user_id',
};

// Check if version changed - but DON'T clear user data
export const checkAppVersion = (): boolean => {
  const savedVersion = localStorage.getItem(SESSION_KEYS.APP_VERSION);
  
  if (savedVersion !== APP_VERSION) {
    console.log('🔄 Version mismatch:', savedVersion, '->', APP_VERSION);
    // ONLY update version, DO NOT clear auth data
    localStorage.setItem(SESSION_KEYS.APP_VERSION, APP_VERSION);
    return true;
  }
  return false;
};

// Session management - preserve user data
export const setAuthSession = (token: string, userId: string) => {
  localStorage.setItem(SESSION_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(SESSION_KEYS.USER_ID, userId);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(SESSION_KEYS.AUTH_TOKEN);
};

export const getUserId = (): string | null => {
  return localStorage.getItem(SESSION_KEYS.USER_ID);
};

export const clearAuthSession = () => {
  localStorage.removeItem(SESSION_KEYS.AUTH_TOKEN);
  localStorage.removeItem(SESSION_KEYS.USER_ID);
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getUserId();
};