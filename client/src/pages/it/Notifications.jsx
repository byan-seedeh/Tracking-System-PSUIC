// import React, { useEffect, useState, useCallback } from "react";
// import { Bell, Check, Trash2, Clock, FilePlus, RefreshCw, AlertCircle } from "lucide-react";
// import useAuthStore from "../../store/auth-store";
// import { useNavigate } from "react-router-dom";
// import {
//     listNotifications,
//     markRead,
//     removeNotification,
// } from "../../api/notification";
// import { toast } from "react-toastify";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";

// dayjs.extend(relativeTime);

// const Notifications = () => {
//     const { token } = useAuthStore();
//     const navigate = useNavigate();
//     const [notifications, setNotifications] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchNotifications = useCallback(async () => {
//         try {
//             setLoading(true);
//             const res = await listNotifications(token);
//             setNotifications(res.data);
//         } catch (err) {
//             console.error(err);
//             // toast.error("Failed to load notifications");
//         } finally {
//             setLoading(false);
//         }
//     }, [token]);

//     useEffect(() => {
//         fetchNotifications();
//     }, [fetchNotifications]);

//     const handleMarkRead = async (e, id) => {
//         e.stopPropagation();
//         try {
//             await markRead(token, id);
//             setNotifications((prev) =>
//                 prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
//             );
//             toast.success("Marked as read");
//         } catch {
//             toast.error("Failed to mark as read");
//         }
//     };

//     const handleDelete = async (e, id) => {
//         e.stopPropagation();
//         try {
//             await removeNotification(token, id);
//             setNotifications((prev) => prev.filter((n) => n.id !== id));
//             toast.success("Notification removed");
//         } catch {
//             toast.error("Failed to remove notification");
//         }
//     };

//     const handleNotificationClick = async (notification) => {
//         // 1. Mark as read immediately in UI and Backend
//         if (!notification.isRead) {
//             // Optimistic update
//             setNotifications((prev) =>
//                 prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
//             );
//             // API call in background (don't await to block nav)
//             markRead(token, notification.id).catch(console.error);
//         }

//         // 2. Navigate to ticket
//         if (notification.ticketId) {
//             navigate(`/it/ticket/${notification.ticketId}`);
//         }
//     };

