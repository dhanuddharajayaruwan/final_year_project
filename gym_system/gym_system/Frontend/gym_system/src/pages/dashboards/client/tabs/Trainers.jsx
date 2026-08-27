import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import trainerProfileService from '@/services/trainerProfile.service';
import scheduleService from '@/services/schedule.service';
import chatService from '@/services/chat.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const MemberTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [scheduleType, setScheduleType] = useState('personal_training');
  const [expireDate, setExpireDate] = useState('');
  const minBookingDate = new Date().toISOString().split('T')[0];
  const dateInputRef = useRef(null);

  const matchTrainer = useCallback((trainer, query) => {
    const name = trainer.user_id?.name?.toLowerCase() || '';
    const specialization = trainer.specialization?.toLowerCase() || '';
    const bio = trainer.bio?.toLowerCase() || '';
    const certifications = (trainer.certifications || []).join(' ').toLowerCase();

    return (
      name.includes(query) ||
      specialization.includes(query) ||
      bio.includes(query) ||
      certifications.includes(query)
    );
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
  } = usePaginatedSearch(trainers, matchTrainer);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else {
      input.focus();
    }
  };

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await trainerProfileService.getAllProfiles();
      if (res.status === 'success') {
        setTrainers(res.profiles || []);
      }
    } catch (err) {
      console.error("Error fetching trainers list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openBookingModal = (trainer) => {
    setSelectedTrainer(trainer);
    setScheduleType('personal_training');
    setExpireDate('');
    setBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!expireDate) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a session target date.' });
      return;
    }

    try {
      await scheduleService.createSchedule({
        trainer_id: selectedTrainer._id,
        schedule_type: scheduleType,
        expire_date: new Date(expireDate).toISOString()
      });
      Swal.fire({ icon: 'success', title: 'Success', text: `Session booked with Coach ${selectedTrainer.user_id?.name || ''}!` });
      setBookingModalOpen(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.response?.data?.message || 'Error booking training session.'
      });
    }
  };

  const handleOpenChat = async (trainer) => {
    try {
      const res = await chatService.createRoom(trainer._id);
      if (res.status === 'success') {
        navigate('/member/chat');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to establish chat session with trainer.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          Certified <span className="text-red-600">Trainers</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search trainers..."
          />
          <div className="bg-red-600/10 border border-red-600/20 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest text-red-500 uppercase text-center sm:text-left">
            {totalItems} Expert Coaches
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
          Browsing trainers catalog...
        </div>
      ) : trainers.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No certified trainers registered in system.
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No trainers match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedItems.map((trainer) => (
            <div
              key={trainer._id}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 group hover:border-red-600 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative w-20 h-20 bg-black border-2 border-gray-800 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:border-red-600 transition-colors overflow-hidden">
                  <span className="relative z-0">🧘</span>
                  {trainer.user_id?.profile_image && (
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${trainer.user_id.profile_image}`} 
                      alt="trainer" 
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-white mb-1 group-hover:text-red-600 transition-colors">
                  {trainer.user_id?.name || 'Coach'}
                </h3>
                <p className="text-[10px] font-black tracking-widest text-red-500 uppercase mb-3">
                  {trainer.specialization || 'General Fitness'}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
                  {trainer.bio || 'Professional fitness and wellness instructor dedicated to transforming lives.'}
                </p>
                
                {trainer.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {trainer.certifications.map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-black tracking-widest bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenChat(trainer)}
                  className="flex-1 border border-gray-700 hover:border-red-600 hover:text-red-500 text-white text-[9px] font-black tracking-widest py-3 rounded-xl uppercase transition-all"
                >
                  💬 CHAT
                </button>
                <button
                  onClick={() => openBookingModal(trainer)}
                  className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white text-[9px] font-black tracking-widest py-3 rounded-xl uppercase transition-all"
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
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

      {/* Booking Form Modal */}
      {bookingModalOpen && selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setBookingModalOpen(false)}></div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 max-w-sm w-full z-10 space-y-6 relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
              Book Personal Training
            </h3>

            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
              Coach: <span className="text-red-500 font-black">{selectedTrainer.user_id?.name?.toUpperCase()}</span>
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Session Type</label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all uppercase"
                >
                  <option value="personal_training">PERSONAL TRAINING</option>
                  <option value="group_class">GROUP CLASS</option>
                  <option value="online_session">ONLINE SESSION</option>
                  <option value="assessment">ASSESSMENT</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="session-date"
                  className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5"
                >
                  Choose Date
                </label>
                <div className="relative">
                  <input
                    id="session-date"
                    ref={dateInputRef}
                    type="date"
                    value={expireDate}
                    min={minBookingDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    onClick={openDatePicker}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest py-3.5 rounded-xl uppercase transition-all shadow-xl shadow-red-600/20 mt-4"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTrainers;
