import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listAllTickets, removeTicket } from '../../api/admin'
import useAuthStore from '../../store/auth-store'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify'
import { Search, MapPin, User, Clock, Trash2, Eye, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'

dayjs.extend(relativeTime);

const AllTickets = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { token } = useAuthStore()

    // Server-side Pagination State
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTickets, setTotalTickets] = useState(0)

    // Filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all')
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

    // Debounce Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Validate Page Effect
    useEffect(() => {
        // If filters change, reset to page 1
        setCurrentPage(1);
    }, [debouncedSearch, filterStatus]);

    const loadTickets = useCallback(async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                limit: 12, // Grid 3 cols -> 12 is nice
                search: debouncedSearch,
                status: filterStatus === 'all' ? undefined : filterStatus
            }

            // Allow bookmarking searches
            const newParams = {};
            if (debouncedSearch) newParams.search = debouncedSearch;
            if (filterStatus !== 'all') newParams.status = filterStatus;
            setSearchParams(newParams, { replace: true });

            const res = await listAllTickets(token, params)

            // New Response Structure: { data, total, page, totalPages }
            if (res.data.data) {
                setTickets(res.data.data)
                setTotalTickets(res.data.total)
                setTotalPages(res.data.totalPages)
            } else {
                // Fallback if structure mismatches (shouldn't happen with our changes)
                setTickets([])
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load tickets')
        } finally {
            setLoading(false)
        }
    }, [token, currentPage, debouncedSearch, filterStatus, setSearchParams])

    useEffect(() => {
        loadTickets()
    }, [loadTickets])

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this ticket?')) return
        try {
            await removeTicket(token, id)
            toast.success('Ticket Deleted')
            loadTickets()
        } catch {
            toast.error('Delete Failed')
        }
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Styles Helpers
    const getStatusColor = (status) => {
        switch (status) {
            case "not_start": return "border-l-amber-400 border-gray-100";
            case "in_progress": return "border-l-blue-400 border-gray-100";
            case "completed": return "border-l-green-400 border-gray-100";
            default: return "border-l-gray-400 border-gray-100";
        }
    };

    const getUrgencyBadge = (urgency) => {
        switch (urgency) {
            case "High":
            case "Critical": return "bg-red-100 text-red-600";
            case "Medium": return "bg-orange-100 text-orange-600";
            case "Low": return "bg-green-100 text-green-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusDotColor = (status) => {
        switch (status) {
            case "not_start": return "bg-amber-500";
            case "in_progress": return "bg-blue-500";
            case "completed": return "bg-green-500";
            default: return "bg-gray-400";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Ticket Management</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">View and manage all support tickets</p>
            </div>

            <div className="space-y-6">
                {/* Controls */}
                <div className="bg-white p-4 rounded-[8px] shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-center text-sm">
                        {/* Search */}
                        <div className="flex items-center gap-3 w-full md:w-96 bg-[#F6F6F6] px-4 py-2.5 rounded-[8px] border border-gray-100">
                            <Search className="text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search tickets by title, ID, or user..."
                                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
                            {['all', 'not_start', 'in_progress', 'completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2.5 rounded-[6px] text-xs font-medium capitalize transition-all whitespace-nowrap border ${filterStatus === status
                                        ? 'bg-[#193C6C] text-white border-[#193C6C] shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content - Grid View */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                            Total Tickets <span className="text-gray-400 ml-1">({totalTickets})</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-white rounded-[8px] shadow-sm animate-pulse border border-gray-100"></div>)}
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[8px] shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No tickets found</h3>
                            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => navigate(`/admin/ticket/${ticket.id}`)}
                                        className={`
                                        bg-white rounded-[8px] p-5 shadow-sm border border-l-4 relative cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group
                                        ${getStatusColor(ticket.status)}
                                    `}
                                    >
                                        {/* Header: ID & Priority & Time */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#193C6C] font-bold text-sm">
                                                    #TK-{String(ticket.id).padStart(4, "0")}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${getUrgencyBadge(ticket.urgency)}`}>
                                                    {ticket.urgency}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs font-medium">
                                                {dayjs(ticket.createdAt).fromNow(true).replace(" days", "d").replace(" months", "mo")} ago
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold font-poppins text-gray-900 text-[16px] mb-2 line-clamp-2 min-h-[48px]">
                                            {ticket.title}
                                        </h3>

                                        {/* Location & User */}
                                        <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-4 font-medium">
                                            {ticket.room && (
                                                <p className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {ticket.room.roomNumber} (Fl. {ticket.room.floor})
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="truncate max-w-[200px]">{ticket.createdBy?.name || ticket.createdBy?.username}</span>
                                            </p>
                                        </div>

                                        {/* Footer: Status & Assigned To */}
                                        <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(ticket.status)}`}></div>
                                                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                                                    {ticket.status.replace("_", " ")}
                                                </span>
                                            </div>

                                            {ticket.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-400">Assigned:</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <img
                                                            src={ticket.assignedTo.picture || `https://ui-avatars.com/api/?name=${ticket.assignedTo.name}&background=random`}
                                                            alt="Agent"
                                                            className="w-5 h-5 rounded-full object-cover ring-1 ring-gray-100"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">Unassigned</span>
                                            )}
                                        </div>

                                        {/* Delete Button - Admin Only */}
                                        <button
                                            onClick={(e) => handleDelete(e, ticket.id)}
                                            className="absolute top-4 right-4 p-1.5 bg-white hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-[6px] transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-gray-100"
                                            title="Delete Ticket"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-6">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-[8px] border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={20} className="text-gray-600" />
                                    </button>

                                    <span className="text-sm font-medium text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-[8px] border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight size={20} className="text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AllTickets
