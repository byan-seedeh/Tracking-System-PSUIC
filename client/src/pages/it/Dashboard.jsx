import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Bell,
  Calendar,
  Search,
  ChevronRight
} from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { getMyTasks } from "../../api/it";

/* =======================
   Helper & Constants
======================= */

const urgencyWeight = {
  High: 3,
  Medium: 2,
  Low: 1,
  Normal: 0
};

const getPriorityStyle = (urgency) => {
  switch (urgency) {
    case "High":
      return "border-red-500 text-red-700 bg-red-50";
    case "Medium":
      return "border-blue-700 text-blue-800 bg-blue-50";
    case "Low":
      return "border-yellow-400 text-yellow-700 bg-yellow-50";
    default:
      return "border-gray-300 text-gray-600 bg-gray-50";
  }
};

const statusLabel = {
  not_start: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected"
};

/* =======================
   Main Component
======================= */

const ITDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await getMyTasks(token);
      const allTickets = Array.isArray(res.data) ? res.data : [];

      setStats({
        pending: allTickets.filter(t => t.status === "not_start").length,
        inProgress: allTickets.filter(t => t.status === "in_progress").length,
        completed: allTickets.filter(t => t.status === "completed").length,
        rejected: allTickets.filter(t => t.status === "rejected").length
      });

      setTickets(allTickets);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadDashboardData();
  }, [token, loadDashboardData]);

  const newTickets = useMemo(() => {
    return tickets
      .filter(t => t.status === "not_start")
      .sort((a, b) => {
        const p =
          (urgencyWeight[b.urgency] || 0) -
          (urgencyWeight[a.urgency] || 0);
        if (p !== 0) return p;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 font-poppins text-slate-800">

      {/* Header */}
      <header className="bg-[#193C6C] px-6 pt-8 pb-9 rounded-b-[2rem]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="text-white">
            <p className="text-sm opacity-80">Welcome back</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user?.name || "IT Officer"}
            </h1>
          </div>

          <button
            onClick={() => navigate("/it/notifications")}
            className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center transition"
          >
            <Bell className="text-white" size={18} />
            {stats.pending > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#193C6C]" />
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-6 space-y-8">

        {/* Status Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatusCard count={stats.pending} label="Not Started" icon={<Clock size={18} />} />
          <StatusCard count={stats.inProgress} label="In Progress" icon={<AlertCircle size={18} />} />
          <StatusCard count={stats.completed} label="Completed" icon={<CheckCircle size={18} />} />
          <StatusCard count={stats.rejected} label="Rejected" icon={<XCircle size={18} />} />
        </section>

        {/* New Tickets */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              New Tickets
            </h2>
            <button
              onClick={() => navigate("/it/tickets?status=not_start")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {newTickets.map(ticket => {
              const priorityStyle = getPriorityStyle(ticket.urgency);

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg
                             border border-slate-200
                             hover:border-slate-300 hover:shadow-sm
                             p-5 transition"
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start mb-2">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 border rounded">
                        <Search size={12} />
                        {ticket.category?.name || "General"}
                      </span>

                      <span className="px-2 py-1 bg-slate-700 text-white rounded uppercase">
                        {statusLabel[ticket.status]}
                      </span>

                      <span className={`px-2 py-1 border rounded uppercase ${priorityStyle}`}>
                        {ticket.urgency || "Normal"}
                      </span>
                    </div>

                    {/* View Detail Icon */}
                    <button
                      onClick={() => navigate(`/it/ticket/${ticket.id}`)}
                      className="w-8 h-8 flex items-center justify-center
                                 rounded-full border border-slate-200
                                 text-slate-500 hover:bg-slate-100 hover:text-slate-700
                                 transition"
                      aria-label="View ticket detail"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {ticket.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-1 mb-2">
                    {ticket.description}
                  </p>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-700 mb-2">
                    <MapPin size={14} className="text-slate-400" />
                    Floor {ticket.room?.floor || "-"}, Room {ticket.room?.roomNumber || "-"}
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 border-t pt-3">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {ticket.createdBy?.name || "User"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(ticket.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
};

/* =======================
   Status Card
======================= */

const StatusCard = ({ count, label, icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4
                    flex justify-between items-center hover:shadow-sm transition">
      <div>
        <div className="text-2xl font-semibold text-slate-800">
          {count}
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-wide">
          {label}
        </div>
      </div>
      <div className="p-2 rounded-full bg-slate-100 text-slate-600">
        {icon}
      </div>
    </div>
  );
};

export default ITDashboard;
