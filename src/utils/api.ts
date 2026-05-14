// Myanmar Link ISP - Field Team Mobile App
// API Configuration & Auth Utilities

const API_BASE = 'https://erp.myanmarlink.online/api';

// Token storage (use SecureStore in production)
let _token: string | null = null;

export const setToken = (token: string | null) => { _token = token; };
export const getToken = () => _token;

export const api = async (path: string, options: RequestInit = {}) => {
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return data;
};

export const login = async (staffId: string, password: string, department: string) => {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ staff_id: staffId, password, department }),
  });
  if (data.session_token) setToken(data.session_token);
  return data;
};

export const logout = async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch {}
  setToken(null);
};

export const getMe = () => api('/auth/me');
export const getIMFTTasks = (date?: string) => api(`/imft/tasks${date ? `?date=${date}` : ''}`);
export const getIMFTDashboard = () => api('/imft/dashboard-stats');
export const getDailyTarget = (date?: string) => api(`/imft/daily-target${date ? `?date=${date}` : ''}`);
export const getMonthlyBonus = () => api('/imft/monthly-bonus');
export const updateIMFTTask = (tid: string, data: any) => api(`/imft/tasks/${tid}`, { method: 'PUT', body: JSON.stringify(data) });
export const getInventory = () => api('/inventory');
export const getBMFTTasks = () => api('/bmft/tasks');
export const updateBMFTTask = (tid: string, data: any) => api(`/bmft/tasks/${tid}`, { method: 'PUT', body: JSON.stringify(data) });
export const getNOCTasks = () => api('/noc/tasks');
export const getEquipmentUsage = () => api('/imft/equipment-usage');
export const submitPowerTest = (data: any) => api('/imft/power-test', { method: 'POST', body: JSON.stringify(data) });

export default api;
