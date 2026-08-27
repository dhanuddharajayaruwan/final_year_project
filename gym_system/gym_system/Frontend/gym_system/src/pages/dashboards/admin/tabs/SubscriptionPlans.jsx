import React, { useEffect, useState, useCallback } from "react";
import subscriptionPlanService from "@/services/subscriptionPlan.service";
import trainingSubscriptionService from "@/services/trainingSubscription.service";
import clientProfileService from "@/services/clientProfile.service";
import { showSuccess, showError, showConfirm } from "@/utils/sweetAlerts";

const SubscriptionPlans = () => {
  const [activeTab, setActiveTab] = useState("plans");
  const [subTab, setSubTab] = useState("all"); // 'all', 'payhere', 'bank_transfer'
  const [loading, setLoading] = useState(true);

  // --- Plans State ---
  const [plans, setPlans] = useState([]);
  const [planPage, setPlanPage] = useState(1);
  const [planTotalPages, setPlanTotalPages] = useState(1);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: "",
    type: "online",
    duration: 30,
  });
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanForm, setEditPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    type: "online",
    duration: 30,
  });

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // --- Assignment Search ---
  const [assignmentSearch, setAssignmentSearch] = useState("");

  // --- User Subscriptions State ---
  const [subscriptions, setSubscriptions] = useState([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [members, setMembers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    user_id: "",
    subscription_plan_id: "",
    duration: 30,
  });
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubForm, setEditSubForm] = useState({
    status: "",
    expire_date: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "plans") {
        const res = await subscriptionPlanService.getAllPlans({
          page: planPage,
          limit: 9,
          search: searchTerm,
          type: typeFilter,
        });
        if (res.status === "success") {
          setPlans(res.plans || []);
          setPlanTotalPages(res.pages || 1);
        }
      } else {
        const [subsRes, plansRes, membersRes] = await Promise.all([
          trainingSubscriptionService.getAllSubscriptions({
            page: subPage,
            limit: 9,
            search: assignmentSearch,
            paymentType: subTab,
          }),
          subscriptionPlanService.getAllPlans({ limit: 1000 }), // Get all for assignment dropdown
          clientProfileService.getAllProfiles(),
        ]);
        if (subsRes.status === "success") {
          setSubscriptions(subsRes.subscriptions || []);
          setSubTotalPages(subsRes.pages || 1);
        }
        if (plansRes.status === "success") setPlans(plansRes.plans || []);
        if (membersRes.status === "success")
          setMembers(membersRes.profiles || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    planPage,
    searchTerm,
    typeFilter,
    subPage,
    assignmentSearch,
    subTab,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Plan Handlers ---
  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const res = await subscriptionPlanService.createPlan({
        ...newPlan,
        price: Number(newPlan.price),
        duration: Number(newPlan.duration),
      });
      if (res.status === "success") {
        showSuccess(
          "Plan Created",
          `${newPlan.name} has been added successfully.`
        );
        setPlans([...plans, res.plan]);
        setIsAddingPlan(false);
        setNewPlan({
          name: "",
          description: "",
          price: "",
          type: "online",
          duration: 30,
        });
      }
    } catch {
      showError("Creation Failed", "Failed to create subscription plan.");
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await subscriptionPlanService.updatePlan(editingPlanId, {
        ...editPlanForm,
        price: Number(editPlanForm.price),
        duration: Number(editPlanForm.duration),
      });
      if (res.status === "success") {
        showSuccess("Plan Updated", "The subscription plan has been updated.");
        setPlans(plans.map((p) => (p._id === editingPlanId ? res.plan : p)));
        setEditingPlanId(null);
      }
    } catch {
      showError("Update Failed", "Failed to update the subscription plan.");
    }
  };

  const handleDeletePlan = async (id) => {
    const confirmed = await showConfirm(
      "Delete Plan?",
      "Are you sure you want to remove this subscription plan?"
    );
    if (!confirmed) return;
    try {
      await subscriptionPlanService.deletePlan(id);
      showSuccess("Deleted", "Subscription plan has been removed.");
      setPlans(plans.filter((p) => p._id !== id));
    } catch (err) {
      showError("Delete Failed", "Failed to remove the plan.");
      console.error("Error deleting plan:", err);
    }
  };

  // --- Assignment Handlers ---
  const handleAssignPlan = async (e) => {
    e.preventDefault();
    try {
      const date = new Date();
      date.setDate(date.getDate() + Number(newAssignment.duration));
      const res = await trainingSubscriptionService.createSubscription({
        ...newAssignment,
        duration: Number(newAssignment.duration),
        expire_date: date.toISOString(),
      });
      if (res.status === "success" || res._id) {
        showSuccess(
          "Plan Assigned",
          "The plan has been successfully assigned to the member."
        );
        fetchData();
        setIsAssigning(false);
        setNewAssignment({
          user_id: "",
          subscription_plan_id: "",
          duration: 30,
        });
      }
    } catch {
      showError(
        "Assignment Failed",
        "Failed to assign the plan to the member."
      );
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: editSubForm.status,
        ...(editSubForm.expire_date
          ? { expire_date: new Date(editSubForm.expire_date).toISOString() }
          : {}),
      };
      const res = await trainingSubscriptionService.updateSubscription(
        editingSubId,
        payload
      );
      if (res.status === "success" || res._id) {
        showSuccess("Updated", "The assignment status has been updated.");
        setEditingSubId(null);
        fetchData();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Failed to update assignment status.";
      showError("Update Failed", msg);
    }
  };

  const handleDeleteAssignment = async (id) => {
    const confirmed = await showConfirm(
      "Remove Subscription?",
      "Are you sure you want to remove this member subscription?"
    );
    if (!confirmed) return;
    try {
      await trainingSubscriptionService.deleteSubscription(id);
      showSuccess("Removed", "The subscription has been removed successfully.");
      setSubscriptions(subscriptions.filter((s) => s._id !== id));
    } catch (err) {
      showError("Remove Failed", "Failed to remove the subscription.");
      console.error("Error deleting assignment:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tab Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">
            Subscription Management
          </h3>
          <div className="flex space-x-6 mt-3">
            {["plans", "user-assignments"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAddingPlan(false);
                  setIsAssigning(false);
                  setTypeFilter("all");
                  setSubTab("all");
                }}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 pb-1 border-b-2 ${
                  activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-400 border-transparent hover:text-blue-400"
                }`}
              >
                {tab === "plans" ? "PLAN TYPES" : "USER ASSIGNMENTS"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "plans" ? (
          <button
            onClick={() => setIsAddingPlan(!isAddingPlan)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition"
          >
            {isAddingPlan ? "CANCEL" : "+ CREATE NEW PLAN"}
          </button>
        ) : (
          <button
            onClick={() => setIsAssigning(!isAssigning)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition"
          >
            {isAssigning ? "CANCEL" : "+ ASSIGN MEMBER PLAN"}
          </button>
        )}
      </div>

      {/* Plans Section: Search & Tabs */}
      {activeTab === "plans" && !isAddingPlan && !editingPlanId && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search plans by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPlanPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPlanPage(1);
                }}
                className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition px-2"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex space-x-4 animate-fadeIn">
            {[
              { id: "all", label: "All Plans" },
              { id: "online", label: "Online Only" },
              { id: "blended", label: "Blended Only" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTypeFilter(tab.id);
                  setPlanPage(1);
                }}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  typeFilter === tab.id
                    ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20"
                    : "bg-white text-gray-400 border border-gray-100 hover:border-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Assignments Section: Search & Tabs */}
      {activeTab === "user-assignments" && !isAssigning && !editingSubId && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={assignmentSearch}
                onChange={(e) => {
                  setAssignmentSearch(e.target.value);
                  setSubPage(1);
                }}
                className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            {assignmentSearch && (
              <button
                onClick={() => {
                  setAssignmentSearch("");
                  setSubPage(1);
                }}
                className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition px-2"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex space-x-4 animate-fadeIn">
            {[
              { id: "all", label: "All Assignments" },
              { id: "payhere", label: "Online (PayHere)" },
              { id: "bank_transfer", label: "Bank Deposits" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSubTab(tab.id);
                  setSubPage(1);
                }}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  subTab === tab.id
                    ? "bg-blue-900 text-white shadow-lg shadow-blue-900/20"
                    : "bg-white text-gray-400 border border-gray-100 hover:border-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === "plans" ? (
        <div className="space-y-8">
          {/* Add Plan Form */}
          {isAddingPlan && (
            <form
              onSubmit={handleAddPlan}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end animate-fadeIn"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g. Platinum"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  required
                  value={newPlan.price}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, price: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Plan Type
                </label>
                <select
                  value={newPlan.type}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, type: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="online">Online</option>
                  <option value="blended">Blended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, duration: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                  placeholder="30"
                />
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                  placeholder="e.g. WiFi, Locker, Personal Trainer"
                />
              </div>
              <button
                type="submit"
                className="md:col-span-full bg-green-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg shadow-green-500/20"
              >
                SAVE PLAN
              </button>
            </form>
          )}

          {/* Edit Plan Form */}
          {editingPlanId && (
            <form
              onSubmit={handleUpdatePlan}
              className="bg-blue-900 p-8 rounded-3xl shadow-xl text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end animate-fadeIn"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Edit Name
                </label>
                <input
                  type="text"
                  required
                  value={editPlanForm.name}
                  onChange={(e) =>
                    setEditPlanForm({ ...editPlanForm, name: e.target.value })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Edit Price
                </label>
                <input
                  type="number"
                  required
                  value={editPlanForm.price}
                  onChange={(e) =>
                    setEditPlanForm({ ...editPlanForm, price: e.target.value })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Edit Type
                </label>
                <select
                  value={editPlanForm.type}
                  onChange={(e) =>
                    setEditPlanForm({ ...editPlanForm, type: e.target.value })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                >
                  <option value="online">Online</option>
                  <option value="blended">Blended</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Edit Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={editPlanForm.duration}
                  onChange={(e) =>
                    setEditPlanForm({
                      ...editPlanForm,
                      duration: e.target.value,
                    })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Edit Description
                </label>
                <input
                  type="text"
                  required
                  value={editPlanForm.description}
                  onChange={(e) =>
                    setEditPlanForm({
                      ...editPlanForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                  placeholder="e.g. WiFi, Locker, Personal Trainer"
                />
              </div>
              <div className="md:col-span-full flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition"
                >
                  UPDATE
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlanId(null)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest italic">
              Plans Loading...
            </div>
          ) : plans.filter((p) => {
              const matchesSearch = p.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
              const matchesType = typeFilter === "all" || p.type === typeFilter;
              return matchesSearch && matchesType;
            }).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans
                .filter((p) => {
                  const matchesSearch = p.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                  const matchesType =
                    typeFilter === "all" || p.type === typeFilter;
                  return matchesSearch && matchesType;
                })
                .map((plan) => (
                  <div
                    key={plan._id}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:border-blue-600 transition duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-20 group-hover:bg-blue-600 group-hover:opacity-10 transition duration-500" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-blue-900 flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition duration-500">
                        💎
                      </div>
                      <span className="text-xl font-black text-blue-900">
                        Rs {plan.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-blue-900 uppercase text-lg">
                        {plan.name}
                      </h4>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            plan.type === "blended"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {plan.type || "online"}
                        </span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
                          {plan.duration || 30} Days
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-8">
                      {(plan.description || "")
                        .split(",")
                        .filter((f) => f.trim())
                        .map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                          >
                            <span className="text-blue-600 mr-2 text-xs">
                              ✓
                            </span>{" "}
                            {feature.trim()}
                          </div>
                        ))}
                      {!(plan.description || "").trim() && (
                        <p className="text-[10px] font-bold text-gray-400 italic uppercase">
                          No description provided
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 pt-6 border-t border-gray-50">
                      <button
                        onClick={() => {
                          setEditingPlanId(plan._id);
                          setEditPlanForm({
                            name: plan.name,
                            price: plan.price,
                            description: plan.description,
                            type: plan.type || "online",
                            duration: plan.duration || 30,
                          });
                        }}
                        className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id)}
                        className="flex-1 bg-white border border-red-100 text-red-500 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100 italic">
              {searchTerm || typeFilter !== "all"
                ? "No plans match your current filters."
                : "No plans found."}
            </div>
          )}

          {/* Pagination */}
          {activeTab === "plans" && planTotalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-8">
              <button
                disabled={planPage === 1}
                onClick={() => setPlanPage((p) => Math.max(1, p - 1))}
                className={`p-2 rounded-xl transition ${
                  planPage === 1
                    ? "text-gray-300"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ◀
              </button>
              <div className="flex space-x-1">
                {[...Array(planTotalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPlanPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition ${
                      planPage === i + 1
                        ? "bg-blue-900 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={planPage === planTotalPages}
                onClick={() =>
                  setPlanPage((p) => Math.min(planTotalPages, p + 1))
                }
                className={`p-2 rounded-xl transition ${
                  planPage === planTotalPages
                    ? "text-gray-300"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Assign Member Form */}
          {isAssigning && (
            <form
              onSubmit={handleAssignPlan}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end animate-fadeIn"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Member
                </label>
                <select
                  required
                  value={newAssignment.user_id}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      user_id: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Member</option>
                  {members.map((m) => (
                    <option key={m.user_id?._id} value={m.user_id?._id}>
                      {m.user_id?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Plan
                </label>
                <select
                  required
                  value={newAssignment.subscription_plan_id}
                  onChange={(e) => {
                    const planId = e.target.value;
                    const selectedPlan = plans.find((p) => p._id === planId);
                    setNewAssignment({
                      ...newAssignment,
                      subscription_plan_id: planId,
                      duration: selectedPlan ? selectedPlan.duration : 30,
                    });
                  }}
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">Select Plan</option>
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  required
                  value={newAssignment.duration}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      duration: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition"
              >
                CONFIRM
              </button>
            </form>
          )}

          {/* Edit Assignment Form */}
          {editingSubId && (
            <form
              onSubmit={handleUpdateAssignment}
              className="bg-blue-900 p-8 rounded-3xl shadow-xl text-white grid grid-cols-1 md:grid-cols-3 gap-6 items-end animate-fadeIn"
            >
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Status
                </label>
                <select
                  value={editSubForm.status}
                  onChange={(e) =>
                    setEditSubForm({ ...editSubForm, status: e.target.value })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editSubForm.expire_date}
                  onChange={(e) =>
                    setEditSubForm({
                      ...editSubForm,
                      expire_date: e.target.value,
                    })
                  }
                  className="w-full bg-blue-800/50 border border-blue-700 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase transition"
                >
                  UPDATE
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubId(null)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl text-[10px] font-black uppercase transition"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto text-left">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Member
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Method
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Expiry
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic"
                      >
                        Loading assignments...
                      </td>
                    </tr>
                  ) : subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                      <tr
                        key={sub._id}
                        className="hover:bg-gray-50/30 transition group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                              {sub.user_id?.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[11px] font-black text-blue-900 uppercase">
                                {sub.user_id?.name}
                              </div>
                              <div className="text-[9px] text-gray-400 font-bold">
                                {sub.user_id?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-blue-900 uppercase bg-blue-50 px-2 py-1 rounded">
                            {sub.subscription_plan_id?.name || "Deleted"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {sub.payment_type === "payhere" && (
                              <span className="flex items-center gap-1.5 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-blue-100 text-blue-600 w-fit">
                                <span className="text-[10px]">💳</span> PayHere
                              </span>
                            )}
                            {sub.payment_type === "bank_transfer" && (
                              <span className="flex items-center gap-1.5 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-yellow-100 text-yellow-600 w-fit">
                                <span className="text-[10px]">🏛️</span> Bank
                                Transfer
                              </span>
                            )}
                            {(!sub.payment_type ||
                              sub.payment_type === "manual") && (
                              <span className="flex items-center gap-1.5 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest bg-gray-100 text-gray-600 w-fit">
                                <span className="text-[10px]">🛠️</span> Manual
                              </span>
                            )}
                            {sub.payment_type === "bank_transfer" &&
                              sub.slip_id && (
                                <div className="group/slip relative">
                                  <span className="text-[9px] font-black text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 hover:border-blue-400 transition cursor-help w-fit">
                                    📎 SLIP: {sub.slip_id}
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">
                          {sub.expire_date
                            ? new Date(sub.expire_date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                              sub.status === "active"
                                ? "text-green-500 bg-green-50"
                                : sub.status === "expired"
                                ? "text-red-500 bg-red-50"
                                : "text-yellow-500 bg-yellow-50"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const isPending = sub.status === "pending";
                                const duration = sub.duration || sub.subscription_plan_id?.duration || 30;
                                const defaultExpire = new Date();
                                defaultExpire.setDate(defaultExpire.getDate() + Number(duration));
                                setEditingSubId(sub._id);
                                setEditSubForm({
                                  // Pre-select Active for pending so admin can approve in one click
                                  status: isPending ? "active" : sub.status,
                                  expire_date: isPending
                                    ? defaultExpire.toISOString().split("T")[0]
                                    : sub.expire_date
                                    ? new Date(sub.expire_date)
                                        .toISOString()
                                        .split("T")[0]
                                    : "",
                                });
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest"
                            >
                              {sub.status === "pending" ? "Approve" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeleteAssignment(sub._id)}
                              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic"
                      >
                        {assignmentSearch || subTab !== "all"
                          ? "No assignments match your search."
                          : "No assignments found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination for Assignments */}
          {activeTab === "user-assignments" && subTotalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-8">
              <button
                disabled={subPage === 1}
                onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                className={`p-2 rounded-xl transition ${
                  subPage === 1
                    ? "text-gray-300"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ◀
              </button>
              <div className="flex space-x-1">
                {[...Array(subTotalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSubPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-black transition ${
                      subPage === i + 1
                        ? "bg-blue-900 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={subPage === subTotalPages}
                onClick={() =>
                  setSubPage((p) => Math.min(subTotalPages, p + 1))
                }
                className={`p-2 rounded-xl transition ${
                  subPage === subTotalPages
                    ? "text-gray-300"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
