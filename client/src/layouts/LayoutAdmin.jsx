import React from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogOut, CircleUser } from "lucide-react";
import useAuthStore from "../store/auth-store";
import Swal from "sweetalert2";

const LayoutAdmin = () => {
    const { user, token, checkUser, actionLogout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const verifyAuth = async () => {
            if (!user && token) {
                await checkUser();
            }
            setIsLoading(false);
        };
        verifyAuth();
    }, [user, token, checkUser]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    const isActive = (path) => {
        if (path === "/admin" && location.pathname === "/admin") return true;
        if (path !== "/admin" && location.pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        { label: "Home", path: "/admin" },
        { label: "Users", path: "/admin/manage-users" },

        { label: "Reports", path: "/admin/reports" },
        { label: "Knowledge Base", path: "/admin/quick-fix" },
    ];

    const handleLogout = () => {
        Swal.fire({
            title: "Confirm Logout",
            text: "Are you sure you want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
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
        <div className="min-h-screen w-full bg-gray-50 flex flex-col font-poppins">
            {/* Top Navigation Bar: Increased height to h-20 (80px), shadow-md */}
            <header className="bg-[#193C6C] text-white shadow-md sticky top-0 z-50 h-20">
                <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-4 shrink-0">
                        <img
                            src="/img/psuic_logo.png"
                            alt="PSU International College"
                            className="h-12 w-auto object-contain brightness-0 invert"
                        />
                    </div>

                    {/* Center: Navigation Tabs */}
                    {/* Tabs: Large, Well-spaced, Pill-like */}
                    <nav className="hidden md:flex items-center gap-2 h-full justify-center flex-1 px-8">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-200 ${isActive(item.path)
                                    ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Right: User Avatar & Text Logout */}
                    <div className="flex items-center gap-6 shrink-0">
                        {/* Avatar */}
                        <div
                            className="cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => navigate("/admin/profile")}
                            title="Go to Profile"
                        >
                            {user?.picture ? (
                                <img
                                    src={user.picture}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-white"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white text-[#193C6C] flex items-center justify-center font-bold text-lg border-2 border-white/20">
                                    <CircleUser size={24} />
                                </div>
                            )}
                        </div>

                        {/* Text Logout */}
                        <button
                            onClick={handleLogout}
                            className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
                <Outlet />
            </main>

            {/* Mobile Navigation (Bottom) - Optional backup for very small screens if needed, 
                 but request said "Use Top Tab Bar Navigation only". 
                 However, keeping a simple mobile menu might be good for responsiveness if top bar overflows.
                 For now, attempting to fit everything in top bar or scroll it. 
                 Let's stick to the strict requirement of "Top Tab Bar Only" and ensure it handles overflow if necessary.
              */}
        </div>
    );
};

export default LayoutAdmin;
