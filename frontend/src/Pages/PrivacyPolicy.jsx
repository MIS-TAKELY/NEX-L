import { useEffect } from "react";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-outfit text-gray-800 flex flex-col">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        className="relative w-full h-80 flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0d1f30 0%, #1B3452 50%, #2a4f78 100%)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

        <div className="relative z-10 text-center select-none px-4">
          <p className="text-white/50 tracking-[0.3em] uppercase text-sm mb-3">
            — &nbsp; Legal Information &nbsp; —
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Privacy Policy
          </h1>
          <div className="w-16 h-1 bg-white/50 mx-auto rounded-full" />
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <main className="flex-grow py-16 px-6 sm:px-12 lg:px-24 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-8">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to NEXL. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at nexl6911@gmail.com.
            </p>
            <p className="text-gray-600 leading-relaxed">
              When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy note, we describe our privacy policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when registering at the website, expressing an interest in obtaining information about us or our products and services, when participating in activities on the website, or otherwise contacting us.
            </p>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, phone number, passwords, and billing information.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the website, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the website.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders and course enrollments.</li>
              <li>To deliver services to the user.</li>
              <li>To respond to user inquiries and offer support.</li>
              <li>To request feedback.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary mb-4">4. Will Your Information Be Shared With Anyone?</h2>
            <p className="text-gray-600 leading-relaxed">
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, or Legal Obligations.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary mb-4">5. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions or comments about this policy, you may email us at nexl6911@gmail.com or by post to:
            </p>
            <address className="not-italic text-gray-600 mt-4 pl-4 border-l-4 border-primary">
              NEXL<br />
              Itahari, Nepal<br />
              +977 9800000000
            </address>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
