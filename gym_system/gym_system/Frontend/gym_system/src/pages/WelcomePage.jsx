import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToHash } from "../utils/scrollToSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import subscriptionPlanService from "../services/subscriptionPlan.service";
import reviewService from "../services/review.service";
import contactService from "../services/contact.service";

const WelcomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [activePricingTab, setActivePricingTab] = useState("online");
  const [pricingIndex, setPricingIndex] = useState(0);

  // Gym Reviews State
  const [gymReviews, setGymReviews] = useState([]);
  const [gymAvgRating, setGymAvgRating] = useState(0);
  const [gymTotalReviews, setGymTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comments: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    message: "",
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactMsg, setContactMsg] = useState({ type: "", text: "" });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmittingContact(true);
    setContactMsg({ type: "", text: "" });
    try {
      await contactService.sendMessage(contactForm);
      setContactMsg({
        type: "success",
        text: "Message sent! We'll get back to you soon.",
      });
      setContactForm({ first_name: "", last_name: "", email: "", message: "" });
    } catch (err) {
      setContactMsg({
        type: "error",
        text:
          err?.response?.data?.message || "Failed to send. Please try again.",
      });
    } finally {
      setSubmittingContact(false);
    }
  };

  // Reset slider index when tab changes
  useEffect(() => {
    setPricingIndex(0);
  }, [activePricingTab]);

  useEffect(() => {
    const fetchGymReviews = async () => {
      try {
        const res = await reviewService.getGymReviews({ limit: 6 });
        if (res.status === "success") {
          setGymReviews(res.reviews || []);
          setGymAvgRating(res.avgRating || 0);
          setGymTotalReviews(res.total || 0);
        }
      } catch (err) {
        console.error("Error fetching gym reviews:", err);
      }
    };
    fetchGymReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewMsg({ type: "error", text: "Please login to submit a review." });
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewMsg({ type: "", text: "" });
      const res = await reviewService.createGymReview({
        rating: Number(reviewForm.rating),
        title: reviewForm.title || null,
        comments: reviewForm.comments || null,
        type: "gym",
      });
      if (res.status === "success") {
        setReviewMsg({ type: "success", text: "Thank you for your review!" });
        setReviewForm({ rating: 5, title: "", comments: "" });
        // Refresh reviews
        const updated = await reviewService.getGymReviews({ limit: 6 });
        if (updated.status === "success") {
          setGymReviews(updated.reviews || []);
          setGymAvgRating(updated.avgRating || 0);
          setGymTotalReviews(updated.total || 0);
        }
      }
    } catch (err) {
      setReviewMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit review.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      navigate("/admin");
    }

    const fetchPlans = async () => {
      try {
        const res = await subscriptionPlanService.getAllPlans();
        if (res.status === "success") {
          setPlans(res.plans || []);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [user, navigate]);

  useEffect(() => {
    if (!location.hash) return;
    scrollToHash(location.hash, { behavior: "smooth" });
  }, [location.hash, loadingPlans]);

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center min-h-[90vh] flex flex-col justify-center pt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
        <div className="relative z-10 px-6 md:px-16 lg:px-24 w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 italic tracking-tighter leading-none">
            YOUR <span className="text-red-600">BEST BODY</span>
          </h1>
          <p className="text-gray-300 mb-10 text-sm md:text-base leading-relaxed max-w-md font-light">
            Join our premium fitness community and transform your life. We
            provide world-class equipment, expert personal trainers, and highly
            effective group programs to help you reach your ultimate goals.
          </p>
          <Link
            to="/register"
            className="inline-block text-center bg-red-600 px-10 py-4 rounded-full font-extrabold text-sm tracking-widest text-white hover:bg-red-700 transition shadow-lg shadow-red-600/40 uppercase"
          >
            Join Us
          </Link>
        </div>
      </section>

      {/* Personalized Training (Red Section) */}
      <section className="bg-red-600 relative z-20 overflow-hidden">
        {/* Angled background effect */}
        <div className="absolute top-0 left-0 w-full h-16 bg-[#121212] -skew-y-2 origin-top-left -mt-8"></div>

        <div className="py-24 px-6 md:px-16 lg:px-24 flex flex-col md:flex-row items-center gap-12 max-w-7xl mx-auto relative">
          <div className="flex-1 w-full">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"
              alt="Personal Trainer"
              className="w-full h-[350px] object-cover shadow-2xl skew-y-[2deg] rounded-sm transform transition duration-500 hover:scale-105"
            />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 italic tracking-tighter uppercase">
              Personalized Training
            </h2>
            <p className="text-red-50 text-base md:text-lg leading-relaxed mb-6 font-light">
              Our certified personal trainers will create a customized workout
              plan tailored to your specific goals, fitness level, and
              lifestyle. Whether you want to lose weight, build muscle, or
              improve your overall health, we're here to guide you every step of
              the way.
            </p>
            <p className="text-red-50 text-base md:text-lg leading-relaxed font-light">
              Experience the difference with one-on-one coaching, comprehensive
              nutritional guidance, and continuous motivation to keep you on
              track.
            </p>
          </div>
        </div>

        {/* Bottom angled effect */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-[#1a1a1a] skew-y-2 origin-bottom-left -mb-8"></div>
      </section>

      {/* Services Section */}
      <section
        id="club"
        className="py-32 px-6 md:px-16 lg:px-24 bg-[#1a1a1a] relative z-10 pb-24"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Our Club Services
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-16 items-center max-w-7xl mx-auto">
          <div className="flex-1 space-y-12">
            <div className="flex gap-6 group cursor-pointer">
              <div className="text-red-600 bg-black p-4 rounded-lg transform group-hover:scale-110 group-hover:bg-red-600 group-hover:text-black transition duration-300 border border-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-red-500 transition">
                  STRENGTH TRAINING
                </h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Build muscle, increase your metabolism, and gain functional
                  strength with our comprehensive specialized free-weight and
                  resistance programs.
                </p>
              </div>
            </div>

            <div className="flex gap-6 group cursor-pointer">
              <div className="text-red-600 bg-black p-4 rounded-lg transform group-hover:scale-110 group-hover:bg-red-600 group-hover:text-black transition duration-300 border border-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-red-500 transition">
                  CARDIO FITNESS
                </h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Improve your cardiovascular health and endurance with
                  state-of-the-art treadmills, ellipticals, stair climbers, and
                  high-intensity interval classes.
                </p>
              </div>
            </div>

            <div className="flex gap-6 group cursor-pointer">
              <div className="text-red-600 bg-black p-4 rounded-lg transform group-hover:scale-110 group-hover:bg-red-600 group-hover:text-black transition duration-300 border border-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-red-500 transition">
                  FUNCTIONAL TRAINING
                </h3>
                <p className="text-gray-400 font-light leading-relaxed">
                  Enhance your daily movements, agility, and core stability
                  through targeted functional exercises utilizing kettlebells,
                  ropes, and plyo boxes.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
              alt="Gym Services"
              className="w-full h-[500px] object-cover rounded-md shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-gray-800"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-6 md:px-16 lg:px-24 bg-[#121212]">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Meet Our Team
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[
            {
              name: "MARCUS COLE",
              role: "HEAD TRAINER",
              img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=600&auto=format&fit=crop",
            },
            {
              name: "SARAH JENKINS",
              role: "FITNESS COACH",
              img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600&auto=format&fit=crop",
            },
            {
              name: "DAVID MILLER",
              role: "CROSSFIT EXPERT",
              img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
            },
          ].map((member, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-md cursor-pointer bg-black"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-[450px] object-cover transition duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-6 px-6 text-center border-b-4 border-transparent group-hover:border-red-600 transition-colors duration-300">
                <h3 className="text-white font-extrabold text-2xl tracking-wide translate-y-2 group-hover:-translate-y-1 transition duration-300 uppercase italic">
                  {member.name}
                </h3>
                <p className="text-red-500 text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-24 px-6 md:px-16 lg:px-24 bg-[#1a1a1a]"
      >
        <div className="flex justify-center mb-12">
          <div className="bg-[#121212] p-1.5 rounded-full border border-gray-800 flex gap-2">
            <button
              onClick={() => setActivePricingTab("online")}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activePricingTab === "online"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Online Subscription
            </button>
            <button
              onClick={() => setActivePricingTab("blended")}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activePricingTab === "blended"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Blended Coaching
            </button>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-12">
          {loadingPlans ? (
            <div className="py-20 text-center text-gray-500 font-black italic uppercase tracking-[0.3em] animate-pulse">
              SYNCING TIERS...
            </div>
          ) : (
            (() => {
              const filteredPlans = plans
                .filter((p) => (p.type || "online") === activePricingTab)
                .sort((a, b) => (a.price || 0) - (b.price || 0));

              const totalPlans = filteredPlans.length;
              const itemsToShow = 3;
              // On mobile we might show 1, but for simplicity let's stick to the grid responsive behavior
              // and just control the offset.
              const visiblePlans = filteredPlans.slice(
                pricingIndex,
                pricingIndex + itemsToShow
              );

              if (totalPlans === 0) {
                return (
                  <div className="py-32 text-center animate-fadeIn">
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest italic mb-6">
                      No {activePricingTab} plans found at the moment
                    </p>
                    <div className="w-12 h-0.5 bg-gray-800 mx-auto"></div>
                  </div>
                );
              }

              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
                    {visiblePlans.map((plan, i) => {
                      const icons = ["❖", "♔", "★", "✦"];
                      const realIndex = pricingIndex + i;
                      const isPro = realIndex === 1; // Middle one usually highlighted
                      return (
                        <div
                          key={plan._id}
                          className={`bg-[#121212] p-8 rounded-md flex flex-col relative border animate-fadeIn ${
                            isPro
                              ? "border-red-600 lg:scale-105 z-10 shadow-[0_0_30px_rgba(220,38,38,0.15)]"
                              : "border-gray-800"
                          }`}
                        >
                          {isPro && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-sm shadow-md uppercase">
                              BEST VALUE
                            </div>
                          )}
                          <div className="text-4xl text-center mb-4 text-gray-500">
                            {icons[realIndex % icons.length]}
                          </div>
                          <h3 className="text-center text-xl font-bold tracking-widest text-white mb-2 uppercase">
                            {plan.name}
                          </h3>

                          <div className="text-center mb-8 border-b border-gray-800 pb-6">
                            <div className="text-3xl font-black text-white italic">
                              <span className="text-red-500 text-xl font-bold not-italic mr-1">
                                Rs
                              </span>
                              {plan.price?.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
                              {plan.duration || 30} Days Validity
                            </div>
                          </div>

                          <ul className="space-y-4 mb-10 flex-grow">
                            {(plan.description || "")
                              .split(",")
                              .filter((f) => f.trim())
                              .map((feature, j) => (
                                <li
                                  key={j}
                                  className="flex items-start text-gray-400 text-sm font-light"
                                >
                                  <span className="text-red-600 mr-3 text-lg font-bold">
                                    ✓
                                  </span>{" "}
                                  {feature.trim()}
                                </li>
                              ))}
                            {!(plan.description || "").trim() && (
                              <li className="text-gray-600 italic text-xs">
                                No specific details listed
                              </li>
                            )}
                          </ul>
                          <Link
                            to={`/subscription-details/${plan._id}`}
                            className={`w-full py-4 rounded-full font-bold text-xs text-center tracking-widest uppercase transition ${
                              isPro
                                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30"
                                : "bg-transparent border-2 border-gray-700 text-white hover:border-white"
                            }`}
                          >
                            Select Tier
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slider Controls */}
                  {totalPlans > itemsToShow && (
                    <>
                      <button
                        onClick={() =>
                          setPricingIndex((prev) => Math.max(0, prev - 1))
                        }
                        className={`absolute top-1/2 -left-4 md:-left-8 -translate-y-1/2 w-10 h-10 rounded-full border border-gray-800 bg-[#121212] flex items-center justify-center text-white transition hover:bg-red-600 hover:border-red-600 ${
                          pricingIndex === 0
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-100"
                        }`}
                        disabled={pricingIndex === 0}
                      >
                        ←
                      </button>
                      <button
                        onClick={() =>
                          setPricingIndex((prev) =>
                            Math.min(totalPlans - itemsToShow, prev + 1)
                          )
                        }
                        className={`absolute top-1/2 -right-4 md:-right-8 -translate-y-1/2 w-10 h-10 rounded-full border border-gray-800 bg-[#121212] flex items-center justify-center text-white transition hover:bg-red-600 hover:border-red-600 ${
                          pricingIndex >= totalPlans - itemsToShow
                            ? "opacity-30 cursor-not-allowed"
                            : "opacity-100"
                        }`}
                        disabled={pricingIndex >= totalPlans - itemsToShow}
                      >
                        →
                      </button>

                      {/* Dots */}
                      <div className="flex justify-center gap-2 mt-12">
                        {[...Array(totalPlans - itemsToShow + 1)].map(
                          (_, i) => (
                            <button
                              key={i}
                              onClick={() => setPricingIndex(i)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                pricingIndex === i
                                  ? "bg-red-600 w-6"
                                  : "bg-gray-700"
                              }`}
                            />
                          )
                        )}
                      </div>
                    </>
                  )}
                </>
              );
            })()
          )}
        </div>
      </section>

      {/* Image Gallery */}
      <section id="gallery" className="py-24 px-2 md:px-6 bg-[#121212]">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Image Gallery
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-w-[1400px] mx-auto">
          {[
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=600&auto=format&fit=crop",
          ].map((src, i) => (
            <div
              key={i}
              className="overflow-hidden group h-[280px] bg-gray-900 cursor-pointer relative"
            >
              <img
                src={src}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-50"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <div className="text-white text-4xl">⛶</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 px-6 md:px-16 lg:px-24 bg-[#1a1a1a]">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Customer Reviews
          </h2>
          {gymReviews.length > 0 && (
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-3">
              {gymReviews.length} review{gymReviews.length !== 1 ? "s" : ""}{" "}
              from our members
            </p>
          )}
        </div>

        {(() => {
          const allReviews =
            gymReviews.length > 0
              ? gymReviews
              : [
                  {
                    _id: "f1",
                    title: "Life-Changing Experience",
                    comments:
                      "Cylon Force Gym completely transformed my attitude towards fitness. The trainers are incredibly supportive and the facilities are top-notch.",
                    user_id: { name: "JOHN DOE" },
                    rating: 5,
                  },
                  {
                    _id: "f2",
                    title: "Broke My Plateau",
                    comments:
                      "The personalized plan I received was exactly what I needed. I've never felt stronger or more confident.",
                    user_id: { name: "AMANDA SMITH" },
                    rating: 5,
                  },
                  {
                    _id: "f3",
                    title: "Best Decision Ever",
                    comments:
                      "Joining this gym was the best decision I made this year. The community vibe keeps me coming back every single day.",
                    user_id: { name: "ROBERT GOMEZ" },
                    rating: 5,
                  },
                  {
                    _id: "f4",
                    title: "Amazing Trainers",
                    comments:
                      "The trainers here genuinely care about your progress. Every session is tailored to push you further.",
                    user_id: { name: "SARAH LEE" },
                    rating: 5,
                  },
                  {
                    _id: "f5",
                    title: "Top-Notch Facilities",
                    comments:
                      "State-of-the-art equipment and always clean. Premium experience every visit.",
                    user_id: { name: "MIKE CHEN" },
                    rating: 4,
                  },
                  {
                    _id: "f6",
                    title: "Great Community",
                    comments:
                      "Everyone here is so welcoming. It stopped feeling like a chore and started feeling like home.",
                    user_id: { name: "PRIYA NAIR" },
                    rating: 5,
                  },
                ];
          const perPage = 3;
          const totalPages = Math.ceil(allReviews.length / perPage);
          const [revPage, setRevPage] = React.useState(0);
          const slice = allReviews.slice(
            revPage * perPage,
            revPage * perPage + perPage
          );

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {slice.map((review) => (
                  <div
                    key={review._id}
                    className="bg-[#222] p-10 rounded-md relative flex flex-col justify-between border border-gray-800 shadow-xl group hover:border-gray-600 transition"
                  >
                    <div>
                      <div className="text-yellow-500 mb-5 text-xl flex justify-center tracking-widest">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      {review.title && (
                        <h4 className="text-white font-black italic uppercase tracking-tight text-center text-sm mb-3">
                          {review.title}
                        </h4>
                      )}
                      {review.comments && (
                        <p className="text-gray-300 font-light italic leading-relaxed text-center text-sm group-hover:text-white transition">
                          "{review.comments}"
                        </p>
                      )}
                    </div>
                    <div className="text-center mt-8 pt-4 border-t border-gray-800">
                      <h4 className="text-white font-bold tracking-widest text-sm uppercase">
                        {review.user_id?.name || "Member"}
                      </h4>
                      {review.createdAt && (
                        <p className="text-red-500 text-xs mt-1 font-semibold">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-12">
                  <button
                    onClick={() => setRevPage((p) => Math.max(0, p - 1))}
                    disabled={revPage === 0}
                    className="w-10 h-10 rounded-full border border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-500 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    ‹
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRevPage(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i === revPage
                            ? "bg-red-600 scale-125"
                            : "bg-gray-700 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setRevPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={revPage === totalPages - 1}
                    className="w-10 h-10 rounded-full border border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-500 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed text-lg"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </section>

      {/* Body Transformations */}
      <section className="py-24 px-2 md:px-6 bg-[#121212]">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Body Transformations
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-[1200px] mx-auto">
          {[
            {
              src: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=600&auto=format&fit=crop",
              span: "col-span-2 row-span-2",
            },
            {
              src: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&auto=format&fit=crop",
              span: "col-span-1",
            },
            {
              src: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?q=80&w=600&auto=format&fit=crop",
              span: "col-span-1",
            },
            {
              src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop",
              span: "col-span-1",
            },
            {
              src: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop",
              span: "col-span-1",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`overflow-hidden group h-[200px] md:h-auto ${item.span} basis-full min-h-[250px] relative`}
            >
              <img
                src={item.src}
                alt={`Transformation ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                <span className="text-white font-bold tracking-widest uppercase border border-white px-4 py-2">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us & Rate Our Service */}
      <section
        id="contact"
        className="py-24 px-6 md:px-16 lg:px-24 bg-[#1a1a1a]"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase">
            Contact Us & Rate Our Service
          </h2>
          <p className="text-gray-500 mt-3 text-sm font-light max-w-2xl mx-auto">
            Get in touch with us or share your experience at Cylon Force Gym.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <div className="bg-[#121212] p-8 md:p-10 rounded-lg border border-gray-800 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              ✉️ Get In Touch
            </h3>
            <form className="space-y-5" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="First Name"
                  value={contactForm.first_name}
                  onChange={(e) =>
                    setContactForm((f) => ({
                      ...f,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={contactForm.last_name}
                  onChange={(e) =>
                    setContactForm((f) => ({ ...f, last_name: e.target.value }))
                  }
                  className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Your Email Address"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm"
              />
              <textarea
                rows="4"
                placeholder="How can we help you?"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm resize-none"
              ></textarea>
              {contactMsg.text && (
                <p
                  className={`text-xs font-bold tracking-wide ${
                    contactMsg.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {contactMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={submittingContact}
                className="bg-red-600 text-white font-bold py-4 px-10 rounded-sm hover:bg-red-700 transition w-full uppercase tracking-widest text-xs shadow-lg shadow-red-600/30 disabled:opacity-60"
              >
                {submittingContact ? "Sending..." : "Send Message"}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-800 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-red-500">📍</span>
                <span className="text-gray-400 text-sm font-light">
                  123 Fitness Avenue, Muscle City, MC 10001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-500">📞</span>
                <span className="text-gray-400 text-sm font-light">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-red-500">✉️</span>
                <span className="text-gray-400 text-sm font-light">
                  info@cylonforce.com
                </span>
              </div>
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-[#121212] p-8 md:p-10 rounded-lg border border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                ⭐ Rate Our Gym
              </h3>
              {gymTotalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm tracking-widest">
                    {"★".repeat(Math.round(gymAvgRating))}
                    {"☆".repeat(5 - Math.round(gymAvgRating))}
                  </span>
                  <span className="text-white font-black text-sm">
                    {gymAvgRating}
                  </span>
                  <span className="text-gray-500 text-[9px] font-bold uppercase">
                    ({gymTotalReviews})
                  </span>
                </div>
              )}
            </div>
            {!user ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm mb-4">
                  Please login to submit a review.
                </p>
                <Link
                  to="/login"
                  className="bg-red-600 text-white font-bold py-3 px-8 rounded-sm hover:bg-red-700 transition uppercase tracking-widest text-xs"
                >
                  Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: star })
                        }
                        className={`text-3xl transition-all duration-200 hover:scale-125 ${
                          star <= reviewForm.rating
                            ? "text-yellow-500"
                            : "text-gray-700"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazing gym experience!"
                    maxLength={100}
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, title: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                    Your Experience
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell us about your experience..."
                    value={reviewForm.comments}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        comments: e.target.value,
                      })
                    }
                    className="w-full bg-[#1a1a1a] text-white px-5 py-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-600 placeholder-gray-600 border border-transparent focus:border-red-600 transition text-sm resize-none"
                  />
                </div>
                {reviewMsg.text && (
                  <p
                    className={`text-xs font-bold tracking-widest uppercase ${
                      reviewMsg.type === "success"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {reviewMsg.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`bg-red-600 text-white font-bold py-4 px-10 rounded-sm hover:bg-red-700 transition w-full uppercase tracking-widest text-xs shadow-lg shadow-red-600/30 ${
                    submittingReview ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WelcomePage;
