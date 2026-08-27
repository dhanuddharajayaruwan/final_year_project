import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import scheduleService from '@/services/schedule.service';
import trainingClipService from '@/services/trainingClip.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const TrainerOverview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ clients: 0, clips: 0, schedules: 0 });
  const [loading, setLoading] = useState(true);
  const [allSchedules, setAllSchedules] = useState([]);

  const matchSession = useCallback((session, query) => {
    const type = session.schedule_type?.replace('_', ' ').toLowerCase() || '';
    const clientName = session.client_id?.name?.toLowerCase() || '';
    const date = new Date(session.expire_date).toLocaleDateString().toLowerCase();
    return type.includes(query) || clientName.includes(query) || date.includes(query);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedSessions,
    totalItems: sessionTotalItems,
    itemsPerPage,
    filteredItems: filteredSessions,
  } = usePaginatedSearch(allSchedules, matchSession);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [clipsRes, schedulesRes] = await Promise.all([
          trainingClipService.getMyClips().catch(() => ({ clips: [] })),
          scheduleService.getMySchedules().catch(() => ({ schedules: [] })),
        ]);

        let myClients = [];
        try {
          const clRes = await import('axios').then((ax) =>
            ax.default.get(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/trainer-profiles/me/clients`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            )
          );
          myClients = clRes.data?.clients || [];
        } catch {
          myClients = [];
        }

        const schedules = schedulesRes.schedules || [];
        setAllSchedules(schedules);
        setStats({
          clients: myClients.length,
          clips: clipsRes.clips?.length || clipsRes.total || 0,
          schedules: schedules.length,
        });
      } catch (err) {
        console.error("Error loading trainer overview stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-950 via-black to-red-950 border border-red-950 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">WELCOME BACK, COACH <span className="text-red-500">{user?.name}</span>!</h1>
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Inspire, coach, and guide your clients to unleash their full power today.</p>
        </div>
        <Link to="/trainer/schedules" className="bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest px-6 py-3.5 rounded-xl uppercase transition-all shadow-lg shadow-red-600/20 z-10">
          View Daily Schedules
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-all">
          <div className="absolute top-4 right-4 text-4xl opacity-10">🏋️</div>
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-1">Booked Clients</p>
          <h3 className="text-3xl font-black italic text-white tracking-tight">{loading ? '...' : stats.clients}</h3>
          <p className="text-[8px] font-bold text-red-500 tracking-wider uppercase mt-3">Active members training under you</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-all">
          <div className="absolute top-4 right-4 text-4xl opacity-10">📹</div>
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-1">Clips Uploaded</p>
          <h3 className="text-3xl font-black italic text-white tracking-tight">{loading ? '...' : stats.clips}</h3>
          <p className="text-[8px] font-bold text-red-500 tracking-wider uppercase mt-3">Video workouts published</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-red-600/30 transition-all">
          <div className="absolute top-4 right-4 text-4xl opacity-10">🗓️</div>
          <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-1">Total Scheduled Sessions</p>
          <h3 className="text-3xl font-black italic text-white tracking-tight">{loading ? '...' : stats.schedules}</h3>
          <p className="text-[8px] font-bold text-red-500 tracking-wider uppercase mt-3">Workout calendars managed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-800 pb-4">
            <h3 className="text-sm font-black italic uppercase tracking-wider text-white">Upcoming Client Sessions</h3>
            <Link to="/trainer/schedules" className="text-[8px] font-black tracking-widest text-red-500 hover:text-white uppercase">See All &rarr;</Link>
          </div>

          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search sessions..."
            className="md:w-full"
          />

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center py-6">Loading schedules...</p>
            ) : allSchedules.length === 0 ? (
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center py-6">No scheduled sessions upcoming.</p>
            ) : filteredSessions.length === 0 ? (
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center py-6">No sessions match your search.</p>
            ) : (
              <>
                {paginatedSessions.map((session) => (
                  <div key={session._id} className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">{session.schedule_type?.replace('_', ' ')}</h4>
                      <p className="text-[9px] font-bold text-gray-500 tracking-widest uppercase mt-1">Client: <span className="text-white">{session.client_id?.name || 'Unknown'}</span></p>
                    </div>
                    <span className="text-[9px] font-black tracking-widest bg-red-600/10 text-red-500 px-3 py-1.5 rounded-lg uppercase">
                      {new Date(session.expire_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}

                <DashboardPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={sessionTotalItems}
                  itemsPerPage={itemsPerPage}
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-6 space-y-4">
          <div className="border-b border-gray-800 pb-4">
            <h3 className="text-sm font-black italic uppercase tracking-wider text-white">Coaching Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="text-xl">🔥</span>
              <div>
                <h4 className="text-xs font-black uppercase text-red-500">Progressive Overload</h4>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed mt-1">Remind clients to log their physical metrics in their Body Info settings periodically. This helps you track fat loss or muscle gains accurately.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-xl">📹</span>
              <div>
                <h4 className="text-xs font-black uppercase text-red-500">Video Tutorials</h4>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed mt-1">Keep uploading bite-sized training clips (.mp4) under 1-2 minutes. They serve as excellent execution guides for workout plans.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerOverview;
