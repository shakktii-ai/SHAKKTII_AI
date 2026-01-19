import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RebuildProgressData() {
  const router = useRouter();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from localStorage
    const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
    const id = userObj?._id || userObj?.id || '';
    setUserId(id);
  }, []);

  const handleRebuild = async () => {
    if (!userId) {
      setError("User ID not found. Please log in first.");
      return;
    }

    setIsRebuilding(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rebuildPracticeProgress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setResult(data);
    } catch (err) {
      console.error('Error rebuilding progress:', err);
      setError(err.message || 'Failed to rebuild progress data');
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Rebuild Progress Data</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" 
           style={{ backgroundImage: "url('/BG.jpg')", backgroundSize: 'cover' }}>
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-purple-800 mb-6">
            Rebuild Practice Progress Data
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will rebuild your practice progress data from all your previous practice responses.
            Use this if your progress dashboard is showing zeros or incomplete data.
          </p>
          
          <div className="text-gray-700 mb-4">
            <strong>User ID:</strong> {userId || 'Not found'}
          </div>
          
          <button
            onClick={handleRebuild}
            disabled={isRebuilding || !userId}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isRebuilding || !userId ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } transition-colors mb-4`}
          >
            {isRebuilding ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                Rebuilding...
              </>
            ) : (
              'Rebuild Progress Data'
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
              <p className="mt-2">Processed {result.totalResponses} practice responses.</p>
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
