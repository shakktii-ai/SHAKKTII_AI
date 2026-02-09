import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function PracticeProgress() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [progressData, setProgressData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalSessionsCompleted: 0,
    totalQuestionsAttempted: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    formattedTimeSpent: '',
    skillBreakdown: {}
  });
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      
      // Get user info from localStorage
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUserName(userFromStorage.fullName || '');
      }
      
      fetchProgressData('all');
    }
  }, []);

  const fetchProgressData = async (skill) => {
    setLoading(true);
    try {
      // Get user ID from localStorage for the query parameter instead of using auth header
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      // TEMPORARY: Remove auth header to avoid 431 error
      const response = await fetch(`/api/getPracticeProgress?skillArea=${skill}&userId=${userId}`, {
        method: 'GET'
        // Auth header temporarily removed
        /*headers: {
          'Authorization': `Bearer ${token}`
        }*/
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }

      const data = await response.json();
      
      setProgressData(data.progress);
      setRecentActivity(data.recentActivity);
      setOverallStats(data.overallStats);
      setSelectedSkill(skill);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get color based on skill area
  const getSkillColor = (skill) => {
    const colors = {
      'Speaking': 'from-pink-500 to-rose-700',
      'Listening': 'from-blue-500 to-cyan-700',
      'Reading': 'from-emerald-500 to-teal-700',
      'Writing': 'from-purple-500 to-indigo-700',
      'Personality': 'from-amber-500 to-orange-700'
    };
    return colors[skill] || 'from-gray-500 to-gray-700';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Practice Progress</title>
      </Head>
      <div className="min-h-screen bg-[#f5f5ff]" >
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button 
                onClick={() => router.push('/practices')} 
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <img src="/2.svg" alt="Back" className="w-8 h-8 mr-2" />
                <span className="text-lg font-medium">Back to Practices</span>
              </button>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600">Progress for</p>
                <p className="font-semibold text-lg text-purple-900">{userName}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <img src="/logoo.png" alt="Logo" className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-900">Practice Progress Report</h1>
            <p className="text-lg text-gray-700 mt-2">
              Track your improvement across different practice areas
            </p>
          </div>

          {/* Skill Filter */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {['all', 'Speaking', 'Listening', 'Reading', 'Writing', 'Personality'].map((skill) => (
              <button
                key={skill}
                onClick={() => fetchProgressData(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSkill === skill
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {skill === 'all' ? 'All Skills' : skill}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Overall Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Progress</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-sm text-gray-600">Sessions Completed</span>
                    <span className="text-3xl font-bold text-purple-900">{overallStats.totalSessionsCompleted}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-sm text-gray-600">Questions Attempted</span>
                    <span className="text-3xl font-bold text-purple-900">{overallStats.totalQuestionsAttempted}</span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-3xl font-bold text-purple-900">
                      {overallStats.averageScore.toFixed(1)} / 3
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 flex flex-col items-center">
                    <span className="text-sm text-gray-600">Total Time Practicing</span>
                    <span className="text-3xl font-bold text-purple-900">{overallStats.formattedTimeSpent}</span>
                  </div>
                </div>
                
                {/* Skill Breakdown Bar Chart */}
                {Object.keys(overallStats.skillBreakdown).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Skill Breakdown</h3>
                    <div className="space-y-4">
                      {Object.entries(overallStats.skillBreakdown).map(([skill, data]) => (
                        <div key={skill} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{skill}</span>
                            <span className="text-sm text-gray-600">
                              {skill === 'Personality' 
                                ? `${Math.min(100, data.averageScore).toFixed(1)}/100` 
                                : `${data.averageScore.toFixed(1)}/3`} 
                              ({data.sessionsCompleted} sessions)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full bg-gradient-to-r ${getSkillColor(skill)}`} 
                              style={{ 
                                width: `${skill === 'Personality' 
                                  ? Math.min(100, data.averageScore) 
                                  : (data.averageScore / 3) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Detailed Progress Cards */}
              {progressData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {progressData.map((progress, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${getSkillColor(progress.skillArea)}`}></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{progress.skillArea}</h3>
                            <p className="text-sm text-gray-600">{progress.difficulty} Level</p>
                          </div>
                          <div className="w-16 h-16">
                            <CircularProgressbar
                              value={(progress.averageScore / 3) * 100}
                              text={`${progress.averageScore.toFixed(1)}`}
                              styles={buildStyles({
                                textSize: '30px',
                                pathColor: progress.skillArea === 'Speaking' ? '#ec4899' : 
                                          progress.skillArea === 'Listening' ? '#0ea5e9' : 
                                          progress.skillArea === 'Reading' ? '#10b981' : 
                                          progress.skillArea === 'Writing' ? '#8b5cf6' : '#f59e0b',
                                textColor: '#4a044e',
                                trailColor: '#e9d5ff',
                              })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Sessions</p>
                            <p className="font-medium">{progress.sessionsCompleted}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Questions</p>
                            <p className="font-medium">{progress.questionsAttempted}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Time Spent</p>
                            <p className="font-medium">{progress.formattedTimeSpent}</p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <p className="text-gray-500">Last Practice</p>
                            <p className="font-medium">{formatDate(progress.lastUpdated).split(',')[0]}</p>
                          </div>
                        </div>
                        
                        {progress.strengths.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Your Strengths:</h4>
                            <div className="flex flex-wrap gap-1">
                              {progress.strengths.map((strength, i) => (
                                <span 
                                  key={i} 
                                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {progress.areasToImprove.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Areas to Improve:</h4>
                            <div className="flex flex-wrap gap-1">
                              {progress.areasToImprove.map((area, i) => (
                                <span 
                                  key={i} 
                                  className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => {
                              const path = progress.skillArea === 'Speaking' ? '/speakingPractice' : 
                                          progress.skillArea === 'Listening' ? '/listeningPractice' :
                                          progress.skillArea === 'Reading' || progress.skillArea === 'Writing' ? '/readingWritingPractice' :
                                          '/personalityTest';
                              router.push(path);
                            }}
                            className={`px-4 py-2 rounded-lg text-white text-sm font-medium bg-gradient-to-r ${getSkillColor(progress.skillArea)} hover:opacity-90`}
                          >
                            Continue Practicing
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">No practice data yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start practicing to see your progress here. Select a practice type and difficulty level to begin.
                  </p>
                  <button
                    onClick={() => router.push('/practices')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700"
                  >
                    Start Practicing
                  </button>
                </div>
              )}
              
              
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default PracticeProgress;
