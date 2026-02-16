import React, { useEffect, useState, useCallback } from "react";
import { Clock, Calendar, CheckCircle, Search, Filter, Printer, User, Wifi, Monitor, Cpu, Box, ChevronDown } from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { getHistory } from "../../api/it";
import { listCategories } from "../../api/category"; // Import list categories
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const History = () => {
    const { token } = useAuthStore();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [categories, setCategories] = useState([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false); // [NEW]

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getHistory(token);
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await listCategories(token);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    }, [token]);

    useEffect(() => {
        fetchHistory();
        fetchCategories();
    }, [fetchHistory, fetchCategories]);

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === "All" || ticket.category?.name === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const getCategoryStyle = (categoryName) => {
        switch (categoryName) {
            case "Hardware":
                return { bg: "bg-pink-100", text: "text-pink-600", icon: <Monitor size={24} /> };
            case "Software":
                return { bg: "bg-blue-100", text: "text-blue-600", icon: <Cpu size={24} /> };
            case "Network":
                return { bg: "bg-purple-100", text: "text-purple-600", icon: <Wifi size={24} /> };
            case "Printer":
                return { bg: "bg-orange-100", text: "text-orange-600", icon: <Printer size={24} /> };
            case "Account":
                return { bg: "bg-green-100", text: "text-green-600", icon: <User size={24} /> };
            default:
                return { bg: "bg-gray-100", text: "text-gray-600", icon: <Box size={24} /> };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-poppins text-gray-900 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                            <Clock className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-white text-3xl font-semibold tracking-tight">
                                Task History
                            </h1>
                            <p className="text-blue-200 text-sm mt-1">
                                Archive of all completed maintenance tasks and resolutions
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 mt-6 relative z-10 space-y-6">
                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-4 z-20">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title, equipment, or room..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-auto">
                                <button
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="w-full md:w-64 pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Filter size={20} className="text-gray-400" />
                                        <span>{filterCategory === "All" ? "All Categories" : filterCategory}</span>
                                    </div>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => {
                                                setFilterCategory("All");
                                                setIsCategoryOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F6F6F6] transition-colors"
                                        >
                                            All Categories
                                        </button>
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setFilterCategory(cat.name);
                                                    setIsCategoryOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F6F6F6] transition-colors"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredTickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">No history found</h3>
                            <p className="text-gray-500 mt-1">You haven't completed any tasks yet.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => {
                            const style = getCategoryStyle(ticket.category?.name);
                            return (
                                <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex items-start gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${style.bg} ${style.text}`}>
                                                {style.icon}
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-800 text-lg md:text-xl group-hover:text-blue-600 transition-colors">
                                                        {ticket.equipment?.name || ticket.title}
                                                    </h3>
                                                    <span className="bg-green-100 text-green-700 text-[10px] uppercase font-semibold px-2 py-1 rounded-full tracking-wide">
                                                        Resolved
                                                    </span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-sm text-gray-500 mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Box size={14} />
                                                        <span>Room {ticket.room?.roomNumber} (Fl. {ticket.room?.floor})</span>
                                                    </div>
                                                    <div className="hidden sm:block text-gray-300">•</div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Ticket #{ticket.id}</span>
                                                    </div>
                                                    <div className="hidden sm:block text-gray-300">•</div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{ticket.category?.name}</span>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-1">
                                                    {ticket.title} — {ticket.description || "No specific description"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 pl-0 md:pl-4 md:min-w-[140px]">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Completed</p>
                                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {dayjs(ticket.updatedAt).format("MMM D, YYYY")}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {dayjs(ticket.updatedAt).format("HH:mm")}
                                                </p>
                                            </div>

                                            {ticket.rating ? (
                                                <div className="flex items-center gap-1.5 mt-3 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                                                    <span className="text-yellow-500 text-sm">⭐</span>
                                                    <span className="text-sm font-semibold text-gray-800">{ticket.rating}/5</span>
                                                </div>
                                            ) : (
                                                <div className="mt-3 px-3 py-1.5 text-xs text-gray-400 bg-gray-50 rounded-lg">
                                                    No Rating
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;
