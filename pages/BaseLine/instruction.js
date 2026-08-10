import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IoIosArrowBack } from "react-icons/io";
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';

function Instruction() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const recognitionRef = useRef(null);
    const [deviceTests, setDeviceTests] = useState({
        speaker: {
            done: false,
            testing: false
        },
        microphone: {
            done: false,
            testing: false,
            permissionGranted: false,
            status: '',
        },
    });

    const slides = [
        {
            id: 1,
            title: "Understand the job role",
            img: '/Shawn.png',
            content: "Understanding the job role means researching its key responsibilities, required skills, and expectations. This helps you tailor your resume, answer interview questions confidently, and demonstrate how your abilities align with the position.",
        },
        {
            id: 2,
            img: '/Job_Discrioption.png',
            title: "Understand the Job Description",
            content: "Carefully read and analyze the job description to grasp the key qualifications, duties, and expectations. Prepare examples of how your skills and experiences match the job requirements",
        },
        {
            id: 3,
            img: '/companys_background..png',
            title: "Understand the collage's background",
            content: "Understanding the collage's background means learning about its history, mission, values, products, services, and industry position. This helps you align your answers in interviews and show genuine interest in the organization",
        },
        {
            id: 4,
            img: '/Self_Introduction.png',
            title: "Practice Your Self Introduction",
            content: "Introduce yourself briefly, highlight key skills, experience, and achievements, and connect them to the job role",
        },
        {
            id: 5,
            img: '/Resume.png',
            title: "Update Your Resume and Carry 1/2 copies",
            content: "Ensure your resume and other application materials are updated, tailored to the job, and neatly organized. Bring multiple copies of your resume and any other requested documents",
        },
        {
            id: 6,
            img: '/Yourself_Professionally.png',
            title: "Present Yourself Professionally",
            content: "Dress appropriately for the industry and collage culture. Pay attention to grooming and personal hygiene to make a positive impression",
        },
        {
            id: 7,
            img: '/Essential_Documents.png',
            title: "Gather and Organize Essential Documents",
            content: "Collect and neatly organize all necessary documents, such as certificates, references, and identification. Use a folder or portfolio to keep everything tidy and easily accessible",
        },
        {
            id: 8,
            img: '/company_News.png',
            title: "Stay Up-to-Date on collage News",
            content: "Research the collage's recent news, achievements, and initiatives. This demonstrates your interest in the collage and can provide valuable conversation topics",
        },
        {
            id: 9,
            img: '/Thoughtful_Questions.png',
            title: " Prepare Thoughtful Questions",
            content: 'Develop a list of insightful questions to ask the interviewer, such as "What are the biggest challenges facing the team?" or "Can you tell me more about the collage culture?',
        },
        {
            id: 10,
            img: '/Rest_Preparation.png',
            title: " Get Adequate Rest and Preparation",
            content: 'Ensure you get sufficient sleep and time to prepare before the interview. This will help you feel confident, focused, and ready to make a positive impression',
        },
    ];

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const testSpeaker = () => {
        setDeviceTests(prev => ({
            ...prev,
            speaker: { ...prev.speaker, testing: true }
        }));

        // Simple speaker test
        const utterance = new SpeechSynthesisUtterance('Speaker test one two three');
        utterance.onend = () => {
            setDeviceTests(prev => ({
                ...prev,
                speaker: { done: true, testing: false }
            }));
        };

        utterance.onerror = (event) => {
            console.error('Speaker test error:', event);
            setDeviceTests(prev => ({
                ...prev,
                speaker: { done: false, testing: false }
            }));
        };

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
                microphone: {
                    ...prev.microphone,
                    testing: true,
                    status: 'Listening... Speak now!',
                },
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
                    microphone: {
                        done: true,
                        testing: false,
                        permissionGranted: true,
                        status: '✓ Microphone is working!',
                    },
                }));
            }
        };

        recognition.onerror = (event) => {
            let errorMessage = 'An error occurred during microphone testing.';
            if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access was denied. Please allow access in your browser settings.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No microphone found. Please connect a microphone.';
            }

            recognition.stop();
            setDeviceTests(prev => ({
                ...prev,
                microphone: {
                    done: false,
                    testing: false,
                    permissionGranted: false,
                    status: errorMessage,
                },
            }));
        };

        recognition.onend = () => {
            if (!deviceTests.microphone.done) {
                setDeviceTests(prev => ({
                    ...prev,
                    microphone: {
                        ...prev.microphone,
                        testing: false,
                        status: '✓ Tested ',
                    },
                }));
            }
        };

        recognition.start();
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleStartInterview = () => {
        if (deviceTests.speaker.done && deviceTests.microphone.done) {
            router.push('/BaseLine/questionForm');
        } else {
            let message = 'Please complete the following tests before starting:\n';
            if (!deviceTests.speaker.done) message += '- Speaker Test\n';
            if (!deviceTests.microphone.done) message += '- Microphone Test\n';
            alert(message);
        }
    };



    // Check for authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    // Auto-advance slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % slides.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [slides.length]);

    // Cleanup microphone test on unmount
    useEffect(() => {
        return () => {
            if (window.SpeechRecognition || window.webkitSpeechRecognition) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.stop();
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#E8E8FB] p-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className=" text-2xl w-8 h-8 flex items-center justify-center mb-2"
            >
                <IoIosArrowBack />
            </button>
            <div className="flex justify-center items-center mb-6">
                <img src="/MM_LOGO.png" width={24} height={24} />
                <h2 className="text-xl ml-2 font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
                    MockMingle
                </h2>
            </div>
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-center mb-2 text-[#1F4CBD]">Instructions</h1>
                <p className=" text-center text[20px]">Discover your personality traits, strengths, and areas for growth with our comprehensive assessment.</p>
            </div>
            <div className="max-w-[500px] mx-auto">


                {/* Slides Container */}
                <div className="relative mb-8">
                    {/* Blue Corner Border */}
                    <div className="absolute top-0.8 left-0.8 w-20 h-20 border-l-[5px] border-t-[5px] border-[#2E56C5] rounded-tl-xl z-10"></div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl min-h-64 relative shadow-md shadow-gray-300 p-4 mb-8">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`transition-opacity duration-300 ${currentIndex === index
                                    ? "opacity-100"
                                    : "opacity-0 absolute inset-0 p-8"
                                    }`}
                            >
                                {/* Inner Gray Border */}
                                <div className="h-full border border-[#D9D9E6] rounded-3xl px-2 py-6 flex flex-col items-center justify-center relative">

                                    <div className="flex items-center justify-center mb-4">
                                        <h3 className="text-xl font-semibold bg-gradient-to-b from-[#1F4CBD] to-[#46A38E] bg-clip-text text-transparent">
                                            {slide.title}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-center text-[#222] leading-6 max-w-2xl">
                                        {slide.content}
                                    </p>

                                    {/* Navigation Dots */}
                                    <div className="flex justify-center space-x-2 mt-6">
                                        {slides.map((_, dotIndex) => (
                                            <button
                                                key={dotIndex}
                                                onClick={() => goToSlide(dotIndex)}
                                                className={`w-2 h-2 rounded-full transition-colors ${currentIndex === dotIndex
                                                    ? "bg-[#6F24E8]"
                                                    : "bg-[#E8E8FB]"
                                                    }`}
                                                aria-label={`Go to slide ${dotIndex + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Test Section */}
                <div className="relative bg-white shadow-md shadow-gray-300 rounded-xl p-6 mb-6 overflow-visible">
                    <div className="absolute -bottom-0.5 -right-0.5 w-20 h-20 border-r-[5px] border-b-[5px] border-[#2E56C5] rounded-br-2xl pointer-events-none"></div>


                    <h3 className="text-lg font-semibold mb-4 bg-gradient-to-b from-[#1F4CBD] to-[#46A38E] bg-clip-text text-transparent">Device Check</h3>

                    <div className="space-y-4">
                        {/* Speaker Test */}
                        <div className={`${deviceTests.speaker.done ? 'bg-[#D1FAE5] border border-[#16A34A]' : 'bg-white border border-gray-300'} flex items-center justify-between  p-2 rounded-xl`}>
                            <div className="flex items-center text-[15px]">
                                <FaVolumeUp className="text-black mx-4" />
                                <span>
                                    Speaker Test{" "}
                                    {deviceTests.speaker.done && (
                                        <span className="text-green-600 font-medium">
                                            ✓ Working
                                        </span>
                                    )}
                                </span>
                            </div>
                            {deviceTests.speaker.done ? (
                                <button
                                    onClick={testSpeaker}
                                    disabled={deviceTests.speaker.testing}
                                    className=" text-sm bg-[#16A34A] px-2 py-1 rounded-xl text-white">
                                    {deviceTests.speaker.testing ? 'Testing...' : 'Re-Test'}
                                </button>
                            ) : (
                                <button
                                    onClick={testSpeaker}
                                    disabled={deviceTests.speaker.testing}
                                    className="text-sm bg-[#6F24E8] text-white px-3 py-1 rounded-xl"
                                >
                                    {deviceTests.speaker.testing ? 'Testing...' : 'Test'}
                                </button>
                            )}
                        </div>

                        {/* Microphone Test */}
                        <div className={`${deviceTests.microphone.done ? 'bg-[#D1FAE5] border border-[#16A34A]' : 'bg-white border border-gray-300'} flex items-center justify-between  p-2 rounded-xl`}>
                            <div className="flex items-center text-[15px]">
                                <FaMicrophone className="text-black mx-4" />
                                <span>
                                    Microphone Test{" "}
                                    {deviceTests.microphone.done && (
                                        <span className="text-green-600 font-medium">
                                            ✓ Working
                                        </span>
                                    )}
                                </span>
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
                                <button
                                    onClick={testMicrophone}
                                    disabled={deviceTests.microphone.testing}
                                    className=" text-sm bg-[#16A34A] px-2 py-1 rounded-xl text-white">
                                    {deviceTests.microphone.testing ? 'Listening...' : 'Re-Test'}
                                </button>
                            ) : (
                                <button
                                    onClick={testMicrophone}
                                    disabled={deviceTests.microphone.testing}
                                    className={`text-sm px-4 py-1 rounded-lg flex items-center rounded-xl
              ${deviceTests.microphone.testing ? 'bg-[#00B4D8] cursor-not-allowed' : 'bg-[#00B4D8] text-white'}`}
                                >
                                    {deviceTests.microphone.testing ? (
                                        <>
                                            <span className="inline-block w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></span>
                                            Listening...
                                        </>
                                    ) : 'Test Microphone'}
                                </button>

                            )}

                        </div>

                    </div>

                </div>

                {/* Start Button */}
                <button
                    onClick={handleStartInterview}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors  ${deviceTests.speaker.done && deviceTests.microphone.done
                        ? 'bg-gradient-to-r from-[#1F4CBD] to-[#46A38E] text-white hover:bg-gray-200'
                        : 'bg-gradient-to-r from-[#1F4CBD]/50 to-[#46A38E]/50 text-white cursor-not-allowed'
                        }`}
                >
                    Complete device check to continue
                </button>
            </div>
        </div>
    );
}

export default Instruction;
