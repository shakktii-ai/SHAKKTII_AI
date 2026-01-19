import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function AcademicTestHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Check for authentication
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      
      // Get user info
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      if (userObj && (userObj._id || userObj.id)) {
        setUserId(userObj._id || userObj.id);
        // Fetch user test history once we have the user ID
        fetchTestHistory(userObj._id || userObj.id);
      } else {
        router.push("/login");
      }
    }
  }, []);

  // Fetch test history from the database
  const fetchTestHistory = async (userId) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching test history from API...');
      const response = await fetch('/api/getInMemoryTestHistory');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received test history data:', {
        success: data.success,
        testCount: data.tests ? data.tests.length : 0,
        hasTests: !!data.tests && data.tests.length > 0
      });
      
      if (data.success) {
        // Filter tests for the current user if needed
        // For now, we'll show all tests
        console.log('Setting tests in state...');
        setTests(data.tests || []);
        
        if (data.tests && data.tests.length > 0) {
          console.log('Sample test data:', {
            id: data.tests[0]._id,
            subject: data.tests[0].subject,
            score: data.tests[0].overallScore,
            hasTestData: !!data.tests[0].testData
          });
        }
      } else {
        console.error('API returned success:false with error:', data.error);
        setError(data.error || 'Failed to load test history');
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
      setError('An error occurred while fetching your test history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time duration (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render stars for rating
  const renderStars = (count) => {
    return (
      <div className="flex">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-xl ${i < count ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
        ))}
      </div>
    );
  };

  // View test details
  const viewTestDetail = (test) => {
    // Use the test data directly from the API response
    setSelectedTest({
      ...test,
      // Ensure questions and answers arrays are available
      questions: test.testData?.questions || [],
      answers: test.testData?.answers || [],
      correctCount: test.correctCount || 0,
      incorrectCount: test.incorrectCount || 0,
      incorrectQuestions: test.incorrectQuestions || []
    });
    setShowDetail(true);
  };

  // Go back to test history list
  const backToList = () => {
    setShowDetail(false);
    setSelectedTest(null);
  };

  // Return to academic test page to take a new test
  const takeNewTest = () => {
    router.push('/academicTest');
  };

  // Render test history list
  const renderTestList = () => {
    if (tests.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-gray-500 mb-4">You haven't taken any academic tests yet.</div>
          <button 
            onClick={takeNewTest}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Take Your First Test
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {tests.map((test) => (
          <div key={test._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{test.subject}</h3>
                <p className="text-sm text-gray-600">{test.department} • {test.stream}</p>
                <p className="text-xs text-gray-500">{formatDate(test.completedAt)}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{Math.round(test.overallScore)}%</div>
                <div>{renderStars(test.stars)}</div>
                <p className="text-xs text-gray-500">Time: {formatTime(test.timeSpent)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {test.testFormat} • {test.questionCount} question{test.questionCount !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => viewTestDetail(test)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render test details view
  const renderTestDetail = () => {
    if (!selectedTest) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={backToList}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to All Tests
          </button>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {selectedTest.testFormat}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {selectedTest.questionCount} Questions
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{selectedTest.subject}</h2>
          <p className="text-gray-600">{selectedTest.department} • {selectedTest.stream}</p>
          <p className="text-sm text-gray-500">Completed on {formatDate(selectedTest.completedAt)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium mb-1">Score</div>
            <div className="text-3xl font-bold text-blue-700">{Math.round(selectedTest.overallScore)}%</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 font-medium mb-1">Correct</div>
            <div className="text-3xl font-bold text-green-700">{selectedTest.correctCount || 0}</div>
            <div className="text-xs text-green-500 mt-1">out of {selectedTest.questionCount}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="text-sm text-red-600 font-medium mb-1">Incorrect</div>
            <div className="text-3xl font-bold text-red-700">{selectedTest.incorrectCount || 0}</div>
            <div className="text-xs text-red-500 mt-1">needs review</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-600 font-medium mb-1">Time Spent</div>
            <div className="text-3xl font-bold text-gray-700">{formatTime(selectedTest.timeSpent)}</div>
            <div className="text-xs text-gray-500 mt-1">minutes</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-3">Test Summary</h3>
            <p className="text-blue-900 mb-4">{selectedTest.feedback}</p>
            
            {selectedTest.incorrectCount > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-100">
                <h4 className="font-medium text-red-700 mb-2">Areas Needing Improvement</h4>
                <div className="space-y-4">
                  {selectedTest.incorrectQuestions.map((q, idx) => (
                    <div key={`incorrect-${idx}`} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="font-medium text-gray-800">Question: {q.question}</div>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-500">Your answer:</span>
                          <div className="font-medium text-red-600">{q.userAnswer || 'No answer provided'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Correct answer:</span>
                          <div className="font-medium text-green-600">{q.correctAnswer || 'N/A'}</div>
                        </div>
                      </div>
                      {q.explanation && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Explanation:</span> {q.explanation}
                        </div>
                      )}
                      {q.improvementTips && q.improvementTips.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700 mb-1">How to improve:</div>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {q.improvementTips.map((tip, tipIdx) => (
                              <li key={`tip-${idx}-${tipIdx}`}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {selectedTest.subjectMastery && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Subject Mastery</h3>
              {selectedTest.subjectMastery.strengths && selectedTest.subjectMastery.strengths.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-green-700 mb-1">Strengths</h4>
                  <ul className="list-disc list-inside text-green-900 text-sm">
                    {selectedTest.subjectMastery.strengths.map((strength, i) => (
                      <li key={`strength-${i}`}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedTest.subjectMastery.improvements && selectedTest.subjectMastery.improvements.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-green-700 mb-1">Areas for Improvement</h4>
                  <ul className="list-disc list-inside text-green-900 text-sm">
                    {selectedTest.subjectMastery.improvements.map((improvement, i) => (
                      <li key={`improve-${i}`}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedTest.subjectMastery.recommendations && selectedTest.subjectMastery.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-1">Recommendations</h4>
                  <ul className="list-disc list-inside text-green-900 text-sm">
                    {selectedTest.subjectMastery.recommendations.map((rec, i) => (
                      <li key={`rec-${i}`}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={takeNewTest}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Academic Test History | SHAKKTII AI</title>
        <meta name="description" content="View your academic test history and progress" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Academic Test History</h1>
          {!showDetail && (
            <button 
              onClick={takeNewTest}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Take New Test
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your test history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => fetchTestHistory(userId)}
                  className="mt-2 text-sm text-red-800 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : showDetail ? (
          renderTestDetail()
        ) : (
          renderTestList()
        )}
      </div>
    </div>
  );
}

export default AcademicTestHistory;
