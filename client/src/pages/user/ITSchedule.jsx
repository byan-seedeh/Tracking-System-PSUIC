import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronLeft, Clock, User, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import useAuthStore from "../../store/auth-store";
import { getPublicSchedule } from "../../api/it";
// Reuse CalendarGrid for consistency
import CalendarGrid from "../../components/CalendarGrid";

const ITSchedule = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // State
    const [schedule, setSchedule] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const res = await getPublicSchedule(token);
                // Safeguard: Ensure res.data is an array
                setSchedule(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                console.error(err);
                setSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadSchedule();
        }
    }, [token]);

    // Helpers
    // Map schedule to events for calendar dots
    const eventsForCalendar = schedule.map(item => ({
        date: item.start,
        type: item.type,
        color: item.type === 'ticket' ? '#EF4444' : '#3B82F6' // Red for fix, Blue for internal
    }));

    // Filter items for selected day
    const selectedItems = schedule.filter(item =>
        dayjs(item.start).isSame(selectedDate, 'day')
    ).sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans text-gray-900">
            {/* Standard Header - Reduced Height */}
            <div className="bg-[#193C6C] sticky top-0 z-50 px-6 pt-10 pb-4 shadow-sm rounded-b-3xl relative overflow-hidden transition-all duration-300">
                {/* Decorative BG */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white opacity-[0.04] blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-2xl font-semibold tracking-wide text-white leading-tight drop-shadow-sm">
                        IT Schedule
                    </h1>
                </div>
            </div>

            <div className="max-w-md md:max-w-2xl mx-auto lg:mx-0 px-6 mt-4 relative z-20 space-y-4 pb-20">

                {/* Calendar */}
                <CalendarGrid
                    currentDate={currentMonth}
                    setCurrentDate={setCurrentMonth}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    events={eventsForCalendar}
                    onDateSelect={setSelectedDate}
                />

                {/* Daily List */}
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 px-1">
                        <Calendar className="text-blue-600" size={18} />
                        Overview for {selectedDate.format('DD MMM')}
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading schedule...</div>
                    ) : selectedItems.length > 0 ? (
                        selectedItems.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-start gap-3 hover:border-blue-100 transition-colors">
                                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${item.type === 'ticket' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <Clock size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{item.details}</h4>
                                        <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap mt-0.5">
                                            {dayjs(item.start).format('HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* Status Badge */}
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${item.type === 'ticket' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {item.type === 'ticket' ? 'Busy' : 'Task'}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                            <User size={10} />
                                            <span className="truncate max-w-[80px]">{item.staff || "IT Staff"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Calendar size={24} />
                            </div>
                            <p className="text-gray-900 font-bold text-sm">No tasks scheduled</p>
                            <p className="text-xs text-gray-400">IT Support is likely available.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ITSchedule;
