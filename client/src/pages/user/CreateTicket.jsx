// client/src/pages/user/CreateTicket.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Search, ArrowLeft, PlusCircle, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth-store";
import { listMyTickets } from "../../api/ticket";
import { listCategories } from "../../api/category";
import TicketCard from "../../components/user/TicketCard";

const CreateTicket = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: "All" // 'All', 'Not Started', 'In Progress'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load Tickets
      const ticketRes = await listMyTickets(token);

      if (ticketRes && Array.isArray(ticketRes.data)) {
        // Filter out 'completed' and 'rejected'
        // We show 'pending' (Not Started) and 'in_progress' and maybe 'cancelled'?
        // Actually the requirement is filters: All, Not Started, In Progress
        // Let's grab everything that is NOT completed
        const activeTickets = ticketRes.data.filter(t => t.status !== "completed");
        setTickets(activeTickets);
      } else {
        setTickets([]);
      }

    } catch (err) {
      console.error("Error loading tickets:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTickets = tickets.filter(t => {
    // Status Filter
    if (filters.status !== "All") {
      // Map UI filter status to API status values
      // "Not Started" -> "pending"
      // "In Progress" -> "in_progress"
      let targetStatus = "";
      if (filters.status === "Not Started") targetStatus = "pending";
      else if (filters.status === "In Progress") targetStatus = "in_progress";

      if (t.status !== targetStatus) return false;
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

  const statusFilters = ["All", "Not Started", "In Progress"];

  return (
    <div className="bg-gray-50 font-poppins text-gray-900 min-h-screen">
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
            Report
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6 space-y-6 relative z-10 pb-24">

        {/* Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search active tickets..."
            className="w-full h-[50px] pl-12 pr-4 rounded-2xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#193C6C]/10 focus:border-[#193C6C] transition-all shadow-sm font-medium"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 touch-pan-x">
          {statusFilters.map(status => (
            <button
              key={status}
              onClick={() => setFilters(prev => ({ ...prev, status: status }))}
              className={`h-[42px] px-6 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center whitespace-nowrap shrink-0 border ${filters.status === status
                ? "bg-[#193C6C] text-white border-[#193C6C] shadow-md shadow-blue-900/10"
                : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-20 text-slate-400 animate-pulse">Loading tickets...</div>
          ) : filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => navigate(`/user/ticket/${ticket.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
              <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={32} className="text-blue-200" />
              </div>
              <h3 className="font-semibold text-slate-700 text-lg">No tickets found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                {filters.search || filters.status !== "All"
                  ? "Try adjusting your search or filters."
                  : "You don't have any active reports right now."}
              </p>

              {/* Call to Action if list is empty */}
              {!filters.search && filters.status === "All" && (
                <button
                  onClick={() => navigate("/user/create-ticket/form")}
                  className="mt-6 flex items-center gap-2 bg-[#193C6C] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 hover:bg-[#132E52] transition-all"
                >
                  <PlusCircle size={20} />
                  Create New Ticket
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
