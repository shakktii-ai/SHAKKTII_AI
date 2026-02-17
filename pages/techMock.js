
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdCheckmarkCircle} from 'react-icons/io';
import {FaArrowRight,FaUserGraduate} from 'react-icons/fa';


export const fetchAssessmentQuestions = async (userDetails) => {
    try {
        const res = await fetch("/api/technicalTest/techTest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "generate_questions",
                // standard: userDetails.standard,
                subject: userDetails.subject
            })
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        const resultList = data.result || data.questions; // Handle potential schema variations

        if (!resultList || !Array.isArray(resultList)) {
            throw new Error("Invalid assessment response format");
        }

        return resultList.map((q, index) => ({
            id: q.id ?? index + 1,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
        }));

    } catch (err) {
        console.error("Assessment API error:", err);
        throw err;
    }
};
const InputStage = ({ onComplete }) => {
    const [formData, setFormData] = useState({ subject: '' });   //standard:''

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.subject) {               //formData.standard
            onComplete(formData);
        } else {
            alert("Please fill all details");
        }
    };

    return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
    >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-lg shadow-purple-500/30">
                <FaUserGraduate />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Technical Asessment</h2>
            <p className="text-slate-400">Enter the Subject and start the assessment.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <label className="block text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider">
                    Subject
                </label>
                <input
                    type="text"
                    placeholder="e.g., Maths, Science..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full bg-slate-950 border border-slate-600 rounded-xl px-5 py-4 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer ${
                        formData.subject === "" ? "text-slate-500" : "text-white"
                    }`}
                    required
                />
            </div>

            {/* Standard Field (Optional) */}
            {/*
            <div>
                <label className="block text-indigo-300 text-xs font-bold mb-2 uppercase tracking-wider">
                    Your Standard (Class)
                </label>
                <input 
                    type="text" 
                    placeholder="e.g., 12th Science" 
                    value={formData.standard} 
                    onChange={(e) => setFormData({...formData, standard: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-600 text-white rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500 transition-all" 
                    required 
                />
            </div>
            */}

            <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl mt-4 shadow-lg shadow-indigo-600/30 transform transition hover:-translate-y-1"
            >
                Start Test &rarr;
            </button>
        </form>
    </motion.div>
);

};

// ==========================================
// 2. MCQ STAGE 
// ==========================================
const MCQStage = ({ title, fetchData, themeColor, onComplete, isFinalStep = false }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            try {
                // Execute the passed function (Assessment or Situation)
                const data = await fetchData();
                if (isMounted) {
                    setQuestions(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load questions", err);
                if (isMounted) {
                    // Fallback for demo stability
                    setQuestions([
                        {
                            id: 1,
                            question: "Unable to load API. This is a demo fallback question.",
                            options: ["Option A", "Option B", "Option C", "Option D"],
                            correctAnswer: "Option A"
                        }
                    ]);
                    setLoading(false);
                }
            }
        };
        load();
        return () => { isMounted = false; };
    }, [fetchData]);

    const handleSelect = (option) => {
        setAnswers(prev => ({ ...prev, [currentQIndex]: option }));
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questions.length) {
           if (!confirm("Some questions are unanswered. Do you still want to submit?")) return;

        }
        // Send data back up
        onComplete({ questions, answers });
    };

    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    if (loading) return <LoadingScreen text={`Loading questions...`} color={themeColor} />;

    const currentQ = questions[currentQIndex];

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[600px]">
            {/* Header & Progress */}
            <div className="flex justify-between items-end mb-6 px-2">
                <div>
                    <h2 className={`text-2xl font-bold text-${themeColor}-400`}>{title}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Question {currentQIndex + 1} / {totalQuestions}
                    </p>
                </div>
                <div className="flex flex-col items-end w-1/3">
                    <span className="text-xs text-slate-500 mb-2 font-mono">
                        {Math.round(progressPercentage)}% Completed
                    </span>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className={`h-full bg-${themeColor}-500 transition-all duration-700 ease-out`}
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 bg-slate-900/80 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl flex flex-col justify-between backdrop-blur-sm no-copy"
             onCopy={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
     onDragStart={(e) => e.preventDefault()}
            >
                <div>
                    <h3 className="text-xl md:text-2xl text-white font-medium mb-10 leading-relaxed"
                    onCopy={(e) => e.preventDefault()}
                    >
                        {currentQ?.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQ?.options?.map((opt, idx) => {
                            const isSelected = answers[currentQIndex] === opt;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(opt)}
                                    className={`p-5 rounded-xl border-2 text-left transition-all flex items-center group
                                        ${isSelected
                                            ? `bg-${themeColor}-900/40 border-${themeColor}-500 text-white shadow-[0_0_15px_rgba(var(--${themeColor}-500),0.3)]`
                                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                                        }`}
                                >
                                    <span className={`w-8 h-8 min-w-[2rem] rounded-full border flex items-center justify-center mr-4 font-bold text-sm transition-colors
                                        ${isSelected
                                            ? `bg-${themeColor}-500 border-${themeColor}-500 text-white`
                                            : 'border-slate-600 text-slate-500 group-hover:border-slate-400'
                                        }`}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-lg">{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
                    <button
                        onClick={() => setCurrentQIndex(p => Math.max(0, p - 1))}
                        disabled={currentQIndex === 0}
                        className="px-6 py-3 rounded-xl text-slate-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    {currentQIndex === totalQuestions - 1 ? (
                        <button
                            onClick={handleSubmit}
                            className={`px-8 py-3 bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105`}
                        >
                            {isFinalStep ? "Submit" : "पुढील टप्पा"}  <IoMdCheckmarkCircle size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQIndex(p => Math.min(totalQuestions - 1, p + 1))}
                            className="px-8 py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                        >
                            Next <FaArrowRight />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoadingScreen = ({ text, color = 'indigo' }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className={`w-16 h-16 border-4 border-${color}-500/30 border-t-${color}-500 rounded-full animate-spin mb-6`}></div>
        <h3 className="text-xl text-blue-500 font-medium tracking-wide animate-pulse">{text}</h3>
    </div>
);

const TransitionScreen = ({ title, subtitle, icon, color, onNext }) => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center bg-slate-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] shadow-2xl">
        <div className={`w-24 h-24 bg-${color}-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-${color}-400 text-4xl shadow-[0_0_30px_rgba(var(--${color}-500),0.2)]`}>{icon}</div>
        <h2 className="text-3xl font-bold text-white mb-3">{title}</h2>
        <p className="text-slate-400 mb-10 text-lg leading-relaxed">{subtitle}</p>
        <button onClick={onNext} className={`px-10 py-4 bg-${color}-600 hover:bg-${color}-500 text-white rounded-full font-bold shadow-lg flex items-center gap-3 mx-auto transition-transform hover:scale-105`}>पुढे जा <FaArrowRight /></button>
    </motion.div>
);


export default function FullAssessmentFlow() {
    const router = useRouter();
    const [stage, setStage] = useState('input');
    const [formUserInfo, setFormUserInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Master State to hold ALL data locally before final submit
    const [masterData, setMasterData] = useState({
        assessment: null,
     
    });

    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');

        if (!userStr) {
            router.push("/login");
            return;
        }

        const user = JSON.parse(userStr);
        setLoggedInUser(user);

    }, []);

useEffect(() => {

  const blockCopy = (e) => e.preventDefault();

  const blockKeys = (e) => {
    if (
      e.ctrlKey &&
      ['c','u','s','a','x'].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
  };

  document.addEventListener('copy', blockCopy);
  document.addEventListener('cut', blockCopy);
  document.addEventListener('contextmenu', blockCopy);
  document.addEventListener('keydown', blockKeys);

  return () => {
    document.removeEventListener('copy', blockCopy);
    document.removeEventListener('cut', blockCopy);
    document.removeEventListener('contextmenu', blockCopy);
    document.removeEventListener('keydown', blockKeys);
  };

}, []);

    const handleInputComplete = (data) => {
        setFormUserInfo(data);
        setStage('assessment');
    };

    // Store stage data locally and move to transition or next stage
    const handleStageData = (key, data, nextStage) => {
        setMasterData(prev => ({ ...prev, [key]: data }));
        setStage(nextStage);
    };

    // FINAL SUBMISSION
    const finalizeAndSubmit = async (finalSituationData) => {
        setIsSubmitting(true);
      if (!loggedInUser?.email) {
   alert("Session expired. Please login again.");
   router.push("/login");
   return;
}

const userEmail = loggedInUser.email;
        // Construct final payload
        const payload = {
            email: userEmail,
            userInfo: formUserInfo,
            masterData:{assessment:finalSituationData}
        };

        try {
            const res = await fetch('/api/submit-full-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // If needed
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStage('success');
            } else {
                console.error("Server Error:", await res.text());
                alert("Submission Failed. Please try again.");
            }
        } catch (error) {
            console.error("Network Error", error);
            alert("Network Error. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <LoadingScreen text="Saving your results..." color="green" />;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative">
            <Head><title>Assessment | Shakkti AI</title></Head>

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
            </div>

            

<nav className="sticky top-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">

    {/* LEFT SIDE - LOGO */}
    <div className="flex items-center gap-2 ">
       <button
            onClick={() => router.back('/dashboard')}
            className="absolute top-4 left-4 text-white bg-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-700 transition"
          >
            ← Back
          </button>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-4">

       
       

        {/* Logged In User */}
        {loggedInUser && (
            <div className="hidden sm:block text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-full">
                Hi, {loggedInUser.fullName}
            </div>
        )}
       
    </div>

</nav>


            <main className="relative z-10 container mx-auto px-4 py-12 min-h-[85vh] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {stage === 'input' && <InputStage key="input" onComplete={handleInputComplete} />}

                    {/* 1. Assessment Stage (Uses fetchAssessmentQuestions) */}
                    {stage === 'assessment' && (
                        <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                            <MCQStage
                                title="Technical Assessment"
                                fetchData={() => fetchAssessmentQuestions(formUserInfo)}
                                themeColor="indigo"
                                onComplete={(data) => finalizeAndSubmit(data)}
                                isFinalStep={true}
                                // onComplete={(data) => handleStageData('assessment', data, 'interview_intro')}
                            />
                        </motion.div>
                    )}

                   
                    {stage === 'success' && (
                        <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-xl mx-auto bg-slate-900/80 p-12 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-md">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 ring-1 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                <IoMdCheckmarkCircle className="text-green-400 text-6xl" />
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4">Congratulations!</h2>
                            <p className="text-slate-400 mb-10 text-lg">Your assessment has been submitted successfully.</p>
                            <button onClick={() => router.push('/dashboard')} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700">
                                Go To Home Page
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}