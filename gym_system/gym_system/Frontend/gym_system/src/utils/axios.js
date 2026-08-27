import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
let baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;
baseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

// Public axios instance (for login/register)
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // required for sending/receiving cookies
});

// Private axios instance (for protected endpoints)
export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true, // ensures cookies are sent
});

axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axiosInstance.get(
          "/auth/refresh",
          { withCredentials: true }
        );
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
