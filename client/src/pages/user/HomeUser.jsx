import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanQrCode,
  PlusCircle,
  CalendarDays,
  BookOpenText,
  User,
} from "lucide-react";

import useAuthStore from "../../store/auth-store";
import { listMyTickets } from "../../api/ticket";
import ServiceButton from "../../components/user/ServiceButton";
import TicketCard from "../../components/user/TicketCard";

const HomeUser = () => {
  const navigate = useNavigate();
  const { user, token, checkUser } = useAuthStore();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= Load Data ================= */
  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listMyTickets(token);
      setTickets(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkUser();
    loadTickets();
  }, [checkUser, loadTickets]);

  /* ================= Services ================= */
  const services = useMemo(
    () => [
      { icon: ScanQrCode, title: "Scan QR", action: () => navigate("/user/scan-qr") },
      { icon: PlusCircle, title: "Report Issue", action: () => navigate("/user/create-ticket") },
      { icon: CalendarDays, title: "IT Schedule", action: () => navigate("/user/it-schedule") },
      { icon: BookOpenText, title: "Knowledge", action: () => navigate("/user/quick-fix") },
    ],
    [navigate]
  );

  /* ================= Today's Tickets ================= */
  const todayTickets = useMemo(() => {
    const today = new Date();
    return tickets
      .filter((t) => {
        if (!t?.createdAt) return false;
        const d = new Date(t.createdAt);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tickets]);

  return (
    <div className="min-h-screen bg-white font-poppins text-[#193C6C] pb-24">

      {/* ================= Header ================= */}
      <header className="bg-[#193C6C] sticky top-0 z-20 px-6 pt-12 pb-8 shadow-sm rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Welcome back,
            </p>
            <h1 className="text-white text-[28px] font-semibold leading-tight">
              {user?.name || "User"}
            </h1>
          </div>

          <button
            onClick={() => navigate("/user/profile")}
            className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 backdrop-blur-sm transition active:scale-95"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <User size={20} />
              </div>
            )}
          </button>
        </div>
      </header>

      {/* ================= Content ================= */}
      <main className="px-6 mt-8 max-w-[1920px] mx-auto flex flex-col gap-8">

        {/* ---------- Services ---------- */}
        <section className="grid grid-cols-4 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-4 justify-items-center">
          {services.map((service, index) => (
            <ServiceButton
              key={index}
              icon={service.icon}
              title={service.title}
              onClick={service.action}
            />
          ))}
        </section>

        {/* ---------- Today's Reports ---------- */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-[18px] font-bold text-slate-800">
              Today's Reports
            </h2>
            <button
              onClick={() => navigate("/user/history")}
              className="text-[13px] font-semibold text-slate-500 hover:text-[#193C6C]"
            >
              View
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white/50 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : todayTickets.length > 0 ? (
            todayTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => navigate(`/user/ticket/${ticket.id}`)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <p className="text-sm font-medium">
                No reports created today.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default HomeUser;
