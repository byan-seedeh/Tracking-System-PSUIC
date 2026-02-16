import React, { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, MapPin, Calendar, User } from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { getAllTickets } from "../../api/ticket";
import { useNavigate, useSearchParams } from "react-router-dom";


const Tickets = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Server-side Pagination State
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTickets, setTotalTickets] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || "all");
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, activeFilter]);

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10, // List View
                search: debouncedSearch,
                status: activeFilter === "All" || activeFilter === "all" ? undefined : activeFilter.toLowerCase().replace(" ", "_")
            };

            // Update URL params
            const newParams = {};
            if (debouncedSearch) newParams.search = debouncedSearch;
            if (activeFilter !== "All" && activeFilter !== "all") newParams.status = activeFilter;
            setSearchParams(newParams, { replace: true });

            const res = await getAllTickets(token, params);

            // Handle new response structure { data, total, page, totalPages }
            if (res.data.data) {
                setTickets(res.data.data);
                setTotalTickets(res.data.total);
                setTotalPages(res.data.totalPages);
            } else {
                setTickets([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, debouncedSearch, activeFilter, setSearchParams]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-poppins text-gray-900">
            {/* Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <div>
                            <h1 className="text-white text-3xl font-semibold">Tickets</h1>
                            <p className="text-blue-200 mt-1 font-medium">Manage and track IT support requests</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10 text-white">
                        <span className="text-sm font-semibold">Total Tickets:</span>
                        <span className="font-semibold text-xl">{totalTickets}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1200px] mx-auto px-6 mt-6 relative z-10 space-y-6">

                {/* Filters & Search - Modern Style (Separated Chunks) */}
                <div className="flex flex-col gap-6">
                    {/* Search - Top Chunk */}
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 relative w-full flex items-center">
                        <div className="absolute left-4 text-gray-400">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tickets by ID, title, or requester..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-transparent focus:bg-white focus:ring-0 text-base font-medium text-gray-700 placeholder-gray-400 outline-none"
                        />
                    </div>

                    {/* Filter Tabs - Bottom Chunk (Scrollable) */}
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 w-full">
                        {["All", "Not Started", "In Progress", "Completed", "Rejected"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`
                                flex-1 min-w-[140px] px-6 py-4 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap shadow-sm text-center
                                ${(activeFilter === filter ||
                                        (activeFilter === "all" && filter === "All") ||
                                        (activeFilter === "completed" && filter === "Completed") ||
                                        (activeFilter === "in_progress" && filter === "In Progress") ||
                                        (activeFilter === "not_start" && filter === "Not Started") ||
                                        (activeFilter === "rejected" && filter === "Rejected"))
                                        ? "bg-[#193C6C] text-white border-[#193C6C] shadow-md transform scale-[1.02]"
                                        : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:text-gray-900"
                                    }
                            `}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ticket Grid */}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl h-40 animate-pulse shadow-sm border border-gray-100"></div>
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4">
                            {tickets.map((ticket) => {
                                // Design Helpers
                                const getUrgencyColor = (urgency) => {
                                    switch (urgency) {
                                        case 'Critical': return 'border-red-500 bg-red-50 text-red-700';
                                        case 'High': return 'border-orange-500 bg-orange-50 text-orange-700';
                                        case 'Medium': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
                                        case 'Low': return 'border-blue-500 bg-blue-50 text-blue-700';
                                        default: return 'border-gray-500 bg-gray-50 text-gray-700';
                                    }
                                };
                                const urgencyStyle = getUrgencyColor(ticket.urgency);
                                const urgencyBorder = urgencyStyle.split(' ')[0]; // Extract border class for card
                                const urgencyBadge = urgencyStyle; // Use full style for badge

                                const getStatusStyle = (status) => {
                                    switch (status) {
                                        case 'not_start': return 'bg-[#0288D1] text-white border-[#0288D1]';
                                        case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                                        case 'completed': return 'bg-green-100 text-green-700 border-green-200';
                                        case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
                                        default: return 'bg-gray-100 text-gray-700 border-gray-200';
                                    }
                                };
                                const getStatusLabel = (status) => {
                                    if (status === 'not_start') return 'Not Started'; // Or 'Pending'
                                    if (status === 'in_progress') return 'In Progress';
                                    return status?.replace('_', ' ') || 'Unknown';
                                }

                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => navigate(`/it/ticket/${ticket.id}`)}
                                        className={`
                                        bg-white rounded-xl shadow-sm border border-gray-200 
                                        p-5 relative cursor-pointer hover:shadow-md transition-all duration-200
                                        flex flex-col gap-3 group
                                    `}
                                    >
                                        {/* Header: Category | Urgency | Status */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                {/* Category Badge */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                                                    <Search size={12} className="text-gray-500" />
                                                    <span>{ticket.category?.name || "General"}</span>
                                                </div>

                                                {/* Urgency Badge (Only if urgent/critical? Or always? Design shows orange badge) */}
                                                <div className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${urgencyBadge.replace(/border-\w+/, '')} bg-opacity-20`}>
                                                    {ticket.urgency || "Normal"}
                                                </div>
                                            </div>

                                            {/* Status Badge (Right) */}
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(ticket.status)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                                {getStatusLabel(ticket.status)}
                                            </div>
                                        </div>

                                        {/* Body: Title & Description */}
                                        <div className="mt-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight group-hover:text-[#193C6C] transition-colors">
                                                    {ticket.title}
                                                </h3>
                                                <ChevronRight size={18} className="text-gray-300 mt-1" />
                                            </div>

                                            <p className="text-sm text-gray-500 line-clamp-1 mt-1 font-medium">
                                                {ticket.description}
                                            </p>
                                        </div>

                                        {/* Footer: Location | Date | User */}
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-500 mt-2 pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span>
                                                    {ticket.room?.floor ? `Fl. ${ticket.room.floor}` : ''}
                                                    {ticket.room?.floor && ticket.room?.roomNumber ? ', ' : ''}
                                                    {ticket.room?.roomNumber || "Unknown Location"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span>
                                                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-gray-400" />
                                                <span>{ticket.createdBy?.name || "Unknown User"}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-gray-600"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <span className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-gray-600"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
};

export default Tickets;
