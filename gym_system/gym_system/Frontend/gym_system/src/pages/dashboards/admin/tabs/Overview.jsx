import React, { useCallback, useEffect, useState } from "react";
import clientProfileService from "@/services/clientProfile.service";
import trainerProfileService from "@/services/trainerProfile.service";
import orderService from "@/services/order.service";
import DashboardSearchBar from "@/components/dashboard/DashboardSearchBar";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const Overview = () => {
  const [stats, setStats] = useState([
    { label: "Total Users", value: "...", icon: "👤", color: "bg-blue-500" },
    { label: "Trainers", value: "...", icon: "🏃", color: "bg-green-500" },
    { label: "Gym Members", value: "...", icon: "💪", color: "bg-purple-500" },
    { label: "Total Orders", value: "...", icon: "💳", color: "bg-yellow-500" },
    {
      label: "Total Revenue",
      value: "...",
      icon: "💰",
      color: "bg-emerald-500",
    },
  ]);

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [membershipData, setMembershipData] = useState([]);

  const matchUser = useCallback((user, query) => {
    const name = user.name?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const role = user.role?.toLowerCase() || '';
    const status = user.status?.toLowerCase() || '';
    return name.includes(query) || email.includes(query) || role.includes(query) || status.includes(query);
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
  } = usePaginatedSearch(recentUsers, matchUser);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, trainersRes, ordersRes] = await Promise.all([
        clientProfileService.getAllProfiles(),
        trainerProfileService.getAllProfiles(),
        orderService.getAllOrders({ limit: 10000 }),
      ]);

      const clients = clientsRes.profiles || [];
      const trainers = trainersRes.profiles || [];
      const allOrders = ordersRes.orders || [];
      const clientCount = clientsRes.total || 0;
      const trainerCount = trainersRes.total || 0;
      const orderCount = ordersRes.total || 0;
      const totalRevenue = allOrders.reduce(
        (sum, o) => sum + (o.total_amount || 0),
        0
      );
      const totalUsers = clientCount + trainerCount;

      setStats([
        {
          label: "Total Users",
          value: totalUsers.toLocaleString(),
          icon: "👤",
          color: "bg-blue-500",
        },
        {
          label: "Trainers",
          value: trainerCount.toLocaleString(),
          icon: "🏃",
          color: "bg-green-500",
        },
        {
          label: "Gym Members",
          value: clientCount.toLocaleString(),
          icon: "💪",
          color: "bg-purple-500",
        },
        {
          label: "Total Orders",
          value: orderCount.toLocaleString(),
          icon: "💳",
          color: "bg-yellow-500",
        },
        {
          label: "Total Revenue",
          value: `Rs ${totalRevenue.toLocaleString()}`,
          icon: "💰",
          color: "bg-emerald-500",
        },
      ]);

      // Process Membership Distribution
      const active = clients.filter(
        (p) => p.membership_status?.toLowerCase() === "active"
      ).length;
      const pending = clients.filter(
        (p) => p.membership_status?.toLowerCase() === "pending"
      ).length;
      const expired = clients.filter(
        (p) => p.membership_status?.toLowerCase() === "expired"
      ).length;

      setMembershipData([
        { name: "Active", value: active, color: "#10B981" },
        { name: "Pending", value: pending, color: "#F59E0B" },
        { name: "Expired", value: expired, color: "#EF4444" },
      ]);

      // Real Revenue Data grouped by month from orders
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const revenueByMonth = {};
      allOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!revenueByMonth[key]) {
          revenueByMonth[key] = {
            name: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
            revenue: 0,
            signups: 0,
          };
        }
        revenueByMonth[key].revenue += order.total_amount || 0;
        revenueByMonth[key].signups += 1;
      });
      const sortedRevenue = Object.keys(revenueByMonth)
        .sort()
        .slice(-6)
        .map((k) => revenueByMonth[k]);
      setRevenueData(
        sortedRevenue.length > 0
          ? sortedRevenue
          : monthNames
              .slice(0, 6)
              .map((m) => ({ name: m, revenue: 0, signups: 0 }))
      );

      // Combine and Sort Recent Users
      const allUsers = [
        ...clients.map((p) => ({
          ...p.user_id,
          status: p.membership_status || "Active",
          profileId: p._id,
        })),
        ...trainers.map((p) => ({
          ...p.user_id,
          status: "Active",
          profileId: p._id,
        })),
      ];

      allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentUsers(allUsers);
    } catch (err) {
      console.error("Error fetching admin overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981"];

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition"
          >
            <div
              className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-lg font-black text-blue-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
              Revenue Flow (LKR)
            </h3>
            <span className="text-[10px] text-green-500 font-bold bg-green-50 px-3 py-1 rounded-full uppercase">
              +12.5% vs Prev month
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-8">
            Member Status
          </h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={membershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {membershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-black text-blue-900">
                {membershipData.reduce((a, b) => a + b.value, 0)}
              </span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                Total Members
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {membershipData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] font-black text-blue-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity / Users Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">
            Recent System Activity
          </h3>
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
            variant="admin"
            className="md:w-72"
          />
        </div>
        <div className="overflow-x-auto text-left">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest italic">
              Loading Activity Stream...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    User Profile
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    System Role
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    Current Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((user, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/30 transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                            {user.name?.charAt(0)}
                          </div>
                          <span className="text-[11px] font-black text-blue-900 uppercase italic tracking-tighter">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black">
                        <span
                          className={`px-3 py-1 rounded-lg ${
                            user.role === "trainer"
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          } uppercase tracking-widest`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black">
                        <span
                          className={`flex items-center space-x-2 ${
                            user.status?.toLowerCase() === "active"
                              ? "text-green-500"
                              : user.status?.toLowerCase() === "pending"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full animate-pulse bg-current`}
                          ></div>
                          <span className="uppercase tracking-widest">
                            {user.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition">
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                          🖊️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic"
                    >
                      {searchQuery ? 'No users match your search.' : 'No registration history recorded'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 pb-5">
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            className="[&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
