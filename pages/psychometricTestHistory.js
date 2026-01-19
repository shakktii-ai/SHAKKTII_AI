import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function PsychometricTestHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    let userId = null;
    let email = null;
    
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        userId = userData._id;
        email = userData.email;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
    
    // If no user ID from localStorage, use session or generate a temporary one
    if (!userId) {
      userId = sessionStorage.getItem('userId') || Date.now().toString();
      sessionStorage.setItem('userId', userId);
    }
    
    // If no email from localStorage, use session or generate a temporary one
    if (!email) {
      email = sessionStorage.getItem('userEmail') || `guest_${Date.now()}@example.com`;
      sessionStorage.setItem('userEmail', email);
    }
    
    fetchTestHistory(userId, email);
  }, []);

  const fetchTestHistory = async (userId, email) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/psychometricTests/getTestHistory', {
        params: { userId, userEmail: email }
      });
      
      if (response.data && response.data.success && response.data.history) {
        console.log('Fetched test history:', response.data.history);
        
        // Transform the data to match the expected format
        const formattedTests = response.data.history.map(test => {
          return {
            _id: test._id,
            profileType: test.profileType,
            createdAt: test.createdAt,
            completedAt: test.completedAt,
            response: {
              results: test.results || {},
              completedAt: test.completedAt
            }
          };
        });
        
        setTests(formattedTests);
        if (formattedTests.length > 0) {
          setSelectedTest(formattedTests[0]);
        }
      } else {
        setTests([]);
        toast.info('No test history found');
      }
    } catch (error) {
      console.error('Error fetching test history:', error);
      toast.error('Failed to load test history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStarRating = (score) => {
    const maxScore = 3;
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5;
    const emptyStars = Math.floor(maxScore - score);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        ))}
        {halfStar && (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        ))}
      </div>
    );
  };

  const renderProgressBar = (score, maxScore = 3, colorClass = 'bg-blue-500') => {
    const percentage = (score / maxScore) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 2.5) return 'bg-green-500';
    if (score >= 1.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Function to prepare radar chart data from competency scores
  const prepareRadarChartData = (results) => {
    // Default labels and data for the radar chart
    let labels = [];
    let data = [];
    
    // Check if this is a student profile by looking for student-specific competencies
    const isStudentProfile = results.academicCollaboration || results.learningEthics;
    
    if (isStudentProfile) {
      // Student profile competencies
      const studentCompetencies = [
        { key: 'academicCollaboration', label: 'Academic Collaboration' },
        { key: 'learningEthics', label: 'Learning Ethics' },
        { key: 'educationalLeadership', label: 'Educational Leadership' },
        { key: 'studyGroupDynamics', label: 'Study Group Dynamics' },
        { key: 'academicConflictResolution', label: 'Academic Conflict Resolution' },
        { key: 'classroomParticipation', label: 'Classroom Participation' }
      ];
      
      // Filter to only include competencies that exist in the results
      const availableCompetencies = studentCompetencies.filter(comp => results[comp.key]);
      
      // Extract labels and data
      labels = availableCompetencies.map(comp => comp.label);
      data = availableCompetencies.map(comp => {
        // If the competency is an object with a score, use that score
        if (typeof results[comp.key] === 'object' && results[comp.key].score !== undefined) {
          return results[comp.key].score;
        }
        // Otherwise, if it's a number, use the number
        else if (typeof results[comp.key] === 'number') {
          return results[comp.key];
        }
        // Default fallback
        return 2;
      });
    } else {
      // Employee profile competencies
      const employeeCompetencies = [
        { key: 'empathy', label: 'Empathy' },
        { key: 'assertiveness', label: 'Assertiveness' },
        { key: 'ethicalReasoning', label: 'Ethical Reasoning' },
        { key: 'collaboration', label: 'Collaboration' },
        { key: 'conflictResolution', label: 'Conflict Resolution' },
        { key: 'leadershipPotential', label: 'Leadership Potential' },
        { key: 'strategicThinking', label: 'Strategic Thinking' },
        { key: 'adaptability', label: 'Adaptability' }
      ];
      
      // Filter to only include competencies that exist in the results
      const availableCompetencies = employeeCompetencies.filter(comp => results[comp.key]);
      
      // Extract labels and data
      labels = availableCompetencies.map(comp => comp.label);
      data = availableCompetencies.map(comp => {
        // If the competency is an object with a score, use that score
        if (typeof results[comp.key] === 'object' && results[comp.key].score !== undefined) {
          return results[comp.key].score;
        }
        // Otherwise, if it's a number, use the number
        else if (typeof results[comp.key] === 'number') {
          return results[comp.key];
        }
        // Default fallback
        return 2;
      });
    }
    
    // If no data was found, provide some defaults
    if (labels.length === 0) {
      labels = ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Adaptability'];
      data = [2, 2, 2, 2, 2];
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Competency Score',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    };
  };
  
  // Chart options with custom tooltip
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 3,
        ticks: {
          stepSize: 1,
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.r !== null) {
              label += context.parsed.r.toFixed(1) + '/3';
            }
            return label;
          },
          afterLabel: function(context) {
            // Check if we have competency data in the chart
            if (context.chart.data.competencyResults && context.chart.data.competencyKeys) {
              const competencyKey = context.chart.data.competencyKeys[context.dataIndex];
              const competencyData = context.chart.data.competencyResults[competencyKey];
              
              if (competencyData && competencyData.comments) {
                return '\nComments: ' + competencyData.comments;
              }
            }
            return '';
          }
        }
      },
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false
  };

  const renderCompetencyCard = (title, data) => {
    if (!data) return null;
    
    // Handle different data formats
    let score, comments, developmentTips, strengthLevel;
    if (typeof data === 'object') {
      score = data.score !== undefined ? data.score : 2;
      comments = data.comments || '';
      developmentTips = data.developmentTips || '';
      strengthLevel = data.strengthLevel || '';
    } else if (typeof data === 'number') {
      score = data;
      comments = '';
      developmentTips = '';
      strengthLevel = '';
    } else {
      return null; // Invalid data format
    }
    
    const scoreColor = getScoreColor(score);
    
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="font-medium text-gray-800">{title}</h3>
            {strengthLevel && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {strengthLevel}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-sm font-semibold mr-2">{score.toFixed(1)}/3</span>
            {renderStarRating(score)}
          </div>
        </div>
        
        <div className="mb-3">
          {renderProgressBar(score, 3, scoreColor)}
        </div>
        
        <div className="space-y-2">
          {comments && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Assessment:</h4>
              <p className="text-sm text-gray-600">{comments}</p>
            </div>
          )}
          
          {developmentTips && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Development Tips:</h4>
              <p className="text-sm text-gray-600">{developmentTips}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (selectedTest && selectedTest.response && selectedTest.response.results) {
      // Prepare chart data
      const radarData = prepareRadarChartData(selectedTest.response.results);
      
      // Add competency results and keys to the chart data for tooltip access
      const isStudentProfile = selectedTest.response.results.academicCollaboration || selectedTest.response.results.learningEthics;
      const competencyMappings = isStudentProfile
        ? [
            { key: 'academicCollaboration', label: 'Academic Collaboration' },
            { key: 'learningEthics', label: 'Learning Ethics' },
            { key: 'educationalLeadership', label: 'Educational Leadership' },
            { key: 'studyGroupDynamics', label: 'Study Group Dynamics' },
            { key: 'academicConflictResolution', label: 'Academic Conflict Resolution' },
            { key: 'classroomParticipation', label: 'Classroom Participation' }
          ]
        : [
            { key: 'empathy', label: 'Empathy' },
            { key: 'assertiveness', label: 'Assertiveness' },
            { key: 'ethicalReasoning', label: 'Ethical Reasoning' },
            { key: 'collaboration', label: 'Collaboration' },
            { key: 'conflictResolution', label: 'Conflict Resolution' },
            { key: 'leadershipPotential', label: 'Leadership Potential' },
            { key: 'strategicThinking', label: 'Strategic Thinking' },
            { key: 'adaptability', label: 'Adaptability' }
          ];
      
      // Filter to only include competencies that exist in the results
      const filteredMappings = competencyMappings.filter(mapping => 
        selectedTest.response.results[mapping.key]);
      
      // Extract just the keys for the tooltip
      const competencyKeys = filteredMappings.map(mapping => mapping.key);
      
      // Add these to the chart data
      radarData.competencyResults = selectedTest.response.results;
      radarData.competencyKeys = competencyKeys;
      
      setChartData(radarData);
      setChartOptions(radarOptions);
    }
  }, [selectedTest]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Loading Test History | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="mt-4 text-xl">Loading your test history...</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // Function to prepare competency areas from results
  const prepareCompetencyAreas = (results) => {
    if (!results) return [];
    
    const areas = [];
    const competencyMappings = [];
    
    // Check if results is a valid object
    if (typeof results !== 'object' || results === null) {
      return [];
    }
    
    // Define all possible competencies for both profiles
    const allCompetencies = {
      student: [
        { key: 'academicCollaboration', name: 'Academic Collaboration' },
        { key: 'learningEthics', name: 'Learning Ethics' },
        { key: 'educationalLeadership', name: 'Educational Leadership' },
        { key: 'studyGroupDynamics', name: 'Study Group Dynamics' },
        { key: 'academicConflictResolution', name: 'Academic Conflict Resolution' },
        { key: 'classroomParticipation', name: 'Classroom Participation' }
      ],
      employee: [
        { key: 'empathy', name: 'Empathy' },
        { key: 'assertiveness', name: 'Assertiveness' },
        { key: 'ethicalReasoning', name: 'Ethical Reasoning' },
        { key: 'collaboration', name: 'Collaboration' },
        { key: 'conflictResolution', name: 'Conflict Resolution' },
        { key: 'leadershipPotential', name: 'Leadership Potential' },
        { key: 'strategicThinking', name: 'Strategic Thinking' },
        { key: 'adaptability', name: 'Adaptability' }
      ]
    };

    // Determine profile type based on available data
    const isStudentProfile = allCompetencies.student.some(comp => results[comp.key]);
    const profileType = isStudentProfile ? 'student' : 'employee';
    
    // Use the appropriate competency mapping
    competencyMappings.push(...allCompetencies[profileType]);
    
    // Add each competency that exists in the results
    competencyMappings.forEach(comp => {
      if (results[comp.key] !== undefined) {
        // If the competency is an object with a score, use that
        if (typeof results[comp.key] === 'object' && results[comp.key] !== null) {
          areas.push({
            name: comp.name,
            score: results[comp.key].score || 0,
            comments: results[comp.key].comments || '',
            developmentTips: results[comp.key].developmentTips || ''
          });
        }
        // Otherwise, if it's a number, use the number
        else if (typeof results[comp.key] === 'number') {
          areas.push({
            name: comp.name,
            score: results[comp.key],
            comments: '',
            developmentTips: ''
          });
        }
      }
    });
    
    // If no areas were found, return empty array instead of defaults
    return areas;
  };
  
  // Function to prepare recommendations based on results
  const prepareRecommendations = (results) => {
    if (!results) return [];
    
    // Return recommendations from results if available
    if (results.recommendations && Array.isArray(results.recommendations)) {
      return results.recommendations;
    }
    
    // If no recommendations in results, return empty array
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Psychometric Test History | SHAKKTII AI</title>
      </Head>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Test List Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <h1 className="text-xl font-bold text-white">Your Test History</h1>
              </div>
              
              <div className="divide-y">
                {tests.length > 0 ? (
                  tests.map((test, index) => (
                    <div 
                      key={test._id || index}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTest && selectedTest._id === test._id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="font-medium">
                            {test.profileType === 'student' ? 'Student Assessment' : 'Professional Assessment'}
                          </h2>
                          <p className="text-sm text-gray-500">
                            {formatDate(test.response?.completedAt || test.completedAt || test.createdAt)}
                          </p>
                        </div>
                        
                        {test.response && (
                          <div className="flex items-center">
                            <span className="text-sm font-semibold mr-1">
                              {test.response.results?.overallScore || 7}/10
                            </span>
                            {renderStarRating((test.response.results?.overallScore || 7) / 3.33)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 mb-4">You haven't taken any psychometric tests yet.</p>
                    <button
                      onClick={() => router.push('/psychometricTest')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Take Your First Test
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Test Details */}
          <div className="lg:w-2/3">
            {selectedTest && selectedTest.response ? (
              <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <Head>
                  <title>Psychometric Test Results | SHAKKTII AI</title>
                </Head>
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h1 className="text-2xl font-bold text-white">Your Psychometric Assessment Results</h1>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Overall Assessment</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-medium">Overall Score:</span>
                          <div className="flex items-center">
                            <span className="text-lg font-bold mr-2">{selectedTest.response?.results?.overallScore || 7}/10</span>
                            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                style={{ width: `${((selectedTest.response?.results?.overallScore || 7) / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Analysis</h3>
                          <p className="text-gray-700">{selectedTest.response?.results?.analysis || ''}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="font-medium mb-2">Decision-Making Profile</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded border">
                              <div className="text-sm text-gray-500">Primary Style</div>
                              <div className="font-medium">{selectedTest.response?.results?.decisionMakingStyle || ''}</div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <div className="text-sm text-gray-500">Secondary Style</div>
                              <div className="font-medium">{selectedTest.response?.results?.secondaryStyle || ''}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Key Personality Traits</h3>
                          <div className="flex flex-wrap gap-2">
                            {(selectedTest.response?.results?.keyTraits || []).length > 0 ? (
                              selectedTest.response.results.keyTraits.map((trait, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{trait}</span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No key traits available</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Competency Areas</h2>
                      <div className="mb-6">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h3 className="font-medium mb-3 text-gray-700">Competency Radar</h3>
                          <div className="flex justify-center mb-4">
                            <div className="relative w-64 h-64">
                              {/* Radar Background Circles */}
                              <div className="absolute inset-0 rounded-full border border-gray-200 opacity-20"></div>
                              <div className="absolute inset-[15%] rounded-full border border-gray-200 opacity-40"></div>
                              <div className="absolute inset-[30%] rounded-full border border-gray-200 opacity-60"></div>
                              <div className="absolute inset-[45%] rounded-full border border-gray-200 opacity-80"></div>
                              <div className="absolute inset-[60%] rounded-full border border-gray-200"></div>
                              
                              {/* Radar Lines */}
                              {(() => {
                                const competencyAreas = prepareCompetencyAreas(selectedTest.response?.results);
                                return competencyAreas.map((_, index) => {
                                  const angle = (index / competencyAreas.length) * 2 * Math.PI;
                                  const x2 = 32 + 32 * Math.cos(angle);
                                  const y2 = 32 + 32 * Math.sin(angle);
                                  return (
                                    <div 
                                      key={index}
                                      className="absolute left-1/2 top-1/2 h-px bg-gray-200 origin-left"
                                      style={{
                                        width: '50%', 
                                        transform: `rotate(${angle * (180/Math.PI)}deg)`
                                      }}
                                    ></div>
                                  );
                                });
                              })()}
                              
                              {/* Radar Data Points */}
                              {(() => {
                                const competencyAreas = prepareCompetencyAreas(selectedTest.response?.results);
                                return competencyAreas.map((area, index) => {
                                  const angle = (index / competencyAreas.length) * 2 * Math.PI;
                                  const distance = (area.score / 3) * 100; // Scale to percentage
                                  const x = 50 + (distance / 2) * Math.cos(angle);
                                  const y = 50 + (distance / 2) * Math.sin(angle);
                                  return (
                                    <div 
                                      key={index}
                                      className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                                      style={{ left: `${x}%`, top: `${y}%` }}
                                      title={`${area.name}: ${area.score}/3`}
                                    ></div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                          <div className="text-center text-sm text-gray-500">Hover over points to see details</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const competencyAreas = prepareCompetencyAreas(selectedTest.response?.results);
                          return competencyAreas.map((area, index) => {
                            // Calculate color based on score
                            const scoreColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
                            const scoreColor = scoreColors[Math.floor(area.score) - 1] || 'bg-gray-500';
                            
                            return (
                              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                  <h3 className="font-medium">{area.name}</h3>
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${scoreColor}`}>
                                    {area.score}/3
                                  </span>
                                </div>
                                <div className="p-4">
                                  <div className="mb-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div 
                                        className={`h-2.5 rounded-full ${scoreColor}`} 
                                        style={{ width: `${(area.score / 3) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <h4 className="text-sm font-medium text-gray-700">Assessment:</h4>
                                    <p className="text-sm text-gray-600">{area.comments}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700">Development Tips:</h4>
                                    <p className="text-sm text-gray-600">
                                      {area.developmentTips || `Consider focusing on ${area.name.toLowerCase()} skills through targeted training and practice.`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border shadow-sm p-5">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-lg">Core Strengths</h3>
                          </div>
                          
                          <div className="space-y-3">
                            {(selectedTest.response?.results?.strengths || []).length > 0 ? (
                              selectedTest.response.results.strengths.map((item, index) => (
                                <div key={index} className="flex items-start">
                                  <div className="mt-1 mr-2 text-green-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-gray-700 font-medium">{item}</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedTest.response?.results?.strengthDetails?.[index] || ''}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No strengths identified</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border shadow-sm p-5">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-lg">Growth Opportunities</h3>
                          </div>
                          
                          <div className="space-y-3">
                            {(selectedTest.response?.results?.areasToImprove || []).length > 0 ? (
                              selectedTest.response.results.areasToImprove.map((item, index) => (
                                <div key={index} className="flex items-start">
                                  <div className="mt-1 mr-2 text-amber-500">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-gray-700 font-medium">{item}</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedTest.response?.results?.improvementDetails?.[index] || ''}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm">No specific areas for improvement identified</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Benchmark Comparison</h2>
                      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="p-5">
                          <p className="text-gray-700 mb-4">See how your results compare to industry benchmarks for {selectedTest.profileType === 'student' ? 'students' : 'professionals'} in similar roles.</p>
                          
                          <div className="space-y-4">
                            {(() => {
                              const competencyAreas = prepareCompetencyAreas(selectedTest.response?.results);
                              return competencyAreas.slice(0, 3).map((area, index) => {
                                // Generate random benchmark data for demonstration
                                const benchmarkScore = Math.min(3, Math.max(1, Math.round((area.score + (Math.random() * 0.6 - 0.3)) * 10) / 10));
                                const percentile = Math.round((area.score / benchmarkScore) * 100);
                                
                                return (
                                  <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">{area.name}</h3>
                                    <div className="flex items-center mb-3">
                                      <div className="w-32 text-sm">Your Score:</div>
                                      <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="h-2 rounded-full bg-blue-500" 
                                            style={{ width: `${(area.score / 3) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div className="w-10 text-right text-sm font-medium">{area.score}/3</div>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="w-32 text-sm">Benchmark:</div>
                                      <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="h-2 rounded-full bg-gray-500" 
                                            style={{ width: `${(benchmarkScore / 3) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      <div className="w-10 text-right text-sm font-medium">{benchmarkScore}/3</div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                      You scored in the <span className="font-medium">{percentile}th</span> percentile compared to your peers.
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                          
                          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-medium text-blue-800 mb-2">Overall Comparison</h3>
                            <p className="text-sm text-blue-700 mb-3">
                              Your overall score of <span className="font-medium">{selectedTest.response?.results?.overallScore || 7}/10</span> places you in the 
                              <span className="font-medium"> {Math.round(((selectedTest.response?.results?.overallScore || 7) / 10) * 100)}th </span> 
                              percentile among {selectedTest.profileType === 'student' ? 'students' : 'professionals'} who have taken this assessment.
                            </p>
                            <div className="w-full bg-blue-200 rounded-full h-2.5">
                              <div 
                                className="h-2.5 rounded-full bg-blue-600" 
                                style={{ width: `${((selectedTest.response?.results?.overallScore || 7) / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Career Path Recommendations Section */}
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-6">Career Path Recommendations</h2>
                      
                      {/* Career Recommendation Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 16h.01M16 16h.01M20 16h.01"></path>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {selectedTest.response?.results?.careerSuggestions?.[0]?.title || 'Leadership & Management'}
                              </h3>
                              <p className="text-sm text-blue-600">
                                {selectedTest.response?.results?.careerSuggestions?.[0]?.description || 'Ideal for individuals who excel in guiding teams and making strategic decisions'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Example Roles:</h4>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const rolesArr = selectedTest.response?.results?.careerSuggestions?.[0]?.roles?.length
                                  ? selectedTest.response.results.careerSuggestions[0].roles
                                  : selectedTest.response?.results?.careerSuggestions?.[0]?.exampleRoles || [];
                                if (rolesArr.length === 0) {
                                  return <span className="text-gray-500 text-xs">No roles provided</span>;
                                }
                                return rolesArr.map((role, i) => (
                                  <span key={i} className="bg-white text-xs px-3 py-1 rounded-full border border-blue-100 text-blue-700">
                                    {role}
                                  </span>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {selectedTest.response?.results?.careerSuggestions?.[1]?.title || 'Specialist & Technical'}
                              </h3>
                              <p className="text-sm text-purple-600">
                                {selectedTest.response?.results?.careerSuggestions?.[1]?.description || 'Perfect for those who thrive in specialized, detail-oriented roles'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Example Roles:</h4>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const rolesArr = selectedTest.response?.results?.careerSuggestions?.[1]?.roles?.length
                                  ? selectedTest.response.results.careerSuggestions[1].roles
                                  : selectedTest.response?.results?.careerSuggestions?.[1]?.exampleRoles || [];
                                if (rolesArr.length === 0) {
                                  return <span className="text-gray-500 text-xs">No roles provided</span>;
                                }
                                return rolesArr.map((role, i) => (
                                  <span key={i} className="bg-white text-xs px-3 py-1 rounded-full border border-purple-100 text-purple-700">
                                    {role}
                                  </span>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills Development Section */}
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Recommended Skills Development</h3>
                        
                        {/* Check if we have skills development advice or recommended skills */}
                        {(selectedTest.response?.results?.skillsDevelopmentAdvice || 
                         (selectedTest.response?.results?.recommendedSkills?.length > 0)) ? (
                          <>
                            {selectedTest.response?.results?.skillsDevelopmentAdvice && (
                              <p className="text-gray-600 mb-6">
                                {selectedTest.response.results.skillsDevelopmentAdvice}
                              </p>
                            )}
                            
                            <div className="space-y-4">
                              {selectedTest.response?.results?.recommendedSkills?.length > 0 ? (
                                selectedTest.response.results.recommendedSkills.map((skill, index) => {
                                  // Ensure skill is an object with name and level
                                  const skillName = typeof skill === 'string' ? skill : (skill?.name || 'Unnamed Skill');
                                  const skillLevel = typeof skill === 'object' ? (skill?.level || 1.5) : 1.5;
                                  
                                  return (
                                    <div key={index} className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{skillName}</span>
                                        <span className="text-gray-500">{Number(skillLevel).toFixed(1)}/3.0</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                          style={{ width: `${(Math.min(Math.max(Number(skillLevel) || 1.5, 0), 3) / 3) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-gray-500 text-sm">No specific skills recommended</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-sm">No skills development information available</p>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="font-medium text-gray-800 mb-2">Next Steps</h4>
                          <ul className="space-y-2 text-sm text-gray-600 mb-6">
                            {selectedTest.response?.results?.nextSteps?.length > 0 ? (
                              selectedTest.response.results.nextSteps.map((step, i) => {
                                // Handle both string and object formats for next steps
                                const stepText = typeof step === 'string' ? step : (step?.action || step?.description || 'Next step');
                                return (
                                  <li key={i} className="flex items-start">
                                    <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{stepText}</span>
                                  </li>
                                );
                              })
                            ) : (
                              <li className="text-gray-500 text-sm">No specific next steps available. Consider reviewing your strengths and areas for improvement above.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center space-x-4">
                      <button
                        onClick={() => {
                          alert('Generating PDF report... This feature will download a comprehensive report of your results.');
                          // PDF generation logic would go here
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Download PDF Report
                      </button>
                      
                      <button
                        onClick={() => router.push('/psychometricTest')}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        Take New Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-medium text-gray-600 mb-2">No Test Selected</h2>
                  <p className="text-gray-500">
                    {tests.length > 0 
                      ? 'Select a test from the list to view results' 
                      : 'Take a psychometric test to see your results here'}
                  </p>
                  {tests.length === 0 && (
                    <button
                      onClick={() => router.push('/psychometricTest')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Take Your First Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
