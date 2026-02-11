import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  User
} from "lucide-react";
import useAuthStore from "../../store/auth-store";

import {
  getMyTasks
} from "../../api/it";


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
  const [, setLoading] = useState(true);
  const [showAllNew, setShowAllNew] = useState(false);



  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);

      const [ticketsRes] = await Promise.all([
        getMyTasks(token)
      ]);


      // Ensure array
      const allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];

      const pendingCount = allTickets.filter(t => t.status === "not_start").length;
      const inProgressCount = allTickets.filter(t => ["in_progress"].includes(t.status)).length;
      const completedCount = allTickets.filter(t => ["completed"].includes(t.status)).length;


      setStats({
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        rejected: allTickets.filter(t => t.status === "rejected").length
      });

      setTickets(allTickets);

    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);



  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, loadDashboardData]);

  // Filter "New Tickets" -> Pending status
  // Sort by Priority (Critical > High > Medium > Low) THEN by Arrival (Oldest First)
  const urgencyWeight = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'Normal': 0 };
  const newTickets = tickets
    .filter(t => t.status === "not_start")
    .sort((a, b) => {
      const weightA = urgencyWeight[a.urgency] || 0;
      const weightB = urgencyWeight[b.urgency] || 0;
      if (weightA !== weightB) {
        return weightB - weightA; // Higher priority first
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Oldest first
    });



  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Blue Header Section - User Info */}
      <div className="bg-[#193C6C] sticky top-0 z-20 px-0 pt-12 pb-8 shadow-sm rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 flex justify-between items-start relative z-10">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              Welcome back,
            </p>
            <h1 className="text-white text-[28px] font-semibold leading-tight">
              {user?.name || "IT Staff"}
            </h1>
          </div>

          {/* Profile Picture */}
          <button
            onClick={() => navigate("/it/profile")}
            className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm transition active:scale-95"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <User size={20} />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Status Cards Grid - Below Header */}
      <div className="max-w-5xl mx-auto px-6 mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            count={stats.pending}
            label="Not Started"
            color="bg-red-50 text-red-600"
            icon={<AlertCircle size={20} />}
          />
          <StatusCard
            count={stats.inProgress}
            label="In Progress"
            color="bg-orange-50 text-orange-600"
            icon={<Clock size={20} />}
          />
          <StatusCard
            count={stats.completed}
            label="Completed"
            color="bg-green-50 text-green-600"
            icon={<CheckCircle size={20} />}
          />
          <StatusCard
            count={stats.rejected}
            label="Rejected"
            color="bg-gray-50 text-gray-500"
            icon={<XCircle size={20} />}
          />
        </div>
      </div>

      {/* New Tickets Section */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 tracking-tight">New Tickets</h3>
          <button
            onClick={() => setShowAllNew(!showAllNew)}
            className="text-[#193C6C] text-sm font-bold hover:underline"
          >
            {showAllNew ? "Show Less" : "See All"}
          </button>
        </div>

        <div className="space-y-4">
          {newTickets.length > 0 ? newTickets.slice(0, showAllNew ? undefined : 5).map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/it/ticket/${ticket.id}`)}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <h4 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                    {ticket.category?.name || "General Request"}
                  </h4>
                  <span className="text-sm font-bold text-gray-900 mt-1">
                    {ticket.description || "No description provided"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${ticket.urgency === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' :
                    ticket.urgency === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {ticket.urgency || "Normal"}
                  </span>

                  {/* View Icon */}
                  <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>


              {/* Footer Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>Floor {ticket.room?.floor || "-"}, {ticket.room?.roomNumber || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span className="font-semibold">{ticket.createdBy?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                </div>
              </div>

            </div>
          )) : (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <CheckCircle size={32} />
              </div>
              <p className="text-gray-900 font-bold text-lg">All caught up!</p>
              <p className="text-gray-400">No new tickets at the moment.</p>
            </div>
          )}
        </div>
      </div >

    </div >
  );
};

const StatusCard = ({ count, label, color, icon }) => (
  <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all duration-300`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="text-center">
      <span className="block text-2xl font-bold text-gray-800">{count}</span>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  </div>
);

export default ITDashboard;
