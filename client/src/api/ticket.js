import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const createTicket = async (token, form) => {
    return await axios.post(`${API_URL}/ticket`, form, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const listMyTickets = async (token) => {
    return await axios.get(`${API_URL}/ticket`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const getTicket = async (token, id) => {
    return await axios.get(`${API_URL}/ticket/` + id, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const listTicketsByEquipment = async (token, id) => {
    return await axios.get(`${API_URL}/ticket/equipment/` + id, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export const submitFeedback = async (token, id, data) => {
    return await axios.post(`${API_URL}/ticket/${id}/feedback`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const getAllTickets = async (token, params = {}) => {
    return await axios.get(`${API_URL}/ticket/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params
    })
}

// Get Ticket History with Filters
export const getTicketHistory = async (token, params = {}) => {
    return await axios.get(`${API_URL}/ticket/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params
    });
}
