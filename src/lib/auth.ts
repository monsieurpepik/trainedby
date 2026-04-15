/**
 * Auth helpers  -  cookie-first, localStorage fallback.
 * The tb_session HttpOnly cookie is set by the verify-magic-link edge function.
 * localStorage is kept as a fallback for backward compatibility.
 */

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith('tb_session=')) return c.slice('tb_session='.length);
  }
  return localStorage.getItem('tb_edit_token');
}

export function setAuthToken(token: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tb_edit_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('tb_edit_token');
  }
  if (typeof document !== 'undefined') {
    document.cookie =
      'tb_session=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Strict';
  }
}

export function isLoggedIn(): boolean {
  return !!getAuthToken();
}
