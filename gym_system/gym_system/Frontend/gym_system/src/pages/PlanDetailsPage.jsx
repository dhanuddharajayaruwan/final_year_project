import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import subscriptionPlanService from "../services/subscriptionPlan.service";
import trainingSubscriptionService from "../services/trainingSubscription.service";
import { AuthContext } from "../context/AuthContext";
import {
  showSuccess,
  showError,
  showLoading,
  showInput,
  showConfirm,
} from "../utils/sweetAlerts";

const PlanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [activeSub, setActiveSub] = useState(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await subscriptionPlanService.getPlanById(id);
        if (res.status === "success") {
          setPlan(res.plan);
        } else {
          showError("Error", "Plan not found");
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
        showError("Error", "Failed to load plan details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, navigate]);

  // Check if user has an active/pending subscription
  useEffect(() => {
    const checkActiveSub = async () => {
      if (!user) return;
      try {
        const res = await trainingSubscriptionService.getMySubscriptions();
        if (res.status === "success") {
          const active = (res.subscriptions || []).find(
            (s) => s.status === "active" || s.status === "pending"
          );
          setActiveSub(active || null);
        }
      } catch (err) {
        console.error("Error checking active subscription:", err);
      }
    };
    checkActiveSub();
  }, [user]);

  // Confirm upgrade/downgrade if user has active subscription on a different plan
  const confirmUpgradeDowngrade = async () => {
    if (!activeSub) return true;
    const currentPlanName =
      activeSub.subscription_plan_id?.name || "current plan";
    return await showConfirm(
      "Change Subscription?",
      `You currently have an active/pending subscription ("${currentPlanName}"). Switching to "${plan.name}" will cancel your existing subscription immediately with no refund. Do you want to proceed?`
    );
  };

  const handleOnlinePayment = async () => {
    if (!user) {
      showError(
        "Authentication Required",
        "Please login or register to continue with the payment."
      );
      navigate("/login");
      return;
    }

    if (!agreedTerms) {
      showError(
        "Terms Required",
        "You must agree to the Terms & Conditions before proceeding."
      );
      return;
    }

    // Block same plan while active
    if (activeSub && String(activeSub.subscription_plan_id?._id) === id) {
      showError(
        "Already Subscribed",
        "You already have an active or pending subscription for this plan. You can subscribe again after it expires."
      );
      return;
    }

    // Confirm upgrade/downgrade
    if (activeSub && !(await confirmUpgradeDowngrade())) return;

    try {
      setIsPaying(true);
      showLoading("Initiating Payment", "Contacting PayHere Secure Gateway...");

      const res = await trainingSubscriptionService.initiatePayHere(id);
      if (res.status === "success") {
        const { payhereData } = res;

        // PayHere form submission
        const form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "https://sandbox.payhere.lk/pay/checkout"); // Sandbox URL, change for production

        Object.keys(payhereData).forEach((key) => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", key);
          input.setAttribute("value", payhereData[key]);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        showError(
          "Payment Failed",
          res.message || "Failed to initiate payment. Please try again."
        );
      }
    } catch (err) {
      console.error("Payment error:", err);
      showError(
        "Payment Error",
        "An unexpected error occurred. Please contact support."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const handleBankDeposit = async () => {
    if (!user) {
      showError(
        "Authentication Required",
        "Please login or register to continue."
      );
      navigate("/login");
      return;
    }

    if (!agreedTerms) {
      showError(
        "Terms Required",
        "You must agree to the Terms & Conditions before proceeding."
      );
      return;
    }

    // Block same plan while active
    if (activeSub && String(activeSub.subscription_plan_id?._id) === id) {
      showError(
        "Already Subscribed",
        "You already have an active or pending subscription for this plan. You can subscribe again after it expires."
      );
      return;
    }

    // Confirm upgrade/downgrade
    if (activeSub && !(await confirmUpgradeDowngrade())) return;

    const slipId = await showInput(
      "Bank Deposit",
      "Please enter your Bank Deposit Slip ID / Reference Number to proceed.",
      "e.g. BD123456"
    );

    if (slipId) {
      try {
        setIsPaying(true);
        showLoading("Submitting Request", "Recording your deposit details...");

        const res = await trainingSubscriptionService.initiateBank(id, slipId);
        if (res.status === "success") {
          showSuccess(
            "Request Received",
            "Once our team verifies your slip (#" +
              slipId +
              "), your subscription will be activated. You can track this in your dashboard."
          );
          navigate("/member/subscriptions");
        }
      } catch (err) {
        console.error("Bank initiation error:", err);
        showError(
          "Submission Error",
          "Failed to record your bank deposit. Please try again or contact support."
        );
      } finally {
        setIsPaying(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <div className="text-red-600 font-black italic animate-pulse tracking-[0.3em] uppercase">
          Loading Tier Details...
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-fadeIn">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  plan.type === "blended"
                    ? "bg-purple-600/20 text-purple-500"
                    : "bg-red-600/20 text-red-500"
                }`}
              >
                {plan.type || "online"}
              </span>
              <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-gray-800 text-gray-400">
                {plan.duration || 30} Days Validity
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              {plan.name}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black text-white italic flex items-start gap-2">
              <span className="text-red-600 text-2xl font-bold not-italic font-sans mt-2">
                Rs
              </span>
              {plan.price?.toLocaleString()}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 italic leading-none">
              Total Investment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Features & Description */}
          <div className="lg:col-span-2 space-y-12 animate-slideLeft">
            <div className="bg-[#1a1a1a] p-10 rounded-2xl border border-gray-800/50 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-red-600/10 transition duration-700"></div>

              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-red-600"></span> Tier Benefits
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {(plan.description || "")
                  .split(",")
                  .filter((f) => f.trim())
                  .map((feature, i) => (
                    <div key={i} className="flex items-start gap-4 group/item">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs text-white shadow-lg shadow-red-600/20 group-hover/item:scale-110 transition">
                        ✓
                      </div>
                      <p className="text-gray-300 font-medium tracking-wide pt-0.5">
                        {feature.trim()}
                      </p>
                    </div>
                  ))}
              </div>

              {!plan.description && (
                <p className="text-gray-500 italic">
                  No specific features listed for this tier.
                </p>
              )}
            </div>

            <div className="bg-[#1a1a1a] p-10 rounded-2xl border border-gray-800/50">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-gray-600"></span> Important
                Information
              </h2>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                By subscribing to the{" "}
                <span className="text-white font-bold">{plan.name}</span>, you
                agree to our Cylon Force Gym terms of service. This plan will be
                active for exactly {plan.duration || 30} days from the moment
                your payment is confirmed.
              </p>
              <div className="p-4 bg-red-600/5 border border-red-600/20 rounded-xl mb-6">
                <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Subscription Policy
                </h4>
                <ul className="text-gray-400 text-[10px] space-y-2 leading-relaxed list-disc ml-4">
                  <li>
                    You may only hold{" "}
                    <span className="text-white font-bold">
                      one active subscription
                    </span>{" "}
                    at a time. You cannot purchase the same plan while it is
                    still active or pending.
                  </li>
                  <li>
                    You may{" "}
                    <span className="text-white font-bold">
                      upgrade or downgrade
                    </span>{" "}
                    to a different plan at any time. Your current subscription
                    will be{" "}
                    <span className="text-red-400 font-bold">
                      cancelled immediately
                    </span>{" "}
                    and the new plan will take effect.
                  </li>
                  <li>
                    <span className="text-red-400 font-bold">No refunds</span>{" "}
                    will be issued for the remaining period of a cancelled
                    subscription. By proceeding, you accept this policy.
                  </li>
                  <li>
                    After your subscription expires, you are free to subscribe
                    to any plan again.
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                  <div className="text-red-500 text-xl mb-2">⚡</div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-1">
                    Instant Access
                  </h4>
                  <p className="text-gray-500 text-[9px] leading-tight">
                    Access services immediately after online payment.
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                  <div className="text-blue-500 text-xl mb-2">🛡️</div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-1">
                    Secure Payment
                  </h4>
                  <p className="text-gray-500 text-[9px] leading-tight">
                    Encrypted transactions via PayHere gateway.
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                  <div className="text-green-500 text-xl mb-2">📞</div>
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-1">
                    24/7 Support
                  </h4>
                  <p className="text-gray-500 text-[9px] leading-tight">
                    Get help anytime from our trainers.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] p-10 rounded-2xl border border-gray-800/50">
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-red-600"></span> Bank Deposit
                Details
              </h2>
              <div className="p-6 bg-black/40 border border-red-600/20 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Bank Name
                    </p>
                    <p className="text-white font-bold tracking-wide uppercase">
                      Commercial Bank
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Account Name
                    </p>
                    <p className="text-white font-bold tracking-wide uppercase">
                      Cylon Force Gym (PVT) LTD
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Account Number
                    </p>
                    <p className="text-red-500 font-black text-xl tracking-widest">
                      8009124456
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Branch
                    </p>
                    <p className="text-white font-bold tracking-wide uppercase">
                      Colombo 07 - Main Branch
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-800/50">
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    * Please make the deposit and keep the reference number
                    (Slip ID). You will need to enter this number when you click
                    the "Bank Deposit" button to initiate your activation
                    request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checkout Sidebar */}
          <div className="animate-slideRight">
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 shadow-2xl sticky top-32">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 text-center underline decoration-red-600 underline-offset-8">
                Checkout
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    Subtotal
                  </span>
                  <span className="text-white font-bold tracking-wider">
                    Rs {plan.price?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-4">
                  <span className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    Valid For
                  </span>
                  <span className="text-white font-bold tracking-wider">
                    {plan.duration || 30} Days
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-dashed border-gray-800">
                  <span className="text-white uppercase tracking-[0.2em] font-black text-sm">
                    Total
                  </span>
                  <span className="text-2xl font-black text-red-600 italic tracking-tighter">
                    Rs {plan.price?.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Active Subscription Warning */}
              {activeSub && (
                <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl mb-6">
                  <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    ⚠ Active Subscription
                  </p>
                  <p className="text-gray-400 text-[10px] leading-relaxed">
                    You have an active/pending{" "}
                    <span className="text-white font-bold">
                      {activeSub.subscription_plan_id?.name}
                    </span>{" "}
                    plan.
                    {String(activeSub.subscription_plan_id?._id) === id
                      ? " You cannot subscribe to the same plan until it expires."
                      : " Purchasing a new plan will cancel your current one with no refund."}
                  </p>
                </div>
              )}

              {/* Terms Agreement Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-red-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 leading-relaxed group-hover:text-gray-300 transition">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-red-500 underline hover:text-red-400"
                  >
                    Terms & Conditions
                  </Link>
                  , including the subscription upgrade/downgrade and no-refund
                  policy.
                </span>
              </label>
              <div className="space-y-4">
                <button
                  onClick={handleOnlinePayment}
                  disabled={
                    isPaying ||
                    !agreedTerms ||
                    (activeSub &&
                      String(activeSub.subscription_plan_id?._id) === id)
                  }
                  className={`w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-3 ${
                    isPaying ||
                    !agreedTerms ||
                    (activeSub &&
                      String(activeSub.subscription_plan_id?._id) === id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="text-xl leading-none">💳</span>{" "}
                  {isPaying ? "PROCESSING..." : "PAY WITH PAYHERE"}
                </button>

                <button
                  onClick={handleBankDeposit}
                  disabled={
                    isPaying ||
                    !agreedTerms ||
                    (activeSub &&
                      String(activeSub.subscription_plan_id?._id) === id)
                  }
                  className={`w-full bg-transparent border-2 border-gray-700 hover:border-white text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition active:scale-95 flex items-center justify-center gap-3 group ${
                    isPaying ||
                    !agreedTerms ||
                    (activeSub &&
                      String(activeSub.subscription_plan_id?._id) === id)
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <span className="text-xl leading-none group-hover:scale-110 transition">
                    🏛️
                  </span>{" "}
                  BANK DEPOSIT
                </button>
              </div>

              <p className="text-[9px] text-center text-gray-500 font-bold uppercase tracking-widest mt-8 leading-relaxed">
                Proceeding with payment constitutes acceptance <br /> of our{" "}
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-red-600 underline"
                >
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanDetailsPage;
