import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const InterviewProgress = ({ userData = null }) => {
  const router = useRouter();
  const [interviewStats, setInterviewStats] = useState({
    no_of_interviews: 1,
    no_of_interviews_completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // First set stats from props or localStorage for immediate display
    if (userData) {
      setInterviewStats({
        no_of_interviews: userData.no_of_interviews || 1,
        no_of_interviews_completed: userData.no_of_interviews_completed || 0,
      });
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
      setInterviewStats({
        no_of_interviews: userFromStorage.no_of_interviews || 1,
        no_of_interviews_completed: userFromStorage.no_of_interviews_completed || 0,
      });
    }
    
    // Then fetch the latest data from the API
    fetchUserStats();
  }, [userData]);
  
  const fetchUserStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get email from localStorage
      const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
      const email = userFromStorage.email;
      
      if (!email) {
        setLoading(false);
        return;
      }
      
      // Try to fetch from API but don't break the component if it fails
      try {
        const response = await fetch(`/api/getUserStats?email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.stats) {
            // Update the stats with the latest data from the API
            setInterviewStats({
              no_of_interviews: data.stats.no_of_interviews || 1,
              no_of_interviews_completed: data.stats.no_of_interviews_completed || 0,
            });
            
            // Also update the user in localStorage for consistency
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = {
              ...currentUser,
              no_of_interviews: data.stats.no_of_interviews,
              no_of_interviews_completed: data.stats.no_of_interviews_completed
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } else {
          // If API fails, use the user data from localStorage as fallback
          console.log('Using fallback user data from localStorage');
        }
      } catch (apiErr) {
        // If there's an error with the API, log it but don't break the component
        console.log('API request failed, using localStorage data instead');
      }
    } catch (err) {
      console.error('Error processing user stats:', err);
      setError('Unable to load interview statistics');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle starting a new interview
  const handleStartInterview = () => {
    router.push('/role');
  };

  // Calculate completion percentage
  const completionPercentage = 
    (interviewStats.no_of_interviews_completed / Math.max(interviewStats.no_of_interviews, 1)) * 100;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6 relative">
      {loading && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4 text-white">Interview Completion Progress</h2>
      
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-medium text-white">Interviews Completed</span>
        <span className="text-xl font-bold text-white">
          {interviewStats.no_of_interviews_completed} / {interviewStats.no_of_interviews}
        </span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-pink-500 h-4 rounded-full transition-all duration-500" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      
      <div className="mt-4 text-sm text-gray-300">
        {interviewStats.no_of_interviews_completed === 0 
          ? "You haven't completed any interviews yet. Start your first interview to see your progress!" 
          : interviewStats.no_of_interviews_completed === interviewStats.no_of_interviews 
            ? "Congratulations! You've completed all available interviews. Great job!" 
            : `You've completed ${interviewStats.no_of_interviews_completed} out of ${interviewStats.no_of_interviews} interviews. Keep going!`}
      </div>
      
      {interviewStats.no_of_interviews_completed < interviewStats.no_of_interviews && (
        <div className="mt-6 text-center">
          <button 
            onClick={handleStartInterview} 
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white rounded-lg shadow-lg hover:from-indigo-700 hover:to-pink-600 transition-all duration-200"
          >
            Start Next Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewProgress;