//     // Helper to get icon and color based on notification type
//     const getNotificationStyle = (type) => {
//         switch (type) {
//             case "ticket_create":
//                 return {
//                     icon: <FilePlus className="w-5 h-5 text-blue-600" />,
//                     bgIcon: "bg-blue-100",
//                     border: "border-blue-200",
//                     accent: "text-blue-600"
//                 };
//             case "ticket_update":
//                 return {
//                     icon: <RefreshCw className="w-5 h-5 text-orange-600" />,
//                     bgIcon: "bg-orange-100",
//                     border: "border-orange-200",
//                     accent: "text-orange-600"
//                 };
//             default:
//                 return {
//                     icon: <Bell className="w-5 h-5 text-gray-600" />,
//                     bgIcon: "bg-gray-100",
//                     border: "border-gray-200",
//                     accent: "text-gray-600"
//                 };
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center min-h-[400px]">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 max-w-4xl mx-auto min-h-screen">
//             <div className="flex items-center justify-between mb-8">
//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
//                         <Bell className="text-white w-6 h-6" />
//                     </div>
//                     <div>
//                         <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
//                         <p className="text-gray-500 text-sm">Manage your task updates and alerts</p>
//                     </div>
//                 </div>
//                 <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
//                     {notifications.filter(n => !n.isRead).length} Unread
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 {notifications.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
//                         <div className="p-4 bg-gray-50 rounded-full mb-4">
//                             <Bell className="w-8 h-8 text-gray-300" />
//                         </div>
//                         <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
//                         <p className="text-gray-500 mt-1">No new notifications at the moment.</p>
//                     </div>
//                 ) : (
//                     notifications.map((notification) => {
//                         const style = getNotificationStyle(notification.type);
//                         return (
//                             <div
//                                 key={notification.id}
//                                 onClick={() => handleNotificationClick(notification)}
//                                 className={`group relative overflow-hidden p-5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${notification.isRead
//                                     ? "bg-white border-gray-200"
//                                     : "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50"
//                                     }`}
//                             >
//                                 {/* Unread Indicator Strip */}
//                                 {!notification.isRead && (
//                                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
//                                 )}

//                                 <div className="flex gap-4">
//                                     {/* Icon Box */}
//                                     <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl ${style.bgIcon}`}>
//                                         {style.icon}
//                                     </div>

//                                     {/* Content */}
//                                     <div className="flex-1 min-w-0">
//                                         <div className="flex items-start justify-between gap-4">
//                                             <div>
//                                                 <h3 className={`text-base font-semibold mb-1 ${notification.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
//                                                     {notification.title}
//                                                 </h3>
//                                                 <p className="text-gray-600 text-sm leading-relaxed">
//                                                     {notification.message}
//                                                 </p>
//                                             </div>

//                                             {/* Actions */}
//                                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 {!notification.isRead && (
//                                                     <button
//                                                         onClick={(e) => handleMarkRead(e, notification.id)}
//                                                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                         title="Mark as read"
//                                                     >
//                                                         <Check size={18} />
//                                                     </button>
//                                                 )}
//                                                 <button
//                                                     onClick={(e) => handleDelete(e, notification.id)}
//                                                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                                                     title="Delete"
//                                                 >
//                                                     <Trash2 size={18} />
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {/* Footer Info */}
//                                         <div className="flex items-center gap-4 mt-3">
//                                             <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
//                                                 <Clock size={14} />
//                                                 <span>{dayjs(notification.createdAt).fromNow()}</span>
//                                             </div>
//                                             {notification.type && (
//                                                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bgIcon} ${style.accent} opacity-80`}>
//                                                     {notification.type.replace('_', ' ').toUpperCase()}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Notifications;



import React, { useEffect, useState, useCallback } from "react";
import {
    Bell,
    Check,
    Trash2,
    Clock,
    Monitor,
    Printer,
    Wifi,
    UserCircle,
    ArrowLeft,
    ChevronRight,
} from "lucide-react";
import useAuthStore from "../../store/auth-store";
import { useNavigate } from "react-router-dom";
import {
    listNotifications,
    markRead,
    removeNotification,
} from "../../api/notification";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Notifications = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH ================= */

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await listNotifications(token);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    /* ================= ACTIONS ================= */

    const handleMarkRead = async (e, id) => {
        e.stopPropagation();
        try {
            await markRead(token, id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            toast.success("Marked as read");
        } catch {
            toast.error("Failed to mark as read");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await removeNotification(token, id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Notification removed");
        } catch {
            toast.error("Failed to remove notification");
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
            markRead(token, notification.id).catch(console.error);
        }

        if (notification.ticketId) {
            navigate(`/it/ticket/${notification.ticketId}`);
        }
    };

    /* ================= STYLE HELPER ================= */

    const getNotificationStyle = (categoryName) => {
        const cat = categoryName?.toUpperCase() || "";

        if (cat.includes("COMPUTER") || cat.includes("HARDWARE")) {
            return {
                icon: <Monitor className="w-6 h-6 text-blue-600" />,
                bg: "bg-blue-50",
            };
        }
        if (cat.includes("PRINTER")) {
            return {
                icon: <Printer className="w-6 h-6 text-rose-600" />,
                bg: "bg-rose-50",
            };
        }
        if (cat.includes("NETWORK") || cat.includes("INTERNET") || cat.includes("WIFI")) {
            return {
                icon: <Wifi className="w-6 h-6 text-indigo-600" />,
                bg: "bg-indigo-50",
            };
        }
        if (cat.includes("ACCOUNT") || cat.includes("LOGIN") || cat.includes("USER")) {
            return {
                icon: <UserCircle className="w-6 h-6 text-emerald-600" />,
                bg: "bg-emerald-50",
            };
        }

        return {
            icon: <Bell className="w-6 h-6 text-gray-600" />,
            bg: "bg-gray-50",
        };
    };

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    /* ================= UI ================= */

    return (
        <div className="min-h-screen bg-gray-50 pb-12 font-poppins">
            {/* ===== HEADER ===== */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-[1200px] mx-auto flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-white hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors"
                        >
                            <ArrowLeft size={28} />
                        </button>
                        <div>
                            <h1 className="text-white text-3xl font-semibold tracking-tight">
                                Notifications
                            </h1>
                            <p className="text-blue-200 text-sm mt-1">
                                Stay updated with your repair tasks
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="max-w-[1200px] mx-auto px-6 mt-6 relative z-10 space-y-6">

                {/* Stats Bar */}
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-gray-700 font-semibold text-lg">Recent Updates</h2>
                    </div>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-semibold border border-red-100 shadow-sm">
                        {unreadCount} Unread
                    </span>
                </div>


                {/* ===== LIST ===== */}
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                <Bell className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                All caught up!
                            </h3>
                            <p className="text-gray-500 mt-1">
                                No new notifications at the moment.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const categoryName = notification.ticket?.category?.name || "Other";
                            const style = getNotificationStyle(categoryName);
                            const ticketTitle = notification.ticket?.title || "Ticket Update";
                            const ticketDesc = notification.ticket?.description || notification.message;
                            const formattedDate = dayjs(notification.createdAt).format("DD MMM YYYY · HH:mm");

                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`
                                        group relative bg-white p-5 rounded-2xl border
                                        transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
                                        ${notification.isRead
                                            ? "border-gray-100"
                                            : "border-blue-100 shadow-md ring-1 ring-blue-50/50"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-5">
                                        {/* Icon Box */}
                                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${style.bg}`}>
                                            {style.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col gap-0.5">
                                                <h3 className={`text-[17px] font-bold tracking-tight ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {categoryName} – {ticketTitle}
                                                </h3>
                                                <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-1">
                                                    {ticketDesc}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap">
                                                        {formattedDate}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Action: Button */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNotificationClick(notification);
                                                }}
                                                className="hidden md:block bg-[#193C6C] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-900 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                                            >
                                                View Details
                                            </button>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNotificationClick(notification);
                                                }}
                                                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"
                                            >
                                                <ChevronRight size={24} />
                                            </div>
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

export default Notifications;
