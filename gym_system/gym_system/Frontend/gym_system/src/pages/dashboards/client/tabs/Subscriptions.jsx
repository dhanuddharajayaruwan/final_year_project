import React, { useCallback, useEffect, useState } from 'react';
import trainingSubscriptionService from '@/services/trainingSubscription.service';
import { Link } from 'react-router-dom';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const matchSubscription = useCallback((sub, query) => {
    const plan = sub.subscription_plan_id?.name?.toLowerCase() || '';
    const status = sub.status?.toLowerCase() || '';
    const started = new Date(sub.started_date).toLocaleDateString().toLowerCase();
    const expires = new Date(sub.expire_date).toLocaleDateString().toLowerCase();

    return (
      plan.includes(query) ||
      status.includes(query) ||
      started.includes(query) ||
      expires.includes(query)
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
  } = usePaginatedSearch(subscriptions, matchSubscription);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await trainingSubscriptionService.getMySubscriptions();
        if (res.status === 'success' || res.subscriptions) {
          setSubscriptions(res.subscriptions || []);
        }
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const activeSub = subscriptions.find(s => s.status === 'active');
  const pendingSub = subscriptions.find(s => s.status === 'pending');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-3xl font-black italic uppercase tracking-tighter">My <span className="text-red-600">Subscriptions</span></h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Subscription Card */}
        {activeSub ? (
          <div className="bg-[#0a0a0a] border border-red-600/30 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl shadow-red-900/10">
            {/* Status Badge */}
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black tracking-widest px-8 py-3 rounded-bl-3xl uppercase italic shadow-lg">
              Active
            </div>

            <div className="relative z-10">
              <div className="text-[11px] font-black tracking-[0.2em] text-gray-500 uppercase mb-4 opacity-70">Current Plan</div>
              
              <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-8 flex items-baseline gap-2">
                {activeSub.subscription_plan_id?.name || 'Standard Plan'}
                <span className="text-red-600 text-lg opacity-80">/{activeSub.duration === 30 ? 'Monthly' : activeSub.duration === 365 ? 'Yearly' : `${activeSub.duration} Days`}</span>
              </h3>

              <div className="space-y-4 mb-10">
                {(activeSub.subscription_plan_id?.description || "Unlimited Gym Access,Personal Trainer,Nutrition Plan").split(',').map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-bold text-gray-400 italic group/item">
                    <span className="text-red-600 text-lg group-hover/item:scale-125 transition-transform duration-300">✓</span> 
                    <span className="group-hover/item:text-white transition-colors duration-300 uppercase tracking-widest text-xs">{feature.trim()}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-transparent mb-8"></div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Expires On</div>
                  <div className="text-xl font-black text-white italic tracking-tight">
                    {new Date(activeSub.expire_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Background elements */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors duration-700"></div>
          </div>
        ) : pendingSub ? (
          <div className="bg-[#0a0a0a] border border-yellow-600/30 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-yellow-600 text-white text-[10px] font-black tracking-widest px-8 py-3 rounded-bl-3xl uppercase italic">
              Pending Approval
            </div>
            <div className="relative z-10">
              <div className="text-[11px] font-black tracking-[0.2em] text-gray-500 uppercase mb-4 opacity-70">Awaiting Activation</div>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white/50 mb-8">
                {pendingSub.subscription_plan_id?.name || 'Requested Plan'}
              </h3>
              <p className="text-xs font-bold text-gray-500 italic mb-10 leading-relaxed uppercase tracking-widest">
                We've received your request. Our team is currently reviewing your payment (Bank Deposit/PayHere). Your plan will be activated shortly.
              </p>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center text-yellow-600 animate-pulse">⏳</span>
                <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Processing Payment Verification</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group hover:border-red-600/50 transition-all duration-500">
            <div className="w-24 h-24 bg-gray-900/50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-30 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 shadow-xl border border-gray-800 group-hover:border-red-600/30">🏆</div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-500 group-hover:text-white transition-colors mb-2">No Active Plan</h3>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest max-w-[250px] mb-8 leading-relaxed">Unlock premium gym access, expert personal training, and tailor-made nutrition plans.</p>
            <Link to="/#pricing" className="bg-transparent border-2 border-gray-800 text-gray-500 text-[10px] font-black tracking-[0.2em] px-10 py-5 rounded-2xl uppercase hover:border-red-600 hover:text-red-600 transition-all duration-500 shadow-xl">
              View All Plans
            </Link>
          </div>
        )}

        {/* Support & History Mini Card */}
        <div className="space-y-6">
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-[2rem] p-8 hover:border-blue-600/30 transition-all duration-500">
            <h4 className="text-[11px] font-black tracking-[0.2em] text-red-600 uppercase mb-6 italic">Member Privileges</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '24/7 Access', val: 'Enabled', icon: '🏪' },
                { label: 'AI Trainer', val: 'Active', icon: '🤖' },
                { label: 'Locker', val: 'Standard', icon: '🔑' },
                { label: 'Wi-Fi', val: 'Ultra-Fast', icon: '📶' }
              ].map((item, id) => (
                <div key={id} className="bg-black/40 p-4 rounded-2xl border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <div className="text-xs font-black text-white italic uppercase tracking-tighter">{item.val}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-[2rem] p-8 relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
              <h4 className="text-[11px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2">Need Help?</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0">Contact our support or view instructions.</p>
            </div>
            <Link to="/member/chat" className="relative z-10 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:scale-110 transition-transform">
              💬
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription History Table */}
      {subscriptions.length > 0 && (
        <div className="mt-12">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">
              Payment <span className="text-red-600">History</span>
            </h3>
            <DashboardSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search subscriptions..."
            />
          </div>
          <div className="bg-gray-900/30 border border-gray-800/50 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/50">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Plan</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Started</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Expires</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((sub) => (
                    <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-black text-white uppercase tracking-widest">{sub.subscription_plan_id?.name || 'Plan'}</div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(sub.started_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(sub.expire_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          sub.status === 'active' ? 'bg-green-600/10 text-green-500' :
                          sub.status === 'pending' ? 'bg-yellow-600/10 text-yellow-500' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-[10px] font-black tracking-widest text-gray-500 uppercase">
                      No subscriptions match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 pb-5">
              <DashboardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
