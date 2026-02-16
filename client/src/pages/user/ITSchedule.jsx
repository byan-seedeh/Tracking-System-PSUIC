import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import useAuthStore from "../../store/auth-store";
import { getPublicSchedule } from "../../api/it";
import { listUsers } from "../../api/user";
// Reuse CalendarGrid for consistency
import CalendarGrid from "../../components/CalendarGrid";

const ITSchedule = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // State
    const [schedule, setSchedule] = useState([]);
    const [staffList, setStaffList] = useState([]); // [NEW] Real Staff List
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [loading, setLoading] = useState(true);
    const [selectedStaffId, setSelectedStaffId] = useState('all'); // [NEW] Filter State

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch Schedule and Staff in parallel
                const [scheduleRes, staffRes] = await Promise.all([
                    getPublicSchedule(token),
                    listUsers(token, { role: 'it_support' }) // Fetch only IT Support
                ]);

                // Set Schedule
                setSchedule(Array.isArray(scheduleRes?.data) ? scheduleRes.data : []);

                // Set Staff List (Ensure we have a list, fallback to empty)
                // Filter specifically for role 'it_support' just in case API returns mixed if params ignored
                const itStaff = Array.isArray(staffRes?.data)
                    ? staffRes.data.filter(u => u.role === 'it_support' || u.role === 'admin')
                    : [];

                // Add 'All Staff' option at the beginning
                const allStaff = { id: 'all', name: 'All Staff', picture: null };
                setStaffList([allStaff, ...itStaff]);

            } catch (err) {
                console.error("Error loading schedule data:", err);
                // Fallback: still clear loading
                setSchedule([]);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadData();
        }
    }, [token]);

    // --- Filter Logic ---
    const filteredSchedule = useMemo(() => {
        if (selectedStaffId === 'all') {
            return schedule;
        }
        // Filter by staffId returning from backend
        return schedule.filter(item => item.staffId === parseInt(selectedStaffId) || item.staffId === selectedStaffId);
        // Note: ID types might differ (string/int), comparison handles both via loose check or careful parsing. 
        // Best to standardise, but '==' or explicit check helps. 
        // Let's assume types might mismatch so check both.
    }, [schedule, selectedStaffId]);

    // Helpers
    // Map schedule to events for calendar dots
    const eventsForCalendar = useMemo(() => {
        return filteredSchedule.map(item => ({
            date: item.start,
            type: item.type,
            color: item.type === 'ticket' ? '#EF4444' : '#3B82F6' // Red for fix, Blue for internal
        }));
    }, [filteredSchedule]);

    // Filter items for selected day
    const selectedItems = useMemo(() => {
        return filteredSchedule.filter(item =>
            dayjs(item.start).isSame(selectedDate, 'day')
        ).sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
    }, [filteredSchedule, selectedDate]);

    // Helper to get selected staff name
    const getSelectedStaffName = () => {
        const staff = staffList.find(s => s.id === selectedStaffId);
        return staff ? staff.name : 'Unknown';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans text-gray-900">
            {/* Header */}
            <div className="bg-[#193C6C] px-6 pt-10 pb-12 rounded-b-[3rem] shadow-lg relative z-0 overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full bg-white opacity-[0.04] blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl mx-auto flex items-center gap-4 relative z-10 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors active:scale-90"
                    >
                        <ArrowLeft size={28} />
                    </button>
                    <h1 className="text-3xl font-semibold tracking-tight text-white leading-tight">
                        IT Schedule
                    </h1>
                </div>

                {/* Real Staff Selector */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 relative z-10 snap-x">
                        {staffList.map((staff) => {
                            const isSelected = selectedStaffId === staff.id;
                            return (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaffId(staff.id)}
                                    className="flex flex-col items-center gap-1.5 min-w-[64px] snap-start transition-all active:scale-95 group"
                                >
                                    {/* Avatar Container */}
                                    <div className={`
                                        w-[52px] h-[52px] rounded-full p-[2px] transition-all duration-300
                                        ${isSelected
                                            ? "bg-gradient-to-tr from-blue-400 to-white shadow-lg shadow-blue-500/30 scale-105"
                                            : "bg-white/10 hover:bg-white/20 border border-transparent"}
                                    `}>
                                        <div className="w-full h-full rounded-full bg-[#193C6C] border-[2px] border-[#193C6C] overflow-hidden flex items-center justify-center">
                                            {staff.id === 'all' ? (
                                                <div className={`text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70'}`}>
                                                    <User size={24} />
                                                </div>
                                            ) : staff.picture ? (
                                                <img
                                                    src={staff.picture}
                                                    alt={staff.name}
                                                    className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                    <User size={24} className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Name - Show first name only */}
                                    <span className={`
                                        text-[11px] font-medium tracking-wide transition-colors truncate max-w-[64px]
                                        ${isSelected ? "text-white font-bold" : "text-blue-200/80"}
                                    `}>
                                        {staff.name.split(' ')[0]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-6 relative z-10 space-y-6 pb-20">

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
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 px-1">
                        <Calendar className="text-blue-600" size={18} />
                        <span>
                            Overview for {selectedDate.format('DD MMM')}
                            <span className="text-gray-400 font-normal ml-1">
                                ({selectedStaffId === 'all' ? 'All Staff' : getSelectedStaffName()})
                            </span>
                        </span>
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading schedule...</div>
                    ) : selectedItems.length > 0 ? (
                        <div className="grid gap-3 animate-in slide-in-from-bottom-2 duration-500">
                            {selectedItems.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4 hover:border-blue-100 transition-colors group">
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
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
                            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={26} />
                            </div>
                            <div>
                                <p className="text-gray-900 font-bold text-sm">No tasks scheduled</p>
                                <p className="text-xs text-gray-400 mt-1">IT Staff is free at this time.</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ITSchedule;
