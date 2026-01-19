import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


// Custom error message component since toast library may not be available
const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <p className="text-gray-800 mb-4">{message}</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

function DecisionScenario() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState('Beginner');
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [token, setToken] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [levelProgress, setLevelProgress] = useState({
    Beginner: [],
    Moderate: [],
    Expert: []
  });
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [responses, setResponses] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  
  const timerRef = useRef(null);

  // Welcome message for the decision-making practice
  const welcomeMessage = `Welcome to your personalized Decision-Making Journey! At each level, you'll face real-life scenarios tailored to challenge your thinking, judgment, and leadership. Starting from simple everyday choices to complex, high-stakes dilemmas, every decision you make will shape your path and unlock higher levels with deeper challenges. As you grow, so will your ability to prioritize, handle pressure, and think critically. Choose wisely—each level is a step closer to mastering the art of smart decision-making.`;

  useEffect(() => {
    // Check if user is authenticated
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [router]);

  // Fetch level progress data when component mounts
  useEffect(() => {
    if (token) {
      fetchLevelProgress();
    }
  }, [token]);

  // Fetch user's level progress
  const fetchLevelProgress = async () => {
    try {
      setLoading(true);
      
      // Get userId from localStorage if available
      let userId = 'guest';
      if (typeof window !== 'undefined') {
        try {
          const userDataStr = localStorage.getItem('user');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userId = userData.id || userData._id || userData.userId || userDataStr;
            console.log('Fetching progress for user:', userId);
          }
        } catch (err) {
          console.error('Error accessing localStorage:', err);
        }
      }
      
      const url = `/api/getPracticeProgress?userId=${encodeURIComponent(userId)}&skillArea=DecisionMaking&_t=${Date.now()}`;
      console.log('Fetching level progress from:', url);
      
      const response = await fetch(url, {
        cache: 'no-store', // Prevent caching to get fresh data
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch progress: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Received progress data:', responseData);
      
      if (!responseData.success) {
        console.error('Error in progress response:', responseData.message);
        throw new Error(responseData.message || 'Failed to load progress data');
      }
      
      // Process the progress data
      const progressData = initializeLevelProgress(responseData);
      console.log('Initialized level progress data:', progressData);
      
      // Update the state with the new progress data
      setLevelProgress(progressData);
      
      return progressData;
    } catch (error) {
      console.error('Error fetching level progress:', error);
      // Return the current levelProgress state if available
      return levelProgress;
      return defaultProgress;
      
    } finally {
      setLoading(false);
    }
  };

  // Initialize level progress data structure with defaults if needed
  const initializeLevelProgress = (serverResponse) => {
    const difficulties = ['Beginner', 'Moderate', 'Expert'];
    const levelsPerDifficulty = 10;
    const progressData = {
      Beginner: [],
      Moderate: [],
      Expert: []
    };
    
    // Debug the server response
    console.log('Server response in initializeLevelProgress:', JSON.stringify(serverResponse, null, 2));
    
    // Extract the progress data from the server response
    // The server returns { success: true, progress: { ... } }
    const serverProgress = Array.isArray(serverResponse?.progress) ? serverResponse.progress[0] : null;
    
    // Debug what we received from server
    console.log('Extracted progress data:', JSON.stringify(serverProgress, null, 2));
    
    // If we have levelProgressMap in the server response, use that directly
    if (serverProgress?.levelProgressMap) {
      // First, initialize all levels as locked
      difficulties.forEach(diff => {
        progressData[diff] = [];
        for (let i = 0; i < levelsPerDifficulty; i++) {
          progressData[diff].push({
            level: i + 1,
            stars: 0,
            completed: false,
            locked: i !== 0 // First level is unlocked by default
          });
        }
      });
      
      // Then update with server data
      serverProgress.levelProgressMap.forEach(levelData => {
        const { level, difficulty, status, stars, completed } = levelData;
        
        if (progressData[difficulty] && level >= 1 && level <= levelsPerDifficulty) {
          const idx = level - 1;
          progressData[difficulty][idx] = {
            level,
            stars: stars || 0,
            completed: completed || false,
            // Lock levels that are not 'completed' or 'current' status
            locked: status === 'locked' || (status !== 'completed' && status !== 'current' && level > 1)
          };
          
          // If a level is completed, ensure the next level is unlocked
          if (completed && level < levelsPerDifficulty) {
            progressData[difficulty][level] = {
              ...progressData[difficulty][level],
              locked: false
            };
          }
        }
      });
      
      // Ensure first level of each difficulty is always unlocked
      difficulties.forEach(diff => {
        if (progressData[diff]?.[0]) {
          progressData[diff][0].locked = false;
        }
      });
      
      console.log('Processed level progress from levelProgressMap:', JSON.stringify(progressData, null, 2));
      return progressData;
    }
    
    // Process levelProgress array if it exists
    if (Array.isArray(serverProgress?.levelProgress)) {
      serverProgress.levelProgress.forEach(level => {
        if (level.difficulty && level.level) {
          const difficulty = level.difficulty;
          const levelNum = level.level;
          progressData[difficulty] = progressData[difficulty] || [];
          progressData[difficulty].push({
            level: levelNum,
            stars: level.stars || 0,
            completed: level.completed || false,
            locked: level.locked !== undefined ? level.locked : levelNum !== 1
          });
        }
      });
    }
    
    // Process each difficulty level
    difficulties.forEach(diff => {
      progressData[diff] = progressData[diff] || [];
      
      // Get all levels for this difficulty from server
      const serverDifficultyLevels = serverProgress?.levelProgress?.filter(l => l.difficulty === diff) || [];
      
      // Generate 10 levels for each difficulty
      for (let level = 1; level <= levelsPerDifficulty; level++) {
        // Find server data for this level
        const serverLevel = serverDifficultyLevels.find(l => l.level === level);
        
        // Check if this level is completed based on server data
        const isCompleted = serverLevel?.completed || (serverLevel?.stars > 0);
        
        // Determine if the level should be locked
        let isLocked = true;
        
        // First level of each difficulty is always unlocked
        if (level === 1) {
          isLocked = false;
        } 
        // Use the locked status from server if explicitly set
        else if (serverLevel && serverLevel.locked !== undefined) {
          isLocked = serverLevel.locked;
        } 
        // For Beginner difficulty, check previous level completion
        else if (diff === 'Beginner') {
          const prevLevel = progressData[diff][level - 2];
          isLocked = !prevLevel?.completed;
        }
        // For Moderate, check if all Beginner levels are completed and previous level in Moderate
        else if (diff === 'Moderate') {
          const allBeginnerCompleted = progressData.Beginner.length === 10 && 
                                     progressData.Beginner.every(l => l.completed);
          const prevLevel = progressData[diff][level - 2];
          isLocked = !allBeginnerCompleted || !prevLevel?.completed;
        }
        // For Expert, check if all Moderate levels are completed and previous level in Expert
        else if (diff === 'Expert') {
          const allModerateCompleted = progressData.Moderate.length === 10 && 
                                     progressData.Moderate.every(l => l.completed);
          const prevLevel = progressData[diff][level - 2];
          isLocked = !allModerateCompleted || !prevLevel?.completed;
        }
        
        // Add the level to the progress data
        progressData[diff].push({
          level,
          stars: serverLevel?.stars || 0,
          completed: isCompleted,
          locked: isLocked
        });
      }
    });
    
    // Deduplicate entries so each level appears only once, keeping server data when available
    difficulties.forEach(diff => {
      const deduped = Array(levelsPerDifficulty).fill(null);
      progressData[diff].forEach(item => {
        const idx = item.level - 1;
        deduped[idx] = { ...(deduped[idx] || {}), ...item };
      });
      progressData[diff] = deduped.map((item, i) => {
        if (item) return item;
        return {
          level: i + 1,
          stars: 0,
          completed: false,
          locked: i !== 0
        };
      });
    });

    console.log('Processed level progress (deduped):', JSON.stringify(progressData, null, 2));
    return progressData;
  };

  // Fallback scenarios have been completely removed - always using GPT API
  
  // Start the practice with selected difficulty and level
  const startPractice = async () => {
    if (!selectedLevel) return;
    
    try {
      setLoading(true);
      
      // First, refresh the level progress to ensure we have the latest data
      const updatedProgress = await fetchLevelProgress();
      
      // Check if the selected level is locked
      const levelData = updatedProgress?.[difficulty]?.[selectedLevel - 1];
      const isLocked = levelData?.locked;
      
      console.log(`Starting practice for ${difficulty} level ${selectedLevel}`, { 
        levelData,
        isLocked,
        allLevels: updatedProgress?.[difficulty]
      });
      
      if (isLocked) {
        console.log(`Level ${selectedLevel} (${difficulty}) is locked. Cannot start.`);
        setErrorMessage(`Level ${selectedLevel} is locked. Please complete the previous level first.`);
        setShowError(true);
        setShowEvaluation(false);
        setShowLevelSelection(true);
        setShowScenario(false);
        return;
      }
      
      // Reset UI state
      setShowWelcome(false);
      setShowLevelSelection(false);
      setShowEvaluation(false);
      setShowScenario(true);
      setShowError(false);
      
      console.log(`Starting practice for ${difficulty} level ${selectedLevel}`);
      
      // Use GET request with query parameters to avoid 431 errors
      const url = `/api/fetchDecisionScenarios?difficulty=${encodeURIComponent(difficulty)}&level=${encodeURIComponent(selectedLevel)}&_t=${Date.now()}`;
      console.log('Fetching scenarios from URL:', url);
      
      // Add retry mechanism for better resilience
      const maxRetries = 2;
      let retries = 0;
      let success = false;
      let data;
      
      while (!success && retries <= maxRetries) {
        try {
          const response = await fetch(url, {
            method: 'GET',  // Using GET instead of POST to avoid large headers
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache' // Prevent caching
            }
          });
          
          if (!response.ok) {
            console.warn(`Server responded with status: ${response.status} - Retry ${retries}/${maxRetries}`);
            // Try to get detailed error message from response
            const errorData = await response.json().catch(() => ({}));
            if (errorData && errorData.message) {
              throw new Error(`${errorData.message}`);
            } else {
              throw new Error(`API responded with status ${response.status}`);
            }
          }

          const text = await response.text();
          console.log('Response text length:', text.length);
          
          if (!text || text.trim() === '') {
            throw new Error('Empty response received from API');
          }
          
          data = JSON.parse(text);
          success = true;
        } catch (error) {
          retries++;
          console.error(`API call attempt ${retries} failed:`, error);
          
          if (retries > maxRetries) {
            throw error; // Rethrow to be caught by outer catch
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (data && data.success && data.scenarios && data.scenarios.length > 0) {
        console.log(`Received ${data.scenarios.length} scenarios for ${difficulty} level ${selectedLevel}`);
        
        setScenarios(data.scenarios);
        setCurrentIndex(0);
        setSelectedOption(null);
        setTestStarted(true);
        setTestCompleted(false);
        setShowLevelSelection(false);
        setShowEvaluation(false);
        setResponses([]);
        setEvaluationResult(null);
        
        // Start the timer
        const timeLimit = data.scenarios[0].timeLimit || 120;
        setTimeLeft(timeLimit);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Set up the timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        throw new Error('Invalid scenario data structure received from API');
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      
      // Set appropriate error message based on error type
      const message = error.toString().includes('API key') ?
        'Missing OpenAI API key. Please add your API key to the environment variables.' :
        'Failed to load scenarios from API. Please try again later or contact support.';
      
      // Show the error message
      setErrorMessage(message);
      setShowError(true);
      setShowLevelSelection(true); // Return to level selection
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  // Submit the selected response
  const submitResponse = async () => {
    if (!selectedOption) return;
    
    try {
      setLoading(true);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const currentScenario = scenarios[currentIndex];
      const selectedOptionObj = currentScenario.options.find(opt => opt.id === selectedOption);
      
      console.log(`Submitting response for scenario ${currentIndex + 1}/${scenarios.length}`);
      
      // Add response to the list
      const newResponses = [...responses, {
        scenarioId: currentScenario.scenarioId,
        scenario: currentScenario.description,
        selectedOption,
        optionText: selectedOptionObj?.text || '',
        optionValue: selectedOptionObj?.value || 0,
        timeSpent: currentScenario.timeLimit - timeLeft,
        completedAt: new Date().toISOString()
      }];
      
      setResponses(newResponses);
      
      // If there are more scenarios, go to the next one
      if (currentIndex < scenarios.length - 1) {
        const nextIndex = currentIndex + 1;
        
        // Reset the timer for the next scenario
        const nextTimeLimit = scenarios[nextIndex].timeLimit || 120;
        
        console.log(`Moving to next scenario: ${nextIndex + 1}/${scenarios.length}`);
        
        // Update state for the next question
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setTimeLeft(nextTimeLimit);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Set up the timer for the next question
        timerRef.current = setInterval(() => {
          setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        // All scenarios are completed
        console.log('All scenarios completed, evaluating responses...');
        setTestCompleted(true);
        
        // Clear any existing timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Evaluate the responses
        await evaluateResponses(newResponses);
        
        // After evaluation, show the evaluation screen
        setShowEvaluation(true);
        setShowScenario(false);
      }
    } catch (error) {
      console.error('Error in submitResponse:', error);
      // Show error to user
      setErrorMessage('An error occurred while submitting your response. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate user responses and update progress
  const evaluateResponses = async () => {
    try {
      setLoading(true);
      
      // Get user ID from localStorage
      let userId = 'guest';
      let userEmail = '';
      
      if (typeof window !== 'undefined') {
        try {
          const userDataStr = localStorage.getItem('user');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userId = userData.id || userData._id || userData.userId || userDataStr;
            userEmail = userData.email || '';
            console.log('Using user ID for evaluation:', userId);
          }
        } catch (err) {
          console.error('Error accessing localStorage:', err);
        }
      }
      
      // Filter out any empty or invalid responses
      const compactResponses = responses.filter(r => 
        r && r.scenarioId && r.selectedOption && r.optionText
      );
      
      if (compactResponses.length === 0) {
        throw new Error('No valid responses to evaluate');
      }
      
      console.log('Submitting evaluation request with data:', {
        userId,
        userEmail,
        skillArea: 'DecisionMaking',
        difficulty,
        level: selectedLevel,
        responses: compactResponses,
        scenarios,
        unlockNextLevel: true
      });
      
      // Call the evaluation API
      const response = await fetch('/api/evaluateDecisionScenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          skillArea: 'DecisionMaking',
          difficulty,
          level: selectedLevel,
          responses: compactResponses,
          scenarios,
          unlockNextLevel: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Evaluation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Evaluation result:', result);
      
      // Log the raw result for debugging
      console.log('Raw evaluation result from server:', JSON.stringify(result, null, 2));
      
      // Log the raw result for debugging
      console.log('Raw result from server:', JSON.stringify(result, null, 2));
      
      // Helper function to safely get nested properties
      const getNestedValue = (obj, path, defaultValue) => {
        try {
          return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
        } catch (e) {
          return defaultValue;
        }
      };
      
      // Transform the result to match the expected format
      const transformedResult = {
        success: result.success || false,
        message: result.message || '',
        // Handle both nested and flat structures
        evaluation: {
          overallEvaluation: {
            score: getNestedValue(result, 'evaluation.overallEvaluation.score', 
                      result.score || getNestedValue(result, 'evaluation.score', 0)),
            stars: getNestedValue(result, 'evaluation.overallEvaluation.stars', 
                     result.stars || getNestedValue(result, 'evaluation.stars', 0)),
            decisionQuality: getNestedValue(result, 'evaluation.overallEvaluation.decisionQuality', 
                                result.decisionQuality || getNestedValue(result, 'evaluation.decisionQuality', 'Good')),
            decisionStyle: getNestedValue(result, 'evaluation.overallEvaluation.decisionStyle', 
                               result.decisionStyle || getNestedValue(result, 'evaluation.decisionStyle', 'Balanced')),
            feedback: getNestedValue(result, 'evaluation.overallEvaluation.feedback', 
                           result.feedback || getNestedValue(result, 'evaluation.feedback', 'No feedback available.')),
            strengths: (() => {
              const strengths = getNestedValue(result, 'evaluation.overallEvaluation.strengths', 
                                     result.strengths || getNestedValue(result, 'evaluation.strengths', []));
              return Array.isArray(strengths) ? strengths : [strengths || 'No specific strengths identified.'];
            })(),
            improvements: (() => {
              const improvements = getNestedValue(result, 'evaluation.overallEvaluation.improvements', 
                                        result.improvements || getNestedValue(result, 'evaluation.improvements', []));
              return Array.isArray(improvements) ? improvements : [improvements || 'No specific areas for improvement.'];
            })()
          },
          // Handle option analysis
          optionAnalysis: getNestedValue(result, 'evaluation.optionAnalysis', {
            bestOption: result.bestOption,
            worstOption: result.worstOption,
            userChoiceQuality: result.userChoiceQuality,
            alternativeOutcomes: result.alternativeOutcomes,
            trends: result.trends
          }),
          // Handle question analysis
          questionAnalysis: getNestedValue(result, 'evaluation.questionAnalysis', 
                                 Array.isArray(result.questionAnalysis) ? result.questionAnalysis : [])
        }
      };
      
      // If we have a direct result with feedback but no evaluation object, use that
      if (!result.evaluation && (result.feedback || result.strengths || result.improvements)) {
        transformedResult.evaluation.overallEvaluation = {
          ...transformedResult.evaluation.overallEvaluation,
          feedback: result.feedback || transformedResult.evaluation.overallEvaluation.feedback,
          strengths: Array.isArray(result.strengths) 
            ? result.strengths 
            : (result.strengths ? [result.strengths] : transformedResult.evaluation.overallEvaluation.strengths),
          improvements: Array.isArray(result.improvements)
            ? result.improvements
            : (result.improvements ? [result.improvements] : transformedResult.evaluation.overallEvaluation.improvements)
        };
      }
      
      // Ensure we have analysis for every scenario
      if (Array.isArray(transformedResult.evaluation.questionAnalysis)) {
        const titlesSet = new Set(transformedResult.evaluation.questionAnalysis.map(q => q.questionTitle));
        scenarios.forEach((sc, idx) => {
          const title = sc.title || `Question ${idx + 1}`;
          if (!titlesSet.has(title)) {
            transformedResult.evaluation.questionAnalysis.push({
              questionTitle: title,
              bestOption: 'N/A',
              worstOption: 'N/A',
              userChoice: 'N/A',
              userChoiceQuality: 'Feedback unavailable.',
              alternativeOutcomes: 'N/A'
            });
          }
        });
      }

      // Debug the transformed result
      console.log('Transformed evaluation result:', JSON.stringify(transformedResult, null, 2));
      
      // Update the evaluation result state
      setEvaluationResult(transformedResult);
      
      // Show the evaluation screen
      setShowEvaluation(true);
      setShowScenario(false);
      
      // Force a refresh of the level progress to show updated stars and unlocked levels
      await fetchLevelProgress();
      
      // Manually update the level progress in the UI to show the next level as unlocked
      setLevelProgress(prevProgress => {
        const newProgress = JSON.parse(JSON.stringify(prevProgress)); // Deep clone
        const currentLevel = selectedLevel - 1; // Convert to 0-based index
        
        // Mark current level as completed
        if (newProgress[difficulty]?.[currentLevel]) {
          newProgress[difficulty][currentLevel] = {
            ...newProgress[difficulty][currentLevel],
            completed: true,
            stars: Math.max(
              newProgress[difficulty][currentLevel]?.stars || 0, 
              transformedResult.evaluation.overallEvaluation.stars || 0
            ),
            locked: false
          };
          
          console.log(`Updated level ${selectedLevel} (${difficulty}):`, 
            newProgress[difficulty][currentLevel]);
        }
        
        // Unlock the next level if it exists
        const nextLevel = selectedLevel; // Already 1-based
        if (nextLevel < 10 && newProgress[difficulty]?.[nextLevel]) {
          newProgress[difficulty][nextLevel] = {
            ...newProgress[difficulty][nextLevel],
            locked: false
          };
          console.log(`Unlocked next level ${nextLevel + 1} (${difficulty})`);
        }
        
        // If this was the last level of a difficulty, unlock the first level of the next difficulty
        if (selectedLevel === 10) {
          let nextDifficulty = null;
          if (difficulty === 'Beginner') nextDifficulty = 'Moderate';
          else if (difficulty === 'Moderate') nextDifficulty = 'Expert';
          
          if (nextDifficulty && newProgress[nextDifficulty]?.[0]) {
            newProgress[nextDifficulty][0] = {
              ...newProgress[nextDifficulty][0],
              locked: false
            };
            console.log(`Unlocked first level of ${nextDifficulty} difficulty`);
          }
        }
        
        console.log('Updated progress data:', JSON.stringify(newProgress, null, 2));
        return newProgress;
      });
      
      return transformedResult;
      
    } catch (error) {
      console.error('Error evaluating responses:', error);
      setErrorMessage(error.message || 'Failed to evaluate responses. Please try again.');
      setShowError(true);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to level selection
  const backToLevelSelection = async () => {
    try {
      setLoading(true);
      setTestStarted(false);
      setTestCompleted(false);
      setShowEvaluation(false);
      setShowScenario(false);
      setShowWelcome(false);
      setShowLevelSelection(true);
      
      // Reset any selected options
      setSelectedOption(null);
      setResponses([]);
      setEvaluationResult(null);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Force a fresh fetch of level progress to show updated stars and unlocked levels
      const updatedProgress = await fetchLevelProgress();
      console.log('Refreshed level progress after returning to level selection:', updatedProgress);
      
      // Force a re-render of the level selection UI
      setLevelProgress(prev => ({ ...prev }));
    } catch (error) {
      console.error('Error in backToLevelSelection:', error);
      setErrorMessage('Failed to load level selection. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Start the next level if available
  const goToNextLevel = async () => {
    try {
      setLoading(true);
      
      // First, refresh the level progress to get the latest data
      const updatedProgress = await fetchLevelProgress();
      
      // Determine the next level/difficulty
      let nextDifficulty = difficulty;
      let nextLevel = selectedLevel + 1;
      
      // Handle level and difficulty transitions
      if (nextLevel > 10) {
        // Move to next difficulty
        if (difficulty === 'Beginner') {
          nextDifficulty = 'Moderate';
        } else if (difficulty === 'Moderate') {
          nextDifficulty = 'Expert';
        } else {
          // All levels completed
          setShowEvaluation(false);
          setShowLevelSelection(true);
          setShowWelcome(false);
          setShowScenario(false);
          return;
        }
        nextLevel = 1; // Start at level 1 of the next difficulty
      }
      
      // Check if the next level is locked in the current progress state
      const nextLevelData = updatedProgress?.[nextDifficulty]?.[nextLevel - 1];
      const isNextLevelLocked = nextLevelData?.locked;
      
      console.log(`Next level data for ${nextDifficulty} ${nextLevel}:`, nextLevelData);
      
      if (isNextLevelLocked) {
        console.log(`Next level ${nextLevel} (${nextDifficulty}) is locked. Returning to level selection.`);
        setShowEvaluation(false);
        setShowLevelSelection(true);
        return;
      }
      
      // Update the difficulty and level in state
      setDifficulty(nextDifficulty);
      setSelectedLevel(nextLevel);
      
      // Force a state update to ensure the new values are used
      await new Promise(resolve => setTimeout(resolve, 0));
      
      console.log(`Proceeding to next level: ${nextLevel} (${nextDifficulty})`);
      
      // Update state for the next level
      setDifficulty(nextDifficulty);
      setSelectedLevel(nextLevel);
      setShowEvaluation(false);
      setShowLevelSelection(false);
      setShowScenario(false);
      setShowWelcome(false);
      
      // Start the next level
      startPractice();
      setCurrentIndex(0);
      setSelectedOption(null);
      setShowLevelSelection(false);
      setShowWelcome(false);
      setShowScenario(true);
      setScenarios([]);
      setResponses([]);
      setEvaluationResult(null);
      setTimeLeft(120);
      setStartTime(null);
      setEndTime(null);
      
      // Load scenarios for the next level
      try {
        const response = await fetch(
          `/api/fetchDecisionScenarios?difficulty=${encodeURIComponent(nextDifficulty)}&level=${encodeURIComponent(nextLevel)}`,
          { method: 'GET', headers: { 'Accept': 'application/json' } }
        );
        
        if (!response.ok) throw new Error('Failed to load scenarios');
        
        const data = await response.json();
        if (data.success && data.scenarios?.length > 0) {
          setScenarios(data.scenarios);
          setTimeLeft(data.scenarios[0]?.timeLimit || 120);
          
          // Start the timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
              if (prevTime <= 1) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
        } else {
          throw new Error('No scenarios found');
        }
      } catch (error) {
        console.error('Error loading next level scenarios:', error);
        // Fall back to level selection if we can't load the next level
        setShowLevelSelection(true);
        setShowScenario(false);
      }
    } catch (error) {
      console.error('Error in goToNextLevel:', error);
      // Fallback to basic navigation if there's an error
      if (selectedLevel < 10) {
        setSelectedLevel(prev => prev + 1);
      }
      setShowEvaluation(false);
      setShowLevelSelection(true);
    } finally {
      setLoading(false);
    }
  };

  // Render the welcome screen
  const renderWelcome = () => {
    return (
      <div className="text-center max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Decision-Making Practice</h1>
        <p className="text-gray-600 mb-8 text-lg">{welcomeMessage}</p>
        <div className="mt-8">
          <button 
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105"
            onClick={() => {
              setShowWelcome(false);
              setShowLevelSelection(true);
            }}
          >
            Start Practicing
          </button>
        </div>
      </div>
    );
  };

  // Render star rating component
  const renderStars = (count) => {
    return (
      <div className="flex justify-center">
        {[1, 2, 3].map((star) => (
          <span 
            key={star} 
            className={`text-${star <= count ? 'yellow-400' : 'gray-300'} text-lg`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Render the current scenario
  const renderScenario = () => {
    const currentScenario = scenarios[currentIndex];
    
    if (!currentScenario) {
      return (
        <div className="text-center p-8">
          <p>No scenario found. Please try again.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={backToLevelSelection}
          >
            Back to Levels
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 mr-4">
            <CircularProgressbar
              value={((currentIndex + 1) / scenarios.length) * 100}
              text={`${currentIndex + 1}/${scenarios.length}`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#3B82F6',
                textColor: '#1F2937',
                trailColor: '#E5E7EB',
              })}
            />
          </div>
          <span className="text-gray-600 font-medium">
            Question {currentIndex + 1} of {scenarios.length}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentScenario.title}</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">{currentScenario.description}</p>
        
        <div className="space-y-4 mb-8">
          {currentScenario.options.map((option) => (
            <div
              key={option.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedOption === option.id 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-md' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-start">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 mt-0.5 flex-shrink-0 ${
                  selectedOption === option.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {option.id}
                </span>
                <span className="text-gray-700">{option.text}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-gray-600">
            Time left: <span className="font-medium">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <button
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              selectedOption
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={submitResponse}
            disabled={!selectedOption}
          >
            {currentIndex < scenarios.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    );
  };

  // Render level selection UI
  const renderLevelSelection = () => {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Select a Level</h2>
        
        {/* Difficulty Tabs */}
        <div className="flex justify-center mb-6">
          {['Beginner', 'Moderate', 'Expert'].map((diff) => (
            <button
              key={diff}
              className={`px-4 py-2 mx-2 rounded-lg ${
                difficulty === diff
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setDifficulty(diff)}
            >
              {diff}
            </button>
          ))}
        </div>
        
        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {levelProgress[difficulty]?.map((level) => {
            const isLocked = level.locked && level.level > 1;
            const isCurrent = level.level === selectedLevel;
            const hasStars = level.stars > 0;
            
            return (
              <div 
                key={`${difficulty}-${level.level}`}
                className={`relative p-4 rounded-lg text-center transition-all ${
                  isLocked
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-blue-100 border-2 border-blue-500 transform scale-105'
                    : 'bg-white hover:bg-blue-50 border border-blue-200 cursor-pointer'
                }`}
                onClick={() => !isLocked && setSelectedLevel(level.level)}
              >
                <div className="text-xl font-bold mb-1">Level {level.level}</div>
                
                {/* Star Rating */}
                {(level.completed || hasStars) && (
                  <div className="flex justify-center gap-0.5 mb-2">
                    {[1, 2, 3].map((star) => (
                      <span 
                        key={star} 
                        className={`text-${star <= (level.stars || 0) ? 'yellow-400' : 'gray-300'} text-lg`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Lock Icon */}
                {isLocked && (
                  <div className="absolute top-1 right-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Checkmark for completed levels */}
                {level.completed && !isLocked && (
                  <div className="absolute top-1 right-1 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Start Button */}
        <div className="mt-8 text-center">
          <button
            className={`px-6 py-3 rounded-lg text-white font-medium text-lg ${
              selectedLevel && !(levelProgress[difficulty]?.[selectedLevel - 1]?.locked && selectedLevel > 1)
                ? 'bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-transform'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={startPractice}
            disabled={!selectedLevel || (levelProgress[difficulty]?.[selectedLevel - 1]?.locked && selectedLevel > 1)}
          >
            {selectedLevel ? `Start Level ${selectedLevel}` : 'Select a Level'}
          </button>
          
          {/* Level Requirements */}
          {selectedLevel && levelProgress[difficulty]?.[selectedLevel - 1]?.locked && selectedLevel > 1 && (
            <p className="mt-2 text-sm text-red-500">
              Complete Level {selectedLevel - 1} to unlock
            </p>
          )}
        </div>
      </div>
    );
  };

  // Helper function to get evaluation data, handling different response structures
  const getEvaluationData = () => {
    if (!evaluationResult) return {};
    
    // If we have a direct evaluation result, use that
    if (evaluationResult.evaluation?.overallEvaluation) {
      return evaluationResult.evaluation.overallEvaluation;
    }
    
    // Otherwise, check for flattened properties
    return {
      score: evaluationResult.score,
      stars: evaluationResult.stars,
      decisionQuality: evaluationResult.decisionQuality,
      decisionStyle: evaluationResult.decisionStyle,
      feedback: evaluationResult.feedback,
      strengths: evaluationResult.strengths,
      improvements: evaluationResult.improvements
    };
  };

  // Render the evaluation feedback
  const renderEvaluation = () => {
    if (!evaluationResult) return null;
    
    const evaluationData = getEvaluationData();
    const stars = evaluationData.stars || 0;
    const score = evaluationData.score || 0;
    const decisionQuality = evaluationData.decisionQuality || 'N/A';
    const decisionStyle = evaluationData.decisionStyle || 'N/A';
    const feedback = evaluationData.feedback || 'No feedback available.';
    const strengths = Array.isArray(evaluationData.strengths) 
      ? evaluationData.strengths 
      : (evaluationData.strengths ? [evaluationData.strengths] : ['No specific strengths identified.']);
    const improvements = Array.isArray(evaluationData.improvements)
      ? evaluationData.improvements 
      : (evaluationData.improvements ? [evaluationData.improvements] : ['No specific areas for improvement.']);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-100 rounded-lg p-6 mb-6 text-center text-green-800 shadow-md">
          <h2 className="text-2xl font-bold mb-2">Level {selectedLevel} Completed! ({difficulty})</h2>
          <div className="flex justify-center items-center text-2xl mb-2 gap-1">
            {[...Array(Math.max(0, Math.min(3, stars)))].map((_, i) => (
              <span key={i} className="text-yellow-400 drop-shadow-md">★</span>
            ))}
            {[...Array(Math.max(0, 3 - stars))].map((_, i) => (
              <span key={i} className="text-gray-300">★</span>
            ))}
          </div>
          
          <div className="flex justify-center gap-8 my-4">
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-blue-700">{score}%</div>
              <div className="text-xs text-gray-500">Overall Score</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-blue-700">{decisionQuality}</div>
              <div className="text-xs text-gray-500">Decision Quality</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-xl font-bold text-blue-700">{decisionStyle}</div>
              <div className="text-xs text-gray-500">Decision Style</div>
            </div>
          </div>
          
          <div className="mt-4 text-lg font-semibold text-indigo-700 animate-pulse">
            {selectedLevel < 10 ? `Level ${selectedLevel + 1} is now unlocked!` : 
              difficulty !== 'Expert' ? `${difficulty === 'Beginner' ? 'Moderate' : 'Expert'} levels are now available!` :
              "Congratulations! You've completed all levels!"}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Decision-Making Performance</h3>
          <div className="text-gray-700 mb-2">
            {feedback}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Areas of Strength</h3>
          <div className="text-gray-700 mb-2">
            <ul className="list-disc pl-5 space-y-1">
              {strengths.map((strength, i) => (
                <li key={i}>{strength}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Areas for Improvement</h3>
          <div className="text-gray-700 mb-2">
            <ul className="list-disc pl-5 space-y-1">
              {improvements.map((improvement, i) => (
                <li key={i}>{improvement}</li>
              ))}
            </ul>
          </div>
        </div>

        {evaluationResult.evaluation?.optionAnalysis && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Overall Decision Analysis</h3>
            
            {evaluationResult.evaluation.optionAnalysis.trends && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Decision Patterns</h4>
                <div className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                  {evaluationResult.evaluation.optionAnalysis.trends}
                </div>
              </div>
            )}
            
            {evaluationResult.evaluation.optionAnalysis.habits && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Your Decision Habits</h4>
                <div className="text-gray-700 bg-green-50 p-4 rounded-lg">
                  {evaluationResult.evaluation.optionAnalysis.habits}
                </div>
              </div>
            )}
            
            {evaluationResult.evaluation.optionAnalysis.ethicalDilemmas && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Ethical Decision Making</h4>
                <div className="text-gray-700 bg-purple-50 p-4 rounded-lg">
                  {evaluationResult.evaluation.optionAnalysis.ethicalDilemmas}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Per-question detailed analysis */}
        {evaluationResult.evaluation?.questionAnalysis && evaluationResult.evaluation.questionAnalysis.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-2xl font-bold text-blue-800 mb-6 pb-2 border-b border-gray-200">Detailed Question Analysis</h3>
            
            <div className="space-y-8">
              {evaluationResult.evaluation.questionAnalysis.map((question, index) => (
                <div key={`question-${index}`} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                    <h4 className="text-lg font-semibold text-indigo-800">
                      {question.questionTitle || `Question ${index + 1}`}
                    </h4>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Your Choice */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-lg">
                        <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Your Choice
                        </h5>
                        <div className="bg-white p-3 rounded-md border border-yellow-100 mb-3">
                          <p className="font-medium text-gray-800">{question.userChoice}</p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-yellow-100">
                          <h6 className="text-sm font-medium text-yellow-700 mb-1">Quality Assessment</h6>
                          <p className="text-sm text-gray-700">{question.userChoiceQuality}</p>
                        </div>
                      </div>
                      
                      {/* Best Option */}
                      <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-r-lg">
                        <h5 className="font-medium text-green-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Best Option
                        </h5>
                        <div className="bg-white p-3 rounded-md border border-green-100">
                          <p className="text-gray-800">{question.bestOption}</p>
                        </div>
                      </div>
                      
                      {/* Worst Option */}
                      <div className="bg-red-50 border-l-4 border-red-400 p-5 rounded-r-lg">
                        <h5 className="font-medium text-red-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Worst Option
                        </h5>
                        <div className="bg-white p-3 rounded-md border border-red-100">
                          <p className="text-gray-800">{question.worstOption}</p>
                        </div>
                      </div>
                      
                      {/* Alternative Outcomes */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-r-lg">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Alternative Outcomes
                        </h5>
                        <div className="bg-white p-3 rounded-md border border-blue-100">
                          <p className="text-gray-700">{question.alternativeOutcomes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-6">
          <button 
            className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-semibold"
            onClick={backToLevelSelection}
          >
            Back to Levels
          </button>
          <button 
            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
            onClick={goToNextLevel}
          >
            Next Level
          </button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 bg-gray-50 min-h-screen">
      <Head>
        <title>Decision Making Practice - SHAKKTII AI</title>
        <meta name="description" content="Practice your decision making skills" />
      </Head>

      {/* Error message display */}
      {showError && (
        <ErrorMessage 
          message={errorMessage} 
          onClose={() => setShowError(false)} 
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {showWelcome && renderWelcome()}
      
      {showLevelSelection && renderLevelSelection()}
      
      {testStarted && !testCompleted && renderScenario()}
      
      {testCompleted && showEvaluation && renderEvaluation()}
    </div>
  );
}

export default DecisionScenario;