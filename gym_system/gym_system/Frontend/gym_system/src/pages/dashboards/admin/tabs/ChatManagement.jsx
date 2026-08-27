import React, { useCallback, useEffect, useRef, useState } from 'react';
import chatService from '@/services/chat.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const ChatManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const matchRoom = useCallback((room, query) => {
    const memberName = room.user_id?.name?.toLowerCase() || '';
    const memberEmail = room.user_id?.email?.toLowerCase() || '';
    const trainerName = room.trainer_id?.user_id?.name?.toLowerCase() || '';
    const specialization = room.trainer_id?.specialization?.toLowerCase() || '';

    return (
      memberName.includes(query) ||
      memberEmail.includes(query) ||
      trainerName.includes(query) ||
      specialization.includes(query)
    );
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedRooms,
    totalItems,
    itemsPerPage,
    filteredItems,
  } = usePaginatedSearch(rooms, matchRoom);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await chatService.getRooms();
      if (res.status === 'success') {
        const nextRooms = res.rooms || [];
        setRooms(nextRooms);
        if (nextRooms.length > 0) {
          setActiveRoom((current) => {
            if (!current) return nextRooms[0];
            return nextRooms.find((room) => room._id === current._id) || nextRooms[0];
          });
        } else {
          setActiveRoom(null);
        }
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const refreshRooms = setInterval(fetchRooms, 15000);
    return () => clearInterval(refreshRooms);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;

    const fetchMessages = async () => {
      try {
        const res = await chatService.getMessages(activeRoom._id);
        if (res.status === 'success') {
          setMessages(res.messages || []);
        }
      } catch (err) {
        console.error('Error loading chat messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeRoom) return;
    const stillVisible = filteredItems.some((room) => room._id === activeRoom._id);
    if (!stillVisible && filteredItems.length > 0) {
      setActiveRoom(filteredItems[0]);
    }
  }, [filteredItems, activeRoom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim() || !activeRoom) return;

    try {
      const text = msg;
      setMsg('');
      const res = await chatService.sendMessage(activeRoom._id, text);
      if (res.status === 'success') {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getSenderLabel = (message, room) => {
    const senderId = message.sender_id?._id || message.sender_id;
    if (senderId?.toString() === room.user_id?._id?.toString()) {
      return room.user_id?.name || 'Member';
    }
    if (senderId?.toString() === room.trainer_id?.user_id?._id?.toString()) {
      return room.trainer_id?.user_id?.name || 'Trainer';
    }
    if (message.sender_id?.role === 'admin') {
      return 'Admin';
    }
    return message.sender_id?.name || 'User';
  };

  const isAdminMessage = (message) => message.sender_id?.role === 'admin';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">
            Live Chat Management
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
            Monitor member and trainer conversations in real time
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search chats..."
            variant="admin"
            className="md:w-72"
          />
          <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest text-blue-600 uppercase text-center sm:text-left">
            {totalItems} Active Threads
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-260px)] min-h-[520px] flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-96 bg-white border border-gray-100 rounded-3xl p-5 flex flex-col gap-4 shadow-sm overflow-hidden">
          <h4 className="text-[10px] font-black tracking-widest text-blue-600 uppercase">
            Member / Trainer Chats
          </h4>

          {loading ? (
            <p className="text-[10px] font-black text-gray-400 uppercase text-center py-8">
              Loading live chats...
            </p>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                No live chats yet
              </p>
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wider mt-2 leading-relaxed">
                Chats appear when members message trainers from the member dashboard.
              </p>
            </div>
          ) : paginatedRooms.length === 0 ? (
            <p className="text-[10px] font-black text-gray-400 uppercase text-center py-8">
              No chats match your search.
            </p>
          ) : (
            <>
              <div className="space-y-2 overflow-y-auto flex-grow">
                {paginatedRooms.map((room) => {
                  const isSelected = activeRoom?._id === room._id;
                  const memberName = room.user_id?.name || 'Member';
                  const trainerName = room.trainer_id?.user_id?.name || 'Trainer';

                  return (
                    <button
                      key={room._id}
                      type="button"
                      onClick={() => setActiveRoom(room)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-gray-50 border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase text-blue-900 truncate">
                            {memberName}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                            with Coach {trainerName}
                          </p>
                        </div>
                        <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1" />
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-2 truncate">
                        {room.trainer_id?.specialization || 'Personal Training'}
                      </p>
                    </button>
                  );
                })}
              </div>

              <DashboardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>

        <div className="flex-grow flex flex-col bg-white border border-gray-100 rounded-3xl p-6 shadow-sm relative">
          {activeRoom ? (
            <>
              <div className="pb-4 border-b border-gray-100 mb-4 flex justify-between items-center gap-4">
                <div>
                  <span className="text-[8px] font-black text-gray-400 tracking-widest uppercase">
                    Live Conversation
                  </span>
                  <h4 className="text-sm font-black uppercase text-blue-900 mt-1">
                    {activeRoom.user_id?.name}
                    <span className="text-gray-400 font-bold mx-2">↔</span>
                    {activeRoom.trainer_id?.user_id?.name}
                  </h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {activeRoom.user_id?.email}
                  </p>
                </div>
                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                  Live
                </span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    No messages in this thread yet.
                  </div>
                ) : (
                  messages.map((message) => {
                    const adminMsg = isAdminMessage(message);
                    const memberId = activeRoom.user_id?._id?.toString();
                    const senderId = (message.sender_id?._id || message.sender_id)?.toString();
                    const isMember = senderId === memberId;

                    return (
                      <div
                        key={message._id}
                        className={`flex flex-col ${adminMsg || !isMember ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">
                          {getSenderLabel(message, activeRoom)}
                        </span>
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                            adminMsg
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : isMember
                                ? 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200'
                                : 'bg-red-50 text-red-700 rounded-tr-none border border-red-100'
                          }`}
                        >
                          {message.message}
                        </div>
                        <span className="text-[8px] font-black text-gray-400 tracking-widest mt-1 px-1 uppercase">
                          {new Date(message.time).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-3 border-t border-gray-100 pt-4">
                <input
                  type="text"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Send admin support message..."
                  className="flex-grow bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-400 transition-all placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-12 text-gray-400 font-bold uppercase tracking-wider">
              <div className="text-4xl mb-4 opacity-40">💬</div>
              Select a chat thread to view the live conversation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;
