import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Home, User, PlusCircle,
  History, CircleUser, LogOut
} from "lucide-react";
import useAuthStore from "../store/auth-store";
import Swal from "sweetalert2";

const LayoutUser = ({ children }) => {
  const { user, token, checkUser, actionLogout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!user && token) {
        await checkUser();
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, [user, token, checkUser]);

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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => {
    if (path === "/user" && location.pathname === "/user") return true;
    if (path !== "/user" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Home", path: "/user" },
    { label: "Report Issue", path: "/user/create-ticket" },
    { label: "IT Schedule", path: "/user/it-schedule" },
    { label: "Knowledge", path: "/user/quick-fix" },
    { label: "History", path: "/user/history" },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-poppins">
      {/* Top Navigation Bar (Desktop) - Matches Admin Style */}
      <header className="hidden lg:block bg-[#193C6C] text-white shadow-md sticky top-0 z-50 h-20">
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
          <nav className="flex items-center gap-2 h-full justify-center flex-1 px-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item.path)
                  ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: User Avatar & Logout */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Avatar */}
            <div
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => navigate("/user/profile")}
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

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Scrollable Content */}
        {/* Scrollable Content */}
        <main
          className={`flex-1 w-full max-w-[1280px] mx-auto lg:pb-8 ${location.pathname.includes("/user/create-ticket/form") ? "pb-0" : "pb-24"
            }`}
        >
          {children || <Outlet />}
        </main>

        {/* Floating Bottom Navigation (Mobile Only) */}
        {!location.pathname.includes("/user/create-ticket/form") && (
          <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
            <nav className="bg-white border-t border-gray-100 pb-safe pt-3 px-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <NavLink href="/user" icon={<Home size={24} />} label="Home" active={isActive("/user")} />
                <NavLink href="/user/create-ticket" icon={<PlusCircle size={24} />} label="Report" active={isActive("/user/create-ticket")} />
                <NavLink href="/user/history" icon={<History size={24} />} label="History" active={isActive("/user/history")} />
                <NavLink href="/user/profile" icon={<User size={24} />} label="Profile" active={isActive("/user/profile")} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component for Nav Links
const NavLink = ({ href, icon, label, active, hasDot, badge }) => (
  <a
    href={href}
    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 relative ${active
      ? "text-[#193C6C]"
      : "text-gray-400 hover:text-gray-600"
      }`}
  >
    <div className={`transition-transform duration-200 relative ${active ? "-translate-y-1" : ""}`}>
      {icon}
      {hasDot && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      )}
      {badge && (
        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center border border-white">
          {badge}
        </span>
      )}
    </div>
    <span className={`text-[10px] font-medium mt-1 ${active ? "font-bold" : ""}`}>
      {label}
    </span>
  </a>
);

export default LayoutUser;
