import React from "react";
import { Outlet, Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { Home, Calendar, User, FileText, Bell, LogOut, Search, Book } from "lucide-react";
import useAuthStore from "../store/auth-store";
import Swal from "sweetalert2";

const LayoutIT = () => {
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  // Assuming role is 'it_support' based on backend
  if (!user || user.role !== "it_support") {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-poppins">
      {/* Desktop Top Navigation Bar (Hidden on mobile) */}
      <header className="hidden md:block bg-[#193C6C] shadow-md sticky top-0 z-50 h-20">
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo Section (Left) */}
          <div className="flex items-center gap-4 shrink-0">
            <img src="/img/psuic_logo.png" alt="PSUIC Logo" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>

          {/* Navigation Links (Center) */}
          <nav className="flex items-center gap-1 mx-4">
            <DesktopNavLink to="/it" label="Home" active={isActive("/it")} />
            <DesktopNavLink to="/it/tickets" label="Tickets" active={isActive("/it/tickets")} />
            <DesktopNavLink to="/it/schedule" label="Schedule" active={isActive("/it/schedule")} />
            <DesktopNavLink to="/it/history" label="History" active={isActive("/it/history")} />
          </nav>

          {/* User Profile & Actions (Right Group) */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate("/it/profile")}
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
                    <User size={24} />
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>



      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Pages will handle their own max-width containers for headers and content */}
        <div className="w-full pb-32 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Floating Bottom Navigation (Mobile/Tablet - hidden on md+) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
        <nav className="bg-white border-t border-gray-100 pb-safe pt-2 px-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex items-end justify-between w-full max-w-lg mx-auto relative">
            <MobileNavLink to="/it" icon={<Home size={22} />} label="Home" active={isActive("/it")} />
            <MobileNavLink to="/it/tickets" icon={<FileText size={22} />} label="Ticket" active={isActive("/it/tickets") || isActive("/it/history")} />
            <MobileNavLink to="/it/schedule" icon={<Calendar size={22} />} label="Schedule" active={isActive("/it/schedule")} />
            <MobileNavLink to="/it/profile" icon={<User size={22} />} label="Profile" active={isActive("/it/profile")} />
          </div>
        </nav>
      </div>
    </div>
  );
};

// Desktop Navigation Link Component
// Desktop Navigation Link Component (Pill Style)
const DesktopNavLink = ({ to, label, active }) => (
  <Link
    to={to}
    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${active
      ? "bg-white/10 text-white shadow-inner ring-1 ring-white/20"
      : "text-white/70 hover:text-white hover:bg-white/5"
      }`}
  >
    {label}
  </Link>
);

// Mobile Navigation Link Component (renamed from NavLink to avoid conflict)
const MobileNavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
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
