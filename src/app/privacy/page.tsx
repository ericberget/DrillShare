import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - DrillShare',
  description: 'Privacy Policy for DrillShare.',
};

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Privacy Policy for DrillShare</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: June 21, 2024</p>

        <div className="space-y-4 text-gray-700">
          <p>
            Welcome to DrillShare. This Privacy Policy explains how we handle information in relation to our services.
          </p>

          <h2 className="text-2xl font-semibold pt-4">Facebook API Services</h2>
          <p>
            DrillShare utilizes Facebook's API services to provide certain features. Specifically, when you provide a URL for a public Facebook video, we use the Facebook oEmbed API to retrieve that video's publicly available thumbnail image.
          </p>
          <p>
            We do not request, collect, store, or have access to any personal information, private data, or non-public content from your Facebook account. Our interaction with Facebook is limited to fetching data from public video URLs that you voluntarily provide.
          </p>

          <h2 className="text-2xl font-semibold pt-4">Information We Do Not Collect</h2>
          <p>
            We do not collect any personal data from Facebook users. We do not use cookies or tracking technologies in association with the Facebook API services.
          </p>

          <h2 className="text-2xl font-semibold pt-4">How We Use Information</h2>
          <p>
            The only information we use from the Facebook API is the URL of the thumbnail image for a public video. This thumbnail is displayed within the DrillShare application to provide a visual preview of the video content you wish to link.
          </p>
          
          <h2 className="text-2xl font-semibold pt-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the contact form on our website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 