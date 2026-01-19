import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ListeningPractice() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [testCompleted, setTestCompleted] = useState(false);
  const [token, setToken] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  // Level-based progress states
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [levelProgress, setLevelProgress] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [responses, setResponses] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Function to generate context-specific questions based on content
  const generateQuestionFromContent = (content) => {
    // Clean content if it contains audio tags
    const cleanContent = content.replace(/\[Audio:\s*|\]/g, '').toLowerCase();
    
    if (cleanContent.includes('weather')) {
      if (cleanContent.includes('temperature')) {
        return "What temperature is mentioned in the weather forecast?";
      } else if (cleanContent.includes('rain') || cleanContent.includes('rainy')) {
        return "Is rain predicted in the weather forecast?";
      } else if (cleanContent.includes('sunny')) {
        return "What type of weather is forecasted for today?";
      } else {
        return "What details are provided in the weather forecast?";
      }
    } else if (cleanContent.includes('train') || cleanContent.includes('station') || cleanContent.includes('platform')) {
      if (cleanContent.includes('depart') || cleanContent.includes('departure')) {
        return "What time does the train depart?";
      } else if (cleanContent.includes('platform')) {
        return "Which platform number is mentioned in the announcement?";
      } else {
        return "What information is being announced at the train station?";
      }
    } else if (cleanContent.includes('teacher') || cleanContent.includes('class') || cleanContent.includes('student')) {
      if (cleanContent.includes('page')) {
        return "What page number did the teacher mention?";
      } else if (cleanContent.includes('book') || cleanContent.includes('assignment')) {
        return "What did the teacher ask the students to do?";
      } else {
        return "What instructions did the teacher give to the class?";
      }
    } else if (cleanContent.includes('meeting') || cleanContent.includes('conference')) {
      return "What is the main purpose of the meeting mentioned in the audio?";
    } else if (cleanContent.includes('restaurant') || cleanContent.includes('food') || cleanContent.includes('menu')) {
      return "What food items or restaurant details are mentioned in the conversation?";
    } else if (cleanContent.includes('price') || cleanContent.includes('cost') || cleanContent.includes('dollar')) {
      return "What price or cost information is mentioned in the audio?";
    } else if (cleanContent.includes('doctor') || cleanContent.includes('hospital') || cleanContent.includes('appointment')) {
      return "What medical information is discussed in the conversation?";
    } else {
      // Generic but still specific enough questions for other contexts
      return "What specific details are mentioned in the audio?";
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      // Show difficulty selection initially
      setShowLevelSelection(false);
    }

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Fetch level progress for the selected difficulty
  const fetchLevelProgress = async (selectedDifficulty) => {
    if (!selectedDifficulty) return;
    
    setLoading(true);
    try {
      // Initialize default progress for all 30 levels
      const defaultProgress = Array.from({ length: 30 }, (_, i) => ({
        level: i + 1,
        stars: 0,
        completed: i === 0, // Only first level is unlocked by default
        questionsCompleted: 0
      }));
      
      // Get user ID
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      // Fetch progress data from API
      const response = await fetch(`/api/getPracticeProgress?skillArea=Listening&difficulty=${selectedDifficulty}&userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.progress) {
        // Find progress for this specific skill area and difficulty
        const listeningProgress = data.progress.find(p => 
          p.skillArea === 'Listening' && p.difficulty === selectedDifficulty
        );
        
        if (listeningProgress && listeningProgress.levelProgress && listeningProgress.levelProgress.length > 0) {
          // Merge the API data with default data to ensure we have all 30 levels
          const mergedProgress = defaultProgress.map(defaultLevel => {
            const apiLevel = listeningProgress.levelProgress.find(l => l.level === defaultLevel.level);
            return apiLevel || defaultLevel;
          });
          setLevelProgress(mergedProgress);
        } else {
          setLevelProgress(defaultProgress);
        }
      } else {
        setLevelProgress(defaultProgress);
      }
    } catch (apiError) {
      console.error("API error, using default progress:", apiError);
      
      // Initialize empty progress for all 30 levels as fallback
      const emptyProgress = Array.from({ length: 30 }, (_, i) => ({
        level: i + 1,
        stars: 0,
        completed: i < 2 // Make first 2 levels completed by default for demo
      }));
      setLevelProgress(emptyProgress);
    } finally {
      setLoading(false);
      setShowLevelSelection(true);
    }
  };
  
  // Handle difficulty selection
  const handleDifficultySelect = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    fetchLevelProgress(selectedDifficulty);
  };
  
  // Handle level selection
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // If it's a double-click or if it's a single click on a level that was already selected, start the practice
    if (selectedLevel === level) {
      fetchQuestions();
    }
  };
  
  // Handle level double click to immediately start practice
  const handleLevelDoubleClick = (level) => {
    setSelectedLevel(level);
    fetchQuestions();
  };
  
  // Back to level selection
  const backToLevelSelection = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setShowEvaluation(false);
    setResponses([]);
    setShowLevelSelection(true);
  };
  // Fetch questions for a specific level
  const fetchQuestions = async () => {
    if (!difficulty || !selectedLevel) return;

    setLoading(true);
    try {
      console.log(`Fetching listening practice questions for ${difficulty} level ${selectedLevel}`);
      
      // Simple auth approach - include user ID in the request body instead of using token in header
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001'; // Fallback to default ID
      
      const response = await fetch('/api/fetchPracticeQuestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header to avoid 431 error
        },
        body: JSON.stringify({
          skillArea: 'Listening',
          difficulty: difficulty,
          count: 5,
          userId: userId, // Send user ID in the body instead
          level: selectedLevel // Include the selected level
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          alert("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(data.error || 'Failed to fetch questions');
      }
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions received');
      }

      setQuestions(data.questions);
      setTestStarted(true);
      setCurrentIndex(0);
      setResponses([]); // Clear any previous responses
      setShowLevelSelection(false); // Hide level selection
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert("Failed to load listening practice questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Play audio for the current question
  const playAudio = () => {
    if (!questions || !questions[currentIndex]) {
      console.error('No current question available to play audio');
      return;
    }
    
    try {
      // In a real implementation, this would play actual audio files
      // For demo purposes, we'll use text-to-speech as a placeholder
      const currentQuestion = questions[currentIndex];
      
      // Make sure we have content to speak
      if (!currentQuestion.content) {
        console.error('Question has no content to speak');
        alert('Error: Question content is missing. Please try another question.');
        return;
      }
      
      // Clean up content text for speaking
      const textToSpeak = currentQuestion.content
        .replace(/\[Audio:\s*|\]/g, '') // Remove [Audio:] tags if present
        .replace(/\n/g, ' ')           // Replace newlines with spaces
        .trim();                       // Trim any extra whitespace
      
      console.log('Speaking text:', textToSpeak);
      
      // Create and configure the speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      
      // Force voices to load if they haven't already
      speechSynthesis.getVoices();
      
      // Set up a timeout to ensure we get voices
      setTimeout(() => {
        // Try to select a good voice
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        const preferredVoices = voices.filter(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') || 
          voice.name.includes('Female')
        );
        
        if (preferredVoices.length > 0) {
          utterance.voice = preferredVoices[0];
          console.log('Using voice:', preferredVoices[0].name);
        } else if (voices.length > 0) {
          // Fallback to any available voice
          utterance.voice = voices[0];
          console.log('Using fallback voice:', voices[0].name);
        }
        
        // Set up events before speaking
        utterance.onstart = () => {
          console.log('Speech started');
        };
        
        utterance.onend = () => {
          console.log('Speech ended');
          startTimer();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          // Start timer even if speech fails
          startTimer();
        };
        
        // Actually speak the text
        window.speechSynthesis.speak(utterance);
        setAudioPlayed(true);
      }, 100); // Short delay to make sure voices are loaded
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('There was an error playing the audio. Please try again.');
      // Still start the timer even if speech fails
      startTimer();
    }
  };

  // Start timer for the current question
  const startTimer = () => {
    const currentQuestion = questions[currentIndex];
    setTimeLeft(currentQuestion.timeLimit);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Handle selection of multiple choice options
  const handleOptionSelect = (option) => {
    setSelectedOptions(prevSelected => {
      // For single selection questions
      if (!Array.isArray(questions[currentIndex].options) || questions[currentIndex].options.length <= 4) {
        return [option];
      }
      
      // For multiple selection questions
      if (prevSelected.includes(option)) {
        return prevSelected.filter(item => item !== option);
      } else {
        return [...prevSelected, option];
      }
    });
  };

  // Handle text input change
  const handleTextResponseChange = (e) => {
    setUserResponse(e.target.value);
  };

  // Submit answer and get feedback
  const submitAnswer = async () => {
    if (loading) return;

    // For multiple choice questions, check if an option is selected
    if (questions[currentIndex].type === 'multiple-choice' && selectedOptions.length === 0) {
      alert('Please select an option');
      return;
    }

    // For text input questions, check if there's a response
    if (questions[currentIndex].type === 'text-input' && !userResponse.trim()) {
      alert('Please enter your response');
      return;
    }

    setLoading(true);
    
    try {
      // Determine which response to use based on question type
      const responseToSubmit = questions[currentIndex].type === 'multiple-choice' 
        ? selectedOptions.join(', ') 
        : userResponse;
      
      // Get user ID
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001';
      
      // Check if the question has a valid MongoDB ObjectId
      // Always ensure we have a valid cardId to use for database referencing
      const cardId = questions[currentIndex].cardId || `L-${difficulty.charAt(0)}-${selectedLevel.toString().padStart(2, '0')}-${(currentIndex + 1).toString().padStart(2, '0')}`;
      
      // Generate a unique ID based on the information we have
      // This is a simplified way to create something that looks like an ObjectId
      const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
      const randomPart = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const testIdToUse = timestamp + randomPart.padStart(16, '0');
      
      const response = await fetch('/api/submitPracticeResponse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: testIdToUse, // Now we always send a valid-looking ID
          cardId: cardId, // Use our validated/generated cardId
          userResponse: responseToSubmit,
          score: 0, // To be determined by AI
          timeSpent: questions[currentIndex].timeLimit - timeLeft,
          userId,
          level: selectedLevel, // Include the level number
          difficulty: difficulty // Include the difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
        setScore(data.score || 0);
        
        // Store response data for level evaluation
        // Extract expected response from question if available, or from listening content
        let expectedResponse = '';
        if (questions[currentIndex].expectedResponse) {
          expectedResponse = questions[currentIndex].expectedResponse;
        } else if (questions[currentIndex].content && questions[currentIndex].content.includes('[Audio:')) {
          // Try to extract expected response from audio content
          const audioText = questions[currentIndex].content.replace('[Audio:', '').replace(']', '').trim();
          if (audioText) {
            expectedResponse = audioText;
          }
        }
        
        console.log('Storing response with expected response:', expectedResponse);
        
        setResponses(prevResponses => [...prevResponses, {
          cardId: questions[currentIndex].cardId,
          question: questions[currentIndex].instructions || questions[currentIndex].content,
          expectedResponse: expectedResponse,
          userResponse: responseToSubmit,
          score: data.score || 1,
          timeSpent: questions[currentIndex].timeLimit - timeLeft,
          completedAt: new Date()
        }]);
      } else {
        throw new Error('Error submitting answer');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Handle moving to the next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setUserResponse('');
      setSelectedOptions([]);
      setAudioPlayed(false);
      setFeedback('');
      setScore(0);
      setTimeLeft(0);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      // Complete the test
      setTestCompleted(true);
      // Evaluate level completion with Claude AI
      evaluateLevelCompletion();
    }
  };
  
  // Function to evaluate level completion using Claude AI
  const evaluateLevelCompletion = async () => {
    try {
      setLoading(true);
      // Get userId from localStorage
      const userObj = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
      const userId = userObj?._id || userObj?.id || '6462d8fbf6c3e30000000001'; // Use default ID if not found
      
      // Ensure we have a valid level value (use 1 as default if none is selected)
      const levelToEvaluate = selectedLevel || 1;
      
      // Make sure we have responses to evaluate
      if (!responses || responses.length === 0) {
        console.error('No responses to evaluate!');
        setEvaluationResult({
          evaluation: {
            overallRating: 1,
            feedback: "No responses were recorded for evaluation. We've assigned a default rating.",
            completed: true
          },
          levelProgress: {
            level: levelToEvaluate,
            stars: 1,
            completed: true
          }
        });
        setShowEvaluation(true);
        setLoading(false);
        return;
      }
      
      console.log('Evaluating level:', levelToEvaluate, 'with responses:', responses);
      
      const response = await fetch('/api/evaluateLevelCompletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          skillArea: 'Listening',
          difficulty,
          level: levelToEvaluate, // Use the validated level value
          responses
        })
      });

      try {
        if (response.ok) {
          const result = await response.json();
          setEvaluationResult(result);
          setShowEvaluation(true);
          
          // Update local level progress data to show updated stars
          if (result.levelProgress) {
            setLevelProgress(prev => {
              const updatedProgress = [...prev];
              const levelIndex = updatedProgress.findIndex(p => p.level === selectedLevel);
              
              if (levelIndex > -1) {
                updatedProgress[levelIndex] = {
                  ...updatedProgress[levelIndex],
                  stars: result.levelProgress.stars,
                  completed: true
                };
              }
              
              return updatedProgress;
            });
          }
        } else {
          console.error('Failed to evaluate level completion');
          // Force show evaluation with default values even on error
          setEvaluationResult({
            evaluation: {
              overallRating: 1,
              feedback: "We couldn't fully evaluate your responses, but you've completed the level.",
              completed: true
            },
            levelProgress: {
              level: selectedLevel,
              stars: 1,
              completed: true
            }
          });
          setShowEvaluation(true);
        }
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        // Force show evaluation with default values on parse error
        setEvaluationResult({
          evaluation: {
            overallRating: 1,
            feedback: "We couldn't process your level evaluation, but we've recorded your progress.",
            completed: true
          },
          levelProgress: {
            level: selectedLevel,
            stars: 1,
            completed: true
          }
        });
        setShowEvaluation(true);
      }
    } catch (error) {
      console.error('Error evaluating level completion:', error);
      // Even with complete failure, provide a graceful fallback
      setEvaluationResult({
        evaluation: {
          overallRating: 1,
          feedback: "There was a problem connecting to the server, but we've still recorded your practice session.",
          completed: true
        },
        levelProgress: {
          level: selectedLevel,
          stars: 1,
          completed: true
        }
      });
      setShowEvaluation(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset the test
  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setUserResponse('');
    setAudioPlayed(false);
    setSelectedOptions([]);
    setResponses([]);
    setShowEvaluation(false);
    setFeedback('');
    setScore(0);
  };

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Listening Practice</title>
        <meta name="description" content="Improve your listening skills with AI-powered practice" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Listening Practice</h1>
            <p className="text-lg text-pink-200">Enhance your listening skills through interactive exercises</p>
          </div>
          
          {!testStarted ? (
            <div className="flex flex-col space-y-8 items-center justify-center">
              <div className="w-full">
                <h2 className="text-xl font-bold text-white mb-4">Select Difficulty:</h2>
                <div className="flex flex-wrap gap-4">
                  {['Beginner', 'Moderate', 'Expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultySelect(level)}
                      className={`px-6 py-3 rounded-xl font-medium ${
                        difficulty === level
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              {showLevelSelection && (
                <div className="w-full bg-white rounded-xl p-4 shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Select Level:</h2>
                  {selectedLevel && (
                    <div className="text-center mb-3 text-pink-600 font-medium">
                      Level {selectedLevel} selected. Double-click to start immediately or click Start Practice below.
                    </div>
                  )}
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <svg className="animate-spin h-10 w-10 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {Array.from({length: 30}, (_, i) => i + 1).map((level) => {
                        // Find the current level's progress (if it exists)
                        const levelData = levelProgress.find(p => p.level === level) || { level, completed: false, stars: 0 };
                        
                        // Find the previous level's progress
                        const prevLevelData = level > 1 ? levelProgress.find(p => p.level === level-1) : { completed: true };
                        
                        // Make first three levels always unlocked
                        const isLocked = level > 3 && !prevLevelData?.completed;
                        const isCompleted = levelData.completed;
                        const stars = levelData.stars || 0;
                        
                        return (
                          <div 
                            key={`level-${level}`}
                            onClick={() => !isLocked && handleLevelSelect(level)}
                            onDoubleClick={() => !isLocked && handleLevelDoubleClick(level)}
                            className={`bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center relative ${!isLocked ? 'cursor-pointer hover:shadow-xl hover:bg-pink-50 transform hover:scale-105' : 'cursor-not-allowed opacity-80'} transition-all duration-200 ${
                              isCompleted ? 'border-2 border-green-500' : ''
                            } ${
                              selectedLevel === level ? 'ring-4 ring-pink-500 ring-opacity-70 transform scale-105' : ''
                            }`}
                          >
                            <div className="text-2xl font-bold text-pink-900 mb-2">Level {level}</div>
                            
                            {/* Star display */}
                            <div className="flex space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  className={`w-6 h-6 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ))}
                            </div>
                            
                            {/* Show locked indicator for locked levels */}
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-60">
                                <div className="bg-black bg-opacity-70 p-2 rounded-full">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={fetchQuestions}
                disabled={!difficulty || !selectedLevel || loading}
                className={`px-6 py-3 rounded-lg font-medium ${
                  !difficulty || !selectedLevel || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-800 to-purple-900 text-white hover:opacity-90'
                }`}
              >
                {loading ? 'Loading...' : 'Start Practice'}
              </button>
            </div>
          ) : testCompleted && !showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Practice Completed!</h1>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
                  <p className="text-lg text-gray-600">Evaluating your responses with model</p>
                </div>
              ) : (
                <>
                  <div className="w-32 h-32 mx-auto my-6">
                    <img src="/completed.svg" alt="Complete" className="w-full h-full" onError={(e) => {
                      e.target.src = "/logoo.png";
                    }} />
                  </div>
                  <p className="text-lg text-gray-600 mb-6">
                    Great job! You've completed the listening practice session.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={backToLevelSelection}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                    >
                      Back to Levels
                    </button>
                    <button
                      onClick={() => setShowEvaluation(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                    >
                      Show Results
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : testCompleted && showEvaluation ? (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Practice Results</h1>
              
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-bold text-purple-800 mb-2">Overall Performance</h2>
                <div className="flex justify-center mb-4">
                  {/* Star display for overall rating */}
                  <div className="flex space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <svg 
                        key={i} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        className={`w-10 h-10 ${i < (evaluationResult?.levelProgress?.stars || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <div className="text-lg text-gray-700 mb-4">
                  {evaluationResult?.evaluation?.feedback || "You've completed this level. Keep practicing to improve your skills!"}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Level {selectedLevel} Completed!</h2>
                <p className="text-lg text-gray-600">
                  You've earned {evaluationResult?.levelProgress?.stars || 1} star{(evaluationResult?.levelProgress?.stars || 1) !== 1 ? 's' : ''} for this level.
                </p>
                {evaluationResult?.levelProgress?.stars === 3 && (
                  <div className="mt-2 text-green-600 font-bold">Perfect score! Excellent work!</div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={backToLevelSelection}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-pink-700"
                >
                  Back to Levels
                </button>
                {selectedLevel < 30 && (
                  <button
                    onClick={() => {
                      setSelectedLevel(prev => Math.min(prev + 1, 30));
                      setTestCompleted(false);
                      setShowEvaluation(false);
                      setResponses([]);
                      fetchQuestions();
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
                  >
                    Next Level
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {difficulty} Level • {selectedLevel || ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                  <div 
                    className="bg-pink-500 h-1 rounded-full" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {questions[currentIndex]?.instructions || "Listen to the audio and answer:"}
                </h2>
                
                {/* Audio content section */}
                <div className="p-4 bg-pink-50 rounded-lg text-pink-900 mb-4">
                  {questions[currentIndex]?.content ? (
                    <div>
                      {questions[currentIndex].content
                        .split('\n')
                        .map((line, i) => {
                          // Process any audio tags in the line
                          const audioMatch = line.match(/\[Audio:\s*([^\]]*)\]/g);
                          if (audioMatch) {
                            const cleanLine = line.replace(/\[Audio:\s*([^\]]*)\]/g, '');
                            return (
                              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                                {cleanLine}
                                {audioMatch.map((match, j) => {
                                  const audioContent = match.replace(/\[Audio:\s*|\]/g, '');
                                  return (
                                    <em key={`audio-${j}`} className="ml-2 text-gray-600">
                                      (Audio: {audioContent})
                                    </em>
                                  );
                                })}
                              </p>
                            );
                          }
                          return (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          );
                        })}
                    </div>
                  ) : "No content available"}
                </div>
                
                {/* Question text - Added to display the actual question */}
                <div className="p-4 bg-indigo-50 rounded-lg text-indigo-900 border border-indigo-100">
                  <h3 className="font-bold mb-2">Question:</h3>
                  {questions[currentIndex]?.questionText && 
                   questions[currentIndex]?.questionText !== "[Question text missing]" ? (
                    <p className="font-medium">{questions[currentIndex].questionText}</p>
                  ) : questions[currentIndex]?.question ? (
                    <p className="font-medium">{questions[currentIndex].question}</p>
                  ) : questions[currentIndex]?.content ? (
                    <p className="font-medium">
                      {generateQuestionFromContent(questions[currentIndex].content)}
                    </p>
                  ) : (
                    <div>
                      <p className="text-red-500 font-medium mb-2">Specific question text is missing for this exercise.</p>
                      <p className="text-sm text-gray-700">
                        Please answer based on what you hear in the audio and the instructions above.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Audio player section */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={playAudio}
                    disabled={audioPlayed}
                    className={`${
                      audioPlayed 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white px-4 py-2 rounded-lg flex items-center`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-3.536 5 5 0 00-1.414-3.536M2.757 12a9 9 0 002.828-6.364A9 9 0 002.757 2.636" />
                    </svg>
                    {audioPlayed ? 'Audio Played' : 'Play Audio'}
                  </button>
                </div>
                
                {/* Timer display */}
                {timeLeft > 0 && (
                  <div className="mt-4 flex justify-center">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <CircularProgressbar
                        value={timeLeft}
                        maxValue={questions[currentIndex]?.timeLimit || 30}
                        text={`${timeLeft}s`}
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: timeLeft < 5 ? '#ef4444' : '#8b5cf6',
                          textColor: timeLeft < 5 ? '#ef4444' : '#1f2937',
                          trailColor: '#e5e7eb',
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                {questions[currentIndex]?.type === 'multiple-choice' ? (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Select your answer:</h3>
                    <div className="space-y-2">
                      {questions[currentIndex]?.options?.map((option, index) => (
                        <div 
                          key={index}
                          onClick={() => handleOptionSelect(option)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedOptions.includes(option)
                              ? 'bg-purple-100 border-purple-500 text-purple-700'
                              : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Your response:</h3>
                    <textarea
                      value={userResponse}
                      onChange={handleTextResponseChange}
                      placeholder="Type your answer here..."
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="4"
                    ></textarea>
                  </div>
                )}
              </div>
              
              {feedback ? (
                <div className="mb-6">
                  <div className={`p-4 rounded-lg ${
                    score === 3 ? 'bg-green-50 text-green-800' :
                    score === 2 ? 'bg-blue-50 text-blue-800' :
                    'bg-yellow-50 text-yellow-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      <h3 className="font-bold text-lg">Feedback:</h3>
                      <div className="ml-2 flex">
                        {[...Array(3)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            className={`w-5 h-5 ${i < score ? 'text-yellow-500 fill-current' : 'text-gray-300 fill-current'}`}
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p>{feedback}</p>
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Practice'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={submitAnswer}
                  disabled={
                    loading || 
                    (questions[currentIndex]?.type === 'multiple-choice' && selectedOptions.length === 0) ||
                    (questions[currentIndex]?.type === 'text-input' && !userResponse.trim()) ||
                    !audioPlayed
                  }
                  className={`w-full font-medium py-2 px-4 rounded-lg ${
                    loading || 
                    (questions[currentIndex]?.type === 'multiple-choice' && selectedOptions.length === 0) ||
                    (questions[currentIndex]?.type === 'text-input' && !userResponse.trim()) ||
                    !audioPlayed
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ListeningPractice;
