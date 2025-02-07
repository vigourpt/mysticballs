import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const TermsOfService: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${
      isDarkMode ? 'text-indigo-100' : 'text-gray-700'
    }`}>
      <h1 className={`text-3xl font-bold mb-8 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Terms of Service
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Mystic Insights, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            2. Service Description
          </h2>
          <p className="mb-4">
            Mystic Insights provides spiritual readings and guidance through various methods including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tarot readings</li>
            <li>Numerology calculations</li>
            <li>Astrological insights</li>
            <li>Oracle card readings</li>
            <li>Other divinatory practices</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            3. User Responsibilities
          </h2>
          <p className="mb-4">
            You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate information</li>
            <li>Maintain the security of your account</li>
            <li>Not share your account credentials</li>
            <li>Use the service in compliance with applicable laws</li>
            <li>Not misuse or abuse the service</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            4. Subscription and Payments
          </h2>
          <p className="mb-4">
            Premium features require a subscription. By subscribing, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pay the subscription fees</li>
            <li>Maintain valid payment information</li>
            <li>Accept automatic renewal terms</li>
            <li>Cancel before renewal to avoid charges</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            5. Disclaimer
          </h2>
          <p>
            Our readings are for entertainment and spiritual guidance purposes only. 
            We do not guarantee specific outcomes or results. Do not use our services 
            as a substitute for professional advice (medical, legal, financial, etc.).
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            6. Contact
          </h2>
          <p>
            For questions about these Terms, please contact{' '}
            <a
              href="mailto:support@mysticinsights.com"
              className={`text-indigo-500 hover:text-indigo-600 ${
                isDarkMode ? 'hover:text-indigo-400' : ''
              }`}
            >
              support@mysticinsights.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;