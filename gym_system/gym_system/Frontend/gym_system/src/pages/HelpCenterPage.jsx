import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const categories = [
  {
    icon: "🏋️",
    title: "Getting Started",
    articles: [
      "How to create your account",
      "Setting up your member profile",
      "Choosing your first subscription plan",
      "How to book a training session",
    ],
  },
  {
    icon: "💳",
    title: "Billing & Payments",
    articles: [
      "Accepted payment methods",
      "How to upgrade or downgrade your plan",
      "Subscription cancellation policy",
      "Bank deposit verification process",
    ],
  },
  {
    icon: "🛒",
    title: "Shop & Orders",
    articles: [
      "How to place an order",
      "Tracking your delivery",
      "Return and refund policy",
      "Delivery fee calculator by district",
    ],
  },
  {
    icon: "👤",
    title: "Account & Profile",
    articles: [
      "How to update your profile photo",
      "Changing your password",
      "Viewing your body stats history",
      "Deleting your account",
    ],
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    articles: [
      "What can the AI assistant help with?",
      "How to ask about products",
      "How to ask about training plans",
      "Limitations of the AI assistant",
    ],
  },
  {
    icon: "📞",
    title: "Contact & Support",
    articles: [
      "How to reach our support team",
      "Live chat with a trainer",
      "Reporting a technical issue",
      "Response time expectations",
    ],
  },
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      articles: cat.articles.filter((a) =>
        a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.articles.length > 0 || !search);

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-16 px-6 md:px-16 lg:px-24 text-center bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
          Help <span className="text-red-600">Center</span>
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-gray-400 text-sm font-light max-w-xl mx-auto mb-10">
          Find answers to your questions about Cylon Force Gym.
        </p>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for help articles..."
            className="w-full bg-[#222] border border-gray-700 text-white px-6 py-4 rounded-full focus:outline-none focus:border-red-600 text-sm placeholder-gray-600 pr-14 transition"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
            🔍
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 hover:border-red-600/40 transition group"
            >
              <div className="text-3xl mb-4">{cat.icon}</div>
              <h3 className="text-white font-black italic uppercase tracking-tight text-lg mb-5 group-hover:text-red-500 transition">
                {cat.title}
              </h3>
              <ul className="space-y-3">
                {cat.articles.map((article, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <span className="text-red-600 mt-0.5 flex-shrink-0">→</span>
                    {article}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-16 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-3">
            Still Need <span className="text-red-600">Help?</span>
          </h3>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Can't find what you're looking for? Our support team is ready to
            assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/#contact"
              className="bg-red-600 text-white font-black tracking-widest text-xs uppercase px-8 py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20"
            >
              Contact Us
            </Link>
            <Link
              to="/faqs"
              className="border border-gray-700 text-gray-300 font-black tracking-widest text-xs uppercase px-8 py-4 rounded-xl hover:border-red-600 hover:text-white transition"
            >
              Browse FAQs
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
