import React from "react";
import { Outlet, Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Home, Calendar, User, CircleUser, FileText, Bell } from "lucide-react";
import AppSidebar from "../components/layout/AppSidebar";
import useAuthStore from "../store/auth-store";
import SidebarIT from "../components/it/SidebarIT";

const LayoutIT = () => {
  const { user, token, checkUser } = useAuthStore();
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

  // Assuming role is 'it_support' based on backend
  if (!user || user.role !== "it_support") {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => location.pathname === path;



  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop Only (lg+) */}
      <AppSidebar
        className="bg-white border-r border-gray-100 hidden lg:flex"
        logo="/img/psuic.png"
        headerClassName="h-32 p-4 flex justify-center items-center"
        logoClassName="w-full h-full object-contain"
      >
        <div className="pt-2 h-full">
          <SidebarIT />
        </div>
      </AppSidebar>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Hidden on md+) */}
        {/* Mobile Header (Hidden on md+) */}
        <header className="bg-[#193C6C] shadow-sm sticky top-0 z-40 md:hidden text-white">
          <div className="flex items-center justify-between p-4 px-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="font-bold text-lg leading-tight">IT Support</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/it/notifications")}
                className="p-2 relative bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></div>
                <span className="text-white"><Bell size={20} /></span>
              </button>

              <button
                onClick={() => navigate("/it/profile")}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <User size={20} />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header REMOVED as per request */}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          <Outlet />
        </main>

        {/* Floating Bottom Navigation (Mobile/Tablet - lg:hidden) */}
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-end justify-between w-full max-w-lg mx-auto relative">
              <NavLink href="/it" icon={<Home size={22} />} label="Home" active={isActive("/it")} />

              <NavLink href="/it/tickets" icon={<FileText size={22} />} label="Ticket" active={isActive("/it/tickets") || isActive("/it/history")} />

              <NavLink href="/it/schedule" icon={<Calendar size={22} />} label="Schedule" active={isActive("/it/schedule")} />

              <NavLink href="/it/profile" icon={<User size={22} />} label="Profile" active={isActive("/it/profile")} />
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Nav Links
const NavLink = ({ href, icon, label, active }) => (
  <Link
    to={href}
    className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${active
      ? "text-blue-600"
      : "text-gray-400 hover:text-gray-600"
      }`}
  >
    <div className={`transition-transform duration-200 ${active ? "-translate-y-1" : ""}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-medium mt-1 truncate w-full text-center ${active ? "opacity-100 font-bold" : "opacity-70"}`}>
      {label}
    </span>
  </Link>
);

export default LayoutIT;
