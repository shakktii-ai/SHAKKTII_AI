import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function AcademicTest() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  
  // State variables
  const [stream, setStream] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [testFormat, setTestFormat] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [mcqSelection, setMcqSelection] = useState(-1);
  const [textAnswer, setTextAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [useCache, setUseCache] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  
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
      } else {
        router.push("/login");
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);
  
  // Set department options based on selected stream
  useEffect(() => {
    if (!stream) return;
    
    let options = [];
    switch (stream) {
      case 'Science':
        options = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
        break;
      case 'Commerce':
        options = ['Accounting', 'Business Studies', 'Economics', 'Statistics'];
        break;
      case 'Arts/Humanities':
        options = ['History', 'Geography', 'Political Science', 'Sociology', 'Psychology', 'Literature'];
        break;
      case 'Engineering':
        options = ['Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'];
        break;
      case 'Medical':
        options = ['Anatomy', 'Physiology', 'Biochemistry', 'Microbiology', 'Pharmacology'];
        break;
      case 'Law':
        options = ['Constitutional Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'International Law'];
        break;
      case 'General':
      case '10th':
      case '11th':
      case '12th':
        options = ['Mathematics', 'Science', 'Social Studies', 'Language', 'Computer'];
        break;
      default:
        options = ['General Knowledge'];
    }
    
    setDepartmentOptions(options);
    setDepartment(''); // Reset department when stream changes
  }, [stream]);
  
  // Timer for the test
  useEffect(() => {
    if (test && !testCompleted) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (testCompleted && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test, testCompleted]);
  
  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Speech recognition not supported in this browser. Please try Chrome, Edge, or Safari.");
      return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' ';
        }
      }
      setTextAnswer(transcript.trim());
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    return true;
  };
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current && !initializeSpeechRecognition()) {
        return;
      }
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };
  
  // Handle selection of stream
  const handleStreamSelect = (selectedStream) => {
    setStream(selectedStream);
    setDepartment('');
    setSubject('');
    
    // Set department options based on selected stream
    let deptOptions = [];
    switch(selectedStream) {
      case '10th Grade':
        deptOptions = ['General'];
        break;
      case '11th Grade':
      case '12th Grade':
        deptOptions = ['Science', 'Commerce', 'Arts/Humanities'];
        break;
      case 'Undergraduate':
        deptOptions = ['Engineering', 'Medicine', 'Business', 'Arts', 'Science', 'Law'];
        break;
      case 'Graduate':
        deptOptions = ['Engineering', 'Medicine', 'Business', 'Arts', 'Science', 'Law', 'Education'];
        break;
      case 'Professional':
        deptOptions = ['IT', 'Healthcare', 'Finance', 'Marketing', 'HR', 'Operations'];
        break;
      default:
        deptOptions = ['General'];
    }
    
    setDepartmentOptions(deptOptions);
    setStep(2);
  };
  
  // Handle selection of department
  const handleDepartmentSelect = (selectedDepartment) => {
    setDepartment(selectedDepartment);
    setStep(3); // Move to subject selection
  };
  
  // Handle selection of subject
  const handleSubjectSelect = (selectedSubject) => {
    setSubject(selectedSubject);
    setStep(4); // Move to confidence level selection
  };
  
  // Handle selection of confidence level
  const handleConfidenceLevelSelect = (level) => {
    setConfidenceLevel(level);
    setStep(5); // Move to test format selection
  };
  
  // Handle selection of test format
  const handleTestFormatSelect = (format) => {
    setTestFormat(format);
    // Don't move to next step yet, wait for the "Start Test" button
  };
  
  // Helper function to clear all cookies that might cause large headers
  const clearProblematicCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Clear each cookie by setting its expiration date to the past
    for (let cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name) {
        console.log(`Clearing cookie: ${name}`);
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
    
    console.log('All cookies cleared to reduce header size');
  };
  
  // Generate the test
  const generateTest = async () => {
    if (!userId || !stream || !department || !subject || !confidenceLevel || !testFormat) {
      alert("Please complete all selections before starting the test.");
      return;
    }
    
    // Display helpful message to set expectations
    if (testFormat === 'Speaking') {
      setLoading(true);
      const useCache = window.confirm(
        "Generating speaking tests may take longer. Would you like to use cached questions if available? " +
        "This will be faster but may show similar questions if you've taken tests on this subject recently."
      );
      
      if (useCache) {
        // We'll add a query parameter to indicate cache preference
        setUseCache(true);
      }
      setLoading(false);
    }
    
    setLoading(true);
    setRetryCount(0); // Reset retry count when starting a new test
    const maxRetries = 2; // Maximum number of automatic retries
    
    const attemptGeneration = async (attempt = 0) => {
      try {
        console.log(`Attempting to generate test (attempt ${attempt + 1})`);
        
        // Clear all cookies before making the request
        if (attempt === 0) {
          clearProblematicCookies();
        }
        
        // Show progress message
        // Use the helper function to get the confidence level text
        const confidenceLevelText = getConfidenceLevelText(confidenceLevel);
        
        setGenerationProgress(`Generating ${confidenceLevelText} ${testFormat?.toLowerCase() || 'custom'} questions for ${subject}...`);
        
        // Use standard fetch API for consistency with other components
        const response = await fetch('/api/generateAcademicTest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            // Don't include token in headers to avoid 431 errors
          },
          body: JSON.stringify({
            userId,
            stream,
            department,
            subject,
            confidenceLevel,
            testFormat,
            useCache: useCache // Include cache preference
          })
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success) {
          // Log the test data to debug
          console.log('Test data received:', data.test);
          if (data.test && data.test.questions) {
            console.log('First question:', data.test.questions[0]);
          }
          console.log('Test generation successful');
          
          // Validate the test data structure
          if (!data.test || !Array.isArray(data.test.questions) || data.test.questions.length === 0) {
            throw new Error('Invalid test data structure received');
          }
          
          // Set fallback used flag if applicable
          if (data.usedFallback) {
            setFallbackUsed(true);
            console.log('Using fallback questions');
          } else if (data.usedCache) {
            console.log('Using cached questions');
          }
          
          // Process and normalize the question data to ensure it's in the correct format
          const processedTest = {
            ...data.test,
            questions: data.test.questions.map((q, index) => {
              // Create a properly structured question object
              const processed = {
                questionText: q.questionText || 
                              (q.question ? q.question : `Question ${index + 1} about ${subject}`),
                difficulty: q.difficulty || 'Moderate',
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswer: q.correctAnswer || ''
              };
              
              console.log(`Processed question ${index}:`, processed);
              return processed;
            })
          };
          
          console.log('Processed test data:', processedTest);
          
          // Store the processed test object in state
          setTest(processedTest);
          setUserAnswers(Array(processedTest.questions.length).fill(''));
          setCurrentQuestion(0);
          
          // Important: We need to explicitly update the component after setting state
          // Use this approach to force a refresh of the question display
          setTimeout(() => {
            console.log('Updated test state should be available now');
            // Move to test-taking phase
            setStep(6);
          }, 100);
          
          // If there's a warning but the test was created, show it as a non-blocking message
          if (data.warning) {
            console.warn('Test created with warning:', data.warning);
            setTimeout(() => {
              alert(`Note: ${data.warning}. Your test will still work, but results may not be saved permanently.`);
            }, 500); // Small delay to ensure the UI updates first
          }
        } else {
          throw new Error(data.message || data.error || 'Failed to generate test');
        }
      } catch (error) {
        console.error(`Test generation failed (attempt ${attempt + 1}):`, error);
        
        // If we haven't reached max retries, try again
        if (attempt < maxRetries) {
          console.log(`Retrying test generation automatically (${attempt + 1}/${maxRetries})...`);
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return attemptGeneration(attempt + 1);
        }
        
        // If we've exceeded retries, show error to user
        setLoading(false);
        
        // Show a more user-friendly error message with retry option
        const errorMessage = error.message.includes('API returned status') ?
          'The server is busy. Please try again in a moment.' :
          'There was a problem generating your test.';
        
        const retry = window.confirm(`${errorMessage} Would you like to try again?`);
        if (retry) {
          setLoading(true);
          attemptGeneration(0); // Reset retry count for manual retry
        }
      }
    };
    
    try {
      await attemptGeneration();
    } finally {
      setLoading(false);
    }
  };
  
  // Utility functions
  // Convert confidence level number to descriptive text
  const getConfidenceLevelText = (level) => {
    switch(parseInt(level)) {
      case 1: return 'easy';
      case 2: return 'moderate';
      case 3: return 'difficult';
      default: return 'customized';
    }
  };
  
  // Handle MCQ selection
  const handleMCQSelect = (index) => {
    setMcqSelection(index);
  };
  
  // Save answer for current question
  const saveAnswer = () => {
    const newAnswers = [...userAnswers];
    const currentQuestionObj = test.questions[currentQuestion];
    
    if (testFormat === 'MCQ') {
      // Validate that we have exactly 4 options for MCQ questions
      if (!currentQuestionObj.options || currentQuestionObj.options.length !== 4) {
        console.error('Invalid MCQ question: does not have exactly 4 options', currentQuestionObj.options);
        alert('This question has an invalid format (must have exactly 4 options). Please contact support.');
        return false;
      }
      
      // Validate that the user has selected an option
      if (mcqSelection >= 0 && mcqSelection < 4 && currentQuestionObj.options[mcqSelection]) {
        newAnswers[currentQuestion] = currentQuestionObj.options[mcqSelection];
        
        // For debugging/validation
        console.log('Selected answer:', newAnswers[currentQuestion]);
        console.log('Correct answer:', currentQuestionObj.correctAnswer);
      } else {
        alert("Please select an option before proceeding.");
        return false;
      }
    } else {
      // For Written or Speaking
      if (textAnswer.trim()) {
        newAnswers[currentQuestion] = textAnswer.trim();
      } else {
        alert("Please provide an answer before proceeding.");
        return false;
      }
    }
    
    setUserAnswers(newAnswers);
    return true;
  };
  
  // Navigate to next question
  const nextQuestion = () => {
    if (!saveAnswer()) return;
    
    if (currentQuestion < test.questions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      // Reset current answer input
      setMcqSelection(-1);
      setTextAnswer('');
    } else {
      // Last question, confirm submission
      if (confirm("You've reached the end of the test. Submit your answers for evaluation?")) {
        submitTest();
      }
    }
  };
  
  // Navigate to previous question
  const prevQuestion = () => {
    saveAnswer(); // Save current answer even when going back
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Set input to previously saved answer
      if (testFormat === 'MCQ') {
        const prevAns = userAnswers[currentQuestion - 1];
        const optionIndex = test.questions[currentQuestion - 1].options.findIndex(opt => opt === prevAns);
        setMcqSelection(optionIndex);
      } else {
        setTextAnswer(userAnswers[currentQuestion - 1] || '');
      }
    }
  };
  
  // Submit the test for evaluation
  const submitTest = async () => {
    // Make sure current answer is saved
    if (!saveAnswer()) return;
    
    // Additional validation for MCQ format - ensure all questions have exactly 4 options
    if (testFormat === 'MCQ') {
      const invalidQuestions = test.questions.filter(q => !q.options || q.options.length !== 4);
      if (invalidQuestions.length > 0) {
        setLoading(false);
        alert(`Error: ${invalidQuestions.length} question(s) do not have exactly 4 options. Please contact support.`);
        return;
      }
      
      // Ensure all answers are recorded
      const unansweredQuestions = userAnswers.findIndex(a => !a);
      if (unansweredQuestions >= 0) {
        setLoading(false);
        if (confirm(`You haven't answered question ${unansweredQuestions + 1}. Go to that question?`)) {
          setCurrentQuestion(unansweredQuestions);
          return;
        }
      }
    }
    
    setLoading(true);
    setTestCompleted(true);
    
    try {
      // Clear cookies here too for consistency
      clearProblematicCookies();
      
      // Format answers properly to match the AcademicTestResponse model structure
      const formattedAnswers = userAnswers.map((answer, index) => ({
        questionIndex: index,
        userAnswer: answer || 'No answer provided' // Ensure we always have a value to meet the required constraint
      }));
      
      console.log('Formatted answers for submission:', formattedAnswers);
      
      // Use standard fetch API for consistency with other components
      const response = await fetch('/api/evaluateAcademicTest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Don't include token in headers to avoid 431 errors
        },
        body: JSON.stringify({
          userId: userId,
          testId: test._id,
          answers: formattedAnswers,
          timeSpent: timeSpent
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Evaluation successful:', data);
        
        // Use the evaluation data from the response
        if (data.evaluation) {
          setEvaluation(data.evaluation);
        } else {
          // If evaluation property is missing, use the whole data object
          setEvaluation(data);
        }
        
        setShowResults(true);
      } else {
        console.error('Evaluation error:', data.error || data.message || 'Unknown error');
        
        // Show more user-friendly error message
        let errorMessage = 'An error occurred while evaluating your test.'; 
        
        if (data.error && data.error.includes('stars')) {
          errorMessage = 'There was an issue with the scoring system. Your test has been submitted but scores may not be accurate.';
        } else if (data.error || data.message) {
          errorMessage = `Error: ${data.error || data.message}`;
        }
        
        alert(errorMessage);
        
        // Even with error, try to show partial results if available
        if (data.evaluation) {
          setEvaluation(data.evaluation);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert(`Failed to submit test: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render star rating
  const renderStars = (count) => {
    return (
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-2xl ${i < count ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
        ))}
      </div>
    );
  };
  
  // Render Step 1: Academic Stream Selection
  const renderStreamSelection = () => {
    const streams = ['10th', '11th', '12th', 'Science', 'Commerce', 'Arts/Humanities', 'Engineering', 'Medical', 'Law', 'General'];
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Test</h1>
          <button
            onClick={() => router.push('/academicTestHistory')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            View Test History
          </button>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">🧭 Step 1: Choose Your Academic Stream</h2>
        <p className="text-gray-600">Please select your academic stream from the list below:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {streams.map((streamOption) => (
            <button
              key={streamOption}
              onClick={() => handleStreamSelect(streamOption)}
              className={`p-4 rounded-lg shadow hover:shadow-md transition duration-300 
                ${stream === streamOption ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              {streamOption}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render Step 2: Department Selection
  const renderDepartmentSelection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setStep(1)} 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">🏫 Step 2: Select Your Department or Specialization</h2>
        </div>
        
        <p className="text-gray-600">You selected <span className="font-semibold text-blue-600">{stream}</span>. Now choose your department:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {departmentOptions.map((dept) => (
            <button
              key={dept}
              onClick={() => handleDepartmentSelect(dept)}
              className={`p-4 rounded-lg shadow hover:shadow-md transition duration-300 
                ${department === dept ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render Step 3: Subject Selection
  const renderSubjectSelection = () => {
    // Generate subject options based on department
    const subjectOptions = [];
    
    // Add some example subjects based on department
    if (department === 'Physics') {
      subjectOptions.push('Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics');
    } else if (department === 'Computer Science') {
      subjectOptions.push('Programming', 'Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems');
    } else if (department === 'Mathematics') {
      subjectOptions.push('Algebra', 'Calculus', 'Geometry', 'Statistics', 'Trigonometry');
    } else {
      // If we don't have specific subjects, just use the department name as a subject
      subjectOptions.push(department);
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setStep(2)} 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">📚 Step 3: Choose the Specific Subject</h2>
        </div>
        
        <p className="text-gray-600">You selected <span className="font-semibold text-blue-600">{stream} - {department}</span>. Now choose a specific subject:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjectOptions.map((subj) => (
            <button
              key={subj}
              onClick={() => handleSubjectSelect(subj)}
              className={`p-4 rounded-lg shadow hover:shadow-md transition duration-300 
                ${subject === subj ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render Step 4: Confidence Level Selection
  const renderConfidenceSelection = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setStep(3)} 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">📈 Step 4: Self-Esteem Check</h2>
        </div>
        
        <p className="text-gray-600">On a scale of 1 to 5, how confident are you in <span className="font-semibold text-blue-600">{subject}</span>?</p>
        <p className="text-gray-500">(1 = Not confident, 5 = Very confident)</p>
        
        <div className="flex justify-center space-x-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleConfidenceLevelSelect(level)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition duration-300 
                ${confidenceLevel === level ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50 border'}`}
            >
              <span className="text-xl font-bold">{level}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Render Step 5: Test Format Selection
  const renderFormatSelection = () => {
    const formats = ['MCQ', 'Written', 'Speaking'];
    const descriptions = {
      'MCQ': 'Multiple Choice Questions',
      'Written': 'Short Answer',
      'Speaking': 'Oral-style answers'
    };
    
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setStep(4)} 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">📝 Step 5: Select Test Format</h2>
        </div>
        
        <p className="text-gray-600">Choose your preferred test format:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formats.map((format) => (
            <button
              key={format}
              onClick={() => handleTestFormatSelect(format)}
              className={`p-6 rounded-lg shadow hover:shadow-md transition duration-300 
                ${testFormat === format ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              <div className="font-bold text-lg">{format}</div>
              <div className={`text-sm ${testFormat === format ? 'text-blue-100' : 'text-gray-500'}`}>
                {descriptions[format]}
              </div>
            </button>
          ))}
        </div>
        
        {testFormat && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={generateTest}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Generating Test...' : 'Start Your Test'}
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // Render Step 6: Taking the Test
  const renderTestQuestion = () => {
    // Add extensive debugging to help identify issues
    console.log('renderTestQuestion called with test:', test);
    console.log('currentQuestion:', currentQuestion);
    
    if (!test || !test.questions || test.questions.length === 0) {
      console.error('Test data missing or empty questions array:', test);
      return <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 font-bold">Error loading test questions.</p>
        <p className="text-gray-600 mt-2">Please try refreshing the page or generating a new test.</p>
      </div>;
    }
    
    // Get the current question (handle different possible formats)
    let question = test.questions[currentQuestion];
    console.log('Raw current question object:', question);
    
    // Sometimes MongoDB objects need special handling
    if (typeof question === 'object' && question !== null) {
      // If it has a toObject method, use it (MongoDB document)
      if (typeof question.toObject === 'function') {
        question = question.toObject();
      }
      
      // Try to access _doc property which sometimes contains the data
      if (question._doc) {
        question = question._doc;
      }
    }
    
    // If question is a string, try to parse it as JSON
    if (typeof question === 'string') {
      try {
        question = JSON.parse(question);
      } catch (e) {
        // If parsing fails, create a basic question object
        question = { questionText: question };
      }
    }
    
    console.log('Processed question object:', question);
    
    // Check if we now have a valid question
    if (!question || !question.questionText) {
      console.error('Invalid question format at index', currentQuestion, ':', question);
      
      // Create a fallback question if needed
      question = {
        questionText: `Question ${currentQuestion + 1} (fallback - original format issue)`,
        difficulty: 'Moderate',
        options: testFormat === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : []
      };
      
      console.log('Using fallback question:', question);
    }
    
    const progress = ((currentQuestion + 1) / test.questions.length) * 100;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Question {currentQuestion + 1} of {test.questions.length}</h2>
          <div className="flex items-center space-x-3">
            <div className="text-gray-600">Time: {formatTime(timeSpent)}</div>
            <div className="w-16 h-16">
              <CircularProgressbar
                value={progress}
                text={`${Math.round(progress)}%`}
                styles={buildStyles({
                  textSize: '28px',
                  pathColor: '#3b82f6',
                  textColor: '#1e3a8a',
                  trailColor: '#e5e7eb',
                })}
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded font-semibold 
              ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                question.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
              {question.difficulty}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold mb-6">{question.questionText}</h3>
          
          {testFormat === 'MCQ' && question.options && (
            <div className="space-y-3">
              {/* Validate that we have exactly 4 options */}
              {question.options.length === 4 ? (
                question.options.map((option, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setMcqSelection(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition duration-300 
                      ${mcqSelection === idx ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 
                        ${mcqSelection === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'}`}
                      >
                        {mcqSelection === idx && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-700 font-medium">This question doesn't have the required 4 options. Please contact support.</p>
                  <p className="text-sm text-yellow-600 mt-2">Found {question.options.length} options instead of 4.</p>
                </div>
              )}
            </div>
          )}
          
          {(testFormat === 'Written' || testFormat === 'Speaking') && (
            <div className="space-y-4">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={testFormat === 'Written' ? "Type your answer here..." : "Your speech will appear here..."}
                className="w-full p-3 border rounded-lg h-40"
                disabled={testFormat === 'Speaking' && isListening}
              />
              
              {testFormat === 'Speaking' && (
                <button
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition duration-300 
                    ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span>{isListening ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-5 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition duration-300 disabled:opacity-50"
          >
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition duration-300"
          >
            {currentQuestion < test.questions.length - 1 ? 'Next' : 'Submit Test'}
          </button>
        </div>
        
        {process.env.NODE_ENV !== 'production' && test && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40" style={{fontSize: '10px'}}>
          <p>Test ID: {test._id}</p>
          <p>Questions: {test.questions ? test.questions.length : 'none'}</p>
          <p>Current: {currentQuestion}</p>
          <p>Format: {testFormat}</p>
          <p>Fallback: {fallbackUsed ? 'Yes' : 'No'}</p>
        </div>
      )}
      
      {/* Show fallback notification when applicable */}
      {fallbackUsed && test && !loading && step === 6 && <FallbackNotification />}
      </div>
    );
  };
  
  // Render test results
  const renderResults = () => {
    if (!evaluation) return null;
    
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Test Completed!</h2>
          
          <div className="flex justify-center mb-4">
            {renderStars(evaluation.stars)}
          </div>
          
          <div className="text-5xl font-bold text-blue-600 mb-4">
            {Math.round(evaluation.overallScore)}%
          </div>
          
          <div className="text-lg text-gray-700 mb-6">
            {evaluation.feedback}
          </div>
          
          <div className="text-sm text-gray-500">
            Time taken: {formatTime(timeSpent)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Question Summary</h3>
          
          <div className="space-y-4">
            {evaluation && evaluation.answers ? evaluation.answers.map((ans, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div className="font-medium">Question {idx + 1}</div>
                  <div className={`px-2 py-1 text-xs rounded font-semibold 
                    ${ans.score >= 80 ? 'bg-green-100 text-green-800' : 
                      ans.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {ans.score}%
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  {ans.feedback}
                </div>
              </div>
            )) : <div className="p-4 text-gray-500">No answer data available</div>}
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  };
  
  // Define a reusable component for fallback notification
  const FallbackNotification = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            We're using our pre-generated question bank for this test. These questions are tailored to your subject but weren't created in real-time.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Academic Test | SHAKKTII AI</title>
        <meta name="description" content="Take personalized academic tests with SHAKKTII AI" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
      <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center bg-gray-100 rounded-full hover:text-purple-800 transition-colors"
              >
                <svg width="30" height="30" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.2929 27.2929C13.9024 27.6834 13.9024 28.3166 14.2929 28.7071L20.6569 35.0711C21.0474 35.4616 21.6805 35.4616 22.0711 35.0711C22.4616 34.6805 22.4616 34.0474 22.0711 33.6569L16.4142 28L22.0711 22.3431C22.4616 21.9526 22.4616 21.3195 22.0711 20.9289C21.6805 20.5384 21.0474 20.5384 20.6569 20.9289L14.2929 27.2929ZM42 28V27L15 27V28V29L42 29V28Z" fill="black" />
                  <path d="M27.5 0.5C42.4204 0.5 54.5 12.3731 54.5 27C54.5 41.6269 42.4204 53.5 27.5 53.5C12.5796 53.5 0.5 41.6269 0.5 27C0.5 12.3731 12.5796 0.5 27.5 0.5Z" stroke="black" />
                </svg>

              </button>
            </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Academic Test</h1>
          <button
            onClick={() => router.push('/academicTestHistory')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            View Test History
          </button>
        </div>
        
        {!test && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm mb-8">
            <p className="text-gray-700 leading-relaxed">
              This tailored test is designed to suit your unique stream, department, subject, and learning style. 
              You'll be challenged with 10 questions, each covering a mix of difficulty levels (easy, moderate, hard), 
              and you can choose your preferred format (MCQ, written, or speaking). 
              After completing the test, you'll receive a 3-star rating along with personalized feedback.
              Let's get started!
            </p>
          </div>
        )}
        
        {fallbackUsed && test && !loading && step === 6 && <FallbackNotification />}
        
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <div className="animate-pulse flex space-x-4 items-center">
                <div className="rounded-full bg-blue-400 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-blue-400 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-300 rounded"></div>
                    <div className="h-4 bg-blue-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <p className="text-center mt-4 text-gray-700">
                {generationProgress || "Creating your personalized academic test..."}
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {!loading && step === 1 && renderStreamSelection()}
        {!loading && step === 2 && renderDepartmentSelection()}
        {!loading && step === 3 && renderSubjectSelection()}
        {!loading && step === 4 && renderConfidenceSelection()}
        {!loading && step === 5 && renderFormatSelection()}
        {!loading && step === 6 && !showResults && renderTestQuestion()}
        {!loading && step === 6 && showResults && renderResults()}
      </div>
    </div>
  );
}

export default AcademicTest;
