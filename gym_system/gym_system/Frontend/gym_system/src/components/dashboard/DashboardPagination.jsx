import React from 'react';

const DashboardPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  className = '',
}) => {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 ${className}`}>
      <p className="text-[9px] font-black tracking-widest text-gray-500 uppercase">
        Showing {start}-{end} of {totalItems}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-xl border border-gray-800 text-[10px] font-black tracking-widest text-gray-400 hover:border-red-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400 uppercase"
          >
            Prev
          </button>
          <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase min-w-[70px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-xl border border-gray-800 text-[10px] font-black tracking-widest text-gray-400 hover:border-red-600 hover:text-white transition-all disabled:opacity-30 disabled:hover:border-gray-800 disabled:hover:text-gray-400 uppercase"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPagination;
