import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Information - DrillShare',
  description: 'Instructions for data deletion for DrillShare.',
};

const DataDeletionPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Data Deletion Information</h1>
        <p className="text-sm text-gray-500 mb-6">Last Updated: June 21, 2024</p>

        <div className="space-y-4 text-gray-700">
          <h2 className="text-2xl font-semibold">Facebook API Services</h2>
          <p>
            DrillShare does not request, collect, or store any personal information, private data, or non-public content from your Facebook account.
          </p>
          <p>
            The only data we interact with is the publicly available thumbnail URL for a public video that you provide. This information is not stored in association with your personal identity or account. Because no personal data is stored, there is no data to delete.
          </p>

          <h2 className="text-2xl font-semibold pt-4">How to Request Deletion</h2>
          <p>
            As no personal data from Facebook is stored by our service, no data deletion action is necessary.
          </p>
          
          <h2 className="text-2xl font-semibold pt-4">Contact Us</h2>
          <p>
            If you have any questions or concerns about our data practices, please contact us through the contact form on our website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPage; 