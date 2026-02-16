import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, Clock, User, RefreshCw, Plus } from "lucide-react";
import dayjs from "dayjs";
import useAuthStore from "../../store/auth-store";
import { getPublicSchedule, syncGoogleCalendar } from "../../api/it";
// Reuse CalendarGrid
import CalendarGrid from "../../components/CalendarGrid";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Schedule = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // State
    const [schedule, setSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const loadSchedule = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await getPublicSchedule(token);
            // Safeguard: Ensure res.data is an array
            setSchedule(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load schedule");
            setSchedule([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            loadSchedule();
        }
    }, [token, loadSchedule]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            const res = await syncGoogleCalendar(token);
            toast.success(res.data.message || "Synced successfully");
            loadSchedule();
        } catch (err) {
            console.error(err);
            toast.error("Sync failed");
        } finally {
            setSyncing(false);
        }
    };

    // Helpers
    // Map schedule to events for calendar dots
    const eventsForCalendar = schedule.map(item => ({
        date: item.start,
        type: item.type,
        color: item.type === 'ticket' ? '#EF4444' : '#3B82F6'
    }));

    // Filter items for selected day
    const selectedItems = schedule.filter(item =>
        dayjs(item.start).isSame(selectedDate, 'day')
    ).sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans text-gray-900">
            {/* Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0">
                <div className="max-w-[1200px] mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <div>
                        <h1 className="text-white text-3xl font-semibold tracking-tight">
                            My Schedule
                        </h1>
                        <p className="text-blue-200 text-sm mt-1">
                            Manage your tasks and calendar
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 mt-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Calendar (Not too big, but main focus) */}
                    <div className="lg:col-span-7">
                        <CalendarGrid
                            currentDate={currentMonth}
                            setCurrentDate={setCurrentMonth}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            events={eventsForCalendar}
                            onDateSelect={setSelectedDate}
                        />
                    </div>

                    {/* Right Column: Actions & Daily List */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Actions */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition disabled:opacity-50"
                            >
                                <RefreshCw size={20} className={syncing ? "animate-spin" : ""} />
                                {syncing ? "Syncing..." : "Sync Google Calendar"}
                            </button>
                        </div>

                        {/* Daily List */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
                            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2 mb-4">
                                <Calendar className="text-blue-600" size={20} />
                                <span>{selectedDate.format('DD MMM YYYY')}</span>
                            </h3>

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-10 text-gray-400">Loading...</div>
                                ) : selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.type === 'ticket' ? 'bg-red-500' : 'bg-blue-500'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">{item.details}</h4>
                                                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                                                        {dayjs(item.start).format('HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description || item.title}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500">No tasks for this day</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
