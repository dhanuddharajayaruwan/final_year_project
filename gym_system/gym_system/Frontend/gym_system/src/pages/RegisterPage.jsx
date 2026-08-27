import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!agreedTerms) {
      errors.agreedTerms = "You must agree to the Terms & Conditions";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const data = await register(name, email, password, role, agreedTerms);

      if (data.status === 'success') {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col justify-center items-center px-4 relative pt-24 pb-16">
        {/* Background styling for depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 to-transparent pointer-events-none"></div>

        <div className="z-10 w-full max-w-md bg-[#1a1a1a] p-8 md:p-10 rounded-lg shadow-2xl border border-gray-800">
        <div className="text-center mb-8">
          <Link to="/" className="font-extrabold text-3xl tracking-widest cursor-pointer inline-block">
            <span className="text-red-600 font-bold">C</span>YLON
            <span className="text-red-600 font-bold ml-1">F</span>ORCE
          </Link>
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mt-6">Join Us</h2>
          <p className="text-gray-400 text-sm mt-2">Start your fitness journey today.</p>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-500 text-sm px-4 py-3 rounded mb-6 flex justify-between items-center transition-all duration-300">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="hover:opacity-70 transition-opacity ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name && e.target.value.trim()) {
                  const newErrors = { ...fieldErrors };
                  delete newErrors.name;
                  setFieldErrors(newErrors);
                }
              }}
              className={`w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border transition ${
                fieldErrors.name ? 'border-red-600 focus:ring-red-600' : 'border-gray-800 focus:ring-red-600 focus:border-red-600'
              }`}
            />
            {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  const newErrors = { ...fieldErrors };
                  if (!e.target.value) {
                    newErrors.email = "Email is required";
                  } else if (validateEmail(e.target.value)) {
                    delete newErrors.email;
                  } else {
                    newErrors.email = "Please enter a valid email address";
                  }
                  setFieldErrors(newErrors);
                }
              }}
              className={`w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border transition ${
                fieldErrors.email ? 'border-red-600 focus:ring-red-600' : 'border-gray-800 focus:ring-red-600 focus:border-red-600'
              }`}
            />
            {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="role">I am a</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-red-600 border border-gray-800 focus:border-red-600 transition appearance-none cursor-pointer"
            >
              <option value="client">Client (Finding a Trainer)</option>
              <option value="trainer">Trainer (Fitness Professional)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  const newErrors = { ...fieldErrors };
                  if (fieldErrors.password) {
                    if (e.target.value.length >= 6) {
                      delete newErrors.password;
                    } else if (e.target.value.length > 0) {
                      newErrors.password = "Password must be at least 6 characters";
                    }
                  }
                  if (fieldErrors.confirmPassword) {
                    if (e.target.value === confirmPassword) {
                      delete newErrors.confirmPassword;
                    } else {
                      newErrors.confirmPassword = "Passwords do not match";
                    }
                  }
                  setFieldErrors(newErrors);
                }}
                minLength="6"
                className={`w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border transition pr-12 ${
                  fieldErrors.password ? 'border-red-600 focus:ring-red-600' : 'border-gray-800 focus:ring-red-600 focus:border-red-600'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    const newErrors = { ...fieldErrors };
                    if (e.target.value === password) {
                      delete newErrors.confirmPassword;
                    } else {
                      newErrors.confirmPassword = "Passwords do not match";
                    }
                    setFieldErrors(newErrors);
                  }
                }}
                className={`w-full bg-[#121212] text-white px-4 py-3 rounded focus:outline-none focus:ring-1 border transition pr-12 ${
                  fieldErrors.confirmPassword ? 'border-red-600 focus:ring-red-600' : 'border-gray-800 focus:ring-red-600 focus:border-red-600'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked);
                  if (e.target.checked && fieldErrors.agreedTerms) {
                    const newErrors = { ...fieldErrors };
                    delete newErrors.agreedTerms;
                    setFieldErrors(newErrors);
                  }
                }}
                className="mt-1 w-4 h-4 accent-red-600 cursor-pointer shrink-0"
              />
              <span className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition">
                I agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 underline hover:text-red-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 underline hover:text-red-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {fieldErrors.agreedTerms && (
              <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest">
                {fieldErrors.agreedTerms}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !agreedTerms}
            className="w-full bg-red-600 text-white font-bold py-3 mt-6 rounded hover:bg-red-700 transition uppercase tracking-widest text-sm shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 transition font-bold">
            Sign In
          </Link>
        </p>
      </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
