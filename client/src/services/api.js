import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Channels
export const getChannels = () => API.get('/channels');
export const createChannel = (data) => API.post('/channels', data);
export const deleteChannel = (id) => API.delete(`/channels/${id}`);

// Messages
export const getMessages = (channelId, skip = 0) =>
  API.get(`/messages/${channelId}?limit=50&skip=${skip}`);
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export default API;
