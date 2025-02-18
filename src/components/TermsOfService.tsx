import React from 'react';

interface Props {
  isDarkMode: boolean;
  onBack: () => void;
}

const TermsOfService: React.FC<Props> = ({ isDarkMode, onBack }) => {
  return (
    <div className={`container mx-auto px-4 py-8 text-indigo-200 ${isDarkMode ? 'dark-mode' : ''}`}>
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 px-4 py-2 text-white bg-indigo-900/40 hover:bg-indigo-900/60 rounded-lg transition-colors"
      >
        <span>←</span>
        Back to Home
      </button>
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Mystic Balls, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Service Description</h2>
          <p className="mb-4">
            Mystic Balls provides digital divination and spiritual guidance services, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tarot readings</li>
            <li>Numerology calculations</li>
            <li>Astrological interpretations</li>
            <li>Oracle card readings</li>
            <li>Rune casting</li>
            <li>I Ching consultations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
          <p className="mb-4">
            To access certain features of our Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly update any changes to your information</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
          <p className="mb-4">
            Our service offers both free and premium features:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free tier includes limited readings per month</li>
            <li>Premium subscriptions provide additional features and readings</li>
            <li>All payments are processed securely through our payment provider</li>
            <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimer</h2>
          <p>
            Our readings and interpretations are for entertainment and self-reflection purposes only. We do not guarantee specific outcomes or results. Users should exercise their own judgment and not rely solely on our services for making important life decisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of Mystic Balls, including but not limited to text, graphics, logos, and software, are owned by us and protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of any changes by posting the updated Terms on this page. Your continued use of the Service after any modifications indicates your acceptance of the updated Terms.
          </p>
        </section>

        <p className="text-sm text-indigo-300 mt-8">
          Last Updated: February 8, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;