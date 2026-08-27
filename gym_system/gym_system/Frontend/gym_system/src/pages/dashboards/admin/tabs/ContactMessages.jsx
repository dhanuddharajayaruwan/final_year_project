import React, { useEffect, useState, useCallback } from "react";
import contactService from "@/services/contact.service";
import { showConfirm, showError, showSuccess } from "@/utils/sweetAlerts";
import DashboardSearchBar from "@/components/dashboard/DashboardSearchBar";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [expanded, setExpanded] = useState(null);

  const matchMessage = useCallback((message, query) => {
    const name = `${message.first_name || ''} ${message.last_name || ''}`.toLowerCase();
    const email = message.email?.toLowerCase() || '';
    const text = message.message?.toLowerCase() || '';
    return name.includes(query) || email.includes(query) || text.includes(query);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems,
    itemsPerPage,
  } = usePaginatedSearch(messages, matchMessage);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 500 };
      if (filter === "unread") params.is_read = "false";
      if (filter === "read") params.is_read = "true";
      const res = await contactService.getAllContacts(params);
      if (res.status === "success") {
        setMessages(res.contacts || []);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkRead = async (id) => {
    try {
      await contactService.markRead(id);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, is_read: true } : m))
      );
    } catch {
      showError("Failed", "Could not mark message as read.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      "Delete Message?",
      "Are you sure you want to permanently delete this message?"
    );
    if (!confirmed) return;
    try {
      await contactService.deleteContact(id);
      showSuccess("Deleted", "Message has been deleted.");
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {
      showError("Failed", "Could not delete the message.");
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">
              Contact Messages
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Messages submitted via the public contact form
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {unreadCount} unread
              </span>
            </div>
          )}
        </div>
        <DashboardSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search messages..."
          variant="admin"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4">
        {[
          { id: "all", label: "All Messages" },
          { id: "unread", label: "Unread" },
          { id: "read", label: "Read" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id);
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              filter === tab.id
                ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20"
                : "bg-white text-gray-400 border border-gray-100 hover:border-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 w-4" />
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Sender
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Message
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Date
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Status
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic"
                  >
                    Loading messages...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic"
                  >
                    {searchQuery ? 'No messages match your search.' : 'No messages found.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((msg) => (
                  <React.Fragment key={msg._id}>
                    <tr
                      className={`hover:bg-gray-50/30 transition cursor-pointer ${
                        !msg.is_read ? "bg-blue-50/30" : ""
                      }`}
                      onClick={() =>
                        setExpanded(expanded === msg._id ? null : msg._id)
                      }
                    >
                      {/* Unread dot */}
                      <td className="px-4 py-4 text-center">
                        {!msg.is_read && (
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-black text-blue-900 uppercase">
                          {msg.first_name} {msg.last_name}
                        </div>
                        <div className="text-[9px] text-gray-400 font-bold">
                          {msg.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-[10px] font-bold text-gray-600 truncate">
                          {msg.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                        <div className="text-[8px] text-gray-300">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                            msg.is_read
                              ? "text-green-600 bg-green-50"
                              : "text-blue-600 bg-blue-50"
                          }`}
                        >
                          {msg.is_read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!msg.is_read && (
                            <button
                              onClick={() => handleMarkRead(msg._id)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(msg._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row — full message */}
                    {expanded === msg._id && (
                      <tr className="bg-blue-50/20">
                        <td />
                        <td colSpan="5" className="px-6 pb-5 pt-1">
                          <div className="bg-white border border-blue-100 rounded-2xl p-5">
                            <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">
                              Full Message
                            </div>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {msg.message}
                            </p>
                            <a
                              href={`mailto:${msg.email}`}
                              className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                              ✉ Reply to {msg.email}
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DashboardPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        className="[&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-blue-600"
      />
    </div>
  );
};

export default ContactMessages;
