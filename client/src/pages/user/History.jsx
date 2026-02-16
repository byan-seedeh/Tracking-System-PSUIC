import React, { useEffect, useState, useCallback } from "react";
import { Search, ArrowLeft, History as HistoryIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth-store";
import { listMyTickets } from "../../api/ticket";
import { listCategories } from "../../api/category";
import TicketCard from "../../components/user/TicketCard";

const History = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [filters, setFilters] = useState({
        search: "",
        priority: "all"
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [ticketRes, catRes] = await Promise.all([
                listMyTickets(token),
                listCategories(token)
            ]);

            if (ticketRes && Array.isArray(ticketRes.data)) {
                // Filter only Completed Tickets
                const completedTickets = ticketRes.data.filter(t => t.status === "completed");
                setTickets(completedTickets);
            } else {
                setTickets([]);
            }

            if (catRes && Array.isArray(catRes.data)) {
                setCategories([{ id: "all", name: "All" }, ...catRes.data]);
            } else {
                setCategories([{ id: "all", name: "All" }]);
            }

        } catch (err) {
            console.error("Error loading history:", err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredTickets = tickets.filter(t => {
        // Category Filter (Using filters.priority state to store category name or id)
        // If the filter is not 'all', check if ticket category name matches the filter
        if (filters.priority !== "all") {
            const categoryName = t.Category?.name || t.category?.name || "";
            if (categoryName !== filters.priority) return false;
        }

        // Search Filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchTitle = t.title?.toLowerCase().includes(searchLower);
            const matchCategory = (t.Category?.name || t.category?.name)?.toLowerCase().includes(searchLower);
            const matchLocation = `fl.${t.Room?.floor || t.room?.floor} - ${t.Room?.roomNumber || t.room?.roomNumber}`.toLowerCase().includes(searchLower);

            return matchTitle || matchCategory || matchLocation;
        }

        return true;
    });

    return (
        <div className="bg-gray-50 font-poppins text-gray-900">
            {/* Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0 overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white opacity-[0.04] blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl mx-auto flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight">
                        History
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6 relative z-10 pb-20">

                {/* Search Bar */}
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search history..."
                        className="w-full h-[50px] pl-12 pr-4 rounded-2xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all shadow-sm font-medium"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                {/* Category Filter - Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 touch-pan-x">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilters(prev => ({ ...prev, priority: cat.name === 'All' ? 'all' : cat.name }))}
                            className={`h-[42px] px-6 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center whitespace-nowrap shrink-0 border ${(filters.priority === 'all' && cat.name === 'All') || filters.priority === cat.name
                                ? "bg-[#193C6C] text-white border-[#193C6C] shadow-md shadow-blue-900/10"
                                : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex flex-col gap-4 pb-20">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400 animate-pulse">Loading history...</div>
                    ) : filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400 flex flex-col items-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <HistoryIcon size={24} className="text-slate-300" />
                            </div>
                            <p className="font-medium text-slate-600">No completed tasks yet</p>
                            <p className="text-xs text-slate-400 mt-1">Completed requests will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
