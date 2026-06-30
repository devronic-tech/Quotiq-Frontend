// ============================================================
// Axios Instance — Configured with JWT interceptors
// ============================================================
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('qt_tokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens) as { accessToken: string };
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Queue to hold failed requests while token is refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: handle 401 with queued token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the response is unauthorized and the request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until the token is refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = localStorage.getItem('qt_tokens');
        if (!tokens) throw new Error('No tokens');

        const { refreshToken } = JSON.parse(tokens) as { refreshToken: string };
        // Use basic axios instance to prevent loop
        const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });

        const newTokens = data.data;
        localStorage.setItem('qt_tokens', JSON.stringify(newTokens));

        // Update the original request's authorization header
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        // Resolve all waiting requests with the new token
        processQueue(null, newTokens.accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        // Reject all queued requests and log the user out
        processQueue(err, null);
        isRefreshing = false;

        localStorage.removeItem('qt_tokens');
        localStorage.removeItem('qt_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
