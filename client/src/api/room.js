// client/src/api/room.js
import axios from "axios";

// Fallback to localhost if env is missing
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const listRooms = async (token) => {
  // ดึงข้อมูลห้องทั้งหมดจาก Server
  return await axios.get(`${API_URL}/room`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createRoom = async (token, form) => {
  return await axios.post(`${API_URL}/room`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateRoom = async (token, id, form) => {
  return await axios.put(`${API_URL}/room/` + id, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeRoom = async (token, id) => {
  return await axios.delete(`${API_URL}/room/` + id, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
