import axios from 'axios';

const gmailApi = axios.create({
  baseURL: '/',
  withCredentials: true, // send httpOnly cookie on every request
});

// Intercept 401 errors — reload to reset Gmail auth state
gmailApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/gmail-api/auth/me')) {
        // Reset gmail auth state without a full page reload
        window.dispatchEvent(new CustomEvent('gmail-auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const gmailGetMe = () =>
  gmailApi.get('/gmail-api/auth/me').then((r) => r.data);

export const gmailLogout = () =>
  gmailApi.post('/gmail-api/auth/logout').then((r) => r.data);

// ── Gmail ─────────────────────────────────────────────────────────────────────
export const gmailGetProfile = () =>
  gmailApi.get('/gmail-api/profile').then((r) => r.data);

export const gmailGetMessages = (params: Record<string, string | number | undefined> = {}) =>
  gmailApi.get('/gmail-api/messages', { params }).then((r) => r.data);

export const gmailGetMessage = (id: string) =>
  gmailApi.get(`/gmail-api/messages/${id}`).then((r) => r.data);

export const gmailGetLabels = () =>
  gmailApi.get('/gmail-api/labels').then((r) => r.data);

export const gmailMarkAsRead = (id: string) =>
  gmailApi.post(`/gmail-api/messages/${id}/read`).then((r) => r.data);

export const gmailToggleStar = (id: string, starred: boolean) =>
  gmailApi.post(`/gmail-api/messages/${id}/star`, { starred }).then((r) => r.data);

export default gmailApi;
