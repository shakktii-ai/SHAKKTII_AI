// import { useState, useEffect } from "react";

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState("");
//   const [userId] = useState("{{ user_id }}"); // Pass the actual user id here
//   const [recognition, setRecognition] = useState(null);
//   const [chatHistory, setChatHistory] = useState(JSON.parse(localStorage.getItem('chatHistory')) || []);

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US'; // You can change this to 'mr-IN' for Marathi
//       recognitionInstance.interimResults = false;
//       recognitionInstance.continuous = false;

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started. Speak into the microphone.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[0][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, []);

//   // Function to speak text
//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   // Handle mic button click
//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false); // Update state to stop the mic
//       } else {
//         recognition.start();
//         setIsListening(true); // Update state to indicate mic is on

//         // Speak the greeting only when the mic is turned on for the first time
//         if (!question) {
//           const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
//           setQuestion(greeting);
//           speakText(greeting, 'en-US');
//         }
//       }
//     }
//   };

//   const handleInputChange = async (event) => {
//     const inputText = event.target.value;
//     if (inputText.trim()) {
//       console.log('Recorded text to send:', inputText);

//       // Add the new user input to the chat history
//       const updatedChatHistory = [...chatHistory, { role: 'user', message: inputText }];
//       setChatHistory(updatedChatHistory);

//       // Prepare the data to be sent to the API, including the chat history
//       const url = "http://139.59.42.156:11434/api/generate";
//       const headers = {
//         "Content-Type": "application/json"
//       };
//       const data = {
//         "model": "gemma:2b",
//         "prompt": inputText,
//         "chat_history": updatedChatHistory,
//         "stream": false
//       };

//       try {
//         const response = await fetch(url, {
//           method: "POST",
//           headers: headers,
//           body: JSON.stringify(data)
//         });

//         if (response.ok) {
//           const responseData = await response.json();
//           const answer = responseData.response;
//           updatedChatHistory.push({ role: 'model', message: answer });
//           setChatHistory(updatedChatHistory);
//           localStorage.setItem('chatHistory', JSON.stringify(updatedChatHistory));

//           setQuestion(answer);
//           speakText(answer, 'hi-IN');
//         } else {
//           console.error("Error fetching response from the API.");
//         }
//       } catch (error) {
//         console.error('Error in the fetch operation:', error);
//       }
//     }
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <input type="text" id="user_id" value={userId} hidden />

//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={handleInputChange}
//             disabled={isListening}  // Disable input while mic is on
//           />
//           <button className="mic-button absolute right-4" onClick={handleMicClick}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-pink-400">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useState, useEffect } from "react";

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState("");
//   const [recognition, setRecognition] = useState(null);

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US'; // You can change this to 'mr-IN' for Marathi
//       recognitionInstance.interimResults = false;
//       recognitionInstance.continuous = false;

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started. Speak into the microphone.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[0][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//         // After mic stops, send the recognized text to the API
//         if (recordedText.trim()) {
//           handleApiCall(recordedText);
//         }
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, [recordedText]); // Run whenever recordedText changes

//   // Function to speak text
//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   // Handle mic button click
//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//       }
//     }
//   };

//   // API call to send the recognized text
//   const handleApiCall = async (inputText) => {
//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
//     const data = {
//       "model": "gemma:2b",
//       "prompt": inputText,
//       "stream": false
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data)
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         const answer = responseData.response;
//         speakText(answer, 'hi-IN'); // Speak the API response
//       } else {
//         console.error("Error fetching response from the API.");
//       }
//     } catch (error) {
//       console.error('Error in the fetch operation:', error);
//     }
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening}  // Disable input while mic is on
//           />
//           <button className="mic-button absolute right-4" onClick={handleMicClick}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-pink-400">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState("");
//   const [recognition, setRecognition] = useState(null);
//   const [loading, setLoading] = useState(false); // Loading state

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US'; // You can change this to 'mr-IN' for Marathi
//       recognitionInstance.interimResults = false;
//       recognitionInstance.continuous = false;

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started. Speak into the microphone.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[0][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//         // After mic stops, send the recognized text to the API
//         if (recordedText.trim()) {
//           handleApiCall(recordedText);
//         }
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, [recordedText]); // Run whenever recordedText changes

//   // Function to speak text
//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   // Handle mic button click
//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//       }
//     }
//   };

//   // API call to send the recognized text
//   const handleApiCall = async (resultText) => {
//     setLoading(true); // Set loading to true when the API request is sent

//     const url = "http://139.59.42.156:11434/api/generate";
//     const headers = {
//       "Content-Type": "application/json"
//     };
//     const data = {
//       "model": "gemma:2b",
//       "prompt": resultText,
//       "stream": false
//     };

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(data)
//       });

