import React, { useEffect, useState, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { getTicketHistory } from "../../api/ticket";
import { listCategories } from "../../api/category";
import { useNavigate } from "react-router-dom";
import TicketCard from "./TicketCard";

const TicketHistory = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        categoryId: "all",
        status: "all"
    });

    const statusOptions = [
        { id: "all", label: "All" },
        { id: "not_started", label: "Not Started" },
        { id: "in_progress", label: "In Progress" },
        { id: "completed", label: "Completed" }
    ];

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Categories (Non-blocking)
            listCategories(token)
                .then(res => setCategories(Array.isArray(res?.data) ? res.data : []))
                .catch(err => {
                    console.error("Category Fetch Error:", err);
                    setCategories([]);
                });

            // Fetch Tickets
            // Note: Ensure your backend supports 'status' param if not already
            const params = {
                categoryId: filters.categoryId !== "all" ? filters.categoryId : undefined,
                // Backend might expect specific status strings. 
                // Adjust if your backend logic for "all" is different (e.g. omitting param).
            };

            const ticketRes = await getTicketHistory(token, params);

            // Client-side filtering for status if backend doesn't support it yet
            // or if we want instant UI updates for small datasets
            let data = Array.isArray(ticketRes?.data) ? ticketRes.data : [];

            if (filters.status !== "all") {
                data = data.filter(t => t.status === filters.status);
            }

            if (filters.categoryId !== "all") {
                data = data.filter(t => t.categoryId == filters.categoryId);
            }

            setTickets(data);
        } catch (err) {
            console.error("Ticket Fetch Error:", err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        loadData();
    }, [loadData]);


    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col gap-4">

                {/* Status Tabs */}
                <div className="grid grid-cols-4 gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                    {statusOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setFilters(prev => ({ ...prev, status: option.id }))}
                            className={`py-2.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center ${filters.status === option.id
                                    ? "bg-[#193C6C] text-white shadow-md shadow-blue-900/10"
                                    : "text-slate-500 hover:bg-slate-50"
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-2">
                    <button
                        onClick={() => setFilters(prev => ({ ...prev, categoryId: "all" }))}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${filters.categoryId === "all"
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilters(prev => ({ ...prev, categoryId: cat.id }))}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${filters.categoryId === cat.id
                                    ? "bg-slate-800 text-white border-slate-800"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 pb-20">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 animate-pulse">Loading history...</div>
                ) : tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <Search size={48} className="text-slate-200 mb-4" />
                        <p>No tickets found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketHistory;
