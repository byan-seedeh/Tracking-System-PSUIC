import React, { useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import {
  Home, User, PlusCircle,
  History
} from "lucide-react";
import AppSidebar from "../components/layout/AppSidebar";
import useAuthStore from "../store/auth-store";
import SidebarUser from "../components/user/SidebarUser";

const LayoutUser = ({ children }) => {
  const { user, token, checkUser } = useAuthStore();
  const location = useLocation();
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!user && !token) {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <AppSidebar
        className="bg-white border-r border-gray-100 hidden lg:flex"
        logo="/img/psuic.png"
        headerClassName="h-32 p-4 flex justify-center items-center"
        logoClassName="w-full h-full object-contain"
      >
        <div className="pt-2 h-full">
          <SidebarUser />
        </div>
      </AppSidebar>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        {/* Scrollable Content */}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-0">
          <div className="max-w-[1920px] mx-auto">
            {children || <Outlet />}
          </div>
        </main>

        {/* Floating Bottom Navigation (Mobile Only) */}
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

// Helper Component for Mobile Nav Links
const MobileNavLink = ({ href, icon, label, active, onClick, isLogout }) => (
  <a
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 ${isLogout
      ? "text-red-600 hover:bg-red-50 font-medium"
      : active
        ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
      }`}
  >
    {icon}
    {label}
  </a>
);

export default LayoutUser;