//       if (response.ok) {
//         const responseData = await response.json();
//         const answer = responseData.response;
//         speakText(answer, 'hi-IN'); // Speak the API response
//       } else {
//         console.error("Error fetching response from the API.");
//       }
//     } catch (error) {
//       console.error('Error in the fetch operation:', error);
//     } finally {
//       setLoading(false); // Set loading to false after the API response is received
//     }
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening}  // Disable input while mic is on
//           />
//           <button className="mic-button absolute right-4" onClick={handleMicClick}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-pink-400">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>

//         {/* Show loading spinner or message */}
//         {loading && (
//           <div className="mt-4 text-white">
//             <span>Loading...</span>
//             <div className="loader"></div> {/* Customize this with your own spinner */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect, useRef } from "react";
// import { getApiResponse } from './api/response'; // Import the API function

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState(""); // Just for display
//   const [recognition, setRecognition] = useState(null);
//   const [loading, setLoading] = useState(false); // Loading state
//   const greetingSpokenRef = useRef(false); // Ref to track if the greeting has been spoken

//   // UseEffect that runs only once on initial render
//   useEffect(() => {
//     if (!greetingSpokenRef.current) {
//       const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
//       setQuestion(greeting); // Set greeting for the UI
//       speakText(greeting, 'en-US'); // Speak the greeting only once
//       greetingSpokenRef.current = true; // Mark the greeting as spoken
//     }
//   }, []); // Empty dependency array ensures this runs only once

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US'; // You can change this to 'mr-IN' for Marathi
//       recognitionInstance.interimResults = false;
//       recognitionInstance.continuous = false;

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started. Speak into the microphone.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[0][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//         // After mic stops, send the recognized text to the API
//         if (recordedText.trim()) {
//           handleApiCall(recordedText);
//         }
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, [recordedText]); // Runs whenever recordedText changes

//   // Function to speak text
//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   // Handle mic button click
//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//       }
//     }
//   };

//   // API call to send the recognized text
//   const handleApiCall = async (resultText) => {
//     setLoading(true); // Set loading to true when the API request is sent

//     const answer = await getApiResponse(resultText);
//     console.log(answer);
//      // Get the answer from the API
//     if (answer) {
//       speakText(answer, 'hi-IN'); // Speak the API response
//     } else {
//       console.error('No answer received from the API.');
//     }

//     setLoading(false); // Set loading to false after the API response is received
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening}  // Disable input while mic is on
//           />
//           <button className="mic-button absolute right-4" onClick={handleMicClick}>
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-pink-400">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>

//         {/* Show loading spinner or message */}
//         {loading && (
//           <div className="mt-4 text-white">
//             <span>Loading...</span>
//             <div className="loader"></div> {/* Customize this with your own spinner */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, useRef } from "react";
// import { getApiResponse } from './api/response';

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState(""); 
//   const [recognition, setRecognition] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [apiResponse, setApiResponse] = useState("");
//   const [error, setError] = useState(""); // For handling errors
//   const greetingSpokenRef = useRef(false);
//   const recognitionTimeout = useRef(null); // To manage debounce

//   useEffect(() => {
//     if (!greetingSpokenRef.current) {
//       const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
//       setQuestion(greeting); // Set greeting for the UI
//       speakText(greeting, 'en-US');
//       greetingSpokenRef.current = true;
//     }
//   }, []);

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = true;
//       recognitionInstance.continuous = true;

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);

//         // Handle debouncing of API calls
//         if (recognitionTimeout.current) {
//           clearTimeout(recognitionTimeout.current);
//         }
//         recognitionTimeout.current = setTimeout(() => {
//           handleApiCall(resultText);
//         }, 1000); // Debouncing by 1 second
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//         setError("Sorry, there was an issue with voice recognition.");
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, [recordedText]);

//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop();
//         setIsListening(false);
//       } else {
//         recognition.start();
//         setIsListening(true);
//       }
//     }
//   };

//   const handleApiCall = async (resultText) => {
//     if (!resultText.trim()) return;

//     setLoading(true);
//     setError(""); // Clear any previous error

//     try {
//       const answer = await getApiResponse(resultText);
//       if (answer) {
//         setApiResponse(answer);
//         speakText(answer, 'hi-IN');
//       } else {
//         setError("No response received from the API.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong while fetching the response.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening}
//           />
//           <button
//             className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//             onClick={handleMicClick}
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>

//         {loading && (
//           <div className="mt-4 text-white">
//             <span>Loading...</span>
//             <div className="loader"></div>
//           </div>
//         )}

//         {error && (
//           <div className="mt-4 text-red-500">
//             <span>{error}</span>
//           </div>
//         )}

