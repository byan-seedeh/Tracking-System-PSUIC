import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    BarChart,
    BookOpen,
    User,
    LogOut
} from "lucide-react";

import useAuthStore from "../../store/auth-store";
import Swal from "sweetalert2";

const SidebarAdmin = ({ className = "" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { actionLogout } = useAuthStore();
    const isActive = (path) => location.pathname === path;

    const services = [
        {
            icon: <LayoutDashboard />,
            title: "Home",
            action: () => navigate("/admin"),
            path: "/admin",
        },
        {
            icon: <Users />,
            title: "Users",
            action: () => navigate("/admin/manage-users"),
            path: "/admin/manage-users",
        },
        {
            icon: <BarChart />,
            title: "Reports",
            action: () => navigate("/admin/reports"),
            path: "/admin/reports",
        },
        {
            icon: <BookOpen />,
            title: "Knowledge Base",
            action: () => navigate("/admin/quick-fix"),
            path: "/admin/quick-fix",
        },
        {
            icon: <User />,
            title: "Profile",
            action: () => navigate("/admin/profile"),
            path: "/admin/profile",
        },
    ];

    const handleLogout = () => {
        Swal.fire({
            title: 'Log out?',
            text: "You will be returned to the login screen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: "rounded-3xl p-6",
                title: "text-xl font-bold text-gray-900 font-poppins",
                htmlContainer: "text-gray-500 font-poppins",
                confirmButton: "bg-[#193C6C] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#122b4d] transition-colors",
                cancelButton: "bg-white text-[#193C6C] border border-[#193C6C] px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors",
                actions: "gap-3"
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                actionLogout();
                navigate("/login");
            }
        });
    };

    return (
        <div className={`flex flex-col gap-2 h-full ${className}`}>
            {services.map((service, index) => (
                <button
                    key={index}
                    onClick={service.action}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group w-full text-left
            ${isActive(service.path) ? "bg-[#193C6C] text-white shadow-md" : "hover:bg-gray-100 text-gray-600"} ${service.className || ""}`}
                >
                    <div className={`w-6 h-6 flex items-center justify-center shrink-0 ${isActive(service.path) ? "text-white" : "text-gray-500 group-hover:text-[#193C6C]"}`}>
                        {React.cloneElement(service.icon, { size: 24 })}
                    </div>
                    <span className={`text-sm font-medium ${isActive(service.path) ? "font-bold" : ""}`}>
                        {service.title}
                    </span>
                </button>
            ))}

            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group w-full text-left hover:bg-gray-50 text-gray-600"
            >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 text-gray-500 group-hover:text-gray-700">
                    <LogOut size={24} />
                </div>
                <span className="text-sm font-medium">Log out</span>
            </button>
        </div>
    );
};

export default SidebarAdmin;
