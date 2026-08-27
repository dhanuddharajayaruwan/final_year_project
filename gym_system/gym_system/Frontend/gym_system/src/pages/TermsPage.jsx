import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen">
      <Navbar />

      <div className="pt-32 pb-24 px-6 md:px-16 lg:px-24 max-w-5xl mx-auto">
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
            Terms & Conditions
          </h1>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-6 italic">
            Last Updated: March 2026
          </p>
        </div>

        <div className="space-y-12 text-gray-400 font-light leading-relaxed animate-slideUp">
          <section>
            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="text-red-600 text-2xl font-bold">01.</span>{" "}
              Acceptance of Terms
            </h2>
            <p>
              By accessing and using Cylon Force Gym (the "Gym"), you agree to
              be bound by these Terms and Conditions. If you do not agree with
              any part of these terms, you must not use our services or
              facilities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="text-red-600 text-2xl font-bold">02.</span>{" "}
              Membership & Access
            </h2>
            <p className="mb-4">
              Membership is personal to the member and is non-transferable.
              Members must be at least 16 years of age. Those under 18 must have
              parental or guardian consent. Access to the gym is granted only
              upon valid membership and payment confirmation.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Check-in is mandatory upon every visit.</li>
              <li>
                The Gym reserves the right to refuse entry or terminate
                membership for breach of rules.
              </li>
              <li>
                Facilities are subject to availability and maintenance
                schedules.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="text-red-600 text-2xl font-bold">03.</span>{" "}
              Health & Safety
            </h2>
            <p className="mb-4">
              Your safety is our priority, but physical exercise involves
              inherent risks. By using the Gym, you acknowledge that:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                You are in good physical condition and have no medical reason
                that would prevent you from exercising.
              </li>
              <li>
                You will use the equipment properly and follow instructions from
                staff.
              </li>
              <li>
                The Gym is not responsible for any injury or health complication
                arising from the use of our services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="text-red-600 text-2xl font-bold">04.</span>{" "}
              Subscription & Payments
            </h2>
            <p className="mb-4">
              Subscription plans (Online or Blended) are active for the duration
              specified at the time of purchase. Payments are non-refundable
              once the plan has been activated. Online payments are processed
              securely via PayHere, and bank deposits require manual
              verification.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                You may only hold{" "}
                <strong className="text-white">one active subscription</strong>{" "}
                at a time. Duplicate subscriptions to the same plan are not
                permitted while the existing subscription is active or pending.
              </li>
              <li>
                You may{" "}
                <strong className="text-white">upgrade or downgrade</strong>{" "}
                your subscription to a different plan at any time. Doing so will{" "}
                <strong className="text-red-500">immediately cancel</strong>{" "}
                your current subscription.
              </li>
              <li>
                <strong className="text-red-500">No refunds</strong> will be
                issued for any remaining time on a cancelled subscription due to
                an upgrade or downgrade. The new plan takes effect immediately
                upon payment confirmation.
              </li>
              <li>
                After your subscription expires or is cancelled, you are free to
                subscribe to any plan, including the same one.
              </li>
              <li>
                Bank deposit subscriptions remain in &quot;pending&quot; status
                until verified by our team. If verification fails, the
                subscription will not be activated.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white italic uppercase tracking-wider mb-4 flex items-center gap-3">
              <span className="text-red-600 text-2xl font-bold">05.</span> Code
              of Conduct
            </h2>
            <p>
              Members are expected to behave with respect toward staff and other
              members. Harassment, loud behavior, or damaging equipment will
              result in immediate expulsion without refund. Proper gym attire
              and clean indoor footwear are mandatory.
            </p>
          </section>
        </div>

        <div className="mt-20 p-8 bg-[#1a1a1a] rounded-2xl border border-gray-800 text-center">
          <p className="text-gray-300 mb-6">
            If you have any questions regarding these terms, please contact our
            support team.
          </p>
          <a
            href="mailto:support@cylonforcegym.com"
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
