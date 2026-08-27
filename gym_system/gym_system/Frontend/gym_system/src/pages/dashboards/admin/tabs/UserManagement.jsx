import React, { useEffect, useState, useCallback } from "react";
import clientProfileService from "@/services/clientProfile.service";
import { showSuccess, showError, showConfirm } from "@/utils/sweetAlerts";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  dob: "",
  contact: "",
  activity_level: "beginner",
  medical_notes: "",
  membership_status: "active",
  height: "",
  weight: "",
  gender: "male",
  goal: "weight_loss",
};

const getClipUrl = (clipPath) => {
  if (!clipPath) return '';
  if (clipPath.startsWith('http')) return clipPath;
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${base}${clipPath.startsWith('/') ? clipPath : `/${clipPath}`}`;
};

const isVideoClip = (path) => /\.(mp4|webm|ogg|mov|m4v)$/i.test(path || '');

const DetailField = ({ label, value }) => (
  <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-blue-900 break-words">{value || '—'}</p>
  </div>
);

const UserManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const matchMember = useCallback(
    (member, query) =>
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query),
    []
  );

  const {
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems,
    itemsPerPage,
    filteredItems,
  } = usePaginatedSearch(members, matchMember);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await clientProfileService.getAllProfiles();
      if (res.status === "success") {
        const formatted = (res.profiles || []).map((p) => ({
          name: p.user_id?.name || "Unknown",
          email: p.user_id?.email || "N/A",
          role: p.user_id?.role || "client",
          status: p.membership_status || "Active",
          profile_image: p.user_id?.profile_image,
          id: p._id,
        }));
        setMembers(formatted);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleDetails = async (profileId) => {
    try {
      setDetailLoading(true);
      setSelectedMember("loading");
      const res = await clientProfileService.getProfileById(profileId);
      if (res.status === "success") setSelectedMember(res.profile);
    } catch {
      showError("Error", "Failed to load member details.");
      setSelectedMember(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (profileId, name) => {
    const confirmed = await showConfirm(
      "Remove Member?",
      `Are you sure you want to permanently delete ${name}? This cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await clientProfileService.deleteProfile(profileId);
      showSuccess("Removed", `${name} has been removed from the system.`);
      setMembers((prev) => prev.filter((m) => m.id !== profileId));
      setTotal((prev) => prev - 1);
    } catch {
      showError("Error", "Failed to delete the member.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await clientProfileService.registerMember({
        ...form,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
      });
      if (res.status === "success") {
        showSuccess("Member Added", `${form.name} has been enrolled.`);
        setIsAdding(false);
        setForm(INITIAL_FORM);
        fetchMembers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add member.";
      showError("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row flex-1 items-start md:items-center gap-4 w-full">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-blue-900 leading-tight">
              Gym Members
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {searchTerm
                ? `MATCHED ${filteredItems.length} OF ${total} MEMBERS`
                : `Total Impact: ${total} Active Lives`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md w-full md:ml-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="SEARCH BY NAME OR EMAIL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 pl-11 pr-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-gray-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${
            isAdding
              ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
          }`}
        >
          {isAdding ? "CANCEL ENROLLMENT" : "+ NEW MEMBER ENROLLMENT"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-3xl border-2 border-blue-50 shadow-2xl overflow-hidden animate-slideUp">
          <div className="bg-blue-600 p-6">
            <h4 className="text-white font-black italic uppercase tracking-widest text-sm">
              Member Admission Form
            </h4>
            <p className="text-blue-100 text-[9px] font-bold uppercase mt-1">
              Capture account, profile, and body metrics
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {/* Account Section */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest pb-2 border-b border-gray-100">
                1. Account Information
              </h5>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="johndoe@gym.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Initial Password
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 px-3 py-3 rounded-xl text-[10px] font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Contact #
                  </label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) =>
                      setForm({ ...form, contact: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-100 px-3 py-3 rounded-xl text-[10px] font-bold outline-none"
                    placeholder="+94 7..."
                  />
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest pb-2 border-b border-gray-100">
                2. Fitness Profile
              </h5>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Activity Experience
                </label>
                <select
                  value={form.activity_level}
                  onChange={(e) =>
                    setForm({ ...form, activity_level: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="beginner">Beginner (New to Gym)</option>
                  <option value="intermediate">Intermediate (Regular)</option>
                  <option value="advanced">Advanced (Athletic)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Admission Status
                </label>
                <select
                  value={form.membership_status}
                  onChange={(e) =>
                    setForm({ ...form, membership_status: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="active">Active (Immediate)</option>
                  <option value="pending">Pending (Review)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                  Medical Clearance / Notes
                </label>
                <textarea
                  value={form.medical_notes}
                  onChange={(e) =>
                    setForm({ ...form, medical_notes: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none h-[116px] resize-none"
                  placeholder="Any injuries or medical conditions administrators should know about..."
                />
              </div>
            </div>

            {/* Body Metrics Section */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest pb-2 border-b border-gray-100">
                3. Physical Metrics
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Primary Goal
                  </label>
                  <select
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="stretching">Flexibility</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) =>
                      setForm({ ...form, height: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                    placeholder="175"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none"
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {submitting ? "PROCESSING..." : "COMPLETE ADMISSION"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Members Grid */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                Synchronizing Database...
              </div>
            </div>
          ) : members.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedItems.map((u, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-[2.5rem] border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />

                  <div className="flex justify-between items-start mb-6 relative">
                    <div className="relative w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/20 group-hover:rotate-6 transition-transform overflow-hidden">
                      <span className="relative z-0">{u.name.charAt(0)}</span>
                      {u.profile_image && (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${u.profile_image}`} 
                          alt={u.name} 
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                        u.status.toLowerCase() === "active"
                          ? "text-green-500 bg-green-50 border-green-100"
                          : u.status.toLowerCase() === "pending"
                          ? "text-yellow-500 bg-yellow-50 border-yellow-100"
                          : "text-red-500 bg-red-50 border-red-100"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>

                  <div className="relative">
                    <h4 className="font-black text-blue-900 uppercase tracking-tight text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {u.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 truncate mt-1 uppercase tracking-wider">
                      {u.email}
                    </p>
                  </div>

                  <div className="mt-8 flex gap-3 relative">
                    <button
                      onClick={() => handleDetails(u.id)}
                      className="flex-1 bg-white border border-gray-100 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20 transition-all"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all group/suspend"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
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
              className="mt-6 [&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-blue-600"
            />
            </>
          ) : (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4 grayscale opacity-20">👥</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {searchTerm
                  ? `No members found matching "${searchTerm}"`
                  : "No members found in system"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member detail drawer */}
      {selectedMember && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-gray-200 flex flex-col animate-fadeIn">
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-900 to-blue-700">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.25em] mb-1">
                  Member Profile
                </p>
                <h4 className="text-xl font-black italic uppercase tracking-tight text-white truncate">
                  {selectedMember === 'loading'
                    ? 'Loading...'
                    : selectedMember.user_id?.name || 'Member'}
                </h4>
                {selectedMember !== 'loading' && (
                  <p className="text-[11px] font-bold text-blue-100 mt-1 truncate">
                    {selectedMember.user_id?.email}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Close details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailLoading || selectedMember === 'loading' ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="relative w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg overflow-hidden">
                    <span className="relative z-0">{selectedMember.user_id?.name?.charAt(0) || '?'}</span>
                    {selectedMember.user_id?.profile_image && (
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${selectedMember.user_id.profile_image}`} 
                        alt="Profile" 
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        selectedMember.membership_status === 'active'
                          ? 'text-green-700 bg-green-100'
                          : selectedMember.membership_status === 'pending'
                            ? 'text-yellow-700 bg-yellow-100'
                            : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {selectedMember.membership_status}
                    </span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                      Joined {selectedMember.createdAt
                        ? new Date(selectedMember.createdAt).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>

                <section className="space-y-3">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Account Information
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DetailField label="Contact" value={selectedMember.user_id?.contact} />
                    <DetailField
                      label="Date of Birth"
                      value={
                        selectedMember.user_id?.dob
                          ? new Date(selectedMember.user_id.dob).toLocaleDateString()
                          : '—'
                      }
                    />
                    <DetailField label="Email" value={selectedMember.user_id?.email} />
                    <DetailField label="Role" value={selectedMember.user_id?.role || 'client'} />
                  </div>
                </section>

                <section className="space-y-3">
                  <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Fitness Profile
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DetailField label="Activity Level" value={selectedMember.activity_level} />
                    <DetailField
                      label="Primary Goal"
                      value={(selectedMember.bodyInfo?.goal || '—').replace(/_/g, ' ')}
                    />
                    <DetailField label="Gender" value={selectedMember.bodyInfo?.gender} />
                    <DetailField
                      label="Height"
                      value={
                        selectedMember.bodyInfo?.height
                          ? `${selectedMember.bodyInfo.height} cm`
                          : '—'
                      }
                    />
                    <DetailField
                      label="Weight"
                      value={
                        selectedMember.bodyInfo?.weight
                          ? `${selectedMember.bodyInfo.weight} kg`
                          : '—'
                      }
                    />
                  </div>
                </section>

                {selectedMember.medical_notes && (
                  <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <h5 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">
                      Medical Notes
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedMember.medical_notes}
                    </p>
                  </section>
                )}
              </div>
            )}

            {selectedMember !== 'loading' && !detailLoading && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                >
                  Close Profile
                </button>
              </div>
            )}
          </aside>
      )}
    </div>
  );
};

export default UserManagement;
