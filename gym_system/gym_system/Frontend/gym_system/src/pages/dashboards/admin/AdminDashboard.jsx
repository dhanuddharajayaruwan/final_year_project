import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import trainingSubscriptionService from "@/services/trainingSubscription.service";
import orderService from "@/services/order.service";
import contactService from "@/services/contact.service";

// ─── Sidebar content extracted OUTSIDE the main component (required by React) ───
const menuItems = [
  {
    id: "overview",
    path: "/admin/overview",
    label: "OVERVIEW",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    id: "users",
    path: "/admin/users",
    label: "USER MANAGEMENT",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    id: "trainers",
    path: "/admin/trainers",
    label: "TRAINERS",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    id: "shop",
    path: "/admin/shop",
    label: "SHOP MANAGER",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
  {
    id: "subscriptions",
    path: "/admin/subscriptions",
    label: "SUBSCRIPTIONS",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
        />
      </svg>
    ),
  },
  {
    id: "orders",
    path: "/admin/orders",
    label: "SHOP ORDERS",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    id: "reviews",
    path: "/admin/reviews",
    label: "USER REVIEWS",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
  },
  {
    id: "chat",
    path: "/admin/chat",
    label: "LIVE CHAT",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    id: "contact",
    path: "/admin/contact",
    label: "CONTACT MESSAGES",
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

const SidebarContent = ({
  pathname,
  pendingSubCount = 0,
  pendingOrderCount = 0,
  unreadContactCount = 0,
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-blue-800 flex flex-col items-center text-center">
      <Link to="/" className="group mb-3">
        <img
          src={logo}
          alt="Cylon Force Logo"
          className="h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </Link>
      <div className="text-[10px] text-white font-bold tracking-[0.3em] uppercase opacity-70">
        Admin Control Center
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-black tracking-widest transition-all duration-300 ${
              isActive
                ? "bg-blue-600 text-white shadow-xl shadow-blue-900/50 scale-[1.02]"
                : "text-blue-200 hover:bg-blue-800 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.id === "subscriptions" && pendingSubCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {pendingSubCount > 99 ? "99+" : pendingSubCount}
              </span>
            )}
            {item.id === "orders" && pendingOrderCount > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
              </span>
            )}
            {item.id === "contact" && unreadContactCount > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {unreadContactCount > 99 ? "99+" : unreadContactCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [pendingSubCount, setPendingSubCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [unreadContactCount, setUnreadContactCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await trainingSubscriptionService.getAllSubscriptions({
          paymentType: "bank_transfer",
          status: "pending",
          limit: 1,
        });
        setPendingSubCount(res.total || 0);
      } catch {
        // silently ignore
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const [pendingRes, processingRes] = await Promise.all([
          orderService.getAllOrders({ order_status: "pending", limit: 1 }),
          orderService.getAllOrders({ order_status: "processing", limit: 1 }),
        ]);
        setPendingOrderCount(
          (pendingRes.total || 0) + (processingRes.total || 0)
        );
      } catch {
        // silently ignore
      }
    };
    fetchOrderCount();
    const interval = setInterval(fetchOrderCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUnreadContacts = async () => {
      try {
        const res = await contactService.getAllContacts({
          is_read: "false",
          limit: 1,
        });
        setUnreadContactCount(res.total || 0);
      } catch {
        // silently ignore
      }
    };
    fetchUnreadContacts();
    const interval = setInterval(fetchUnreadContacts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user || user.role !== "admin") return null;

  const activeLabel =
    menuItems.find((item) => location.pathname === item.path)?.label ||
    "DASHBOARD";

  return (
    <div className="bg-[#f4f7fe] min-h-screen font-sans flex text-gray-800">
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.35s ease-out forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .sidebar-slide { animation: slideIn 0.3s ease-out forwards; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* ─── DESKTOP SIDEBAR (lg+) ─── */}
      <aside className="w-72 bg-blue-900 hidden lg:flex flex-col fixed h-full z-40 border-r border-blue-800">
        <SidebarContent
          user={user}
          pathname={location.pathname}
          pendingSubCount={pendingSubCount}
          pendingOrderCount={pendingOrderCount}
          unreadContactCount={unreadContactCount}
        />
      </aside>

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="sidebar-slide absolute left-0 top-0 h-full w-72 bg-blue-900 border-r border-blue-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-blue-300 hover:text-white transition z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <SidebarContent
              user={user}
              pathname={location.pathname}
              pendingSubCount={pendingSubCount}
              pendingOrderCount={pendingOrderCount}
              unreadContactCount={unreadContactCount}
            />
          </aside>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-grow lg:ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-blue-900 hover:bg-blue-50 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-base md:text-xl font-black italic uppercase tracking-tighter text-blue-900">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Notification Bell */}
            <div className="relative hidden sm:block">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-gray-400 cursor-pointer hover:text-blue-900 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 hover:bg-blue-100 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white font-black text-sm shadow">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none">
                    {user.name}
                  </div>
                  <div className="text-[8px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">
                    {user.role}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-black text-lg shadow">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black text-blue-900 uppercase">
                          {user.name}
                        </div>
                        <div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">
                          {user.role}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-50 tracking-widest uppercase transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div
          className="p-4 md:p-8 flex-grow animate-fadeIn"
          key={location.pathname}
        >
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-gray-100 bg-white">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.3em] uppercase opacity-70">
            &copy; {new Date().getFullYear()} Cylon Force Admin Dashboard &bull;
            v1.0.4
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;
