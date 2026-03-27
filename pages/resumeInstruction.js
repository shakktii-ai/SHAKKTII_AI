import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IoIosArrowBack } from "react-icons/io";
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';

function ResumeInstruction() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const recognitionRef = useRef(null);
    const [deviceTests, setDeviceTests] = useState({
        speaker: { done: false, testing: false },
        microphone: { done: false, testing: false, permissionGranted: false, status: '' },
    });

    const slides = [
        {
            id: 1,
            title: "Review Your Resume",
            content: "1. Your interview questions will be based on your uploaded resume. Review your resume before starting — be ready to discuss your skills, projects, and experience in detail.",
        },
        {
            id: 2,
            title: "Be Ready for Deep-Dive Questions",
            content: "2. Expect questions that dig into specific points on your resume. Prepare real examples for every skill and role you have listed.",
        },
        {
            id: 3,
            title: "Understand the Job Description",
            content: "3. Connect your resume points to the role you're applying for. Think about how your past experience directly addresses the responsibilities.",
        },
        {
            id: 4,
            title: "Practice Your Self Introduction",
            content: "4. Introduce yourself briefly, highlight key skills, experience, and achievements from your resume, and connect them to the job role.",
        },
        {
            id: 5,
            title: "Speak Clearly and Confidently",
            content: "5. Speak at a moderate pace. Enunciate clearly so the AI can understand your responses. Avoid filler words like 'um' and 'uh' where possible.",
        },
        {
            id: 6,
            title: "Present Yourself Professionally",
            content: "6. Treat this as a real interview. Dress appropriately, sit upright, and maintain a professional tone throughout your responses.",
        },
        {
            id: 7,
            title: "Use the STAR Method",
            content: "7. For behavioral questions, use Situation, Task, Action, Result. This structure helps you give complete, compelling answers drawn from your resume experience.",
        },
        {
            id: 8,
            title: "Don't Skip Any Question",
            content: "8. Answer every question to the best of your ability. If unsure, acknowledge it professionally and share what you do know.",
        },
        {
            id: 9,
            title: "Prepare Thoughtful Questions",
            content: '9. Develop a list of insightful questions you might ask a real interviewer, such as "What are the biggest challenges facing the team?"',
        },
        {
            id: 10,
            title: "Get Adequate Rest and Preparation",
            content: '10. Ensure you get sufficient sleep and preparation time before the interview. This will help you feel confident, focused, and ready.',
        },
    ];

    const handleNext = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    const handlePrev = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    const goToSlide = (index) => setCurrentIndex(index);

    const testSpeaker = () => {
        setDeviceTests(prev => ({ ...prev, speaker: { ...prev.speaker, testing: true } }));
        const utterance = new SpeechSynthesisUtterance('Speaker test one two three');
        utterance.onend = () => setDeviceTests(prev => ({ ...prev, speaker: { done: true, testing: false } }));
        utterance.onerror = () => setDeviceTests(prev => ({ ...prev, speaker: { done: false, testing: false } }));
        window.speechSynthesis.speak(utterance);
    };

    const testMicrophone = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setDeviceTests(prev => ({
                ...prev,
                microphone: { ...prev.microphone, testing: true, status: 'Listening... Speak now!' },
            }));
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            if (transcript.trim().length > 0) {
                recognition.stop();
                setDeviceTests(prev => ({
                    ...prev,
                    microphone: { done: true, testing: false, permissionGranted: true, status: '✓ Microphone is working!' },
                }));
            }
        };

        recognition.onerror = (event) => {
            let errorMessage = 'An error occurred during microphone testing.';
            if (event.error === 'not-allowed') errorMessage = 'Microphone access was denied. Please allow access in your browser settings.';
            else if (event.error === 'no-speech') errorMessage = 'No speech detected. Please try again.';
            else if (event.error === 'audio-capture') errorMessage = 'No microphone found. Please connect a microphone.';

            recognition.stop();
            setDeviceTests(prev => ({
                ...prev,
                microphone: { done: false, testing: false, permissionGranted: false, status: errorMessage },
            }));
        };

        recognition.onend = () => {
            if (!deviceTests.microphone.done) {
                setDeviceTests(prev => ({
                    ...prev,
                    microphone: { ...prev.microphone, testing: false, status: '✓ Tested' },
                }));
            }
        };

        recognition.start();
    };

    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const handleStartInterview = () => {
        // Check if API response is ready (questions were fetched)
        const apiStatus = localStorage.getItem("apiResponseStatus");

        if (deviceTests.speaker.done && deviceTests.microphone.done) {
            if (apiStatus === "success") {
                router.push('/resumeQuestionForm');
            } else if (apiStatus === "error") {
                alert("There was an error preparing your questions. Please go back and try again.");
            } else {
                // Still loading — wait and retry
                alert("Please wait while your resume questions are being prepared...");
            }
        } else {
            let message = 'Please complete the following tests before starting:\n';
            if (!deviceTests.speaker.done) message += '- Speaker Test\n';
            if (!deviceTests.microphone.done) message += '- Microphone Test\n';
            alert(message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/login');
    }, [router]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length);
        }, 10000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="min-h-screen p-6">
            <button onClick={() => router.back()} className="text-2xl w-8 h-8 flex items-center justify-center mb-12">
                <IoIosArrowBack />
            </button>

            <div className="max-w-md mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl font-normal text-center mb-2">Instructions</h1>
                    <p className="text-center">Please follow these instructions carefully</p>
                </div>

                {/* Slides Container */}
                <div className="bg-blue-300 rounded-xl p-8 mb-8 min-h-64 relative">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`transition-opacity duration-300 ${currentIndex === index ? 'opacity-100' : 'opacity-0 absolute inset-0 p-6'}`}
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-medium">{slide.title}</h3>
                            </div>
                            <p className="text-sm pl-13">{slide.content}</p>
                        </div>
                    ))}

                    <div className="flex justify-center mt-6 space-x-2 absolute bottom-4 left-0 right-0">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-600'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Device Test Section */}
                <div className="bg-blue-300 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-medium mb-4">Device Check</h3>
                    <div className="space-y-4">
                        {/* Speaker Test */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FaVolumeUp className="text-blue-400 mr-2" />
                                <span>Speaker Test</span>
                            </div>
                            {deviceTests.speaker.done ? (
                                <span className="text-sm">✓ Tested</span>
                            ) : (
                                <button
                                    onClick={testSpeaker}
                                    disabled={deviceTests.speaker.testing}
                                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                >
                                    {deviceTests.speaker.testing ? 'Testing...' : 'Test'}
                                </button>
                            )}
                        </div>

                        {/* Microphone Test */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FaMicrophone className="text-blue-400 mr-2" />
                                <span>Microphone Test</span>
                            </div>
                            {deviceTests.microphone.testing ? (
                                <div className="flex items-center">
                                    <span className="flex space-x-1">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                    <span className="ml-2 text-sm">Listening...</span>
                                </div>
                            ) : deviceTests.microphone.done ? (
                                <span className="text-sm">{deviceTests.microphone.status || '✓ Working'}</span>
                            ) : (
                                <button
                                    onClick={testMicrophone}
                                    disabled={deviceTests.microphone.testing}
                                    className={`text-sm px-4 py-2 rounded-lg flex items-center ${deviceTests.microphone.testing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    Test Microphone
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartInterview}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        deviceTests.speaker.done && deviceTests.microphone.done
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Start Resume Interview
                </button>
            </div>
        </div>
    );
}

export default ResumeInstruction;