import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const faqData = [
  {
    category: "Membership & Subscriptions",
    icon: "💳",
    faqs: [
      {
        q: "What membership plans does Cylon Force Gym offer?",
        a: "We offer multiple subscription tiers designed for different goals — from basic gym access to premium plans that include personal training sessions, nutrition guidance, and exclusive training clips. Visit the Subscriptions page to compare plans and pricing.",
      },
      {
        q: "How do I upgrade or downgrade my plan?",
        a: "Log in to your member dashboard, go to the Subscriptions section, and select a new plan. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.",
      },
      {
        q: "Can I cancel my subscription at any time?",
        a: "Yes. You can cancel your subscription from your dashboard at any time. You will retain access until the end of your current billing period. No refunds are issued for unused days in the current cycle.",
      },
      {
        q: "Is there a free trial available?",
        a: "We occasionally offer promotional free trials. Follow our social media pages or check our homepage banners for current offers.",
      },
    ],
  },
  {
    category: "Training & Schedules",
    icon: "🏋️",
    faqs: [
      {
        q: "How do I book a training session?",
        a: "Log in to your account and navigate to the Schedules section in your member dashboard. Select an available trainer, choose a date and time, and confirm your booking. You'll receive a confirmation notification.",
      },
      {
        q: "Can I choose my own trainer?",
        a: "Absolutely. Our Trainers page lets you browse trainer profiles including their specializations, certifications, and experience. You can select a preferred trainer when booking a session.",
      },
      {
        q: "What happens if I need to cancel a booked session?",
        a: "You can cancel a scheduled session up to 24 hours before the start time through your dashboard without penalty. Late cancellations within the 24-hour window may be counted as a used session.",
      },
      {
        q: "Are training clips included in all plans?",
        a: "Training clips are available based on your subscription tier. Premium plan subscribers get full access to all training clips. Check your plan's feature list for details.",
      },
    ],
  },
  {
    category: "Shop & Orders",
    icon: "🛒",
    faqs: [
      {
        q: "What products are available in the shop?",
        a: "Our shop carries a curated selection of gym equipment, supplements, activewear, and accessories — all vetted for quality. Browse by category using the filters on the Shop page.",
      },
      {
        q: "How long does delivery take?",
        a: "Delivery times vary by District. Standard delivery typically takes 3–7 business days. You can view the estimated delivery time and fee for your area on the checkout page.",
      },
      {
        q: "How do I track my order?",
        a: "Once your order is dispatched, you'll receive a tracking update in your dashboard under Orders. Navigate to any order to see its current shipping status and estimated arrival.",
      },
      {
        q: "What is your return policy?",
        a: "We accept returns on unopened, undamaged products within 14 days of delivery. Supplements and personal items are non-returnable for hygiene reasons. Contact our support team to initiate a return.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    icon: "💰",
    faqs: [
      {
        q: "What payment methods are accepted?",
        a: "We currently accept bank transfers and deposits. After placing an order or subscribing to a plan, you'll receive bank details and a reference code. Submit your payment receipt through the platform for verification.",
      },
      {
        q: "How long does payment verification take?",
        a: "Payment verification typically takes 1–2 business days. Our team manually reviews uploaded receipts. You'll be notified once your payment is confirmed and your order or subscription is activated.",
      },
      {
        q: "Will I receive a receipt for my payment?",
        a: "Yes. Once your payment is verified, you'll receive a confirmation in your dashboard history and an email receipt.",
      },
      {
        q: "Are there any extra fees on top of the listed prices?",
        a: "Shop orders include a delivery fee based on your district. Subscription prices are flat with no hidden fees. All pricing is clearly shown before you confirm any purchase.",
      },
    ],
  },
  {
    category: "Account & Profile",
    icon: "👤",
    faqs: [
      {
        q: "How do I update my profile information?",
        a: "Go to your Member Dashboard and navigate to the Profile tab. You can update your display name, profile photo, contact details, and fitness goals from there.",
      },
      {
        q: "How do I change my password?",
        a: "Log in and go to your Profile settings. Click 'Change Password', enter your current password, then set a new one. We recommend using a strong, unique password.",
      },
      {
        q: "What is the Body Info section used for?",
        a: "The Body Info section lets you log and track your physical stats over time — including weight, height, BMI, and body measurements. Tracking these helps you and your trainer monitor your fitness progress.",
      },
      {
        q: "How do I delete my account?",
        a: "Account deletion requests can be submitted by contacting our support team at support@cylonforce.com. We will process the deletion within 30 days and confirm via email.",
      },
    ],
  },
  {
    category: "AI Assistant",
    icon: "🤖",
    faqs: [
      {
        q: "What can I ask the AI assistant?",
        a: "Our AI assistant is powered by Google Gemini and has knowledge of our current products, subscription plans, trainers, and delivery pricing. Ask it about available equipment, plan comparisons, trainer specializations, or delivery fees.",
      },
      {
        q: "Does the AI assistant give personalized fitness advice?",
        a: "The AI assistant provides general information based on our gym's offerings. For personalized fitness or nutrition plans, we recommend booking a session with one of our certified trainers.",
      },
      {
        q: "Is my conversation with the AI assistant private?",
        a: "Your chat messages are not linked to your personal profile or stored beyond the current session. The assistant does not have access to your personal account data, order history, or body stats.",
      },
    ],
  },
];

const FaqItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-800/30 transition"
      >
        <span className="text-white text-sm font-semibold">{faq.q}</span>
        <span
          className={`text-red-600 text-xl flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
          {faq.a}
        </p>
      </div>
    </div>
  );
};

const FaqsPage = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const displayData = activeCategory
    ? faqData.filter((d) => d.category === activeCategory)
    : faqData;

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-16 px-6 md:px-16 lg:px-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
          Frequently Asked <span className="text-red-600">Questions</span>
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Got questions? We've got answers. Browse by category or scroll through
          all FAQs below.
        </p>
      </div>

      <div className="pb-24 px-6 md:px-16 lg:px-24 max-w-5xl mx-auto">
        {/* Category filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition ${
              activeCategory === null
                ? "bg-red-600 text-white"
                : "border border-gray-700 text-gray-400 hover:border-red-600 hover:text-white"
            }`}
          >
            All
          </button>
          {faqData.map((d, i) => (
            <button
              key={i}
              onClick={() =>
                setActiveCategory(
                  activeCategory === d.category ? null : d.category
                )
              }
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition flex items-center gap-2 ${
                activeCategory === d.category
                  ? "bg-red-600 text-white"
                  : "border border-gray-700 text-gray-400 hover:border-red-600 hover:text-white"
              }`}
            >
              <span>{d.icon}</span> {d.category}
            </button>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {displayData.map((section, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-white font-black italic uppercase tracking-tighter text-xl">
                  {section.category}
                </h2>
              </div>
              <div className="space-y-3 bg-[#1a1a1a] rounded-2xl p-6">
                {section.faqs.map((faq, j) => (
                  <FaqItem key={j} faq={faq} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-[#1a1a1a] border border-gray-800 rounded-3xl p-10 text-center">
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-3">
            Still Have <span className="text-red-600">Questions?</span>
          </h3>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Couldn't find your answer? Our support team is happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/#contact"
              className="bg-red-600 text-white font-black tracking-widest text-xs uppercase px-8 py-4 rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20"
            >
              Contact Support
            </Link>
            <Link
              to="/help-center"
              className="border border-gray-700 text-gray-300 font-black tracking-widest text-xs uppercase px-8 py-4 rounded-xl hover:border-red-600 hover:text-white transition"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FaqsPage;
