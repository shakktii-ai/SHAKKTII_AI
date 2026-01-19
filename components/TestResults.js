import React from 'react';

const TestResults = ({ results, onRetakeTest }) => {
  if (!results) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto rounded-xl overflow-hidden bg-white shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-black text-white p-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{results.personalityType || 'Your Personality Profile'}</h1>
          <p className="text-lg text-blue-200">
            Your unique personality profile based on the assessment
          </p>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Overall Summary */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-8 shadow-lg text-white">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white">Executive Summary</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              {(results.executiveSummary || results.summary || '').split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph || <br />}</p>
              ))}
            </div>
            {results.reportId && (
              <p className="text-sm text-blue-200 text-opacity-80 mt-4">
                Report ID: {results.reportId}
              </p>
            )}
          </div>

          {/* Key Traits */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Strengths</h3>
              <ul className="space-y-4">
                {results.strengths.map((strength, index) => (
                  <li key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">{strength.title}</h4>
                    {strength.description && (
                      <p className="mt-1 text-gray-700 text-sm">{strength.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Growth */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Areas For Growth</h3>
              <ul className="space-y-4">
                {results.areasForGrowth.map((area, index) => (
                  <li key={index} className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">{area.title}</h4>
                    {area.description && (
                      <p className="mt-1 text-gray-700 text-sm">{area.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Matches */}
          {results.careerMatches && results.careerMatches.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Career Matches</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {results.careerMatches.map((career, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-blue-800">{career.title}</h4>
                    {career.description && (
                      <p className="mt-1 text-gray-700 text-sm">{career.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Development Suggestions */}
          <div className="bg-gradient-to-r from-blue-900 to-black text-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-white">Development Suggestions</h3>
            <div className="space-y-6">
              {results.recommendations.map((rec, index) => (
                <div key={index} className="bg-white bg-opacity-10 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">{rec.title || `Suggestion ${index + 1}`}</h4>
                      <p className="mt-1 text-blue-50">{rec.description || rec}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-transparent border-2 border-black text-black rounded-lg hover:bg-[#D2E9FA] hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              onClick={onRetakeTest}
              className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Return to Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
