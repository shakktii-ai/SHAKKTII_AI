import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

export default function PsychometricTest() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [test, setTest] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [reasonings, setReasonings] = useState([]);
  const [results, setResults] = useState(null);
  const [token, setToken] = useState('');
  const [profileType, setProfileType] = useState(null); // 'student' or 'employee'
  const [showCardSelection, setShowCardSelection] = useState(true); // Show card selection by default

  // Check for token and user email on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);

      // Try to get user email from localStorage
      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          if (userData.email) {
            setUserEmail(userData.email);
          }
        }
      } catch (error) {
        console.error('Error getting user email:', error);
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const generateTest = async (type) => {
    // Initialize variables at the start of the function
    let userId = sessionStorage.getItem('userId');
    let emailToUse = userEmail || '';
    let testGenerated = false;

    try {
      // Try to get user ID from localStorage if available
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData && userData._id) {
        userId = userData._id;
      } else if (!userId) {
        userId = `guest_${Date.now()}`;
        sessionStorage.setItem('userId', userId);
      }

      // Use the state userEmail or generate a temporary one
      emailToUse = userEmail || (userData && userData.email) || `guest_${Date.now()}@example.com`;
      console.log('Starting test generation for email:', emailToUse);

      if (!emailToUse) {
        throw new Error('Could not determine user email');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      userId = userId || `guest_${Date.now()}`;
      emailToUse = emailToUse || `guest_${Date.now()}@example.com`;
    }

    setGenerating(true);
    setLoading(true);
    setShowCardSelection(false);

    // Clear any previous test state
    setResults(null);
    setTest(null);
    setCurrentQuestionIndex(0);

    // Show initial loading message
    const loadingToast = toast.info('Generating 30 psychometric questions. This may take a moment...', {
      autoClose: false,
      closeOnClick: false,
      draggable: false
    });

    try {
      // Make API request to generate questions with a 2.5 minute timeout
      const response = await axios.post('/api/psychometricTests/generatePsychometricTest', {
        profileType: type,
        userEmail: emailToUse,
        forceNew: true,
        userId: userId
      }, {
        timeout: 150000, // 2.5 minute timeout for initial request
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // If we get here, the request completed successfully
      testGenerated = true;

      // Check if we have questions in the response
      if (response.data?.questions?.length > 0) {
        const testData = {
          _id: response.data.testId || Date.now().toString(),
          profileType: type,
          questions: response.data.questions,
          createdAt: new Date().toISOString()
        };

        setTest(testData);
        console.log(`Received ${testData.questions.length} questions from OpenAI`);

        // Initialize arrays for responses
        setSelectedOptions(new Array(testData.questions.length).fill(null));
        setReasonings(new Array(testData.questions.length).fill(''));

        toast.update(loadingToast, {
          render: `Successfully loaded ${testData.questions.length} questions`,
          type: 'success',
          autoClose: 3000
        });
      } else {
        throw new Error('No questions received from API');
      }
    } catch (error) {
      console.error('Error generating test:', error);

      // Check if it's a timeout error
      if (!testGenerated && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
        console.log('Request timed out. Checking if test was generated...');

        try {
          // Update loading message
          toast.update(loadingToast, {
            render: 'Finalizing your test. Please wait...',
            type: 'info',
            autoClose: false
          });

          // Wait a moment before checking to give the server time to process
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Check if questions were generated despite the timeout
          const checkResponse = await axios.post('/api/psychometricTests/checkStatus', {
            profileType: type,
            userEmail: emailToUse
          }, {
            timeout: 10000, // 10 second timeout for status check
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (checkResponse.data?.questions?.length > 0) {
            const testData = {
              _id: checkResponse.data.testId || Date.now().toString(),
              profileType: type,
              questions: checkResponse.data.questions,
              createdAt: new Date().toISOString()
            };

            setTest(testData);
            console.log(`Retrieved ${testData.questions.length} questions that were generated`);

            // Initialize arrays for responses
            setSelectedOptions(new Array(testData.questions.length).fill(null));
            setReasonings(new Array(testData.questions.length).fill(''));

            toast.update(loadingToast, {
              render: `Successfully loaded ${testData.questions.length} questions`,
              type: 'success',
              autoClose: 3000
            });
            return; // Successfully loaded questions
          }
        } catch (checkError) {
          console.error('Error checking question status:', checkError);
        }
      }

      // If we get here, we couldn't load the questions
      toast.update(loadingToast, {
        render: 'Failed to generate test. Please try again.',
        type: 'error',
        autoClose: 3000
      });

      setShowCardSelection(true); // Show card selection again
    } finally {
      if (!test) {
        setLoading(false);
        setGenerating(false);
      }
      // Don't dismiss the loading toast if we have a test to show
      if (!testGenerated) {
        toast.dismiss(loadingToast);
      }
    }
  };

  const handleCardSelection = (type) => {
    setProfileType(type);
    generateTest(type);
  };

  const handleOptionSelect = (optionIndex) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleReasoningChange = (e) => {
    const newReasonings = [...reasonings];
    newReasonings[currentQuestionIndex] = e.target.value;
    setReasonings(newReasonings);
  };

  const goToNextQuestion = () => {
    if (selectedOptions[currentQuestionIndex] === null) {
      toast.warning('Please select an option before continuing');
      return;
    }

    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Check if all questions are answered before submitting
      confirmSubmitTest();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Check if all questions are answered before submitting
  const confirmSubmitTest = () => {
    const unansweredQuestions = selectedOptions.map((option, index) =>
      option === null ? index + 1 : null
    ).filter(Boolean);

    if (unansweredQuestions.length > 0) {
      const questionList = unansweredQuestions.join(', ');
      const isPlural = unansweredQuestions.length > 1;
      toast.warning(`Question${isPlural ? 's' : ''} ${questionList} ${isPlural ? 'are' : 'is'} not answered. Please complete all questions before submitting.`);
    } else {
      if (confirm('Are you sure you want to submit your test? You cannot change your answers after submission.')) {
        submitTest();
      }
    }
  };

  const submitTest = async () => {
    try {
      setEvaluating(true);

      // Prepare responses data
      const responses = selectedOptions.map((optionIndex, questionIndex) => ({
        questionIndex,
        selectedOption: optionIndex,
        reasoning: reasonings[questionIndex]
      }));

      // Get user info from localStorage
      let userId = null;
      let userEmail = null;

      try {
        const userJson = localStorage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          userId = userData._id;
          userEmail = userData.email;
          console.log('Using user email for evaluation:', userEmail);
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }

      // If no user ID from localStorage, use session or generate a temporary one
      if (!userId) {
        userId = sessionStorage.getItem('userId') || Date.now().toString();
        sessionStorage.setItem('userId', userId);
      }

      // If no email was found, generate a temporary one based on timestamp
      // This ensures we always have an email to save in the database
      if (!userEmail) {
        userEmail = `guest_${Date.now()}@example.com`;
        console.log('Using temporary email for evaluation:', userEmail);
      }

      // Instead of sending the test ID, send the complete questions array
      // This avoids the ObjectId casting error
      const response = await axios.post('/api/psychometricTests/evaluatePsychometricTest', {
        questions: test.questions,
        responses,
        userId,
        profileType: profileType,
        email: userEmail,
        testId: test.testId // Include the testId if it exists
      });

      // Store the complete response data including profileType
      setResults(response.data);
      console.log('Evaluation results:', response.data);

      // Save results to database
      try {
        const saveResponse = await axios.post('/api/psychometricTests/saveTestResults', {
          userId,
          userEmail,
          profileType: profileType,
          responses: responses,
          results: response.data,
          questions: test.questions
        });

        if (saveResponse.data.success) {
          console.log('Test results saved to database:', saveResponse.data);
          toast.success('Test results saved successfully');
        } else {
          console.error('Error saving test results:', saveResponse.data);
          toast.warning('Test completed, but results could not be saved');
        }
      } catch (saveError) {
        console.error('Error saving test results:', saveError);
        toast.warning('Test completed, but there was an issue saving your results');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Error evaluating test: ' + (error.response?.data?.message || error.message));
    } finally {
      setEvaluating(false);
    }
  };

  const renderStarRating = (score) => {
    return (
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${i < score ? 'text-yellow-500' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Card selection screen
  if (showCardSelection) {
    return (
      <>
        <div className="bg-black min-h-screen px-4 py-10">
          <button
            onClick={() => router.back('/dashboard')}
            className="absolute top-4 left-4 text-white bg-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition"
          >
            ← Back
          </button>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => router.push('/psychometricTestHistory')}
              className="text-white bg-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition"
            >
              History →
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-10">
            Psychometric Test
          </h1>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-32">

            {/* Student Test Card */}
            <div className="bg-white w-[300px] max-w-md rounded-2xl p-5">
              <h2 className="text-2xl font-bold text-center mb-4">Student Test</h2>

              <div className="bg-[#D2E9FA] p-5 -ml-5 rounded-r-full shadow-[inset_0_5px_10px_0_rgba(0,0,0,0.2)]">
                <div className="bg-[#69676720] mx-auto w-36 h-36 rounded-full shadow-[inset_10px_7px_7px_rgba(0,0,0,0.25),inset_6px_6px_10px_rgba(255,255,255,0.6)]">
                  <img src="/mock.png" alt="Student Test" className="w-full h-full object-contain" />
                </div>
              </div>

              <p className="text-left my-4 text-sm">
                Designed for students and academic environments.
                Evaluates academic potential, learning style,
                teamwork, and leadership qualities in educational
                contexts.
              </p>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Workplace dynamics</p>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Professional ethics</p>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Management potential</p>
              </div>

              <button
                onClick={() => handleCardSelection('student')}
                className="bg-gradient-to-r from-black to-gray-400 text-white mt-5 w-full py-2 rounded-full"
              >
                Take Test
              </button>
            </div>

            {/* Employee Test Card */}
            <div className="bg-white w-[300px] max-w-md rounded-2xl p-5">
              <h2 className="text-2xl font-bold text-center mb-4">Employee Test</h2>

              <div className="bg-[#D2E9FA] p-5 -ml-5 rounded-r-full shadow-[inset_0_5px_10px_0_rgba(0,0,0,0.2)]">
                <div className="bg-[#69676720] mx-auto w-36 h-36 rounded-full shadow-[inset_10px_7px_7px_rgba(0,0,0,0.25),inset_6px_6px_10px_rgba(255,255,255,0.6)]">
                  <img src="/mock.png" alt="Employee Test" className="w-full h-full object-contain" />
                </div>
              </div>

              <p className="text-left my-4 text-sm">
                Tailored for working professionals. Evaluates
                workplace competencies, conflict resolution,
                leadership potential, and professional decision-
                making.
              </p>

              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Workplace dynamics</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Professional ethics</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />              </svg><p className="text-left">Management potential</p>
                </div>
              </div>

              <button
                onClick={() => handleCardSelection('employee')}
                className="bg-gradient-to-r from-black to-gray-400 text-white mt-5 w-full py-2 rounded-full"
              >
                Take Test
              </button>
            </div>

          </div>
        </div>

      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">
            {generating ? 'Generating your psychometric test...' : 'Loading...'}
          </p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Evaluating Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl">Evaluating your responses with AI...</p>
          <p className="mt-2 text-gray-600">This may take a minute. We're analyzing your decision-making style.</p>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (results) {
    const competencyAreas = [];
    const recommendations = [];

    // Extract evaluation data from the API response
    const evaluation = results.evaluation || {};
    const profileType = results.profileType || 'employee';

    console.log('Rendering results with evaluation:', evaluation);

    // Directly access the evaluation properties without nested paths

    // Helper function to safely access nested properties
    const safeGet = (obj, path, defaultValue) => {
      try {
        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
          if (current === undefined || current === null) {
            return defaultValue;
          }
          current = current[part];
        }

        return current === undefined || current === null ? defaultValue : current;
      } catch (e) {
        return defaultValue;
      }
    };

    if (profileType === 'student') {
      // Only add items if they exist
      if (evaluation.academicCollaboration) {
        competencyAreas.push({
          name: 'Academic Collaboration',
          score: evaluation.academicCollaboration.score || 2,
          comments: evaluation.academicCollaboration.comments || 'No comments available'
        });
      }

      if (evaluation.learningEthics) {
        competencyAreas.push({
          name: 'Learning Ethics',
          score: evaluation.learningEthics.score || 2,
          comments: evaluation.learningEthics.comments || 'No comments available'
        });
      }

      if (evaluation.educationalLeadership) {
        competencyAreas.push({
          name: 'Educational Leadership',
          score: evaluation.educationalLeadership.score || 2,
          comments: evaluation.educationalLeadership.comments || 'No comments available'
        });
      }

      if (evaluation.studyGroupDynamics) {
        competencyAreas.push({
          name: 'Study Group Dynamics',
          score: evaluation.studyGroupDynamics.score || 2,
          comments: evaluation.studyGroupDynamics.comments || 'No comments available'
        });
      }

      if (evaluation.academicConflictResolution) {
        competencyAreas.push({
          name: 'Academic Conflict Resolution',
          score: evaluation.academicConflictResolution.score || 2,
          comments: evaluation.academicConflictResolution.comments || 'No comments available'
        });
      }

      if (evaluation.classroomParticipation) {
        competencyAreas.push({
          name: 'Classroom Participation',
          score: evaluation.classroomParticipation.score || 2,
          comments: evaluation.classroomParticipation.comments || 'No comments available'
        });
      }

      recommendations.push(
        {
          title: 'Recommended Learning Styles',
          items: evaluation.recommendedLearningStyles || ['Visual learning', 'Practical application', 'Group study']
        },
        {
          title: 'Academic Path Recommendations',
          items: evaluation.academicPathRecommendations || ['Consider peer tutoring', 'Join study groups', 'Seek hands-on learning opportunities']
        }
      );
    } else {
      // Employee profile - use the original competencies
      // Empathy
      if (evaluation.empathy) {
        competencyAreas.push({
          name: 'Empathy',
          score: evaluation.empathy.score || 2,
          comments: evaluation.empathy.comments || 'No comments available'
        });
      }

      // Assertiveness
      if (evaluation.assertiveness) {
        competencyAreas.push({
          name: 'Assertiveness',
          score: evaluation.assertiveness.score || 2,
          comments: evaluation.assertiveness.comments || 'No comments available'
        });
      }

      // Ethical Reasoning
      if (evaluation.ethicalReasoning) {
        competencyAreas.push({
          name: 'Ethical Reasoning',
          score: evaluation.ethicalReasoning.score || 2,
          comments: evaluation.ethicalReasoning.comments || 'No comments available'
        });
      }

      // Collaboration
      if (evaluation.collaboration) {
        competencyAreas.push({
          name: 'Collaboration',
          score: evaluation.collaboration.score || 2,
          comments: evaluation.collaboration.comments || 'No comments available'
        });
      }

      // Conflict Resolution
      if (evaluation.conflictResolution) {
        competencyAreas.push({
          name: 'Conflict Resolution',
          score: evaluation.conflictResolution.score || 2,
          comments: evaluation.conflictResolution.comments || 'No comments available'
        });
      }

      // Leadership Potential
      if (evaluation.leadershipPotential) {
        competencyAreas.push({
          name: 'Leadership Potential',
          score: evaluation.leadershipPotential.score || 2,
          comments: evaluation.leadershipPotential.comments || 'No comments available'
        });
      }

      recommendations.push(
        {
          title: 'Career Path Recommendations',
          items: evaluation.careerPathRecommendations || ['Project management', 'Team leadership', 'Specialized technical role']
        },
        {
          title: 'Role Fit Recommendations',
          items: evaluation.roleFitRecommendations || ['Team lead', 'Project coordinator', 'Technical specialist']
        }
      );
    }

    // If no competency areas were added (due to missing data), add default ones
    if (competencyAreas.length === 0) {
      if (profileType === 'student') {
        competencyAreas.push(
          { name: 'Academic Collaboration', score: 2, comments: 'Default assessment' },
          { name: 'Learning Ethics', score: 2, comments: 'Default assessment' },
          { name: 'Educational Leadership', score: 2, comments: 'Default assessment' }
        );
      } else {
        competencyAreas.push(
          { name: 'Workplace Dynamics', score: 2, comments: 'Default assessment' },
          { name: 'Professional Ethics', score: 2, comments: 'Default assessment' },
          { name: 'Management Potential', score: 2, comments: 'Default assessment' }
        );
      }
    }

    return (
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
                    <span className="text-lg font-bold mr-2">{evaluation.overallScore || 7}/10</span>
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        style={{ width: `${((evaluation.overallScore || 7) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Analysis</h3>
                  <p className="text-gray-700">{evaluation.analysis || 'Your responses indicate a balanced approach to decision-making with a good understanding of ethical considerations in professional contexts.'}</p>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Decision-Making Profile</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-500">Primary Style</div>
                      <div className="font-medium">{evaluation.decisionMakingStyle || 'Balanced Analytical'}</div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="text-sm text-gray-500">Secondary Style</div>
                      <div className="font-medium">{evaluation.secondaryStyle || 'Collaborative'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Key Personality Traits</h3>
                  <div className="flex flex-wrap gap-2">
                    {(evaluation.keyTraits || ['Analytical', 'Ethical', 'Collaborative', 'Detail-oriented']).map((trait, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{trait}</span>
                    ))}
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
                      {competencyAreas.map((_, index) => {
                        const angle = (index / competencyAreas.length) * 2 * Math.PI;
                        const x2 = 32 + 32 * Math.cos(angle);
                        const y2 = 32 + 32 * Math.sin(angle);
                        return (
                          <div
                            key={index}
                            className="absolute left-1/2 top-1/2 h-px bg-gray-200 origin-left"
                            style={{
                              width: '50%',
                              transform: `rotate(${angle * (180 / Math.PI)}deg)`
                            }}
                          ></div>
                        );
                      })}

                      {/* Radar Data Points */}
                      {competencyAreas.map((area, index) => {
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
                      })}
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500">Hover over points to see details</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competencyAreas.map((area, index) => {
                  // Calculate color based on score
                  const scoreColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];
                  const scoreColor = scoreColors[area.score - 1] || 'bg-gray-500';

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
                })}
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
                    {(evaluation.strengths || ['Good ethical reasoning', 'Balanced decision-making']).map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-1 mr-2 text-green-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">{item}</p>
                          <p className="text-sm text-gray-500">
                            {evaluation.strengthDetails?.[index] || `This is a significant asset in your decision-making approach.`}
                          </p>
                        </div>
                      </div>
                    ))}
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
                    {(evaluation.areasToImprove || ['Consider more stakeholder perspectives', 'Balance assertiveness with empathy']).map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-1 mr-2 text-amber-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">{item}</p>
                          <p className="text-sm text-gray-500">
                            {evaluation.improvementDetails?.[index] || `Focusing on this area will enhance your overall effectiveness.`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Personalized Recommendations</h2>
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b">
                    <h3 className="font-medium text-gray-800">Based on your unique profile, we recommend:</h3>
                  </div>

                  <div className="divide-y">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-5">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">{index + 1}</span>
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800">{rec.title}</h3>
                        </div>

                        <div className="ml-11 space-y-3">
                          {rec.items.map((item, idx) => (
                            <div key={idx} className="flex items-start">
                              <div className="mt-1 mr-2 text-blue-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-700">{item}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {rec.itemDetails?.[idx] || `This recommendation is tailored to your assessment results.`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {rec.resources && (
                          <div className="mt-4 ml-11 pt-3 border-t">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Resources:</h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.resources.map((resource, resourceIdx) => (
                                <span key={resourceIdx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{resource}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Benchmark Comparison</h2>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="p-5">
                  <p className="text-gray-700 mb-4">See how your results compare to industry benchmarks for {profileType === 'student' ? 'students' : 'professionals'} in similar roles.</p>

                  <div className="space-y-4">
                    {competencyAreas.slice(0, 3).map((area, index) => {
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
                    })}
                  </div>

                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-medium text-blue-800 mb-2">Overall Comparison</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Your overall score of <span className="font-medium">{evaluation.overallScore || 7}/10</span> places you in the
                      <span className="font-medium"> {Math.round(((evaluation.overallScore || 7) / 10) * 100)}th </span>
                      percentile among {profileType === 'student' ? 'students' : 'professionals'} who have taken this assessment.
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-blue-600"
                        style={{ width: `${((evaluation.overallScore || 7) / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Suggestions Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Career Path Recommendations</h2>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-800">Based on your assessment, here are career paths that align with your strengths and personality:</h3>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career Card 1 - Primary Recommendation */}
                    <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">1</span>
                        </div>
                        <h3 className="text-lg font-semibold">
                          {evaluation.careerSuggestions?.[0]?.title || 'Strategic Leadership Roles'}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {evaluation.careerSuggestions?.[0]?.description || 'Your strong leadership potential and analytical skills make you well-suited for roles that require strategic thinking and team management.'}
                      </p>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Example Roles:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const rolesArr = evaluation.careerSuggestions?.[0]?.roles?.length
                              ? evaluation.careerSuggestions[0].roles
                              : evaluation.careerSuggestions?.[0]?.exampleRoles || [];
                            if (rolesArr.length === 0) {
                              return <span className="text-gray-500 text-xs">No roles provided</span>;
                            }
                            return rolesArr.map((role, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                                {role}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Career Card 2 - Secondary Recommendation */}
                    <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold">2</span>
                        </div>
                        <h3 className="text-lg font-semibold">
                          {evaluation.careerSuggestions?.[1]?.title || 'Creative Problem-Solving'}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {evaluation.careerSuggestions?.[1]?.description || 'Your creative approach to problem-solving and adaptability make you a great fit for dynamic, innovative roles.'}
                      </p>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Example Roles:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const rolesArr = evaluation.careerSuggestions?.[1]?.roles?.length
                              ? evaluation.careerSuggestions[1].roles
                              : evaluation.careerSuggestions?.[1]?.exampleRoles || [];
                            if (rolesArr.length === 0) {
                              return <span className="text-gray-500 text-xs">No roles provided</span>;
                            }
                            return rolesArr.map((role, idx) => (
                              <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                                {role}
                              </span>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Development Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Recommended Skills Development</h3>
                    <div className="space-y-4">
                      {(evaluation.skillRecommendations || [
                        { skill: 'Leadership & Management', level: 'Advanced' },
                        { skill: 'Strategic Thinking', level: 'Intermediate' },
                        { skill: 'Communication', level: 'Advanced' },
                        { skill: 'Data Analysis', level: 'Beginner' }
                      ]).map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-1/4 font-medium text-gray-700">{item.skill}</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full bg-blue-600"
                                style={{
                                  width: item.level === 'Beginner' ? '33%' :
                                    item.level === 'Intermediate' ? '66%' : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-24 text-right text-sm text-gray-600">
                            {item.level} Level
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center space-x-4 flex-wrap">
              <button
                onClick={() => {
                  alert('Generating PDF report... This feature will download a comprehensive report of your results.');
                  // PDF generation logic would go here
                }}
                className="px-6 py-3 mb-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download PDF Report
              </button>

              <button
                onClick={() => router.push('/psychometricTestHistory')}
                className="px-6 py-3 mb-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                View Test History
              </button>

              <button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setShowCardSelection(true);
                }}
                className="px-6 py-3 mb-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Take New Test
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Head>
          <title>Psychometric Test | SHAKKTII AI</title>
        </Head>
        <div className="text-center">
          <p className="text-xl text-red-600">Failed to load test. Please try again.</p>
          <button
            onClick={() => checkExistingTest(token)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  // Helper function to check if a question is answered
  const isQuestionAnswered = (index) => {
    return selectedOptions[index] !== null;
  };

  // Count answered questions
  const answeredCount = selectedOptions.filter(option => option !== null).length;
  const totalQuestions = test.questions.length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Psychometric Test | SHAKKTII AI</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Psychometric Assessment</h1>
                <p className="text-blue-100">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </p>
              </div>
              <div className="text-white text-right">
                <div className="text-xl font-bold">{answeredCount}/{totalQuestions}</div>
                <div className="text-sm text-blue-100">Questions Answered</div>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {/* Question Navigation */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">Question Navigation:</div>
              <div className="text-sm text-gray-500">{answeredCount}/{totalQuestions} answered</div>
            </div>

            {/* Group questions into sets of 10 for better organization */}
            {Array.from({ length: Math.ceil(test.questions.length / 10) }).map((_, group) => (
              <div key={group} className="flex flex-wrap gap-2 mb-2 justify-center">
                {test.questions
                  .slice(group * 10, (group + 1) * 10)
                  .map((_, idx) => {
                    const questionIndex = group * 10 + idx;
                    return (
                      <button
                        key={questionIndex}
                        onClick={() => goToQuestion(questionIndex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                          ${currentQuestionIndex === questionIndex
                            ? 'bg-blue-600 text-white'
                            : isQuestionAnswered(questionIndex)
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-2"
                style={{
                  backgroundColor: currentQuestion.difficulty === 'Easy' ? '#e0f2fe' :
                    currentQuestion.difficulty === 'Moderate' ? '#fef3c7' :
                      '#fee2e2',
                  color: currentQuestion.difficulty === 'Easy' ? '#0369a1' :
                    currentQuestion.difficulty === 'Moderate' ? '#92400e' :
                      '#b91c1c'
                }}
              >
                {currentQuestion.difficulty} Difficulty
              </div>
              <h2 className="text-xl font-medium text-gray-800">{currentQuestion.scenario}</h2>
            </div>

            <div className="space-y-4 mb-6">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedOptions[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 h-5 w-5 mt-0.5 border rounded-full flex items-center justify-center ${selectedOptions[currentQuestionIndex] === index
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                      }`}>
                      {selectedOptions[currentQuestionIndex] === index && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-base ${selectedOptions[currentQuestionIndex] === index
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-700'
                        }`}>
                        {option.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label htmlFor="reasoning" className="block text-sm font-medium text-gray-700 mb-1">
                Optional: Why did you choose this response? (Your reasoning)
              </label>
              <textarea
                id="reasoning"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain your thought process..."
                value={reasonings[currentQuestionIndex] || ''}
                onChange={handleReasoningChange}
              ></textarea>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentQuestionIndex === test.questions.length - 1 && (
                  <button
                    onClick={() => confirmSubmitTest()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Submit Test ({answeredCount}/{totalQuestions})
                  </button>
                )}

                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentQuestionIndex < test.questions.length - 1 ? 'Next' : 'Review & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}