//         {apiResponse && (
//           <div className="mt-4 text-white">
//             <h6>Response: </h6>
//             <p>{apiResponse}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect, useRef } from "react";
// import { getApiResponse } from './api/response';

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState(""); 
//   const [recognition, setRecognition] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [apiResponse, setApiResponse] = useState("");
//   const [error, setError] = useState(""); // For handling errors
//   const greetingSpokenRef = useRef(false);

//   useEffect(() => {
//     if (!greetingSpokenRef.current) {
//       const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
//       setQuestion(greeting); // Set greeting for the UI
//       speakText(greeting, 'en-US');
//       greetingSpokenRef.current = true;
//     }
//   }, []);

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = true;
//       recognitionInstance.continuous = false; // Only listen once

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//         setError("Sorry, there was an issue with voice recognition.");
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, []);

//   const speakText = (text, lang) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
//     speechSynthesis.speak(utterance);
//   };

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         // Send recorded text to API after stopping
//         handleApiCall(recordedText);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//       }
//     }
//   };

//   const handleApiCall = async (resultText) => {
//     if (!resultText.trim()) return;

//     setLoading(true);
//     setError(""); // Clear any previous error

//     try {
//       const answer = await getApiResponse(resultText);
//       if (answer) {
//         setApiResponse(answer);
//         speakText(answer, 'hi-IN');
//       } else {
//         setError("No response received from the API.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong while fetching the response.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening}
//           />
//           <button
//             className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//             onClick={handleMicClick}
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>

//         {loading && (
//           <div className="mt-4 text-white">
//             <span>Loading...</span>
//             <div className="loader"></div>
//           </div>
//         )}

//         {error && (
//           <div className="mt-4 text-red-500">
//             <span>{error}</span>
//           </div>
//         )}

//         {apiResponse && (
//           <div className="mt-4 text-white">
//             <h6>Response: </h6>
//             <p>{apiResponse}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect, useRef } from "react";
// import { getApiResponse } from './api/response';

// export default function Home() {
//   const [isListening, setIsListening] = useState(false);
//   const [recordedText, setRecordedText] = useState("");
//   const [question, setQuestion] = useState(""); 
//   const [recognition, setRecognition] = useState(null);
//   const [loading, setLoading] = useState(false); // State for tracking if speech synthesis is in progress
//   const [apiResponse, setApiResponse] = useState("");
//   const [error, setError] = useState(""); // For handling errors
//   const greetingSpokenRef = useRef(false);

//   useEffect(() => {
//     if (!greetingSpokenRef.current) {
//       const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
//       setQuestion(greeting); // Set greeting for the UI
//       speakText(greeting, 'en-US');
//       greetingSpokenRef.current = true;
//     }
//   }, []);

//   useEffect(() => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognitionInstance = new SpeechRecognition();
//       recognitionInstance.lang = 'en-US';
//       recognitionInstance.interimResults = true;
//       recognitionInstance.continuous = false; // Only listen once

//       recognitionInstance.onstart = () => {
//         console.log('Voice recognition started.');
//       };

//       recognitionInstance.onresult = (event) => {
//         const resultText = event.results[event.results.length - 1][0].transcript;
//         setRecordedText(resultText);
//         console.log('Speech recognized:', resultText);
//       };

//       recognitionInstance.onerror = (event) => {
//         console.error('Recognition error:', event.error);
//         setError("Sorry, there was an issue with voice recognition.");
//       };

//       recognitionInstance.onend = () => {
//         setIsListening(false);
//         console.log('Voice recognition stopped.');
//       };

//       setRecognition(recognitionInstance);
//     } else {
//       alert('Speech Recognition API is not supported in this browser.');
//     }
//   }, []);

//   const speakText = (text, lang) => {
//     setLoading(true); // Disable the mic button while speaking
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = lang;
    
//     utterance.onend = () => {
//       setLoading(false); // Enable the mic button after speech ends
//     };

//     speechSynthesis.speak(utterance);
//   };

//   const handleMicClick = () => {
//     if (recognition) {
//       if (isListening) {
//         recognition.stop(); // Stop the recognition
//         setIsListening(false);
//         // Send recorded text to API after stopping
//         handleApiCall(recordedText);
//       } else {
//         recognition.start(); // Start the recognition
//         setIsListening(true);
//       }
//     }
//   };

//   const handleApiCall = async (resultText) => {
//     if (!resultText.trim()) return;

//     setLoading(true);
//     setError(""); // Clear any previous error

//     try {
//       const answer = await getApiResponse(resultText);
//       if (answer) {
//         setApiResponse(answer);
//         speakText(answer, 'hi-IN');
//       } else {
//         setError("No response received from the API.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong while fetching the response.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="relative flex justify-center items-center h-screen bg-black">
//       <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
//       <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
//       <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
//         <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

