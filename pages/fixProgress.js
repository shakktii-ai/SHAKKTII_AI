import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FixProgress() {
  const router = useRouter();
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progressId, setProgressId] = useState(router.query.id || '');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get progress ID from query parameter if provided
    if (router.query.id) {
      setProgressId(router.query.id);
    }
    
    // Get user ID from localStorage
    const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const id = userObj?._id || userObj?.id || '';
    setUserId(id);
  }, [router.query]);

  const handleFix = async () => {
    if (!progressId) {
      setError("Progress ID is required");
      return;
    }

    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fixProgressData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          progressId,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setResult(data);
    } catch (err) {
      console.error('Error fixing progress:', err);
      setError(err.message || 'Failed to fix progress data');
    } finally {
      setIsFixing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Fix Progress Data</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" 
           style={{ backgroundImage: "url('/BG.jpg')", backgroundSize: 'cover' }}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-purple-800 mb-6">
            Fix Progress Record
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will fix a specific progress record by updating session metrics based on existing practice responses.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="progressId">
              Progress Record ID
            </label>
            <input
              id="progressId"
              type="text"
              value={progressId}
              onChange={(e) => setProgressId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter Progress ID"
            />
          </div>
          
          <button
            onClick={handleFix}
            disabled={isFixing || !progressId}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isFixing || !progressId ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors mb-4`}
          >
            {isFixing ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                Fixing...
              </>
            ) : (
              'Fix Progress Record'
            )}
          </button>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
              <strong>Success!</strong> {result.message}
              
              {result.updatedRecord && (
                <div className="mt-4 text-sm border-t border-green-200 pt-2">
                  <p><strong>Sessions Completed:</strong> {result.updatedRecord.sessionsCompleted}</p>
                  <p><strong>Questions Attempted:</strong> {result.updatedRecord.questionsAttempted}</p>
                  <p><strong>Average Score:</strong> {result.updatedRecord.averageScore.toFixed(2)}</p>
                  <p><strong>Time Spent:</strong> {result.updatedRecord.timeSpent} seconds</p>
                  <p><strong>Last Updated:</strong> {formatDate(result.updatedRecord.lastUpdated)}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push('/practiceProgress')}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              Go to Progress Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
