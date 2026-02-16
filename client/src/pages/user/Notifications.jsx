import React, { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2, Clock, FilePlus, RefreshCw, AlertCircle, ArrowLeft, ChevronLeft } from "lucide-react";
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

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
            );
            markRead(token, notification.id).catch(console.error);
        }

        if (notification.ticketId) {
            navigate(`/user/ticket/${notification.ticketId}`);
        }
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case "ticket_create":
                return {
                    icon: <FilePlus className="w-5 h-5 text-blue-600" />,
                    bgIcon: "bg-blue-100",
                    border: "border-blue-200",
                    accent: "text-blue-600"
                };
            case "ticket_update":
                return {
                    icon: <RefreshCw className="w-5 h-5 text-orange-600" />,
                    bgIcon: "bg-orange-100",
                    border: "border-orange-200",
                    accent: "text-orange-600"
                };
            default:
                return {
                    icon: <Bell className="w-5 h-5 text-gray-600" />,
                    bgIcon: "bg-gray-100",
                    border: "border-gray-200",
                    accent: "text-gray-600"
                };
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gray-50 font-poppins text-gray-900">
            {/* Standard Blue Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0 overflow-hidden">
                <div className="max-w-4xl mx-auto flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <h1 className="text-white text-3xl font-semibold tracking-tight">
                            Notifications
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">
                            Stay updated on your ticket status
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-6 relative z-10 space-y-6">
                {/* Stats Bar */}
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/20 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Bell size={18} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Recent Updates</span>
                    </div>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-semibold border border-red-100 shadow-sm">
                        {unreadCount} Unread
                    </span>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
                            ))}
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((n) => {
                            const style = getNotificationStyle(n.type);
                            return (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`
                                        group relative bg-white rounded-2xl p-4 border transition-all cursor-pointer
                                        hover:shadow-md hover:border-blue-100
                                        ${n.isRead ? 'opacity-70 grayscale-[0.3]' : 'border-l-4 border-l-blue-600 bg-blue-50/10 shadow-sm'}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.bgIcon}`}>
                                            {style.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`text-[15px] font-bold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                                    {n.title}
                                                </h3>
                                                <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                                                    {dayjs(n.createdAt).fromNow()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>

                                            <div className="flex items-center gap-4 mt-3">
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkRead(e, n.id)}
                                                        className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                                    >
                                                        <Check size={14} strokeWidth={3} />
                                                        Mark Read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, n.id)}
                                                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-red-500 bg-gray-50 px-2 py-1 rounded-md transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Bell size={32} className="opacity-20" />
                            </div>
                            <p className="text-lg font-semibold">All caught up!</p>
                            <p className="text-sm opacity-60">No new notifications at this time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
