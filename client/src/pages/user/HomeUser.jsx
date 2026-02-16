import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScanQrCode,
  PlusCircle,
  CalendarDays,
  BookOpenText,
  User,
  Coffee,
  CheckCircle2,
  Bell
} from "lucide-react";

import useAuthStore from "../../store/auth-store";
import { listMyTickets } from "../../api/ticket";
import { listNotifications } from "../../api/notification";
import TicketCard from "../../components/user/TicketCard";

const HomeUser = () => {
  const navigate = useNavigate();
  const { user, token, checkUser } = useAuthStore();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ================= Load Data ================= */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketRes, notifyRes] = await Promise.all([
        listMyTickets(token),
        listNotifications(token)
      ]);
      setTickets(Array.isArray(ticketRes?.data) ? ticketRes.data : []);
      const unread = Array.isArray(notifyRes?.data) 
        ? notifyRes.data.filter(n => !n.isRead).length 
        : 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkUser();
    loadData();
  }, [checkUser, loadData]);

  /* ================= Services ================= */
  const services = useMemo(
    () => [
      { icon: ScanQrCode, title: "Scan QR", action: () => navigate("/user/scan-qr") },
      { icon: PlusCircle, title: "Report", action: () => navigate("/user/create-ticket/form") },
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
    <div className="min-h-screen bg-slate-50 font-poppins pb-32">

      {/* ================= HERO HEADER ================= */}
      <header className="
        relative bg-[#193C6C] text-white 
        rounded-b-[2.5rem] 
        pt-12 pb-16 px-6 
        shadow-lg overflow-hidden
      ">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              Welcome back,
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.name || "User"}
            </h1>
          </div>

          <button
            onClick={() => navigate("/user/notifications")}
            className="
              relative w-12 h-12 rounded-2xl
              bg-white/10 backdrop-blur-md border border-white/20
              flex items-center justify-center
              hover:bg-white/20 transition-all active:scale-95
            "
          >
            <Bell className="text-white" size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-[#193C6C]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>


      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <main className="
        relative z-10 
        px-6 
        mt-8
        max-w-4xl mx-auto 
        flex flex-col gap-8
      ">

        {/* ================= QUICK ACTIONS ================= */}
        <section className="
          bg-white rounded-[2rem] 
          shadow-sm border border-slate-100
          p-6
        ">
          <div className="grid grid-cols-4 gap-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={index}
                  onClick={service.action}
                  className="group flex flex-col items-center gap-3 transition-transform active:scale-95"
                >
                  <div className="
                    w-14 h-14 rounded-2xl 
                    bg-slate-50 text-[#193C6C] border-2 border-transparent
                    flex items-center justify-center 
                    group-hover:border-[#193C6C] group-hover:bg-white
                    transition-all duration-300
                  ">
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <span className="
                    text-xs font-semibold text-[#193C6C]
                    text-center leading-tight 
                  ">
                    {service.title}
                  </span>
                </button>
              );
            })}
          </div>
        </section>


        {/* ================= TODAY'S REPORTS ================= */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#193C6C]">
                Today's Reports
              </h2>
              {todayTickets.length > 0 && (
                 <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                   {todayTickets.length} New
                 </span>
              )}
            </div>
            
            <button
              onClick={() => navigate("/user/history")}
              className="text-sm font-semibold text-slate-400 hover:text-[#193C6C] transition-colors"
            >
              View History
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-sm" />
              ))}
            </div>
          ) : todayTickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {todayTickets.map((ticket) => {
                 // Determine Status Style (Inline logic or helper)
                 const getStatusStyle = (status) => {
                    switch (status) {
                        case 'not_started': return 'bg-slate-100 text-slate-600';
                        case 'in_progress': return 'bg-orange-50 text-orange-600';
                        case 'completed': return 'bg-green-50 text-green-600';
                        case 'rejected': return 'bg-red-50 text-red-600';
                        default: return 'bg-slate-100 text-slate-500';
                    }
                 };
                 const getStatusLabel = (status) => {
                    switch (status) {
                        case 'not_started': return 'Pending';
                        case 'in_progress': return 'In Progress';
                        case 'completed': return 'Completed';
                        case 'rejected': return 'Rejected';
                        default: return status?.replace('_', ' ') || 'Unknown';
                    }
                 };

                 return (
                <div 
                    key={ticket.id} 
                    onClick={() => navigate(`/user/ticket/${ticket.id}`)}
                    className="
                        bg-white rounded-2xl p-5 shadow-sm border border-slate-100
                        active:scale-[0.98] transition-all cursor-pointer hover:shadow-md
                    "
                >
                    {/* Header: Category & Status */}
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {typeof ticket.category === 'object' ? ticket.category?.name : ticket.category || "General"}
                        </span>
                        <span className={`
                            text-[10px] font-bold px-2.5 py-1 rounded-md
                            ${getStatusStyle(ticket.status)}
                        `}>
                            {getStatusLabel(ticket.status)}
                        </span>
                    </div>

                    {/* Content: Title & Desc */}
                    <h3 className="text-[16px] font-bold text-[#193C6C] mb-1 leading-tight line-clamp-1">
                        {ticket.title}
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 line-clamp-1 mb-4">
                        {ticket.description}
                    </p>

                    {/* Footer: Location & Time */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                             {/* Location Pill Style - Simplified */}
                             <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#193C6C]"></div>
                                <span className="text-[11px] font-semibold text-slate-600 uppercase">
                                    {ticket.room ? 
                                        (typeof ticket.room === 'object' ? `Fl. ${ticket.room.floor} - ${ticket.room.roomNumber}` : ticket.room) 
                                        : "Unknown Location"}
                                </span>
                             </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                             {new Date(ticket.createdAt).toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                 );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="
              flex flex-col items-center justify-center py-12 px-6
              bg-white rounded-2xl 
              border border-dashed border-slate-200
            ">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-slate-700 font-bold text-base">
                All caught up!
              </h3>
              <p className="text-slate-400 text-xs text-center">
                No tickets reported today.
              </p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default HomeUser;

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ScanQrCode,
//   PlusCircle,
//   CalendarDays,
//   BookOpenText,
//   User,
// } from "lucide-react";

// import useAuthStore from "../../store/auth-store";
// import { listMyTickets } from "../../api/ticket";
// import ServiceButton from "../../components/user/ServiceButton";
// import TicketCard from "../../components/user/TicketCard";

// const HomeUser = () => {
//   const navigate = useNavigate();
//   const { user, token, checkUser } = useAuthStore();

//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);

//   /* ================= Load Data ================= */
//   const loadTickets = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await listMyTickets(token);
//       setTickets(Array.isArray(res?.data) ? res.data : []);
//     } catch (error) {
//       console.error("Failed to load tickets:", error);
//       setTickets([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     checkUser();
//     loadTickets();
//   }, [checkUser, loadTickets]);

//   /* ================= Services ================= */
//   const services = useMemo(
//     () => [
//       { icon: ScanQrCode, title: "Scan QR", action: () => navigate("/user/scan-qr") },
//       { icon: PlusCircle, title: "Report Issue", action: () => navigate("/user/create-ticket") },
//       { icon: CalendarDays, title: "IT Schedule", action: () => navigate("/user/it-schedule") },
//       { icon: BookOpenText, title: "Knowledge", action: () => navigate("/user/quick-fix") },
//     ],
//     [navigate]
//   );

//   /* ================= Today's Tickets ================= */
//   const todayTickets = useMemo(() => {
//     const today = new Date();
//     return tickets
//       .filter((t) => {
//         if (!t?.createdAt) return false;
//         const d = new Date(t.createdAt);
//         return (
//           d.getDate() === today.getDate() &&
//           d.getMonth() === today.getMonth() &&
//           d.getFullYear() === today.getFullYear()
//         );
//       })
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//   }, [tickets]);

//   return (
//     <div className="min-h-screen bg-white font-poppins text-[#193C6C] pb-24">

//       {/* ================= Header Section ================= */}
//       <header className="
//         /* Mobile: Full Width Blue Background */
//         bg-[#193C6C] w-full
//         sticky top-0 z-20 
//         rounded-b-[2rem] shadow-sm
//         pt-12 pb-8 
        
//         /* Desktop: Transparent Background (Clean Title Look) */
//         md:bg-transparent md:static md:rounded-none md:shadow-none 
//         md:pt-8 md:pb-6
        
//         transition-all duration-300
//       ">
//         {/* Mobile Blob Background (Hidden on Desktop) */}
//         <div className="md:hidden absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

//         {/* Content Container */}
//         <div className="
//           relative z-10 flex justify-between items-start 
//           /* Padding Control */
//           px-6 md:px-8
//           /* Max Width for Desktop Alignment */
//           max-w-screen-xl mx-auto
//         ">
//           <div>
//             <p className="
//               text-sm font-medium mb-1 opacity-90
//               text-blue-100 md:text-slate-500 /* Mobile: Light Blue, Desktop: Grey */
//             ">
//               Welcome back,
//             </p>
//             <h1 className="
//               text-[28px] md:text-3xl font-semibold leading-tight
//               text-white md:text-[#193C6C] /* Mobile: White, Desktop: Dark Blue */
//             ">
//               {user?.name || "User"}
//             </h1>
//           </div>

//           {/* Profile Picture (Visible ONLY on Mobile) */}
//           <button
//             onClick={() => navigate("/user/profile")}
//             className="
//               flex md:hidden 
//               w-11 h-11 rounded-full border-2 border-white/20 
//               overflow-hidden bg-white/10 backdrop-blur-sm 
//               transition active:scale-95 items-center justify-center
//             "
//           >
//             {user?.picture ? (
//               <img
//                 src={user.picture}
//                 alt="Profile"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="text-white">
//                 <User size={20} />
//               </div>
//             )}
//           </button>
//         </div>
//       </header>

//       {/* ================= Main Content ================= */}
//       <main className="
//         px-6 md:px-8 
//         mt-4 md:mt-0 
//         max-w-screen-xl mx-auto flex flex-col gap-8
//       ">

//         {/* ---------- Services Grid ---------- */}
//         <section className="grid grid-cols-4 gap-4 md:gap-8 justify-items-center md:justify-items-start">
//           {services.map((service, index) => (
//             <ServiceButton
//               key={index}
//               icon={service.icon}
//               title={service.title}
//               onClick={service.action}
//             />
//           ))}
//         </section>

//         {/* ---------- Today's Reports ---------- */}
//         <section className="flex flex-col gap-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-[18px] md:text-xl font-bold text-slate-800">
//               Today's Reports
//             </h2>
//             <button
//               onClick={() => navigate("/user/history")}
//               className="text-[13px] md:text-sm font-semibold text-slate-500 hover:text-[#193C6C] transition-colors"
//             >
//               View All
//             </button>
//           </div>

//           {loading ? (
//             <div className="flex flex-col gap-4">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
//               ))}
//             </div>
//           ) : todayTickets.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {todayTickets.map((ticket) => (
//                 <TicketCard
//                   key={ticket.id}
//                   ticket={ticket}
//                   onClick={() => navigate(`/user/ticket/${ticket.id}`)}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center min-h-[200px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
//               <BookOpenText size={32} className="opacity-50" />
//               <p className="text-sm font-medium">No reports created today.</p>
//             </div>
//           )}
//         </section>

//       </main>
//     </div>
//   );
// };

// export default HomeUser;