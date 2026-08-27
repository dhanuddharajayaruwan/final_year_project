import { useEffect, useMemo, useState } from 'react';

export const ITEMS_PER_PAGE = 10;

export function usePaginatedSearch(items, searchFn) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => searchFn(item, query));
  }, [items, searchQuery, searchFn]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, items.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    searchQuery,
    setSearchQuery,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
    totalItems: filteredItems.length,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}
