import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import scheduleService from '@/services/schedule.service';
import trainingClipService from '@/services/trainingClip.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const COMPLETION_OPTIONS = [
  { value: 'not_complete', label: 'Not Complete' },
  { value: 'half_complete', label: 'Half Complete' },
  { value: 'complete', label: 'Complete' },
];

const COMPLETION_STYLES = {
  not_complete: 'bg-gray-800 text-gray-400 border-gray-700',
  half_complete: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20',
  complete: 'bg-green-600/10 text-green-500 border-green-600/20',
};

const isActiveSchedule = (expireDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(expireDate) >= today;
};

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedules');
  const [coachClips, setCoachClips] = useState([]);
  const [clipsLoading, setClipsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const matchSchedule = useCallback((session, query) => {
    const coach = session.trainer_id?.user_id?.name?.toLowerCase() || '';
    const type = session.schedule_type?.replace('_', ' ').toLowerCase() || '';
    const workout = session.workout_plan?.toLowerCase() || '';
    const diet = session.diet_plan?.toLowerCase() || '';
    const status = session.completion_status?.replace('_', ' ').toLowerCase() || '';
    const date = new Date(session.expire_date).toLocaleDateString().toLowerCase();
    return (
      coach.includes(query) ||
      type.includes(query) ||
      workout.includes(query) ||
      diet.includes(query) ||
      status.includes(query) ||
      date.includes(query)
    );
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedSchedules,
    totalItems,
    itemsPerPage,
    filteredItems,
  } = usePaginatedSearch(schedules, matchSchedule);

  const activeCoaches = useMemo(() => {
    const map = new Map();
    schedules.forEach((session) => {
      if (!isActiveSchedule(session.expire_date)) return;
      const id = session.trainer_id?._id;
      const name = session.trainer_id?.user_id?.name;
      if (id && name) map.set(String(id), name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await scheduleService.getMySchedules();
      if (res.status === 'success') {
        setSchedules(res.schedules || []);
      }
    } catch (err) {
      console.error("Error fetching member schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (activeTab !== 'schedules' && !activeCoaches.some((c) => c.id === activeTab)) {
      setActiveTab('schedules');
    }
  }, [activeCoaches, activeTab]);

  useEffect(() => {
    if (activeTab === 'schedules') {
      setCoachClips([]);
      return;
    }

    const loadClips = async () => {
      try {
        setClipsLoading(true);
        const res = await trainingClipService.getCoachClips(activeTab);
        if (res.status === 'success') {
          setCoachClips(res.clips || []);
        }
      } catch (err) {
        console.error("Error loading coach clips:", err);
        setCoachClips([]);
      } finally {
        setClipsLoading(false);
      }
    };

    loadClips();
  }, [activeTab]);

  const handleStatusChange = async (id, completion_status) => {
    try {
      setUpdatingId(id);
      const res = await scheduleService.updateCompletion(id, completion_status);
      if (res.status === 'success') {
        setSchedules((prev) =>
          prev.map((s) => (s._id === id ? { ...s, completion_status } : s))
        );
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update progress.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: 'Cancel Session?',
      text: "Are you sure you want to cancel this training session?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel booking'
    });

    if (result.isConfirmed) {
      try {
        await scheduleService.deleteSchedule(id);
        Swal.fire('Cancelled', 'Your session has been successfully cancelled.', 'success');
        fetchSchedules();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Failed to cancel session.', 'error');
      }
    }
  };

  const activeCoachName = activeCoaches.find((c) => c.id === activeTab)?.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
          My Training <span className="text-red-600">Schedule</span>
        </h2>
        {activeTab === 'schedules' && (
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search schedules..."
          />
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${
            activeTab === 'schedules'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-red-600/40'
          }`}
        >
          My Schedules
        </button>
        {activeCoaches.map((coach) => (
          <button
            key={coach.id}
            type="button"
            onClick={() => setActiveTab(coach.id)}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${
              activeTab === coach.id
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:border-red-600/40'
            }`}
          >
            {coach.name} Videos
          </button>
        ))}
      </div>

      {activeTab === 'schedules' ? (
        loading ? (
          <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
            Loading your training log...
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
            No training sessions booked. Go to the 'Browse Trainers' tab to schedule one.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
            No schedules match your search.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              {paginatedSchedules.map((session) => (
                <div
                  key={session._id}
                  className="bg-gray-900/30 border border-gray-800 p-6 rounded-3xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 group hover:border-red-600/30 transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full xl:w-auto">
                    <div className="bg-black p-4 rounded-2xl text-center min-w-[120px] border border-gray-800 group-hover:border-red-600 transition-colors">
                      <div className="text-xs font-black italic text-red-500">
                        {session.schedule_type?.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                        {new Date(session.expire_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-black italic uppercase tracking-tight text-white">
                        Coach: {session.trainer_id?.user_id?.name || 'Assigned Trainer'}
                      </h4>

                      <div className="bg-black/20 p-4 rounded-xl border border-gray-800/80 max-w-xl">
                        <span className="text-[8px] font-black text-red-500 tracking-widest uppercase">Workout Program</span>
                        <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">
                          {session.workout_plan || 'Pending coach assignment. Check back soon!'}
                        </p>
                      </div>

                      <div className="bg-black/20 p-4 rounded-xl border border-gray-800/80 max-w-xl">
                        <span className="text-[8px] font-black text-red-500 tracking-widest uppercase">Dietary Plan</span>
                        <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">
                          {session.diet_plan || 'Pending coach assignment. Check back soon!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full xl:w-auto self-end xl:self-center min-w-[200px]">
                    <div>
                      <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                        Session Progress
                      </label>
                      <select
                        value={session.completion_status || 'not_complete'}
                        disabled={updatingId === session._id}
                        onChange={(e) => handleStatusChange(session._id, e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-red-600 transition-all disabled:opacity-50 ${
                          COMPLETION_STYLES[session.completion_status || 'not_complete']
                        }`}
                      >
                        {COMPLETION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => handleCancel(session._id)}
                      className="w-full border border-gray-700 text-gray-500 hover:border-red-600 hover:text-red-500 text-[9px] font-black tracking-widest px-6 py-3.5 rounded-xl uppercase transition-all"
                    >
                      Cancel Booking
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
          </div>
        )
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Training videos from Coach {activeCoachName} — active schedule required
          </p>

          {clipsLoading ? (
            <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
              Loading coach videos...
            </div>
          ) : coachClips.length === 0 ? (
            <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
              No training videos uploaded by this coach yet.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {coachClips.map((clip) => (
                <div
                  key={clip._id}
                  className="shrink-0 w-72 bg-gray-900/40 border border-gray-800 rounded-3xl p-4 flex flex-col gap-3 hover:border-red-600/40 transition-all"
                >
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-gray-800 bg-black">
                    <video
                      src={`${trainingClipService.BASE_URL}${clip.clip}`}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-300 uppercase leading-relaxed line-clamp-3">
                    {clip.description || 'No description'}
                  </p>
                  <span className="text-[8px] font-black text-gray-600 tracking-widest uppercase">
                    {new Date(clip.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schedules;
