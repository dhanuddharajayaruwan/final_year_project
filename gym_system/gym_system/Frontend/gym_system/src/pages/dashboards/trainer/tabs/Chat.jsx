import React, { useCallback, useEffect, useState, useRef } from 'react';
import chatService from '@/services/chat.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const TrainerChat = () => {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const matchRoom = useCallback((room, query) => {
    const clientName = room.user_id?.name?.toLowerCase() || '';
    const clientEmail = room.user_id?.email?.toLowerCase() || '';
    return clientName.includes(query) || clientEmail.includes(query);
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
      console.error("Error loading chat rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
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
        console.error("Error loading chat messages:", err);
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
      setMsg("");
      const res = await chatService.sendMessage(activeRoom._id, text);
      if (res.status === 'success') {
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col xl:flex-row gap-6">
      <div className="w-full xl:w-80 bg-black/40 border border-gray-800 rounded-3xl p-5 flex flex-col gap-4 overflow-hidden">
        <div className="space-y-3">
          <h3 className="text-xs font-black tracking-widest text-red-500 uppercase italic">Active Threads</h3>
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clients..."
            className="md:w-full"
          />
        </div>

        {loading ? (
          <p className="text-[10px] font-black text-gray-500 uppercase text-center py-6">Loading inbox...</p>
        ) : rooms.length === 0 ? (
          <p className="text-[10px] font-black text-gray-500 uppercase text-center py-6">No active messages</p>
        ) : paginatedRooms.length === 0 ? (
          <p className="text-[10px] font-black text-gray-500 uppercase text-center py-6">No clients match your search.</p>
        ) : (
          <>
            <div className="space-y-2 overflow-y-auto flex-grow">
              {paginatedRooms.map((room) => {
                const isSelected = activeRoom?._id === room._id;
                const clientName = room.user_id?.name || 'Client';
                const clientEmail = room.user_id?.email || '';
                return (
                  <div
                    key={room._id}
                    onClick={() => setActiveRoom(room)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected ? 'bg-red-600/10 border-red-600' : 'bg-[#151515] border-gray-800 hover:border-red-600/40'
                    }`}
                  >
                    <h4 className="text-xs font-black uppercase text-white">{clientName}</h4>
                    <p className="text-[8px] font-bold text-gray-500 mt-1 uppercase tracking-widest leading-none">{clientEmail}</p>
                  </div>
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

      <div className="flex-grow flex flex-col bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 relative shadow-inner">
        {activeRoom ? (
          <>
            <div className="sticky top-0 py-3 bg-[#1a1a1a] border-b border-gray-800/80 z-10 flex justify-between items-center mb-4">
              <div>
                <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">COACHING CHAT SESSION</span>
                <h4 className="text-sm font-black uppercase text-white mt-0.5">{activeRoom.user_id?.name}</h4>
              </div>
              <span className="bg-red-600/10 text-red-500 border border-red-600/20 px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase">
                COACH ONLINE
              </span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-xs font-bold uppercase tracking-widest">
                  Start of conversation. Type your message below.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === activeRoom.trainer_id || m.sender_id?._id === activeRoom.trainer_id?.user_id?._id || m.sender_id?._id === activeRoom.trainer_id?.user_id || m.sender_id === activeRoom.trainer_id?.user_id?._id;
                  const isCoachSender = m.sender_id?.role === 'trainer' || m.sender_id?.role === 'admin' || isMe;

                  return (
                    <div key={m._id} className={`flex flex-col ${isCoachSender ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-lg ${
                        isCoachSender
                          ? 'bg-red-600 text-white rounded-tr-none'
                          : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                      }`}>
                        {m.message}
                      </div>
                      <span className="text-[8px] font-black text-gray-600 tracking-widest mt-1 px-1 uppercase">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-4 border-t border-gray-800/80 pt-4">
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="TYPE COACHING MESSAGE HERE..."
                className="flex-grow bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-xs font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder-gray-600 uppercase"
              />
              <button type="submit" className="bg-red-600 text-white p-4 rounded-2xl hover:bg-white hover:text-red-600 transition-all shadow-xl shadow-red-600/10">
                <svg className="w-6 h-6 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center text-center p-12 text-gray-500 font-bold uppercase tracking-wider">
            Select a client thread from the left sidebar to open the chat window.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerChat;
