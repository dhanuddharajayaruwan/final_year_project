import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import authService from '@/services/auth.service';
import logo from '@/assets/logo.png';

const menuItems = [
  { id: 'overview', path: '/member/overview', label: 'OVERVIEW', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { id: 'orders', path: '/member/orders', label: 'MY ORDERS', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  )},
  { id: 'subscriptions', path: '/member/subscriptions', label: 'SUBSCRIPTIONS', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" /></svg>
  )},
  { id: 'trainers', path: '/member/trainers', label: 'BROWSE TRAINERS', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { id: 'schedules', path: '/member/schedules', label: 'MY SCHEDULES', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  )},
  { id: 'reviews', path: '/member/reviews', label: 'MY RATINGS', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  )},
  { id: 'chat', path: '/member/chat', label: 'SUPPORT CHAT', icon: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  )},
];

const SidebarContent = ({ pathname }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-gray-800 flex flex-col items-center text-center">
      <Link to="/" className="group mb-3">
        <img src={logo} alt="Cylon Force Logo" className="h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-110" />
      </Link>
      <div className="text-[10px] text-white font-bold tracking-[0.3em] uppercase opacity-70">Member Dashboard</div>
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
                ? 'bg-red-600 text-white shadow-xl shadow-red-900/50 scale-[1.02]'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  </div>
);

const ClientDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (user && user.role !== 'client') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user || user.role !== 'client') return null;

  const activeLabel = menuItems.find(item => location.pathname === item.path)?.label || 'MEMBER DASHBOARD';

  return (
    <div className="bg-[#121212] min-h-screen font-sans flex text-white">
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.35s ease-out forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .sidebar-slide { animation: slideIn 0.3s ease-out forwards; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-black hidden lg:flex flex-col fixed h-full z-40 border-r border-gray-800">
        <SidebarContent pathname={location.pathname} />
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <aside
            className="sidebar-slide absolute left-0 top-0 h-full w-72 bg-black border-r border-gray-800 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent pathname={location.pathname} />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow lg:ml-72 flex flex-col min-h-screen">
        <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-2xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-gray-800 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
              {activeLabel}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 hover:bg-gray-800 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-red-300 flex items-center justify-center text-white font-black text-sm shadow overflow-hidden">
                  {user.profile_image ? (
                    <img 
                      src={authService.getImageUrl(user.profile_image)} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = ''; }} 
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{user.name}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800 bg-black/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-red-300 flex items-center justify-center text-white font-black text-lg shadow overflow-hidden">
                        {user.profile_image ? (
                          <img 
                            src={authService.getImageUrl(user.profile_image)} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase">{user.name}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{user.role}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-[10px] font-black text-gray-400 hover:bg-gray-800 hover:text-white tracking-widest uppercase transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span>Back to Home</span>
                    </Link>
                    <div className="border-t border-gray-800 my-1" />
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-500/10 tracking-widest uppercase transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 flex-grow animate-fadeIn" key={location.pathname}>
          <Outlet />
        </div>

        <footer className="p-6 text-center border-t border-gray-800 bg-black/50">
          <p className="text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase opacity-70">
            &copy; {new Date().getFullYear()} Cylon Force Member Dashboard &bull; v1.0.0
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ClientDashboard;
