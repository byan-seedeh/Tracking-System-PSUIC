import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { listAllTickets } from '../../../api/admin';
import useAuthStore from '../../../store/auth-store';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ReportStatusDetail = () => {
    const { status } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');

    // Filters
    const [year, setYear] = useState('All');
    const [month, setMonth] = useState('All');

    // UI Dropdowns
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [isMonthOpen, setIsMonthOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const statusTitle = status ? status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Details';

    // Status Mapping
    const getStatusKey = (s) => {
        if (!s) return '';
        const lower = s.toLowerCase();
        if (lower.includes('not started') || lower === 'not_started') return 'not_started';
        if (lower.includes('in progress') || lower === 'in_progress') return 'in_progress';
        if (lower.includes('completed')) return 'completed';
        if (lower.includes('total')) return 'all';
        return s;
    };

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await listAllTickets(token, { limit: 10000 });
            let all = res.data.tickets || [];

            const key = getStatusKey(status);
            if (key !== 'all') {
                all = all.filter(t => t.status === key);
            }

            // Sort Latest to Oldest
            all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTickets(all);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [status, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Available Years
    const availableYears = useMemo(() => {
        const years = new Set(tickets.map(t => dayjs(t.createdAt).year()));
        years.add(2025);
        years.add(2026);
        return Array.from(years).filter(y => !isNaN(y)).sort((a, b) => a - b).map(String);
    }, [tickets]);

    // Filter Logic
    const filteredData = useMemo(() => {
        return tickets.filter(t => {
            // Text Search
            const searchMatch =
                t.title?.toLowerCase().includes(filterText.toLowerCase()) ||
                t.requester?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                t.deviceTag?.toLowerCase().includes(filterText.toLowerCase());

            // Year Filter
            const yearMatch = year === 'All' || dayjs(t.createdAt).format('YYYY') === String(year);

            // Month Filter
            const monthMatch = month === 'All' || dayjs(t.createdAt).month() === MONTHS.indexOf(month);

            return searchMatch && yearMatch && monthMatch;
        });
    }, [tickets, filterText, year, month]);

    // Export Logic
    const handleExportExcel = () => {
        setIsExportOpen(false);
        const wb = XLSX.utils.book_new();
        const data = filteredData.map(t => ({
            ID: t.id,
            Title: t.title,
            User: t.requester?.name || 'Unknown',
            Role: t.requester?.role || 'User',
            Status: t.status,
            Date: dayjs(t.createdAt).format('YYYY-MM-DD HH:mm'),
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Status Detail");
        XLSX.writeFile(wb, `Report_${status}_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    const handleExportPDF = () => {
        setIsExportOpen(false);
        const input = document.getElementById('report-detail-table');
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Report_${status}_${dayjs().format('YYYYMMDD')}.pdf`);
        });
    };

    return (
        <div className="space-y-6 font-sans font-poppins text-[#193C6C] pb-20">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">{statusTitle} Tickets</h1>
                </div>
                <p className="text-gray-500 text-sm font-medium font-poppins ml-14">Full detailed list • {filteredData.length} records</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* LEFT: Search Bar */}
                <div className="relative w-full md:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, user or tag..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="pl-10 pr-4 h-[44px] bg-white border border-gray-200 rounded-[12px] text-sm text-[#193C6C] outline-none focus:ring-2 focus:ring-[#193C6C]/20 w-full transition-all shadow-sm font-medium"
                    />
                </div>

                {/* RIGHT: Filters & Export */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">

                    {/* Year Filter */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); setIsExportOpen(false); }}
                            className={`flex items-center gap-2 bg-white border px-4 h-[44px] rounded-xl text-sm font-bold min-w-[120px] justify-between transition-all shadow-sm
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
                            className={`flex items-center gap-2 bg-white border px-4 h-[44px] rounded-xl text-sm font-bold min-w-[140px] justify-between transition-all shadow-sm
                                ${month === 'All' ? 'border-gray-200 text-gray-500' : 'border-[#193C6C] text-[#193C6C]'}`}
                        >
                            <span>{month === 'All' ? 'Month' : month}</span>
                            <ChevronDown size={14} className={month === 'All' ? "text-gray-400" : "text-[#193C6C]"} />
                        </button>
                        {isMonthOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden text-sm max-h-[300px] overflow-y-auto custom-scrollbar">
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

                    {/* Export Button */}
                    <div className="relative">
                        <button
                            onClick={() => { setIsExportOpen(!isExportOpen); setIsYearOpen(false); setIsMonthOpen(false); }}
                            className="flex items-center justify-center w-[44px] h-[44px] bg-[#193C6C] text-white rounded-xl hover:bg-[#245291] transition-colors shadow-sm group relative"
                            title="Export List"
                        >
                            <Download size={20} />
                        </button>

                        {isExportOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Export As</p>
                                </div>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors font-medium text-sm"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                        <FileText size={16} />
                                    </div>
                                    PDF List
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-gray-700 hover:text-green-600 transition-colors font-medium text-sm"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                        <FileSpreadsheet size={16} />
                                    </div>
                                    Excel Data
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden" id="report-detail-table">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#F6F6F6] text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Equipment / Issue</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">Loading data...</td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((t, i) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#193C6C]">{t.deviceTag || t.title}</p>
                                            <p className="text-xs text-gray-400 font-normal">{t.issueType || "Issue Report"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
                                                    {t.requester?.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-gray-700 font-medium">{t.requester?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {dayjs(t.createdAt).format('DD MMM YYYY')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {dayjs(t.createdAt).format('HH:mm')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize
                                                ${t.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    t.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-orange-100 text-orange-700'}`}>
                                                {t.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => navigate(`/admin/ticket/${t.id}`)} className="text-[#193C6C] font-semibold hover:underline text-xs">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">No tickets found for selected criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportStatusDetail;
