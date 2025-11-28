import React from 'react';

const SuccessScreen = ({ jobTitle, applicationId, submittedAt, email }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-purple-50 to-orange-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-100 p-10 text-center transform transition-all duration-300">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <svg className="h-20 w-20 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Thank you for applying to <span className="font-semibold text-purple-700">{jobTitle}</span>. 
            We have received your application and will review it shortly.
          </p>

          {/* Application Details */}
          <div className="bg-linear-to-br from-purple-50 to-orange-50 rounded-2xl p-6 mb-8 border border-purple-200">
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Application ID:</span> 
                <span className="ml-2 font-mono text-purple-700">{applicationId}</span>
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Submitted on:</span> 
                <span className="ml-2">{new Date(submittedAt).toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Countdown message */}
          <p className="text-sm text-gray-600 mb-6">
            Redirecting back to the job listing in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
