import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import scheduleService from '@/services/schedule.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const COMPLETION_LABELS = {
  not_complete: 'Not Complete',
  half_complete: 'Half Complete',
  complete: 'Complete',
};

const COMPLETION_STYLES = {
  not_complete: 'bg-gray-800 text-gray-400 border-gray-700',
  half_complete: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20',
  complete: 'bg-green-600/10 text-green-500 border-green-600/20',
};

const TrainerSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [scheduleType, setScheduleType] = useState('personal_training');
  const [expireDate, setExpireDate] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [dietPlan, setDietPlan] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const dateInputRef = useRef(null);
  const minTargetDate = new Date().toISOString().split('T')[0];

  const matchSchedule = useCallback((sch, query) => {
    const clientName = sch.client_id?.name?.toLowerCase() || '';
    const type = sch.schedule_type?.replace('_', ' ').toLowerCase() || '';
    const workout = sch.workout_plan?.toLowerCase() || '';
    const diet = sch.diet_plan?.toLowerCase() || '';
    const date = new Date(sch.expire_date).toLocaleDateString().toLowerCase();
    const status = sch.completion_status?.replace('_', ' ').toLowerCase() || '';
    return (
      clientName.includes(query) ||
      type.includes(query) ||
      workout.includes(query) ||
      diet.includes(query) ||
      date.includes(query) ||
      status.includes(query)
    );
  }, []);

  const clientOptions = useMemo(() => {
    const map = new Map();
    schedules.forEach((sch) => {
      const id = sch.client_id?._id || sch.client_id;
      const name = sch.client_id?.name;
      if (id && name) map.set(String(id), name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [schedules]);

  const schedulesForView = useMemo(() => {
    if (!clientFilter) return schedules;
    return schedules.filter(
      (sch) => String(sch.client_id?._id || sch.client_id) === clientFilter
    );
  }, [schedules, clientFilter]);

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
  } = usePaginatedSearch(schedulesForView, matchSchedule);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      const [schRes, clientsRes] = await Promise.all([
        scheduleService.getMySchedules(),
        axios.get(`${baseUrl}/api/trainer-profiles/me/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (schRes.status === 'success') {
        setSchedules(schRes.schedules || []);
      }
      if (clientsRes.data?.status === 'success') {
        setClients(clientsRes.data.clients || []);
      }
    } catch (err) {
      console.error("Error loading trainer schedules data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditMode(false);
    setCurrentId(null);
    setClientId(clients[0]?.user?._id || '');
    setScheduleType('personal_training');
    setExpireDate('');
    setWorkoutPlan('');
    setDietPlan('');
    setModalOpen(true);
  };

  const openEditModal = (sch) => {
    setEditMode(true);
    setCurrentId(sch._id);
    setClientId(sch.client_id?._id || '');
    setScheduleType(sch.schedule_type);
    
    // Format date for input
    const d = new Date(sch.expire_date);
    const dateString = d.toISOString().split('T')[0];
    setExpireDate(dateString);
    
    setWorkoutPlan(sch.workout_plan || '');
    setDietPlan(sch.diet_plan || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a client.' });
      return;
    }
    if (!expireDate) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please choose an expire date.' });
      return;
    }

    try {
      if (editMode) {
        // Update schedule
        await scheduleService.updateSchedule(currentId, {
          schedule_type: scheduleType,
          expire_date: new Date(expireDate).toISOString(),
          workout_plan: workoutPlan,
          diet_plan: dietPlan,
        });
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Client workout schedule updated!' });
      } else {
        // Create schedule
        await scheduleService.createSchedule({
          client_id: clientId,
          schedule_type: scheduleType,
          expire_date: new Date(expireDate).toISOString(),
          workout_plan: workoutPlan,
          diet_plan: dietPlan,
        });
        Swal.fire({ icon: 'success', title: 'Scheduled', text: 'Workout scheduled successfully!' });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.response?.data?.message || 'Error processing request.'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await scheduleService.deleteSchedule(id);
        Swal.fire('Deleted!', 'Schedule has been deleted.', 'success');
        loadData();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete schedule.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Daily Workout <span className="text-red-600">Schedules</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {clientFilter
              ? `${totalItems} sessions for ${clientOptions.find((c) => c.id === clientFilter)?.name || 'client'}`
              : `${totalItems} scheduled sessions`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-[10px] font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all uppercase w-full sm:w-auto"
          >
            <option value="">ALL CLIENTS</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>{client.name.toUpperCase()}</option>
            ))}
          </select>
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search schedules..."
          />
          <button
            onClick={openAddModal}
            className="bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest px-5 py-3 rounded-xl uppercase transition-all shadow-lg shadow-red-600/20 whitespace-nowrap"
          >
            Schedule Workout +
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
          Loading schedules...
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No workout plans scheduled yet. Click 'Schedule Workout +' to construct a fitness schedule.
        </div>
      ) : schedulesForView.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No schedules found for this client.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No schedules match your search.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
          {paginatedSchedules.map((sch) => (
            <div
              key={sch._id}
              className="bg-gray-900/30 border border-gray-800 p-6 rounded-3xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 group hover:border-red-600/30 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center w-full xl:w-auto">
                <div className="bg-black p-4 rounded-2xl text-center min-w-[120px] border border-gray-800 group-hover:border-red-600 transition-colors">
                  <div className="text-xs font-black italic text-red-500">
                    {sch.schedule_type?.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {new Date(sch.expire_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-black italic uppercase tracking-tight text-white">
                      Client: {sch.client_id?.name || 'Unknown User'}
                    </h4>
                    <span className={`text-[8px] font-black tracking-widest px-2 py-1 rounded-full border uppercase ${
                      COMPLETION_STYLES[sch.completion_status || 'not_complete']
                    }`}>
                      {COMPLETION_LABELS[sch.completion_status || 'not_complete']}
                    </span>
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                    Workout: <span className="text-white normal-case font-medium">{sch.workout_plan || 'Not Scheduled'}</span>
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
                    Diet: <span className="text-white normal-case font-medium">{sch.diet_plan || 'Not Scheduled'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full xl:w-auto">
                <button
                  onClick={() => handleDelete(sch._id)}
                  className="flex-1 xl:flex-none border border-gray-700 text-gray-500 hover:border-red-600 hover:text-red-500 text-[9px] font-black tracking-widest px-5 py-3 rounded-xl uppercase transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => openEditModal(sch)}
                  className="flex-1 xl:flex-none bg-white text-black hover:bg-red-600 hover:text-white text-[9px] font-black tracking-widest px-5 py-3 rounded-xl uppercase transition-all"
                >
                  Edit / Program Plan
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
      )}

      {/* Program Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}></div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 max-w-lg w-full z-10 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
              {editMode ? 'Program Workout & Diet Plan' : 'Schedule Workout Session'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editMode && (
                <div>
                  <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Select Client</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all uppercase"
                  >
                    <option value="">CHOOSE CLIENT...</option>
                    {clients.map(c => (
                      <option key={c.user?._id} value={c.user?._id}>{c.user?.name?.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Schedule Type</label>
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
                    htmlFor="target-date"
                    className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5"
                  >
                    Target Date
                  </label>
                  <div className="relative">
                    <input
                      id="target-date"
                      ref={dateInputRef}
                      type="date"
                      value={expireDate}
                      min={editMode ? undefined : minTargetDate}
                      onChange={(e) => setExpireDate(e.target.value)}
                      onClick={openDatePicker}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black tracking-widest text-white focus:outline-none focus:border-red-600 transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Workout Plan Description</label>
                <textarea
                  value={workoutPlan}
                  onChange={(e) => setWorkoutPlan(e.target.value)}
                  placeholder="E.G. 3X10 INCLINE BENCH, 4X8 BARBELL ROWS, 3X15 LATERAL RAISES..."
                  rows="3"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-red-600 transition-all placeholder-gray-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Diet Plan Description</label>
                <textarea
                  value={dietPlan}
                  onChange={(e) => setDietPlan(e.target.value)}
                  placeholder="E.G. PRE-WORKOUT: 1 BANANA. POST-WORKOUT: 200G GRILLED CHICKEN, 150G SWEET POTATO..."
                  rows="3"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-red-600 transition-all placeholder-gray-600 uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white text-[10px] font-black tracking-widest py-3.5 rounded-xl uppercase transition-all shadow-xl shadow-red-600/20 mt-4"
              >
                {editMode ? 'Save Training Plan' : 'Confirm Scheduling'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSchedules;
