import React from 'react';

interface Props {
  isDarkMode: boolean;
}

const PrivacyPolicy: React.FC<Props> = ({ isDarkMode }) => {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${
      isDarkMode ? 'text-indigo-100' : 'text-gray-700'
    }`}>
      <h1 className={`text-3xl font-bold mb-8 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Privacy Policy
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            1. Information We Collect
          </h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name)</li>
            <li>Reading preferences and history</li>
            <li>Payment information (processed securely by Stripe)</li>
            <li>Usage data and interactions with our service</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the collected information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our services</li>
            <li>Process your payments</li>
            <li>Send you updates and communications</li>
            <li>Personalize your experience</li>
            <li>Analyze usage patterns and optimize our platform</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            3. Data Security
          </h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            Your data is encrypted in transit and at rest. We regularly review and update 
            our security practices to maintain the safety of your information.
          </p>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            4. Your Rights
          </h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:privacy@mysticinsights.com"
              className={`text-indigo-500 hover:text-indigo-600 ${
                isDarkMode ? 'hover:text-indigo-400' : ''
              }`}
            >
              privacy@mysticinsights.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;