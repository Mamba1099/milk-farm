/**
 * Utility functions for session and route management
 */

export const isProtectedRoute = (path: string): boolean => {
  const protectedPaths = [
    '/dashboard',
    '/animals',
    '/production',
    '/accounts',
    '/analytics',
    '/settings',
    '/sales'
  ];
  
  return protectedPaths.some(protectedPath => path.startsWith(protectedPath));
};

export const isAuthRoute = (path: string): boolean => {
  const authPaths = ['/login', '/signup'];
  return authPaths.includes(path);
};

export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    const cookies = ['auth-token', 'session', 'refresh-token'];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });
  }
};

export const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    clearAuthData();
    window.location.replace('/login');
  }
};

export const redirectToDashboard = (): void => {
  if (typeof window !== 'undefined') {
    window.location.replace('/dashboard');
  }
};