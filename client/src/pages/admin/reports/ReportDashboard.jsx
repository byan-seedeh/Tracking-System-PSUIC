import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, Users, Activity, MapPin, Server,
    Download, FileText, Calendar, Filter, FileSpreadsheet
} from 'lucide-react';
import { listAllTickets } from '../../../api/admin';
import useAuthStore from '../../../store/auth-store';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Constants & Config ---
const COLORS = {
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444',
    purple: '#a855f7',
    navy: '#193C6C',
    gray: '#9ca3af'
};

const MONO_BLUE_COLORS = ['#193C6C', '#245291', '#3569B7', '#4E83D6', '#72A3F3'];
const PIE_COLORS = [COLORS.navy, COLORS.blue, COLORS.purple, COLORS.green, COLORS.orange];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ReportDashboard = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // --- State ---
    const [activeTab, setActiveTab] = useState('ticket'); // ticket, user, floor, equipment
    const [rawTickets, setRawTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [year, setYear] = useState('All');
    const [month, setMonth] = useState('All');

    // UI State for Clean Dropdowns
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // --- Fetch Data ---
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAllTickets(token, { limit: 10000 });
            setRawTickets(res.data.tickets || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Derived State: Available Years ---
    const availableYears = useMemo(() => {
        const years = new Set(rawTickets.map(t => dayjs(t.createdAt).year()));
        // Explicitly include future years as requested
        years.add(2025);
        years.add(2026);

        const yearsArray = Array.from(years)
            .filter(y => !isNaN(y))
            .sort((a, b) => a - b); // Oldest to Newest

        return yearsArray.map(String);
    }, [rawTickets]);

    // --- Filter Logic ---
    useEffect(() => {
        let result = rawTickets;

        // Filter by Year
        if (year !== 'All') {
            result = result.filter(t => dayjs(t.createdAt).format('YYYY') === String(year));
        }

        // Filter by Month
        if (month !== 'All') {
            result = result.filter(t => dayjs(t.createdAt).month() === MONTHS.indexOf(month));
        }

        setFilteredTickets(result);
    }, [rawTickets, year, month]);

    // --- Statistics Helpers ---
    const stats = useMemo(() => {
        const total = filteredTickets.length;
        const notStarted = filteredTickets.filter(t => t.status === 'not_started').length;
        const inProgress = filteredTickets.filter(t => t.status === 'in_progress').length;
        const completed = filteredTickets.filter(t => t.status === 'completed').length;

        // Resolution Rate
        const resolutionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        return { total, notStarted, inProgress, completed, resolutionRate };
    }, [filteredTickets]);

    // --- Export Functions ---
    const handleExportExcel = () => {
        setIsExportOpen(false);
        const wb = XLSX.utils.book_new();
        let data = [];
        let sheetName = "Report Data";

        // Generate data based on active tab
        if (activeTab === 'ticket') {
            sheetName = "Ticket Overview";
            data = filteredTickets.map(t => ({
                ID: t.id,
                Title: t.title,
                User: t.requester?.name || 'Unknown',
                Role: t.requester?.role || 'User',
                Status: t.status,
                Priority: t.priority,
                Category: t.deviceTag || 'General',
                Location: t.room ? `Floor ${t.room.floor} - ${t.room.roomNumber}` : 'Unknown',
                Date: dayjs(t.createdAt).format('YYYY-MM-DD HH:mm'),
                ResolvedAt: t.resolvedAt ? dayjs(t.resolvedAt).format('YYYY-MM-DD HH:mm') : '-'
            }));
        } else if (activeTab === 'user') {
            sheetName = "User Analysis";
            // 1. Requesters
            const requesters = filteredTickets.reduce((acc, t) => {
                const name = t.requester?.name || 'Unknown';
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {});
            // 2. Roles
            const roles = filteredTickets.reduce((acc, t) => {
                const role = t.requester?.role || 'User';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {});

            // Combine for simple export (flattened)
            data = [
                { Section: "--- User Roles ---" },
                ...Object.entries(roles).map(([role, count]) => ({ Section: "Role Request", Name: role, Count: count })),
                { Section: "--- Top Requesters ---" },
                ...Object.entries(requesters).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ Section: "Requester", Name: name, Count: count }))
            ];
        } else if (activeTab === 'floor') {
            sheetName = "Floor Analysis";
            // 1. Floors
            const floors = filteredTickets.reduce((acc, t) => {
                const f = t.room ? `Floor ${t.room.floor}` : 'Unknown';
                acc[f] = (acc[f] || 0) + 1;
                return acc;
            }, {});
            // 2. Rooms
            const rooms = filteredTickets.reduce((acc, t) => {
                const r = t.room ? `Floor ${t.room.floor} - ${t.room.roomNumber}` : 'Unknown';
                acc[r] = (acc[r] || 0) + 1;
                return acc;
            }, {});

            data = [
                { Section: "--- Floor Breakdown ---" },
                ...Object.entries(floors).map(([floor, count]) => ({ Section: "Floor", Name: floor, Count: count })),
                { Section: "--- Problematic Rooms ---" },
                ...Object.entries(rooms).sort((a, b) => b[1] - a[1]).map(([room, count]) => ({ Section: "Room", Name: room, Count: count }))
            ];
        } else if (activeTab === 'equipment') {
            sheetName = "Equipment Analysis";
            const equipment = filteredTickets.reduce((acc, t) => {
                const type = t.deviceTag || 'General';
                let category = 'Other';
                if (type.toLowerCase().includes('pc') || type.toLowerCase().includes('com')) category = 'Computer';
                else if (type.toLowerCase().includes('print')) category = 'Printer';
                else if (type.toLowerCase().includes('proj')) category = 'Projector';
                else category = type;
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            data = Object.entries(equipment).map(([cat, count]) => ({ Category: cat, Tickets: count }));
        }

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Generate filename with timestamp
        const timestamp = dayjs().format('YYYYMMDD_HHmm');
        XLSX.writeFile(wb, `SystemReport_${activeTab}_${timestamp}.xlsx`);
    };

    const handleExportPDF = () => {
        setIsExportOpen(false);
        const input = document.getElementById('report-dashboard-content');
        if (!input) return;

        html2canvas(input, {
            scale: 2,
            backgroundColor: '#F9FAFB', // Match page bg
            ignoreElements: (element) => element.classList.contains('no-export')
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const timestamp = dayjs().format('YYYYMMDD_HHmm');
            pdf.save(`SystemReport_${timestamp}.pdf`);
        });
    };

    // --- Components ---

    const MetricCard = ({ title, count, color, linkTo }) => {
        const styles = {
            blue: "from-[#193C6C] to-[#2A5298]",
            orange: "from-[#F59E0B] to-[#D97706]",
            green: "from-[#10B981] to-[#059669]",
            red: "from-[#EF4444] to-[#DC2626]",
        };

        const gradient = styles[color] || styles.blue;

        return (
            <Link
                to={linkTo}
                className={`relative overflow-hidden rounded-xl p-4 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br ${gradient} group`}
            >
                <div className="flex flex-col h-full justify-between relative z-10">
                    <div>
                        <h3 className="text-3xl font-bold font-poppins text-white leading-tight tracking-tight mb-1">
                            {count}
                        </h3>
                        <p className="text-white/90 text-xs font-medium tracking-wide uppercase opacity-90">
                            {title}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 mt-3 text-[10px] font-bold text-white/90 bg-white/20 w-fit px-2 py-1 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-white/30 transition-colors">
                        <span>Details</span>
                        <ChevronDown size={12} className="-rotate-90" />
                    </div>
                </div>

                {/* Subtle visual texture visually reduced */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <div className="w-20 h-20 rounded-full border-[12px] border-white"></div>
                </div>
            </Link>
        );
    };

    return (
        <div className="font-sans font-poppins text-[#193C6C] pb-24">

            {/* --- Main Content --- */}
            <div id="report-dashboard-content" className="space-y-6">

                {/* 1. Page Title (Standard Header) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500 no-export">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">System Reports</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-medium font-poppins ml-14">
                        Analytics Overview • {dayjs().format('MMMM D, YYYY')}
                    </p>
                </div>

                {/* 2. Controls Row (Tabs + Filters + Export) */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: Navigation Tabs */}
                    <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
                        {[
                            { id: 'ticket', label: 'Ticket Overview', icon: <Activity size={16} /> },
                            { id: 'user', label: 'User Analysis', icon: <Users size={16} /> },
                            { id: 'floor', label: 'Floor & Room', icon: <MapPin size={16} /> },
                            { id: 'equipment', label: 'Equipment', icon: <Server size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all
                                    ${activeTab === tab.id
                                        ? 'bg-[#193C6C] text-white shadow-md'
                                        : 'text-gray-500 hover:text-[#193C6C] hover:bg-gray-50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Right: Filters & Export */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">

                        {/* Year Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); setIsExportOpen(false); }}
                                className={`flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-bold min-w-[120px] justify-between transition-all shadow-sm
                                    ${year === 'All' ? 'border-gray-200 text-gray-500' : 'border-[#193C6C] text-[#193C6C]'}`}
                            >
                                <span>{year === 'All' ? 'Year' : year}</span>
                                <ChevronDown size={14} className={year === 'All' ? "text-gray-400" : "text-[#193C6C]"} />
                            </button>
                            {isYearOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
                                    <button
                                        onClick={() => { setYear('All'); setIsYearOpen(false); }}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium ${year === 'All' ? 'text-[#193C6C] bg-blue-50' : 'text-gray-600'}`}
                                    >
                                        All Years
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    {availableYears.map(y => (
                                        <button
                                            key={y}
                                            onClick={() => { setYear(y); setIsYearOpen(false); }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium ${year === y ? 'text-[#193C6C] bg-blue-50' : 'text-gray-600'}`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Month Filter */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); setIsExportOpen(false); }}
                                className={`flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-bold min-w-[140px] justify-between transition-all shadow-sm
                                    ${month === 'All' ? 'border-gray-200 text-gray-500' : 'border-[#193C6C] text-[#193C6C]'}`}
                            >
                                <span>{month === 'All' ? 'Month' : month}</span>
                                <ChevronDown size={14} className={month === 'All' ? "text-gray-400" : "text-[#193C6C]"} />
                            </button>
                            {isMonthOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden text-sm max-h-[300px] overflow-y-auto">
                                    <button
                                        onClick={() => { setMonth('All'); setIsMonthOpen(false); }}
                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium ${month === 'All' ? 'text-[#193C6C] bg-blue-50' : 'text-gray-600'}`}
                                    >
                                        All Months
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    {MONTHS.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => { setMonth(m); setIsMonthOpen(false); }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors font-medium ${month === m ? 'text-[#193C6C] bg-blue-50' : 'text-gray-600'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export Action Dropdown */}
                        <div className="relative no-export">
                            <button
                                onClick={() => { setIsExportOpen(!isExportOpen); setIsYearOpen(false); setIsMonthOpen(false); }}
                                className="flex items-center justify-center w-10 h-10 bg-[#193C6C] text-white rounded-lg hover:bg-[#245291] transition-colors shadow-sm group relative"
                                title="Export Report"
                            >
                                <Download size={20} />
                                {/* Tooltip */}
                                <span className="absolute -bottom-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Export Report
                                </span>
                            </button>

                            {isExportOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Export As</p>
                                    </div>
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors font-medium text-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                            <FileText size={16} />
                                        </div>
                                        PDF Report
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors font-medium text-sm group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                            <FileSpreadsheet size={16} />
                                        </div>
                                        Excel Data
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* 3. Metric Cards (Smaller) */}
                {/* 3. Metric Cards (Smaller) */}
                {activeTab === 'ticket' && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Total Tickets"
                            count={stats.total}
                            color="blue"
                            linkTo="/admin/reports/status/total"
                        />
                        <MetricCard
                            title="Not Started"
                            count={stats.notStarted}
                            color="red"
                            linkTo="/admin/reports/status/not_started"
                        />
                        <MetricCard
                            title="In Progress"
                            count={stats.inProgress}
                            color="orange"
                            linkTo="/admin/reports/status/in_progress"
                        />
                        <MetricCard
                            title="Completed"
                            count={stats.completed}
                            color="green"
                            linkTo="/admin/reports/status/completed"
                        />
                    </div>
                )}

                {/* 4. Charts & Detailed Analysis */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* === TICKET OVERVIEW === */}
                    {activeTab === 'ticket' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Trend Chart */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-[#193C6C] text-lg">Daily Ticket Trend</h3>
                                    <div className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{loading ? 'Loading...' : `Last 7 Days`}</div>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={Object.entries(filteredTickets.reduce((acc, t) => {
                                            const date = dayjs(t.createdAt).format('DD/MM');
                                            acc[date] = (acc[date] || 0) + 1;
                                            return acc;
                                        }, {})).slice(-7).map(([date, count]) => ({ date, count }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: '#F3F4F6' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#193C6C" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Key Indicators */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4">
                                        <Activity size={32} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">Resolution Rate</p>
                                    <h3 className="text-5xl font-bold text-[#193C6C]">{stats.resolutionRate}%</h3>
                                    <span className="text-sm font-medium text-green-600 mt-2 bg-green-50 px-3 py-1 rounded-full">Success</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === USER ANALYSIS === */}
                    {activeTab === 'user' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-[#193C6C] mb-6 text-lg">Top 5 Requesters</h3>
                                <div className="space-y-4">
                                    {Object.entries(filteredTickets.reduce((acc, t) => {
                                        const name = t.requester?.name || 'Unknown';
                                        acc[name] = (acc[name] || 0) + 1;
                                        return acc;
                                    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count], i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#193C6C] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {name[0]}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{name}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-[#193C6C] text-lg">{count}</span>
                                                <span className="text-[10px] text-gray-400 font-medium uppercase">Tickets</span>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredTickets.length === 0 && <p className="text-center text-gray-400 py-8">No data available</p>}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-[#193C6C] mb-6 text-lg">Requests by User Role</h3>
                                <div className="h-[350px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(filteredTickets.reduce((acc, t) => {
                                                    const role = t.requester?.role || 'User';
                                                    acc[role] = (acc[role] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([name, value]) => ({ name, value }))}
                                                cx="50%" cy="50%" innerRadius={80} outerRadius={120}
                                                paddingAngle={5} dataKey="value"
                                            >
                                                {PIE_COLORS.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === FLOOR & ROOM ANALYSIS === */}
                    {activeTab === 'floor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-[#193C6C] mb-6 text-lg">Tickets by Floor</h3>
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={Object.entries(filteredTickets.reduce((acc, t) => {
                                            const floor = t.room ? `Floor ${t.room.floor}` : 'Unknown';
                                            acc[floor] = (acc[floor] || 0) + 1;
                                            return acc;
                                        }, {})).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={80} stroke="#64748B" fontSize={14} tickLine={false} axisLine={false} fontWeight={600} />
                                            <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px' }} />
                                            <Bar dataKey="count" fill="#193C6C" radius={[0, 6, 6, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-[#193C6C] mb-6 text-lg">Top 5 Problematic Rooms</h3>
                                <div className="space-y-4">
                                    {Object.entries(filteredTickets.reduce((acc, t) => {
                                        const room = t.room ? `Floor ${t.room.floor} - ${t.room.roomNumber}` : 'Unknown';
                                        acc[room] = (acc[room] || 0) + 1;
                                        return acc;
                                    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([room, count], i) => (
                                        <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                                    <MapPin size={16} />
                                                </div>
                                                <span className="text-gray-700 font-bold">{room}</span>
                                            </div>
                                            <span className="bg-red-50 text-red-600 font-bold px-4 py-1.5 rounded-full text-xs shadow-sm">{count} Issues</span>
                                        </div>
                                    ))}
                                    {filteredTickets.length === 0 && <p className="text-center text-gray-400 py-8">No data available</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === EQUIPMENT ANALYSIS === */}
                    {activeTab === 'equipment' && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-[#193C6C] mb-6 text-lg">Equipment Breakdown</h3>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(filteredTickets.reduce((acc, t) => {
                                                const type = t.deviceTag || 'General';
                                                let category = 'Other';
                                                if (type.toLowerCase().includes('pc') || type.toLowerCase().includes('com')) category = 'Computer';
                                                else if (type.toLowerCase().includes('print')) category = 'Printer';
                                                else if (type.toLowerCase().includes('proj')) category = 'Projector';
                                                else category = type;

                                                acc[category] = (acc[category] || 0) + 1;
                                                return acc;
                                            }, {})).map(([name, value]) => ({ name, value }))}
                                            cx="50%" cy="50%" outerRadius={140}
                                            fill="#8884d8" dataKey="value" label
                                        >
                                            {MONO_BLUE_COLORS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={MONO_BLUE_COLORS[index % MONO_BLUE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                        <Legend verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDashboard;
