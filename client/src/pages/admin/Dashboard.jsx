import React, { useState, useEffect, useCallback } from "react";
import { Users, Shield, Database, LayoutGrid, ChevronRight, Ticket, Briefcase, BookOpen, UserCog, FileText, Lock, HardDrive } from "lucide-react";
import { getDashboardStats } from "../../api/admin";
import useAuthStore from "../../store/auth-store";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        ticketCount: 0,
        itStaffCount: 0,
        roomCount: 0,
        equipmentCount: 0,
        resolutionRate: 0
    });

    const loadStats = useCallback(async () => {
        try {
            const res = await getDashboardStats(token);
            if (res && res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const kpiCards = [
        {
            title: "Total Tickets",
            value: stats.ticketCount,
            icon: <Ticket size={28} />,
            bgIcon: "bg-blue-50",
            text: "text-[#193C6C]"
        },
        {
            title: "IT Support",
            value: stats.itStaffCount,
            icon: <Briefcase size={28} />,
            bgIcon: "bg-blue-50",
            text: "text-[#193C6C]"
        },
        {
            title: "Resolution Rate",
            value: stats.resolutionRate + "%",
            icon: <Shield size={28} />,
            bgIcon: "bg-blue-50",
            text: "text-[#193C6C]"
        },
        {
            title: "Equipment",
            value: stats.equipmentCount,
            icon: <Database size={28} />,
            bgIcon: "bg-blue-50",
            text: "text-[#193C6C]"
        }
    ];

    const menuItems = [
        {
            title: "User Management",
            desc: "Manage student & staff accounts",
            icon: <Users size={24} />,
            link: "/admin/manage-users",
        },
        // IT Staff Management removed as per user request
        {
            title: "Floor & Room Management",
            desc: "Lab and server room status",
            icon: <LayoutGrid size={24} />,
            link: "/admin/manage-rooms",
        },
        {
            title: "Equipment Management",
            desc: "Inventory tracking",
            icon: <HardDrive size={24} />,
            link: "/admin/manage-equipment",
        },

        {
            title: "Permission",
            desc: "Access control",
            icon: <Lock size={24} />,
            link: "/admin/permission",
        },
        {
            title: "Knowledge Base",
            desc: "Guides & Troubleshooting",
            icon: <BookOpen size={24} />,
            link: "/admin/quick-fix",
        },
        {
            title: "Analytics Reports",
            desc: "Dashboard and export the reports",
            icon: <FileText size={24} />,
            link: "/admin/reports",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header: White Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1">
                <h1 className="text-3xl font-semibold text-[#193C6C] tracking-tight font-poppins">Analytics Dashboard</h1>
                <p className="text-gray-500 text-sm font-medium font-poppins">Monitor helpdesk performance</p>
            </div>

            {/* KPI Cards Grid */}
            {/* Design Rules: Same width, height, border radius, padding. Centered vertically. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((card, idx) => (
                    <div
                        key={idx}
                        className="bg-white h-32 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col justify-center">
                            <h3 className="text-4xl font-semibold text-[#193C6C] mb-1">{card.value}</h3>
                            <p className="text-sm font-medium text-gray-400">{card.title}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-full ${card.bgIcon} text-[#193C6C] flex items-center justify-center`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Management Section */}
            <div>
                <h2 className="text-[#193C6C] text-lg font-semibold mb-6 tracking-wide uppercase text-opacity-80">Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.link)}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group flex items-center justify-between h-28" // Fixed height
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-[#193C6C] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#193C6C] transition-colors">{item.title}</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={24} className="text-gray-300 group-hover:text-[#193C6C] transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
