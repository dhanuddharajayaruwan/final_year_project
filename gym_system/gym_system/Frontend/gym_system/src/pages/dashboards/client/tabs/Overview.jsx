import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import orderService from "@/services/order.service";
import trainingSubscriptionService from "@/services/trainingSubscription.service";
import scheduleService from "@/services/schedule.service";
import subscriptionPlanService from "@/services/subscriptionPlan.service";
import { Link, useNavigate } from "react-router-dom";

const ClientOverview = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [stats, setStats] = useState({
    recentOrders: [],
    totalOrders: 0,
    activeSubscriptions: 0,
    totalSchedules: 0,
    totalSpent: 0,
    currentPlan: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, subsRes, schedulesRes] = await Promise.all([
          orderService.getMyOrders({ limit: 3 }),
          trainingSubscriptionService.getMySubscriptions(),
          scheduleService.getMySchedules({ limit: 1 }),
        ]);

        const orders = ordersRes.orders || [];
        const subs = subsRes.subscriptions || [];
        const activeSub = subs.find((s) => s.status === "active");

        const totalSpent = orders.reduce((acc, order) => {
          if (order.payment_status === "success")
            return acc + order.total_amount;
          return acc;
        }, 0);

        setStats({
          recentOrders: orders,
          totalOrders: ordersRes.total || 0,
          activeSubscriptions: subs.filter((s) => s.status === "active").length,
          totalSchedules: schedulesRes.total || 0,
          totalSpent,
          currentPlan: activeSub,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const openPricing = async () => {
    setShowPricing(true);
    if (plans.length > 0) return;
    setPlansLoading(true);
    try {
      const res = await subscriptionPlanService.getAllPlans();
      setPlans(res.plans || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPlansLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-red-600/10 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 text-white">
              Hello,{" "}
              <span className="text-red-600">{user.name.split(" ")[0]}</span>!
            </h1>
            <p className="text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase opacity-80">
              Your fitness journey is{" "}
              <span className="text-red-600 italic">24% complete</span> this
              month. Keep it up!
            </p>
          </div>
          <button
            onClick={openPricing}
            className="bg-white text-black text-[10px] font-black tracking-widest px-8 py-4 rounded-2xl uppercase hover:bg-red-600 hover:text-white transition-all shadow-xl"
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Subscription Spotlight (The Photo-like UI) */}
      {stats.currentPlan && (
        <div className="bg-[#0a0a0a] border border-red-600/30 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-red-900/10 animate-slideUp">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black tracking-widest px-6 py-2.5 rounded-bl-2xl uppercase italic shadow-lg">
            Active
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase mb-2 opacity-70">
                Current Active Plan
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
                {stats.currentPlan.subscription_plan_id?.name}{" "}
                <span className="text-red-600 text-sm">
                  / {stats.currentPlan.duration === 30 ? "Monthly" : "Premium"}
                </span>
              </h3>
              {stats.currentPlan.subscription_plan_id?.description && (
                <div className="flex flex-wrap gap-3 mt-1">
                  {stats.currentPlan.subscription_plan_id.description
                    .split(",")
                    .filter(Boolean)
                    .map((f, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black tracking-widest text-gray-400 uppercase bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800"
                      >
                        <span className="text-red-600 mr-1">✓</span> {f.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>
            <div className="w-px h-16 bg-gray-800 hidden md:block"></div>
            <div className="flex gap-12 items-center">
              <div>
                <div className="text-[9px] font-black tracking-[0.2em] text-gray-500 uppercase mb-1">
                  Expires On
                </div>
                <div className="text-sm font-black text-white italic">
                  {new Date(stats.currentPlan.expire_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "ACTIVE PLANS",
            value: stats.activeSubscriptions,
            color: "text-blue-500",
            icon: "⚡",
          },
          {
            label: "SESSIONS",
            value: stats.totalSchedules,
            color: "text-green-500",
            icon: "📅",
          },
          {
            label: "TOTAL ORDERS",
            value: stats.totalOrders,
            color: "text-purple-500",
            icon: "📦",
          },
          {
            label: "SPENT",
            value: `Rs ${stats.totalSpent.toLocaleString()}`,
            color: "text-red-600",
            icon: "💰",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-900/40 border border-gray-800/60 p-6 rounded-3xl hover:border-red-600/50 transition-all group scale-100 hover:scale-105 duration-500"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">
                {item.icon}
              </span>
              <div className="w-6 h-6 rounded-full bg-red-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-1 h-1 bg-red-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="text-[9px] font-black tracking-[0.2em] text-gray-500 uppercase mb-1">
              {item.label}
            </div>
            <div
              className={`text-xl font-black italic uppercase tracking-tighter ${item.color}`}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Mini Table */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-[2rem] p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase italic">
              Recent Shop Orders
            </h3>
            <Link
              to="/member/orders"
              className="text-[9px] font-black tracking-widest text-gray-500 hover:text-white uppercase transition pb-1 border-b border-gray-800"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-black/40 rounded-2xl hover:bg-black transition-colors border border-transparent hover:border-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-sm border border-gray-800">
                      📦
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest text-white uppercase mb-0.5">
                        ORD#{order._id.slice(-4)}
                      </div>
                      <div className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black italic text-white">
                      Rs {order.total_amount.toLocaleString()}
                    </div>
                    <div
                      className={`text-[7px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-md ${
                        order.payment_status === "success"
                          ? "bg-green-600/10 text-green-500"
                          : "bg-yellow-600/10 text-yellow-500"
                      }`}
                    >
                      {order.payment_status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[9px] font-black text-gray-600 text-center py-10 uppercase tracking-[0.3em]">
                No activity yet
              </p>
            )}
          </div>
        </div>

        {/* AI & Support Promo */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-gray-800 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 opacity-10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🤖</span>
              <h3 className="text-[10px] font-black tracking-[0.3em] text-red-600 uppercase italic">
                Support Station
              </h3>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6 uppercase tracking-widest">
              Experiencing issues or need a custom training plan? Our elite
              support team and AI Bot are 24/7 online for you.
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openChatbot"))}
            className="block text-center bg-white text-black text-[10px] font-black tracking-[0.2em] py-5 rounded-2xl uppercase hover:bg-red-600 hover:text-white transition-all shadow-2xl hover:shadow-red-600/40"
          >
            🤖 Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setShowPricing(false)}
        >
          <div
            className="bg-[#111] border border-gray-800 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#111] border-b border-gray-800 px-10 py-6 flex items-center justify-between rounded-t-[2.5rem] z-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                  Choose Your <span className="text-red-600">Plan</span>
                </h2>
                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">
                  Unlock premium features and transform your fitness
                </p>
              </div>
              <button
                onClick={() => setShowPricing(false)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white flex items-center justify-center transition text-lg font-black"
              >
                ×
              </button>
            </div>

            {/* Plans Grid */}
            <div className="px-10 py-8">
              {plansLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                </div>
              ) : plans.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-16 uppercase tracking-widest font-black">
                  No plans available at the moment.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans.map((plan) => {
                    const isCurrentPlan =
                      stats.currentPlan?.subscription_plan_id?._id ===
                        plan._id ||
                      stats.currentPlan?.subscription_plan_id === plan._id;
                    return (
                      <div
                        key={plan._id}
                        className={`relative rounded-3xl p-8 flex flex-col gap-5 border transition-all duration-300 ${
                          isCurrentPlan
                            ? "bg-red-600/10 border-red-600/60"
                            : "bg-[#1a1a1a] border-gray-800 hover:border-red-600/40"
                        }`}
                      >
                        {isCurrentPlan && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black tracking-widest px-5 py-2 rounded-bl-2xl rounded-tr-3xl uppercase">
                            Current
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-[9px] font-black tracking-[0.2em] text-gray-500 uppercase">
                              {plan.duration} Days
                            </div>
                            <span
                              className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                                plan.type === "blended"
                                  ? "bg-purple-600/15 text-purple-400 border border-purple-600/30"
                                  : "bg-blue-600/15 text-blue-400 border border-blue-600/30"
                              }`}
                            >
                              {plan.type === "blended"
                                ? "⚡ Blended"
                                : "🌐 Online"}
                            </span>
                          </div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                            {plan.name}
                          </h3>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-red-600 italic">
                            Rs {Number(plan.price).toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">
                            /{" "}
                            {plan.duration === 30
                              ? "mo"
                              : plan.duration === 365
                              ? "yr"
                              : `${plan.duration}d`}
                          </span>
                        </div>

                        <div className="h-px bg-gray-800"></div>

                        <ul className="space-y-2 flex-1">
                          {(plan.description || "")
                            .split(",")
                            .filter(Boolean)
                            .map((feature, j) => (
                              <li
                                key={j}
                                className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                              >
                                <span className="text-red-600">✓</span>
                                {feature.trim()}
                              </li>
                            ))}
                        </ul>

                        <button
                          onClick={() => {
                            setShowPricing(false);
                            navigate("/member/subscriptions");
                          }}
                          disabled={isCurrentPlan}
                          className={`w-full text-[10px] font-black tracking-[0.2em] uppercase py-4 rounded-2xl transition-all ${
                            isCurrentPlan
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-white text-black hover:bg-red-600 hover:text-white shadow-lg hover:shadow-red-600/30"
                          }`}
                        >
                          {isCurrentPlan ? "Active Plan" : "Subscribe Now"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-center text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-8">
                Payment is manually verified by our team after bank transfer.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOverview;
