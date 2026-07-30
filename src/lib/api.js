import axios from "axios";

// Base URL backend, diatur lewat file .env -> VITE_API_BASE_URL
// Contoh: VITE_API_BASE_URL=http://localhost:5000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Menyisipkan access token JWT ke setiap request (jika ada)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika token kedaluwarsa / tidak valid (401), otomatis logout & kembali ke halaman login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/") {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Helper untuk mengambil pesan error yang konsisten dari response backend
export function getErrorMessage(err, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  return err?.response?.data?.message || fallback;
}

// Base URL tanpa /api, dipakai untuk mengakses file statis (gambar QR, lampiran)
export const FILE_BASE_URL = BASE_URL.replace(/\/api\/?$/, "");

export default api;
