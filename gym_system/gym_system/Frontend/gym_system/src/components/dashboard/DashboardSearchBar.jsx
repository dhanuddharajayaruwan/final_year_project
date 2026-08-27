import React from 'react';

const adminInputClasses =
  'bg-white border-blue-100 text-blue-900 placeholder-blue-300 focus:border-blue-400';

const DashboardSearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  variant = 'dark',
}) => (
  <div className={`relative w-full md:w-72 ${className}`}>
    <svg
      className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
        variant === 'admin' ? 'text-blue-300' : 'text-gray-500'
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border rounded-xl pl-11 pr-10 py-3 text-[10px] font-black tracking-widest focus:outline-none transition-all uppercase ${
        variant === 'admin'
          ? adminInputClasses
          : 'bg-gray-900/50 border-gray-800 text-white placeholder-gray-600 focus:border-red-600'
      }`}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
          variant === 'admin' ? 'text-blue-300 hover:text-blue-600' : 'text-gray-500 hover:text-white'
        }`}
        aria-label="Clear search"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

export default DashboardSearchBar;