//         <div className="my-6">
//           <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
//         </div>

//         <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

//         <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
//           <input
//             type="text"
//             id="textContent"
//             className="bg-transparent border-none text-white focus:outline-none w-full"
//             placeholder="Type Here"
//             value={recordedText}
//             onChange={(e) => setRecordedText(e.target.value)}
//             disabled={isListening || loading}  // Disable input while listening or speaking
//           />
//           <button
//             className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
//             onClick={handleMicClick}
//             disabled={loading}  // Disable mic button while speaking
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
//               <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
//             </svg>
//           </button>
//         </div>

//         {loading && (
//           <div className="mt-4 text-white">
//             <span>Loading...</span>
//             <div className="loader"></div>
//           </div>
//         )}

//         {error && (
//           <div className="mt-4 text-red-500">
//             <span>{error}</span>
//           </div>
//         )}

//         {apiResponse && (
//           <div className="mt-4 text-white">
//             <h6>Response: </h6>
//             <p>{apiResponse}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { getApiResponse } from './api/response';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [question, setQuestion] = useState(""); 
  const [recognition, setRecognition] = useState(null);
  const [loading, setLoading] = useState(false); // State for tracking if speech synthesis is in progress
  const [apiResponse, setApiResponse] = useState("");
  const [error, setError] = useState(""); // For handling errors
  const greetingSpokenRef = useRef(false);

  useEffect(() => {
    if (!greetingSpokenRef.current) {
      const greeting = "Hi, I am Shakti, your interview trainer! Please click on the mic button to start speaking.";
      setQuestion(greeting); // Set greeting for the UI
      speakText(greeting, 'en-US');
      greetingSpokenRef.current = true;
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = true;
      recognitionInstance.continuous = true; // Continuously listen

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started.');
      };

      recognitionInstance.onresult = (event) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        setRecordedText(resultText);
        console.log('Speech recognized:', resultText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Recognition error:', event.error);
        setError("Sorry, there was an issue with voice recognition.");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log('Voice recognition stopped.');
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech Recognition API is not supported in this browser.');
    }
  }, []);

  const speakText = (text, lang) => {
    setLoading(true); // Disable the mic button while speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    utterance.onend = () => {
      setLoading(false); // Enable the mic button after speech ends
    };

    speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop(); // Stop the recognition
        setIsListening(false);
        // Send recorded text to API after stopping
        handleApiCall(recordedText);
      } else {
        recognition.start(); // Start the recognition
        setIsListening(true);
      }
    }
  };

  const handleApiCall = async (resultText) => {
    if (!resultText.trim()) return;

    setLoading(true);
    setError(""); // Clear any previous error

    try {
      const answer = await getApiResponse(resultText);
      if (answer) {
        setApiResponse(answer);
        speakText(answer, 'hi-IN');
      } else {
        setError("No response received from the API.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching the response.");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex justify-center items-center h-screen bg-black">
      <img src="bg.gif" className="absolute top-0 left-0 w-full h-full object-cover" />
      <img src="logoo.png" className="absolute top-4 right-8 w-20 mb-6" alt="Shakti AI Logo" />
      
      <div className="container bg-transparent text-center max-w-xs p-6 rounded-lg relative">
        <h1 className="text-2xl text-white">Hi <span className="text-pink-400">This is Shakti</span></h1>

        <div className="my-6">
          <img id="mainImage" src="main.gif" className="w-36 h-36" alt="Shakti AI Logo" />
        </div>

        <h6 id="question" className="mt-4 text-white text-lg">{question || "Please click on the mic button to start speaking."}</h6>

        <div className="input-box mt-6 relative flex items-center bg-gray-800 rounded-xl px-4 py-2">
          <input
            type="text"
            id="textContent"
            className="bg-transparent border-none text-white focus:outline-none w-full"
            placeholder="Type Here"
            value={recordedText}
            onChange={(e) => setRecordedText(e.target.value)}
            disabled={isListening || loading}  // Disable input while listening or speaking
          />
          <button
            className={`mic-button absolute right-4 ${isListening ? 'text-red-500' : 'text-pink-400'}`}
            onClick={handleMicClick}
            disabled={loading}  // Disable mic button while speaking
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
              <path fill="currentColor" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 10a1 1 0 1 1 2 0v2a5 5 0 0 0 10 0v-2a1 1 0 1 1 2 0v2a7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-2.07A7 7 0 0 1 5 12v-2z"/>
            </svg>
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-white">
            <span>Loading...</span>
            <div className="loader"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500">
            <span>{error}</span>
          </div>
        )}

        {apiResponse && (
          <div className="mt-4 text-white">
            {/* <h6>Response: </h6>
            <p>{apiResponse}</p> */}
          </div>
        )}
      </div>
    </div>
  );
}
