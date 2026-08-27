import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollToSection';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import authService from '../services/auth.service';
import logo from '../assets/logo.png';
import { showConfirm, showSuccess } from '../utils/sweetAlerts';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState('');
  const dropdownRef = useRef(null);

  const handleGuestSearch = (e) => {
    e.preventDefault();
    const trimmed = guestOrderId.trim();
    if (!trimmed) return;
    navigate(`/track-order?id=${encodeURIComponent(trimmed)}`);
    setGuestOrderId('');
    setIsMobileMenuOpen(false);
  };

  const goToSection = (sectionId, e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (location.pathname === '/') {
      scrollToSection(sectionId);
      window.history.replaceState(null, '', `/#${sectionId}`);
      setActiveSection(sectionId);
      return;
    }

    navigate(`/#${sectionId}`);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm("Logout", "Are you sure you want to log out?");
    if (confirmed) {
      logout();
      showSuccess("Logged Out", "You have been logged out successfully.");
      navigate('/');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['club', 'team', 'pricing', 'gallery', 'contact'];
      let current = '';

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        current = 'contact';
      } else {
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 200) {
              current = section;
              break;
            }
          }
        }
      }
      
      if (!current && window.scrollY < 200) {
        current = ''; 
      }
      
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    if (location.pathname !== '/') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, location.pathname]);

  // Derive active UI state for shop/cart from URL
  const isShopOrCart = location.pathname.startsWith('/shop') || location.pathname.startsWith('/cart');
  const currentActive = isShopOrCart ? 'shop' : activeSection;

  return (
    <nav className="flex justify-between items-center py-5 px-6 md:px-16 bg-black/95 text-white fixed top-0 w-full z-50 border-b border-gray-900 shadow-md">
      <div className="font-extrabold text-2xl tracking-widest cursor-pointer">
        <Link 
          to="/" 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-2"
        >
          <img src={logo} alt="Cylon Force Logo" className="h-15 w-auto object-contain" />
          <div className="flex flex-col md:flex-row md:items-center leading-none">
            <span className="text-red-600 font-bold">C</span>YLON
            <span className="text-red-600 font-bold ml-0.5 md:ml-1">F</span>ORCE
          </div>
        </Link>
      </div>
      <ul className="hidden md:flex space-x-8 text-xs font-bold tracking-widest text-gray-300">
        <a href="/#club" onClick={(e) => goToSection('club', e)} className={`cursor-pointer transition duration-300 ${currentActive === 'club' ? 'text-red-600' : 'hover:text-red-600'}`}>CLUB</a>
        <a href="/#team" onClick={(e) => goToSection('team', e)} className={`cursor-pointer transition duration-300 ${currentActive === 'team' ? 'text-red-600' : 'hover:text-red-600'}`}>TEAM</a>
        <a href="/#pricing" onClick={(e) => goToSection('pricing', e)} className={`cursor-pointer transition duration-300 ${currentActive === 'pricing' ? 'text-red-600' : 'hover:text-red-600'}`}>PRICING</a>
        <a href="/#gallery" onClick={(e) => goToSection('gallery', e)} className={`cursor-pointer transition duration-300 ${currentActive === 'gallery' ? 'text-red-600' : 'hover:text-red-600'}`}>GALLERY</a>
        <Link to="/shop" className={`cursor-pointer transition duration-300 flex items-center space-x-1 ${currentActive === 'shop' ? 'text-red-600' : 'hover:text-red-600'}`}>
          <span>SHOP</span>
          <span className="bg-red-600 text-[7px] text-white px-1 py-[1px] rounded animate-pulse uppercase">HOT</span>
        </Link>
        <a href="/#contact" onClick={(e) => goToSection('contact', e)} className={`cursor-pointer transition duration-300 ${currentActive === 'contact' ? 'text-red-600' : 'hover:text-red-600'}`}>CONTACT</a>
        {!user && (
          <Link
            to="/track-order"
            className={`cursor-pointer transition duration-300 flex items-center gap-1 ${
              location.pathname === '/track-order' ? 'text-red-600' : 'hover:text-red-600'
            }`}
          >
            📦 TRACK ORDER
          </Link>
        )}
      </ul>
      
      <div className="flex items-center space-x-4">
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Cart Icon - Show on Shop and Product pages for Clients and Trainers */}
        {(location.pathname === '/shop' || location.pathname.startsWith('/product/')) && (
          <div className="relative group">
            <Link 
              to={user ? "/cart" : "#"} 
              className={`transition-all duration-300 flex items-center justify-center ${
                user 
                  ? 'text-gray-300 hover:text-red-600 cursor-pointer' 
                  : 'text-gray-500 hover:text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => !user && e.preventDefault()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {user && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-[8px] text-white w-4 h-4 rounded-full flex items-center justify-center font-black border border-black group-hover:scale-110 transition-transform">
                  {cartItems.length}
                </span>
              )}
            </Link>
            
            {/* Tooltip for guests */}
            {!user && (
              <div className="absolute top-10 right-0 bg-red-600 text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none z-50 whitespace-nowrap uppercase italic">
                Need to login to the system
              </div>
            )}
          </div>
        )}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-sm font-light text-gray-300 hover:text-white transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full border border-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
                {user.profile_image ? (
                  <img 
                    src={authService.getImageUrl(user.profile_image)} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <span className="hidden sm:block font-bold uppercase">{user.name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-48 bg-[#1a1a1a] border-1 border-white rounded-md shadow-2xl ring-1 ring-white/10 py-2 z-50 transform origin-top-right transition-all">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)} 
                  className="block px-4 py-2 text-sm font-bold tracking-wider text-gray-300 hover:bg-gray-800 hover:text-white transition"
                >
                  PROFILE
                </Link>
                <Link 
                  to={user.role === 'admin' ? "/admin" : user.role === 'trainer' ? "/trainer" : "/member"}
                  onClick={() => setIsDropdownOpen(false)} 
                  className={`block px-4 py-2 text-sm font-bold tracking-wider transition hover:bg-gray-800 ${
                    user.role === 'admin' || user.role === 'trainer' ? 'text-red-500 hover:text-red-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {user.role === 'admin' ? 'ADMIN DASHBOARD' : user.role === 'trainer' ? 'TRAINER DASHBOARD' : 'MEMBER DASHBOARD'}
                </Link>
                <div className="border-t border-gray-800 my-2"></div>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-4 py-2 text-sm font-bold tracking-wider text-red-500 hover:bg-gray-800 hover:text-red-400 transition"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-red-600 px-6 py-2 rounded-full font-bold text-xs tracking-widest text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30">
            SIGN IN
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[73px] left-0 w-full bg-black/95 border-b border-gray-900 py-6 px-6 z-40 transition-all duration-300">
          <ul className="flex flex-col space-y-6 text-sm font-bold tracking-widest text-gray-300">
            <a href="/#club" onClick={(e) => goToSection('club', e)} className={`cursor-pointer transition ${activeSection === 'club' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>CLUB</a>
            <a href="/#team" onClick={(e) => goToSection('team', e)} className={`cursor-pointer transition ${activeSection === 'team' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>TEAM</a>
            <a href="/#pricing" onClick={(e) => goToSection('pricing', e)} className={`cursor-pointer transition ${activeSection === 'pricing' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>PRICING</a>
            <a href="/#gallery" onClick={(e) => goToSection('gallery', e)} className={`cursor-pointer transition ${activeSection === 'gallery' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>GALLERY</a>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`cursor-pointer transition flex items-center space-x-2 ${activeSection === 'shop' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>
              <span>SHOP</span>
              <span className="bg-red-600 text-[8px] text-white px-1 rounded animate-pulse">NEW</span>
            </Link>
            <a href="/#contact" onClick={(e) => goToSection('contact', e)} className={`cursor-pointer transition ${activeSection === 'contact' ? 'text-red-600 underline decoration-red-600 underline-offset-8 decoration-2' : 'hover:text-red-600'}`}>CONTACT</a>
            {!user && (
              <>
                <div className="border-t border-gray-900 pt-4">
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-3">Track Your Order</p>
                  <form onSubmit={handleGuestSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={guestOrderId}
                      onChange={(e) => setGuestOrderId(e.target.value)}
                      placeholder="Paste Order ID..."
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-gray-600 outline-none focus:border-red-600 transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-lg hover:bg-red-700 transition uppercase tracking-widest"
                    >
                      GO
                    </button>
                  </form>
                </div>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
