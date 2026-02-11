// client/src/api/category.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const createCategory = async (token, data) => {
  return await axios.post(`${API_URL}/category`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const listCategories = async (token) => {
  return await axios.get(`${API_URL}/category`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCategory = async (token, id, data) => {
  return await axios.put(`${API_URL}/category/` + id, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeCategory = async (token, id) => {
  return await axios.delete(`${API_URL}/category/` + id, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
