import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import authService from '../../../../services/auth.service';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const TrainerClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  const matchClient = useCallback((client, query) => {
    const name = client.user?.name?.toLowerCase() || '';
    const email = client.user?.email?.toLowerCase() || '';
    const activity = client.profile?.activity_level?.toLowerCase() || '';
    return name.includes(query) || email.includes(query) || activity.includes(query);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedClients,
    totalItems,
    itemsPerPage,
    filteredItems,
  } = usePaginatedSearch(clients, matchClient);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseUrl}/api/trainer-profiles/me/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.status === 'success') {
          setClients(response.data.clients || []);
        }
      } catch (err) {
        console.error("Error fetching trainer clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            My Booked <span className="text-red-600">Clients</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            {totalItems} clients training under you
          </p>
        </div>

        <DashboardSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search clients by name or email..."
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold uppercase tracking-widest">
          Loading clients database...
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No clients found. Bookings will appear here when clients select you as their coach.
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-12 text-center text-gray-500 font-bold uppercase tracking-wider">
          No clients match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-3">
            {paginatedClients.map((client) => {
              const isSelected = selectedClient?.user?._id === client.user?._id;
              return (
                <div
                  key={client.user?._id}
                  onClick={() => setSelectedClient(client)}
                  className={`bg-gray-900/40 border p-5 rounded-2xl cursor-pointer hover:border-red-600 transition-all duration-300 flex items-center justify-between ${
                    isSelected ? 'border-red-600 bg-red-600/5' : 'border-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-red-900 flex items-center justify-center font-black uppercase text-sm border border-gray-800 text-white overflow-hidden">
                      {client.user?.profile_image ? (
                        <img
                          src={authService.getImageUrl(client.user.profile_image)}
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                        />
                      ) : (
                        client.user?.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-white">{client.user?.name}</h4>
                      <p className="text-[9px] font-bold text-gray-500 tracking-wider lowercase mt-0.5">{client.user?.email}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black tracking-widest bg-gray-800 text-gray-400 px-2 py-1 rounded-md uppercase">
                    {client.profile?.activity_level}
                  </span>
                </div>
              );
            })}

            <DashboardPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>

          <div className="xl:col-span-2">
            {selectedClient ? (
              <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-900/50 flex items-center justify-center text-2xl font-black border border-red-900 text-white overflow-hidden">
                      {selectedClient.user?.profile_image ? (
                        <img
                          src={authService.getImageUrl(selectedClient.user.profile_image)}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedClient.user?.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase tracking-tight text-white">{selectedClient.user?.name}</h3>
                      <p className="text-[10px] font-black text-red-500 tracking-widest uppercase mt-0.5">
                        Client Progress File
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase ${
                      selectedClient.profile?.membership_status === 'active'
                        ? 'bg-green-600/10 text-green-500 border border-green-600/20'
                        : 'bg-red-600/10 text-red-500 border border-red-600/20'
                    }`}>
                      {selectedClient.profile?.membership_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 text-center">
                    <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Height</span>
                    <h5 className="text-lg font-black italic text-white mt-1">
                      {selectedClient.bodyInfo?.height ? `${selectedClient.bodyInfo.height} cm` : 'N/A'}
                    </h5>
                  </div>
                  <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 text-center">
                    <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Weight</span>
                    <h5 className="text-lg font-black italic text-white mt-1">
                      {selectedClient.bodyInfo?.weight ? `${selectedClient.bodyInfo.weight} kg` : 'N/A'}
                    </h5>
                  </div>
                  <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 text-center">
                    <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Gender</span>
                    <h5 className="text-lg font-black italic text-white mt-1 uppercase">
                      {selectedClient.bodyInfo?.gender || 'N/A'}
                    </h5>
                  </div>
                  <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 text-center">
                    <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">Training Goal</span>
                    <h5 className="text-xs font-black italic text-red-500 mt-2 uppercase">
                      {selectedClient.bodyInfo?.goal?.replace('_', ' ') || 'FITNESS'}
                    </h5>
                  </div>
                </div>

                <div className="space-y-4 bg-black/20 p-6 rounded-2xl border border-gray-800/80">
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-red-500 uppercase">Coaching & Medical Notes</h4>
                    <p className="text-xs font-bold text-gray-300 leading-relaxed mt-2 uppercase">
                      {selectedClient.profile?.medical_notes || 'NO MEDICAL CONDITIONS RECORDED'}
                    </p>
                  </div>

                  {selectedClient.user?.contact && (
                    <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 uppercase tracking-widest">Phone Number:</span>
                      <span className="text-white tracking-widest">{selectedClient.user.contact}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/10 border border-gray-800/40 border-dashed rounded-3xl p-16 text-center text-gray-500 font-bold uppercase tracking-wider">
                Select a client from the left pane to view details and progress reports.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerClients;
