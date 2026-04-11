import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DemoVideo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  const slidesCount = 15;

  const nextStep = useCallback(() => {
    setDirection(1);
    setCurrentStep((prev) => {
      if (prev === slidesCount - 1) {
        setIsPlaying(false);
        setIsEnlarged(false);
        return 0;
      }
      return prev + 1;
    });
  }, [slidesCount]);

  // Auto-slide effect (only if playing)
  useEffect(() => {
    if (!isPlaying) return;

    // 8s for last slide (index 14), 5s for others
    const delay = currentStep === slidesCount - 1 ? 8000 : 5000;

    const timer = setTimeout(() => {
      nextStep();
    }, delay);

    return () => clearTimeout(timer);
  }, [nextStep, isPlaying, currentStep, slidesCount]);

  // Lock scroll when enlarged
  useEffect(() => {
    if (isEnlarged) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isEnlarged]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 }
      }
    })
  };

  const renderSlideContent = (index) => {
    switch (index) {
      case 0: // NEW Dashboard (Screenshot 164812)
        return (
          <div className="w-full h-full bg-[#f8faff] flex flex-col font-sans overflow-hidden" style={{ fontFamily: 'Inter, Manrope, sans-serif' }}>
            {/* Top Internal Navbar */}
            <div className="h-[45px] md:h-[55px] bg-white border-b border-gray-100 flex items-center justify-between px-3 md:px-6 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#14b8a6] flex items-center justify-center p-1 md:p-1.5">
                  <img src="/MM_LOGO.png" alt="Logo" className="w-full h-full object-contain invert" />
                </div>
                <span className="text-[#1E0A40] font-black text-sm md:text-base tracking-tight">MockMingle</span>
                <div className="hidden md:flex items-center gap-5 ml-8">
                  <span className="text-[#6366f1] font-bold text-[11px] bg-indigo-50 px-3 py-1.5 rounded-lg">Dashboard</span>
                  {["Progress", "Reports", "SoftSkills", "Learn"].map((link) => (
                    <span key={link} className="text-gray-400 font-bold text-[11px] hover:text-gray-600 transition-colors cursor-pointer">{link}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1.5 bg-[#ffedd5] px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-orange-100">
                  <span className="text-orange-500 text-[8px] md:text-[10px]">🔥</span>
                  <span className="text-[#ea580c] font-black text-[8px] md:text-[10px]">4</span>
                </div>
                <div className="relative">
                  <svg width="14" height="14" className="md:w-[18px] md:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[5px] text-white font-black">2</div>
                </div>
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-purple-100 border md:border-2 border-purple-200 flex items-center justify-center text-purple-600 font-black text-[10px] overflow-hidden">
                  <img src="/ananya gupta.jpeg" alt="U" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4 p-2 md:p-5 overflow-y-auto md:overflow-hidden">
              {/* Left Column */}
              <div className="h-auto md:flex-[1.8] flex flex-col gap-4">
                {/* Welcome Card */}
                <div className="bg-white rounded-[24px] p-4 md:p-6 border border-blue-50 relative overflow-hidden flex flex-col justify-center min-h-[100px] md:min-h-[140px] shadow-sm">
                  <div className="absolute top-0 right-0 w-24 md:w-40 h-24 md:h-40 bg-[#f0f7ff] rounded-full -mr-12 md:-mr-20 -mt-12 md:-mt-20" />
                  <div className="z-10">
                    <p className="text-[#2dd4bf] font-black text-[8px] md:text-[10px] uppercase tracking-widest mb-1">✨ AI Coach Ready</p>
                    <h2 className="text-[#1E0A40] text-xl md:text-3xl font-black mb-1">Welcome Back, Sumit</h2>
                    <p className="text-gray-400 text-[10px] md:text-xs font-medium">Here's your growth snapshot.</p>
                  </div>
                </div>

                {/* Points Card */}
                <div className="bg-white rounded-[24px] p-6 border border-blue-50 flex-1 flex flex-col gap-4 min-h-0 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#3b82f6] rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8l-4 4 4 4M16 12H8" /></svg>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold text-[8px] md:text-[10px] uppercase">Total Points</p>
                        <h3 className="text-[#1E0A40] text-2xl md:text-4xl font-black">355</h3>
                        <p className="text-gray-400 text-[8px] md:text-[9px] font-bold">255 pts this week</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="bg-[#f3e8ff] text-[#7e22ce] px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Top 100%</span>
                      <span className="bg-[#ffedd5] text-[#ea580c] px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">4-day streak</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400">
                      <span>Active Candidate</span>
                      <span>145 pts to Interview Ready</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] w-[70%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-auto">
                    <div className="bg-[#f8faff] p-3 rounded-xl border border-blue-50 flex flex-col items-center">
                      <p className="text-gray-400 text-[8px] font-bold uppercase mb-1">Rank</p>
                      <p className="text-[#1E0A40] font-black text-xs">#1</p>
                      <p className="text-gray-300 text-[7px]">of 1</p>
                    </div>
                    <div className="bg-[#faf5ff] p-3 rounded-xl border border-purple-50 flex flex-col items-center">
                      <p className="text-gray-400 text-[8px] font-bold uppercase mb-1">Percentile</p>
                      <p className="text-[#1E0A40] font-black text-xs">Top 100%</p>
                      <p className="text-gray-300 text-[7px]">global rank</p>
                    </div>
                    <div className="bg-[#fffaf5] p-3 rounded-xl border border-orange-50 flex flex-col items-center">
                      <p className="text-gray-400 text-[8px] font-bold uppercase mb-1">Best Streak</p>
                      <p className="text-[#1E0A40] font-black text-xs">4</p>
                      <p className="text-gray-300 text-[7px]">days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="h-auto md:flex-1 flex flex-col gap-4">
                {/* Ranking Snapshot Card */}
                <div className="bg-white rounded-[24px] p-4 border border-blue-50 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /></svg>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold text-[10px] uppercase">Your Ranking</p>
                      <h4 className="text-[#1E0A40] font-black text-sm">Top 100%</h4>
                    </div>
                    <div className="ml-auto text-green-500 font-black text-[10px] bg-green-50 px-2 rounded-full">📈 355 pts</div>
                  </div>
                  <div className="w-full h-1.5 bg-purple-50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[60%]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-[10px]">🎖️</div>
                    <span className="text-gray-400 font-bold text-[9px] uppercase">Active Candidate Badge</span>
                  </div>
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-[24px] border border-blue-50 p-4 flex flex-col shadow-sm">
                  <h4 className="text-[#1E0A40] font-black text-sm mb-4">Recent Activity</h4>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                    {[
                      { title: "Technical module completed", pts: "+20", icon: "💎", color: "text-green-500", time: "4h ago" },
                      { title: "Psychometric module completed", pts: "+20", icon: "🧠", color: "text-green-500", time: "5h ago" },
                      { title: "DecisionMaking module completed", pts: "+40", icon: "⚖️", color: "text-green-500", time: "5h ago" },
                      { title: "Excel module completed", pts: "+20", icon: "📊", color: "text-green-500", time: "1d ago" },
                      { title: "Personality module completed", pts: "+25", icon: "🎭", color: "text-green-500", time: "1d ago" },
                      { title: "3-day streak bonus", pts: "+10", icon: "🔥", color: "text-orange-500", time: "1d ago" },
                      { title: "Listening module completed", pts: "+20", icon: "🎧", color: "text-green-500", time: "1d ago" },
                      { title: "Mock interview completed", pts: "+50", icon: "🎯", color: "text-blue-500", time: "1d ago" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-gray-50 w-7 h-7 flex items-center justify-center rounded-lg">{item.icon}</span>
                          <div>
                            <p className="text-[#1E0A40] font-bold text-[9px] leading-tight">{item.title}</p>
                            <p className="text-gray-300 text-[8px]">{item.time}</p>
                          </div>
                        </div>
                        <span className={`${item.color} font-black text-[10px]`}>{item.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );



      case 1: // NEW Practice Zones (Screenshot 164857)
        return (
          <div className="w-full h-full bg-[#f8faff] flex flex-col p-4 md:p-8 overflow-hidden" style={{ fontFamily: 'Manrope' }}>
            <div className="mb-4 md:mb-6 shrink-0 text-center md:text-left">
              <h2 className="text-[#1E0A40] text-xl md:text-3xl font-black mb-1">Practice Zones</h2>
              <p className="text-gray-400 text-xs md:text-sm font-bold">Choose an area to improve your skills</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-4 mb-6 md:mb-8 overflow-y-auto md:overflow-hidden pr-1 md:flex-1">
              {[
                { name: "Interview Simulations", progress: "45%", color: "border-blue-500", icon: "🎙️", desc: "Practice full mock interviews with AI-powered feedback." },
                { name: "Resume-Based Interview", progress: "45%", color: "border-green-500", icon: "📄", desc: "Practice mock interview tailored to your resume." },
                { name: "Behaviour", progress: "30%", color: "border-purple-500", icon: "👥", desc: "Master STAR method responses and situational questions." },
                { name: "Soft Skills", progress: "60%", color: "border-cyan-500", icon: "🧠", desc: "Improve leadership and interpersonal abilities." },
                { name: "Technical Training", progress: "25%", color: "border-orange-500", icon: "🎯", desc: "Evaluate your technical knowledge and subject understanding." }
              ].map((zone, i) => (
                <div key={i} className={`bg-white rounded-[20px] border-t-8 ${zone.color} p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer min-h-[140px] md:min-h-0`}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl md:text-2xl shrink-0">{zone.icon}</div>
                  <h3 className="text-[#1E0A40] font-black text-sm leading-tight">{zone.name}</h3>
                  <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-3 md:line-clamp-4">{zone.desc}</p>
                  <div className="mt-auto pt-2">
                    <p className="text-gray-400 font-bold text-[9px] uppercase tracking-tighter mb-1">{zone.progress} complete</p>
                    <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full bg-current ${zone.color.replace('border-', 'text-')} opacity-60`} style={{ width: zone.progress }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#eff6ff] to-[#f5f3ff] rounded-[20px] md:rounded-[32px] p-4 md:p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between shrink-0 shadow-inner gap-4 md:gap-6 text-center md:text-left">
              <div className="max-w-xl">
                <span className="bg-purple-100 text-purple-600 px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[7px] md:text-[10px] font-black uppercase mb-1 md:mb-3 inline-block tracking-widest leading-none">✨ AI Resume Builder</span>
                <h3 className="text-[#1E0A40] text-lg md:text-3xl font-black mb-1 md:mb-2 leading-tight">Professional Resume</h3>
                <p className="text-[#475569] text-[10px] md:text-sm font-medium leading-normal">Smart suggestions and instant improvements.</p>
              </div>
              <button className="bg-[#6366f1] text-white px-6 md:px-10 py-2.5 md:py-4 rounded-[12px] md:rounded-[18px] font-black text-[10px] md:text-sm shadow-xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all w-full md:w-auto">
                Create New Resume
              </button>
            </div>
          </div>
        );



      case 2: // Self-Introduction Practice (Old Index 0)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 bg-[#f8faff] overflow-y-auto md:overflow-hidden">
            <div className="w-full max-w-xl flex flex-col gap-4">
              <div className="flex justify-between items-center text-[10px] md:text-xs text-gray-500 font-bold border-b border-[#1E0A40]/10 pb-1">
                <span>Question 1 of 11</span>
              </div>
              <div className="bg-[#e0f2fe] rounded-[24px] p-4 md:p-8 shadow-xl border border-blue-100 flex flex-col items-center gap-4">
                <h3 className="text-[#1E0A40] font-extrabold text-base md:text-xl">Question:</h3>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 italic text-center text-[#334155] text-[12px] md:text-[16px] leading-relaxed">
                  "Hello Sumit, can you tell me about yourself, including your educational background and previous work experience?"
                </div>
                <button className="bg-[#5d4ae1] text-white px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-[#4a3ab8] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                  Listen Again
                </button>
                <div className="bg-[#99f6e4] text-[#0d9488] px-3 py-0.5 rounded-full text-[10px] font-bold animate-pulse">
                  AI Speaking...
                </div>
                <div className="flex gap-6 mt-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c084fc] to-[#f472b6] flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Start Speaking</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#14b8a6] to-[#6ee7b7] flex items-center justify-center shadow-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Next Question</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Psychometric (Old Index 1)
        return (
          <div className="w-full h-full flex flex-col bg-white p-4 md:p-6 overflow-hidden">
            <div className="flex justify-between items-center border-b-2 border-blue-700 pb-1 mb-2">
              <span className="text-blue-700 font-black text-[10px] md:text-sm uppercase">Psychometric Assessment</span>
              <div className="text-gray-400 text-[8px] md:text-xs font-bold">1 / 29 Questions Answered</div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4 justify-center">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`w-4 h-4 md:w-6 md:h-6 rounded flex items-center justify-center text-[6px] md:text-[8px] font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 shadow-inner flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="bg-[#e0f2fe] text-[#0369a1] text-[8px] font-bold px-2 py-0.5 rounded inline-block mb-2 uppercase tracking-tighter w-fit">Easy Difficulty</div>
              <h4 className="text-[14px] md:text-[18px] font-bold text-[#1e293b] mb-4">"You find a colleague cheating during an examination. What do you do?"</h4>
              <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                {[
                  "Report the incident to the teacher immediately",
                  "Confront the colleague after the examination",
                  "Ignore the situation",
                  "Cheat as well because everyone is doing it"
                ].map((opt, i) => (
                  <div key={i} className={`p-2 md:p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${i === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${i === 1 ? 'border-blue-500' : 'border-gray-300'}`}>
                      {i === 1 && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <span className={`text-[10px] md:text-sm ${i === 1 ? 'text-blue-900 font-semibold' : 'text-gray-600'}`}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button className="px-4 py-1.5 bg-gray-100 text-gray-400 rounded-md font-bold text-xs cursor-not-allowed">Previous</button>
              <button className="px-8 py-1.5 bg-blue-600 text-white rounded-md font-bold text-xs hover:bg-blue-700 transition-colors">Next</button>
            </div>
          </div>
        );

      case 4: // Socializing (Old Index 2)
        return (
          <div className="w-full h-full flex flex-col bg-black p-4 md:p-6 text-white overflow-hidden">
            <div className="flex justify-between text-[10px] font-bold mb-2">
              <span>Question 1 of 10</span>
              <span>10% Complete</span>
            </div>
            <div className="w-full h-1 bg-white/20 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-blue-500 w-[10%]" />
            </div>
            <div className="flex flex-col items-center flex-1 min-h-0 overflow-hidden">
              <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-bold mb-4 flex items-center gap-2 shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                Time Remaining: 30:00
              </div>
              <div className="w-full bg-white rounded-2xl p-4 md:p-8 text-[#1e293b] flex flex-col min-h-0 flex-1 overflow-hidden">
                <h3 className="text-[16px] md:text-[20px] font-bold mb-4 text-center shrink-0">"I enjoy meeting new people and socializing in large groups."</h3>
                <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                  {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((opt, i) => (
                    <div key={i} className={`w-full p-2.5 rounded-xl border flex items-center text-xs ${i === 4 ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-500'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 border-t pt-4 shrink-0">
                  <button className="text-gray-400 font-bold uppercase text-[10px]">Previous</button>
                  <button className="bg-blue-600 text-white px-6 py-1.5 rounded-lg font-bold uppercase text-[10px] shadow-lg shadow-blue-500/30">Next</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Marathi Situation (Old Index 3)
        return (
          <div className="w-full h-full flex flex-col bg-[#0f172a] p-4 md:p-6 text-white overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[#2dd4bf] text-[20px] md:text-[24px] font-black" style={{ fontFamily: 'Manrope' }}>सिच्युएशन अ‍ॅटिट्यूड</h2>
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">प्रश्न 1 / 10</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] font-bold">0% पूर्ण</span>
                <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-cyan-400 w-0" />
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/50 border border-white/5 rounded-[20px] md:rounded-[24px] p-4 md:p-8 flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto md:overflow-hidden">
              <h3 className="text-[14px] md:text-[20px] font-bold leading-relaxed text-left overflow-y-auto pr-1 shrink-0">
                "तुम्ही PCB असेंब्ली लाईनवर काम करत असताना तुम्हाला समजते की मशीन अचानक बिघडली आहे. तुम्हाला उत्पादन थांबवायचं नाही. तुम्ही काय कराल?"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
                {[
                  "सुपरवायझरला ताबडतोब सांगा",
                  "काहीही न करता थांबून बघा",
                  "सहकाऱ्यांना सांगा",
                  "स्वतःच मशीन दुरुस्त करण्याचा प्रयत्न करा"
                ].map((opt, i) => (
                  <div key={i} className="bg-[#0f172a]/80 border border-white/10 p-3 rounded-xl flex items-center gap-3 group hover:border-[#2dd4bf] transition-colors cursor-pointer min-h-0">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-black group-hover:text-[#2dd4bf] shrink-0 text-xs text-center">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-gray-300 text-[11px] md:text-[14px] leading-snug flex-1">{opt}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                <span className="text-gray-500 text-[10px] font-bold opacity-50">मागील (Previous)</span>
                <button className="bg-white text-black px-6 py-2 rounded-lg font-black text-xs flex items-center gap-2">
                  पुढील (Next)
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        );

      case 6: // Listening Practice (Old Index 4)
        return (
          <div className="w-full h-full flex flex-col bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] p-4 md:p-6 overflow-hidden">
            <div className="text-white text-center mb-4">
              <h2 className="text-[24px] md:text-[32px] font-black leading-tight">Listening Practice</h2>
              <p className="text-white/70 font-bold text-xs">Enhance your listening skills through interactive exercises</p>
            </div>

            <div className="bg-white rounded-[24px] p-4 md:p-8 shadow-2xl flex-1 flex flex-col gap-4 overflow-y-auto md:overflow-hidden min-h-0">
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-b border-gray-100 pb-2">
                <span>Question 1 of 5</span>
                <span>Beginner Level • 1</span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 w-[20%]" />
              </div>

              <div className="overflow-y-auto space-y-4 pr-2">
                <h4 className="text-[14px] md:text-[16px] font-black text-[#1e293b]">Listen to the short conversation and answer the question below.</h4>

                <div className="bg-pink-50 rounded-xl p-3 border border-pink-100 italic text-pink-900 text-[11px] md:text-[13px] leading-relaxed">
                  "The audio features a slow-paced dialogue where a man asks, 'What time does the movie start tonight?' and a woman replies, 'It starts at 7 PM.'"
                </div>

                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-[12px] md:text-[14px]">
                  <h6 className="text-blue-900 font-black mb-1 uppercase tracking-tighter text-[10px]">Question:</h6>
                  <p className="text-[#1e293b] font-medium">What time does the movie start?</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="bg-gray-200 px-4 py-1.5 rounded-lg text-gray-500 font-bold text-[10px] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                  Audio Played
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#7c3aed]/20 border-t-[#7c3aed] flex items-center justify-center text-[#7c3aed] font-black text-xs animate-spin-slow">
                  27s
                </div>
                <button className="flex-1 bg-[#9333ea] text-white py-2 rounded-xl font-black text-sm shadow-lg shadow-purple-500/20">Submit Answer</button>
              </div>
            </div>
          </div>
        );

      case 7: // Excel MCQ (Old Index 5)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#f1f5f9] p-4 md:p-8">
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 md:p-8 w-full max-w-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#1e293b] font-bold text-xs md:text-sm">Question 1 of 15</span>
                <span className="text-red-500 font-bold text-xs md:text-sm">Time Left: 9:57</span>
              </div>
              <h3 className="text-[#1e293b] text-sm md:text-base font-medium mb-6">Which Excel function adds numbers in a range?</h3>
              <div className="space-y-2">
                {["SUM", "AVERAGE", "COUNT", "MAX"].map((opt, i) => (
                  <div key={i} className="w-full py-2 border border-blue-400 rounded-md text-[#1e293b] text-center font-medium hover:bg-blue-50 transition-colors cursor-pointer capitalize text-xs">
                    {opt}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button className="bg-[#4f46e5] text-white px-6 py-1.5 rounded-lg font-bold text-xs">Next</button>
              </div>
            </div>
          </div>
        );

      case 8: // Choosing a Breakfast (Old Index 6)
        return (
          <div className="w-full h-full flex flex-col bg-white p-4 md:p-8 overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                  <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="113" strokeLinecap="round" />
                </svg>
                <span className="absolute text-[8px] font-bold text-gray-500">1/10</span>
              </div>
              <span className="text-gray-500 font-bold text-xs">Question 1 of 10</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
              <h2 className="text-[#1e293b] text-lg md:text-2xl font-bold">Choosing a Breakfast</h2>
              <p className="text-[#475569] text-[11px] md:text-sm leading-relaxed max-w-3xl border-l-4 border-blue-100 pl-3">
                You wake up and feel like having a nice breakfast. You want something tasty but healthy. You have time to prepare something at home or grab something on your way.
              </p>

              <div className="space-y-2">
                {[
                  "Option A: Make a smoothie",
                  "Option B: Prepare scrambled eggs",
                  "Option C: Grab a coffee",
                  "Option D: Skip breakfast"
                ].map((opt, i) => (
                  <div key={i} className={`p-2.5 rounded-xl border-2 flex items-center gap-3 transition-all ${i === 0 ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'} cursor-pointer`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-[11px] md:text-sm ${i === 0 ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <span className="text-gray-500 font-bold text-xs">Time left: 1:34</span>
              <button className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors">Next</button>
            </div>
          </div>
        );

      case 9: // Speaking Practice (Old Index 7)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center relative p-4 bg-[#0a0a0a] overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #444 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="text-center mb-4 z-10 shrink-0">
              <h2 className="text-[#be2155] text-2xl md:text-3xl font-black mb-1 uppercase tracking-tight">Speaking Practice</h2>
              <p className="text-gray-500 font-bold text-[10px] md:text-xs">Enhance your speaking skills through interactive exercises</p>
            </div>

            <div className="bg-white rounded-[24px] shadow-2xl p-4 md:p-8 w-full max-w-2xl z-10 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <span className="text-gray-800 font-bold text-[10px] md:text-xs">Question 1 of 5</span>
                <span className="text-gray-800 font-bold text-[10px] md:text-xs">Beginner Level • 1</span>
              </div>
              <div className="w-full h-1 bg-pink-100 rounded-full mb-4 overflow-hidden shrink-0">
                <div className="h-full bg-pink-500 w-[20%]" />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <h3 className="text-[#111827] text-base md:text-lg font-black leading-tight">
                  Describe your favorite food. What ingredients are in it and why do you like it?
                </h3>

                <div className="flex justify-end">
                  <button className="text-pink-500 font-bold text-[10px] underline">Show example</button>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30 cursor-pointer hover:bg-pink-600 transition-colors shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                  </div>
                  <span className="text-[#111827] font-bold text-xs">Click to speak</span>
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-gray-100 shrink-0">
                <button className="bg-gray-200 text-gray-500 px-8 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider">Next Question</button>
              </div>
            </div>
          </div>
        );

      case 10: // Reading Practice (Old Index 8)
        return (
          <div className="w-full h-full flex flex-col bg-white p-4 md:p-6 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="20" cy="20" r="18" stroke="#f3e8ff" strokeWidth="3" fill="transparent" />
                    <circle cx="20" cy="20" r="18" stroke="#a855f7" strokeWidth="3" fill="transparent" strokeDasharray="113" strokeDashoffset="90" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[8px] font-bold text-purple-600">1/5</span>
                </div>
                <div>
                  <h2 className="text-[#581c87] text-lg md:text-xl font-black">Reading Practice</h2>
                  <p className="text-gray-400 font-bold text-[10px]">Beginner Level</p>
                </div>
              </div>
              <div className="bg-purple-50 px-3 py-1 rounded-lg text-purple-600 font-bold text-xs">0:00</div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-6">
              <div className="bg-[#f3f4f6] rounded-xl p-4 border border-gray-100">
                <h4 className="text-[#111827] font-black mb-1 text-xs">Instructions:</h4>
                <p className="text-gray-600 text-[11px] mb-3">Read the passage and answer the question below.</p>
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="text-[#111827] font-black mb-2 uppercase text-[10px] tracking-widest text-gray-400 border-b pb-1">Passage:</h4>
                  <p className="text-[#111827] text-[12px] md:text-[14px] leading-relaxed">
                    Tom likes to play soccer. Every Saturday, he goes to the park with his friends to play a game. They have lots of fun and enjoy the sunny weather.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[#111827] font-black mb-0.5 text-sm">Question:</h4>
                  <p className="text-gray-600 text-xs">What does Tom do every Saturday?</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[#111827] font-black text-[10px] uppercase">Choose the correct answer:</h4>
                  {[
                    "He plays basketball",
                    "He plays soccer",
                    "He goes swimming",
                    "He reads a book"
                  ].map((opt, i) => (
                    <div key={i} className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all bg-gray-50 border-gray-200 hover:border-purple-300 cursor-pointer`}>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${i === 1 ? 'border-purple-500' : 'border-gray-300'}`}>
                        {i === 1 && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                      </div>
                      <span className={`text-[12px] text-gray-700 font-medium`}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 border-t pt-4">
              <button className="bg-gray-200 text-gray-400 px-10 py-2 rounded-lg font-bold text-xs">Submit Answer</button>
            </div>
          </div>
        );

      case 11: // Marathi Technical Grid (Old Index 9)
        return (
          <div className="w-full h-full flex flex-col bg-[#0f172a] p-4 md:p-6 text-white overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-[#6366f1] text-[20px] md:text-[24px] font-black" style={{ fontFamily: 'Manrope' }}>टेक्निकल असेसमेंट</h2>
                <p className="text-gray-500 font-bold text-[10px] uppercase mt-1">प्रश्न 1 / 20</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-[10px] font-bold uppercase">0% पूर्ण</span>
                <div className="w-48 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#1e293b] w-0" />
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/30 border border-white/5 rounded-[24px] p-4 md:p-8 flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto md:overflow-hidden">
              <h3 className="text-[18px] md:text-[22px] font-bold leading-relaxed text-center overflow-y-auto pr-2">
                "PCB उत्पादन प्रक्रियेत कोणता टप्पा सोल्डिरिंगसाठी आवश्यक आहे?"
              </h3>

              <div className="grid md:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-2">
                {[
                  "एटिंग प्रक्रिया",
                  "ड्राइंग प्रक्रिया",
                  "पेंटिंग प्रक्रिया",
                  "फॅब्रिकेशन प्रक्रिया"
                ].map((opt, i) => (
                  <div key={i} className="bg-[#0f172a]/80 border border-white/10 p-4 rounded-xl flex items-center gap-4 group hover:border-[#6366f1] transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-black group-hover:text-[#6366f1] shrink-0">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-gray-300 text-[12px] md:text-[14px] leading-snug flex-1">{opt}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-4">
                <span className="text-gray-500 text-xs font-bold opacity-30">मागील (Previous)</span>
                <button className="bg-white text-black px-8 py-2 rounded-lg font-black text-xs flex items-center gap-2 hover:translate-x-1 transition-transform">
                  पुढील (Next)
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        );

      case 12: // Marathi Speaking (Old Index 10)
        return (
          <div className="w-full h-full flex flex-col bg-[#0f172a] p-4 md:p-6 text-white overflow-hidden">
            <div className="text-center mb-4">
              <p className="text-[#a855f7] font-bold text-[10px] tracking-widest uppercase">प्रश्न 1 / 5</p>
              <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden max-w-sm mx-auto">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[20%]" />
              </div>
            </div>

            <div className="bg-[#1e293b]/30 border border-white/5 rounded-[32px] p-6 md:p-10 flex-1 flex flex-col items-center justify-center gap-6 text-center min-h-0 overflow-y-auto md:overflow-hidden">
              <h3 className="text-[18px] md:text-[24px] font-black leading-tight max-w-2xl overflow-y-auto">
                तुमच्या जमेच्या बाजू (Strengths) आणि कमकुवत बाजू (Weaknesses) कोणत्या आहेत?
              </h3>

              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                </div>
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Speaking...</span>
              </div>

              <div className="w-full max-w-2xl bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 h-24 flex items-start justify-start">
                <span className="text-white/20 italic text-base font-medium">Wait for question...</span>
              </div>

              <button className="bg-white text-black px-10 py-3 rounded-full font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform">
                पुढील (Next)
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        );

      case 13: // Progress Report (Screenshot 165304)
        return (
          <div className="w-full h-full bg-[#f8faff] flex flex-col p-4 md:p-10 overflow-hidden" style={{ fontFamily: 'Inter, Manrope, sans-serif' }}>
            <div className="mb-3 md:mb-6 shrink-0 text-center md:text-left">
              <h2 className="text-[#1E0A40] text-xl md:text-4xl font-black mb-0.5 md:mb-1 leading-tight">Your Progress Report</h2>
              <p className="text-gray-400 text-[10px] md:text-lg font-medium">Track your growth across all skill areas</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 shrink-0">
              {[
                { label: "Overall Score", value: "35", total: "/50", icon: "bullseye", color: "text-teal-500", bgColor: "bg-teal-50" },
                { label: "Job Role", value: "Program Manager", icon: "trending-up", color: "text-green-500", bgColor: "bg-green-50" },
                { label: "Date", value: "3/21/2026", icon: "calendar", color: "text-orange-400", bgColor: "bg-orange-50" },
                { label: "Total Reports", value: "226", icon: "file-text", color: "text-purple-500", bgColor: "bg-purple-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-[16px] md:rounded-[24px] p-2.5 md:p-6 border border-blue-50 shadow-sm flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-1.5 md:gap-5">
                  <div className={`w-8 h-8 md:w-14 md:h-14 ${stat.bgColor} rounded-xl md:rounded-2xl flex items-center justify-center ${stat.color} shrink-0`}>
                    {stat.icon === "bullseye" && <svg width="16" height="16" className="md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
                    {stat.icon === "trending-up" && <svg width="16" height="16" className="md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}
                    {stat.icon === "calendar" && <svg width="16" height="16" className="md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                    {stat.icon === "file-text" && <svg width="16" height="16" className="md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>}
                  </div>
                  <div>
                    <p className="text-gray-400 font-bold text-[7px] md:text-xs uppercase mb-0.5 md:mb-1 tracking-tight">{stat.label}</p>
                    <div className="flex items-baseline justify-center md:justify-start">
                      <span className="text-[#1E0A40] text-xs md:text-2xl font-black">{stat.value}</span>
                      {stat.total && <span className="text-gray-300 text-[8px] md:text-sm font-bold ml-1">{stat.total}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="mb-4 shrink-0">
                <h3 className="text-[#1E0A40] text-xl font-black">Skill Analysis: Program Manager</h3>
                <p className="text-gray-400 text-xs font-bold mt-1">Detailed breakdown of your performance on 3/21/2026</p>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2 pb-4">
                {[
                  { name: "Technical Proficiency", score: 8, status: "Strong", color: "text-[#6366f1]", ring: "stroke-[#6366f1]" },
                  { name: "Communication", score: 6, status: "Good", color: "text-[#8b5cf6]", ring: "stroke-[#8b5cf6]" },
                  { name: "Decision-Making", score: 8, status: "Strong", color: "text-[#6366f1]", ring: "stroke-[#6366f1]" },
                  { name: "Confidence", score: 7, status: "Good", color: "text-[#8b5cf6]", ring: "stroke-[#8b5cf6]" },
                  { name: "Language Fluency", score: 6, status: "Good", color: "text-[#8b5cf6]", ring: "stroke-[#8b5cf6]" }
                ].map((skill, i) => (
                  <div key={i} className="bg-white rounded-[20px] p-4 md:px-6 border border-blue-50 shadow-sm flex items-center gap-3 md:gap-6 group hover:translate-x-1 transition-transform cursor-pointer">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="28" cy="28" r="24"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray="150.8"
                          style={{ strokeDashoffset: 150.8 - (150.8 * skill.score / 10) }}
                          strokeLinecap="round"
                          className={skill.ring}
                        />
                      </svg>
                      <span className={`absolute font-black text-base md:text-lg ${skill.color}`}>{skill.score}</span>
                    </div>

                    <div className="flex-1">
                      <h4 className={`text-lg font-black ${skill.color}`}>{skill.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tight ${skill.status === 'Strong' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                          {skill.status}
                        </span>
                        <span className="text-gray-300 font-bold text-[10px] uppercase">Last tested: 3/21/2026</span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-green-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                      </div>
                      <div className="text-gray-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 14: // NEW Skill-Based Video Suggestions (Screenshot 180559)
        return (
          <div className="w-full h-full bg-[#111827] flex flex-col p-6 overflow-hidden text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 shrink-0 relative gap-4">
              <button className="flex items-center gap-2 text-[#3b82f6] hover:text-blue-400 transition-colors text-xs md:text-sm font-bold self-start md:self-auto">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                Back to Dashboard
              </button>
              <h2 className="md:absolute md:left-1/2 md:-translate-x-1/2 text-xl md:text-2xl font-bold tracking-tight text-center">Skill Video Suggestions</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-6 flex flex-col gap-8">
              {/* Category 1: Technical Interview Skills */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                    <svg width="18" height="18" className="md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="white"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-black text-red-500 uppercase tracking-wide">Recommended Videos</h3>
                    <p className="text-gray-400 text-[8px] md:text-[10px] font-bold mt-0.5">April 8, 2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    { title: "How To Pass Technical Interviews When You Suck At LeetCode", thumb: "https://img.youtube.com/vi/ajI9R-6saEk/maxresdefault.jpg", category: "Technical Interview Skills (Technical) Video" },
                    { title: "Top 6 Coding Interview Concepts (Data Structures & Algorithms)", thumb: "https://img.youtube.com/vi/Q4C3ZRJLnac/maxresdefault.jpg", category: "Technical Interview Skills (Technical) Video" }
                  ].map((video, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-gray-800 shadow-2xl transition-transform hover:scale-[1.02]">
                        <img src={video.thumb} alt="thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-black">12:45</div>
                      </div>
                      <h4 className="text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{video.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5">{video.category}</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase">Added: 4/10/2026, 6:03:42 PM</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: MongoDB */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black tracking-tight">MongoDB</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "MongoDB in 5 Minutes with Eliot Horowitz", thumb: "https://img.youtube.com/vi/-bt_y4Loofg/maxresdefault.jpg", category: "MongoDB Video" },
                    { title: "MongoDB Explained in 10 Minutes | SQL vs NoSQL | Jumpstart", thumb: "https://img.youtube.com/vi/nN2JlbVWy2k/hqdefault.jpg", category: "MongoDB Video" },
                    { title: "MongoDB Interview Questions Answers | MongoDB Interview Questions | ARC...", thumb: "https://img.youtube.com/vi/ofme2o29ngU/maxresdefault.jpg", category: "MongoDB Video" }
                  ].map((video, i) => (
                    <div key={i} className="group cursor-pointer">
                      <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 border border-gray-800 shadow-2xl transition-transform hover:scale-[1.02]">
                        <img src={video.thumb} alt="thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded font-black">10:00</div>
                      </div>
                      <h4 className="text-[12px] font-bold leading-snug line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{video.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5">{video.category}</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase">Added: 4/10/2026, 6:03:42 PM</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Render simple placeholder for remaining slides (expanding pattern)
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 font-bold p-10">
            <div className="text-4xl opacity-20 mb-4">Step {index + 1}</div>
            <p className="text-center italic opacity-30">Replicating remaining screenshots as interactive CSS components...</p>
          </div>
        );
    }
  };

  return (
    <section
      id="demo-video"
      className="relative w-full pt-[40px] md:pt-[70px] pb-[60px] md:pb-[100px] overflow-hidden"
      style={{ backgroundColor: '#1E0A40' }}
    >
      <div className="max-w-[1440px] mx-auto px-[20px] md:px-[73px] flex flex-col items-center">

        {/* Headline Section */}
        <div className="text-center mb-[30px] md:mb-[40px]">
          <h2
            className="text-[22px] md:text-[50px] font-bold mb-[10px]"
            style={{
              fontFamily: 'Manrope',
              letterSpacing: '0.01em',
              lineHeight: '1.2',
              color: 'white'
            }}
          >
            <span style={{
              background: 'linear-gradient(346.62deg, #6F24E8 -2.91%, #D3D3D3 86.46%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              See How
            </span>
            <span style={{ color: '#FF7046' }}> MockMingle </span>
            <span style={{
              background: 'linear-gradient(346.62deg, #6F24E8 -2.91%, #D3D3D3 86.46%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Works
            </span>
          </h2>
          <p className="text-[14px] md:text-[20px] text-white/80 max-w-[700px] mx-auto leading-relaxed" style={{ fontFamily: 'Manrope' }}>
            Watch how students prepare with AI interviews and land their dream jobs.
          </p>
        </div>

        {/* Video Player Container */}
        <div
          className={`relative w-full max-w-[1235px] min-h-[480px] md:min-h-0 aspect-[9/12] md:aspect-[1235/566] rounded-[24px] overflow-hidden flex items-center justify-center transition-all duration-500 ${isEnlarged ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          style={{
            backgroundColor: '#000',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 40px 100px rgba(0,0,0,0.6)'
          }}
        >
          {/* ─── CASE 1: SPLASH SCREEN (Not yet playing) ─── */}
          {!isPlaying && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 cursor-pointer group"
              style={{ background: '#D0D0FF' }}
              onClick={() => setIsPlaying(true)}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center relative shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #B553E6 0%, #DB4BB0 100%)',
                }}
              >
                <div style={{ width: '0', height: '0', borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderLeft: '25px solid white', marginLeft: '8px' }} />
              </motion.div>
              <span className="text-[#1E0A40] font-black text-lg md:text-xl transition-opacity group-hover:opacity-80">Click To Play Demo</span>
            </div>
          )}

          {/* ─── CASE 2: ACTIVE SLIDER (Playing) ─── */}
          {isPlaying && (
            <>
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 w-full h-full"
                >
                  {renderSlideContent(currentStep)}
                </motion.div>
              </AnimatePresence>

              {/* Enlarge Icon (Bottom Left) */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsEnlarged(true); }}
                className="absolute bottom-6 left-6 z-40 bg-black/30 hover:bg-black/50 p-3 rounded-full border border-white/20 transition-all backdrop-blur-md text-white shadow-lg group"
                title="Enlarge Video"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* ─── CASE 3: ENLARGED FULLSCREEN MODAL ─── */}
        <AnimatePresence>
          {isEnlarged && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-10 pointer-events-auto"
              style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsEnlarged(false)}
                className="absolute top-4 right-4 md:top-10 md:right-10 text-white p-2 hover:bg-white/10 rounded-full transition-colors z-[10000]"
              >
                <svg width="24" height="24" className="md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>

              {/* Pop-out content */}
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="relative w-full max-w-[1400px] min-h-[500px] md:min-h-0 aspect-[9/14] md:aspect-[1235/566] bg-black rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
              >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={`enlarge-${currentStep}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                  >
                    {renderSlideContent(currentStep)}
                  </motion.div>
                </AnimatePresence>

                {/* Info Text in enlarged mode */}
                <div className="absolute bottom-8 right-12 z-40 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
                  <p className="text-white font-bold text-sm tracking-widest uppercase">MockMingle Demo View</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default DemoVideo;
