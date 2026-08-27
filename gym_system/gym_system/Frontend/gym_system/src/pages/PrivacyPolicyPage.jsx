import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us when you create an account, purchase products, book training sessions, or contact us for support. This includes:

• Personal identifiers: name, email address, phone number, date of birth
• Account credentials: username and encrypted password
• Profile data: profile photo, fitness goals, body measurements, and health stats
• Payment information: bank reference numbers and transaction details (we do not store full card numbers)
• Shipping information: delivery address, city, and contact details for orders
• Communications: messages you send through our contact form or AI assistant`,
  },
  {
    title: "How We Use Your Information",
    content: `Cylon Force Gym uses the information we collect to:

• Create and manage your account and member profile
• Process orders, subscriptions, and gym memberships
• Schedule and coordinate personal training sessions
• Send transactional emails (order confirmations, payment receipts)
• Personalize your experience and provide AI-powered fitness recommendations
• Respond to your inquiries and provide customer support
• Improve our platform, services, and product offerings
• Comply with legal obligations and enforce our Terms of Service`,
  },
  {
    title: "Data Sharing & Disclosure",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your data only in these limited circumstances:

• Service providers: Third-party vendors who assist us in operating our website and providing services (payment processors, delivery partners, email platforms) under strict confidentiality obligations
• Legal requirements: When required by law, court order, or government authority
• Business transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction
• With your consent: Any other sharing we will seek your explicit consent for first`,
  },
  {
    title: "Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to improve your browsing experience. These include:

• Essential cookies: Required for core site functionality (authentication sessions, cart storage)
• Preference cookies: Remember your display settings and preferences
• Analytics cookies: Help us understand how visitors interact with our platform

You can control cookies through your browser settings. Disabling certain cookies may affect some features of the site.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal data:

• Passwords are hashed using bcrypt before storage — we never store plaintext passwords
• JWT tokens are used for stateless authenticated sessions
• All data transmission is encrypted via HTTPS/TLS
• Access to user data is restricted to authorized personnel only
• Regular security reviews are conducted on our codebase and infrastructure

No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: "Data Retention",
    content: `We retain your personal information for as long as your account remains active or as needed to provide services. Specifically:

• Account data is retained until you request deletion
• Order history is kept for 7 years for legal and tax compliance
• Body stat logs are retained until you delete them from your profile
• Contact form messages are kept for up to 12 months
• When you delete your account, we anonymize or delete your personal data within 30 days`,
  },
  {
    title: "Your Rights",
    content: `You have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request corrections to inaccurate or incomplete data
• Deletion: Request deletion of your account and associated data
• Portability: Request your data in a structured, machine-readable format
• Objection: Object to specific uses of your data

To exercise any of these rights, please contact us at privacy@cylonforce.com or use the Contact Us form.`,
  },
  {
    title: "Children's Privacy",
    content: `Cylon Force Gym services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete it.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make material changes, we will notify you by:

• Posting the updated policy on this page with a new "Last Updated" date
• Sending an email notification to registered users

Your continued use of Cylon Force Gym after any changes constitutes your acceptance of the new Privacy Policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to us:

• Email: privacy@cylonforce.com
• Phone: +1 (555) 123-4567
• Address: 123 Fitness Avenue, Muscle City
• Contact Form: cylonforce.com/#contact`,
  },
];

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
            Privacy <span className="text-red-600">Policy</span>
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-sm">Last Updated: January 2025</p>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-4">
            At Cylon Force Gym, we are committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your
            personal information.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 mb-10">
          <h3 className="text-white font-black italic uppercase tracking-tight text-sm mb-5 text-red-600">
            Quick Navigation
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-gray-400 hover:text-red-500 text-sm transition flex items-center gap-2"
                >
                  <span className="text-red-600 text-xs">→</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              id={`section-${i}`}
              key={i}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 scroll-mt-32"
            >
              <h2 className="text-xl font-black italic uppercase text-red-600 tracking-tight mb-5">
                {section.title}
              </h2>
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-xs mb-6">
            By using Cylon Force Gym, you agree to this Privacy Policy. See also
            our{" "}
            <Link to="/terms" className="text-red-500 hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
