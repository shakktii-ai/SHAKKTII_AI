import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { getApiResponse } from './api/questionsFetchFormModel';
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

export default function Role() {
  const router = useRouter();
  const [jobRole, setJobRole] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState("");
  const [user, setUser] = useState(null);
  const [hasAvailableInterviews, setHasAvailableInterviews] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUser(userFromStorage);
        setEmail(userFromStorage.email || '');  // Initialize email here directly
        
        // Check if user has available interviews from local storage initially
        const completedInterviews = userFromStorage.no_of_interviews_completed || 0;
        const totalInterviews = userFromStorage.no_of_interviews || 1;
        
        if (completedInterviews >= totalInterviews) {
          setHasAvailableInterviews(false);
        } else {
          setHasAvailableInterviews(true);
        }
      }
    }
  }, [router]);

    // Function to check if user has available interviews
  const checkInterviewAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (!userFromStorage || !userFromStorage.email) {
        toast.error("User information not found. Please login again.");
        setIsCheckingAvailability(false);
        return false;
      }

      // Try to get the latest stats from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/getUserStats?email=${encodeURIComponent(userFromStorage.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.stats) {
          const completedInterviews = data.stats.no_of_interviews_completed || 0;
          const totalInterviews = data.stats.no_of_interviews || 1;
          
          // Update the user in localStorage with latest stats
          const updatedUser = {
            ...userFromStorage,
            no_of_interviews: totalInterviews,
            no_of_interviews_completed: completedInterviews
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setHasAvailableInterviews(completedInterviews < totalInterviews);
          return completedInterviews < totalInterviews;
        }
      }
      
      // Fallback to using the data from localStorage
      const completedInterviews = userFromStorage.no_of_interviews_completed || 0;
      const totalInterviews = userFromStorage.no_of_interviews || 1;
      setHasAvailableInterviews(completedInterviews < totalInterviews);
      return completedInterviews < totalInterviews;
      
    } catch (error) {
      console.error('Error checking interview availability:', error);
      toast.error("Error checking interview availability. Please try again.");
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent form from submitting normally
    localStorage.removeItem("apiResponseStatus");
    
    if (!jobRole.trim()) {
      toast.error("Please enter a job role");
      return;
    }
    
    // Show loading indicator
    toast.loading("Checking interview availability...");
    
    // Check if user has available interviews
    const userHasAvailableInterviews = await checkInterviewAvailability();
    toast.dismiss(); // Dismiss loading toast
    
    if (!userHasAvailableInterviews) {
      setShowErrorModal(true);
      return;
    }
    
    // If we get here, proceed with the interview
    toast.success("Starting interview preparation...");
    
    // Declare formattedQuestions here once
    let formattedQuestions = [];
    
    router.push("/instruction");
  
    // Replace this with a fetch request to your new API
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/questionsFetchFormModel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobRole,
          level,
        }),
      });
  
      // Check if the response is OK (status 200)
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Something went wrong. Please try again.");
      }
  
      // Parse the response
      const responseData = await res.json();
  
      console.log('Fetched Questions:', responseData.questions);  // Debug: Log fetched questions
  
      let fetchedQuestions = responseData.questions;
  
      if (fetchedQuestions) {
        // Check if the fetchedQuestions is a string
        if (typeof fetchedQuestions === 'string') {
          console.log('Raw response:', fetchedQuestions);
          
          // Pattern specifically designed for the example format
          // Handle format like "**1. What is the difference between...**"
          const matches = [];
          
          // Create an array to store all possible regex patterns
          const patterns = [
            // Bold number with asterisks pattern
            { regex: /\*\*\d+\.\s+([^*]+?)\*\*/g, type: 'Bold with ** markers' },
            
            // Regular numbered list pattern with period
            { regex: /^\s*\d+\.\s+([^(\n]+)/gm, type: 'Regular numbered list' },
            
            // Numbered list pattern with potential markdown
            { regex: /\d+\.\s+([^\n(]+)/g, type: 'Simple number followed by text' }
          ];
          
          // Try each pattern until we find matches
          // Convert to string once outside the loop
          const questionText = fetchedQuestions.toString();
          
          for (const pattern of patterns) {
            let match;
            pattern.regex.lastIndex = 0; // Reset regex for each use
            
            while ((match = pattern.regex.exec(questionText)) !== null) {
              if (match[1]) {
                const question = match[1].trim();
                matches.push(question);
                console.log(`Found ${pattern.type} question:`, question);
              }
            }
            
            // If we found any matches, stop trying patterns
            if (matches.length > 0) {
              console.log(`Found ${matches.length} questions using pattern: ${pattern.type}`);
              break;
            }
          }
          
          // Remove extra formatting from the questions
          const cleanedMatches = matches.map(q => {
            // Remove any remaining markdown or unnecessary characters
            return q.replace(/\*\*/g, '').trim();
          });
          
          const matchedQuestions = cleanedMatches.length > 0 ? cleanedMatches : null;
          console.log('Extracted questions:', cleanedMatches);
          
          // For debugging
          console.log('Total questions found:', cleanedMatches.length);
  
          console.log('Matched Questions:', matchedQuestions); // Debug: Log matched questions
  
          if (matchedQuestions) {
            // Start with the "Introduce yourself" question as the first element
            const firstName = user?.fullName?.split(' ')[0];
            formattedQuestions = [{
              questionText: ` hello ${firstName} Can you tell me about yourself, including your educational background and previous work experience?`,
              answer: null,
            }];
  
            // Add the fetched questions to the array
            const additionalQuestions = matchedQuestions.map(questionText => ({
              questionText: questionText.trim(),
              answer: null,
            }));
  
            // Prepend the fetched questions after the "Introduce yourself"
            formattedQuestions.push(...additionalQuestions);
  
            // Set the questions in the state with the "Introduce yourself" as the first question
            setQuestions(formattedQuestions);
          } else {
            console.error("No valid questions found in the fetched data.");
          }
        } else {
          console.error('Fetched questions are not in expected string format:', fetchedQuestions);
        }
      } else {
        console.error("No questions received from API.");
      }
  
      console.log("Questions to be sent:", formattedQuestions);
  
      if (formattedQuestions && formattedQuestions.length > 0) {
        const data = { jobRole, email, level, questions: formattedQuestions };
  
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/jobRoleAndQuestionsSave`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
  
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData?.error || "Something went wrong. Please try again.");
          }
  
          const response = await res.json();
          // console.log(response.data._id); // Log the successful response
  
          // Store the response _id in localStorage
          if (response.data._id) {
            // Remove the existing items if they exist
            localStorage.removeItem("_id");
            localStorage.removeItem("_idForReport");
  
            // Add the new items
            localStorage.setItem("_id", response.data._id);
            localStorage.setItem("_idForReport", response.data._id);
          }
  
          // Store response status in localStorage to enable button on Instruction page
          localStorage.setItem("apiResponseStatus", "success");
  
        } catch (error) {
          console.error('Error:', error);
          // Store response failure status in localStorage
          localStorage.setItem("apiResponseStatus", "error");
        }
      } else {
        console.error("No questions received. Please try again.");
      }
    } catch (error) {
      console.error('Error during question fetch:', error);
      localStorage.setItem("apiResponseStatus", "error");
    }
  };
  
  return (
    <div className="min-h-screen   p-6">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <Link href="/" className="block mb-12">
        <div className=" text-2xl w-8 h-8 flex items-center justify-center">
          <IoIosArrowBack />
        </div>
      </Link>
      
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h1 className="text-2xl font-normal text-center mb-2">Select Job Role</h1>
            <input 
              type="text" 
              name="jobRole" 
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full p-3  border border-gray-700 rounded-lg focus:outline-none focus:border-gray-500 text-center"
              placeholder="Type..."
              required
            />
          </div>

          <div>
            <h2 className="text-2xl font-normal text-center mb-6">Select Level</h2>
            <div className="space-y-4">
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((lvl) => (
                <label 
                  key={lvl} 
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    level === lvl ? 'border-black' : 'border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={lvl}
                    checked={level === lvl}
                    onChange={() => setLevel(lvl)}
                    className="h-5 w-5"
                  />
                  <span className="ml-3 text-lg">{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500 text-black font-medium py-3 px-6 rounded-lg text-lg"
            disabled={isCheckingAvailability}
          >
            {isCheckingAvailability ? 'Checking...' : 'Start'}
          </button>
        </form>
        
        {/* Hidden email input */}
        <input 
          type="email" 
          name="email" 
          value={email} 
          readOnly 
          className="hidden"
        />
      </div>
      
      {/* No interviews available modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md border border-red-500 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">No Available Interviews</h2>
              <p className="text-gray-300 mb-4">You have used all your available interviews. Please contact the administrator to request more interviews.</p>
              <div className="flex justify-center space-x-4">
                <Link href="/profile">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200">
                    View Profile
                  </button>
                </Link>
                <button 
                  onClick={() => setShowErrorModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
