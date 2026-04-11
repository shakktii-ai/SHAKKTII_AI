import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { id: '01', title: 'AI Powered Mock Interviews', desc: 'Experience realistic interview scenarios with intelligent AI feedback.', img: '/Testimonial1.png' },
  { id: '02', title: 'Resume Analyzer', desc: 'Get instant insights on how to optimize your resume for ATS system.', img: '/Testimonial2.png' },
  { id: '03', title: 'Baseline Career Assessment', desc: 'Understand your current standing and create a personalized growth plan.', img: '/Testimonial3.png' },
  { id: '04', title: 'Skill Test and Plans', desc: 'Identify gaps and follow structured improvement roadmaps.', img: '/Testimonial4.png' },
  { id: '05', title: 'Real-Time Reports', desc: 'Track your progress with detailed performance analytics.', img: '/Testimonial5.png' },
  { id: '06', title: 'Community Hub', desc: 'Debates, group discussions, and networking with peers.', img: '/Testimonial6.png' },
];

const InfiniteFeatureScroll = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Safe way to check window size in Next.js
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const len = features.length;
  const showNext = () => setActiveIndex((prev) => (prev + 1) % len);
  const showPrev = () => setActiveIndex((prev) => (prev + len - 1) % len);

  const prevIndex = (activeIndex + len - 1) % len;
  const nextIndex = (activeIndex + 1) % len;
  const visibleIndices = [prevIndex, activeIndex, nextIndex];

  return (
    <section className="font-manrope py-8 md:py-20 md:min-h-screen flex flex-col items-center select-none font-sans px-2">
      <h2 className="text-xl md:text-4xl font-semibold mb-8 md:mb-12 text-center leading-tight bg-gradient-to-b from-[#666666] to-[#6F24E8] bg-clip-text text-transparent">
        Why Choose <span className='text-[#FF7A50]'>Mockmingle</span>
      </h2>

      <div className="bg-[#6F24E8]/[6%] max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 rounded-[20px] items-center overflow-hidden p-6 md:p-0">

        {/* LEFT SIDE: THE IMAGE STACK & MOBILE NAV */}
        <div className="relative h-[400px] md:h-[500px] flex flex-col items-center justify-center">
          
          <button onClick={showPrev} className="absolute top-0 md:hidden z-30 bg-white/80 p-2 rounded-full shadow-md mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7024EB" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
          </button>

          <div className="flex flex-col items-center gap-2 w-full">
            {visibleIndices.map((idx, pos) => {
              const isCenter = pos === 1;
              const isAbove = pos === 0;
              const isBelow = pos === 2;

              return (
                <motion.div
                  key={`img-${features[idx].id}`}
                  animate={{
                    opacity: isCenter ? 1 : 0.3,
                    scale: isCenter ? 1 : 0.8,
                    // Use isMobile state instead of direct window access
                    height: isCenter ? (isMobile ? "300px" : "400px") : "60px",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-full max-w-[280px] md:w-72 overflow-hidden relative transition-all duration-500 ${
                    isCenter
                      ? 'rounded-tl-[80px] rounded-br-[80px] rounded-tr-[20px] rounded-bl-[20px] border-none'
                      : isAbove
                        ? 'rounded-br-[40px] border-b-2 border-r-2 border-[#7024EB]'
                        : 'rounded-tl-[40px] border-t-2 border-l-2 border-[#7024EB]'
                  }`}
                >
                  <img src={features[idx].img} className="w-full h-full object-cover" alt="feature" />

                  <AnimatePresence>
                    {isCenter && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 md:hidden text-white"
                      >
                        <h3 className="font-bold text-xl">{features[idx].title}</h3>
                        <p className="text-xs opacity-90 mt-1">{features[idx].desc}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <button onClick={showNext} className="absolute bottom-0 md:hidden z-30 bg-white/80 p-2 rounded-full shadow-md mt-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7024EB" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>

        {/* RIGHT SIDE: THE ORIGINAL TEXT STACK (Desktop Only) */}
        <div className="hidden md:flex flex-col gap-4 md:-ml-12 z-10">
          {visibleIndices.map((idx, pos) => {
            const isCenter = pos === 1;
            const item = features[idx];

            return (
              <motion.div
                key={`text-${item.id}`}
                onClick={() => setActiveIndex(idx)}
                animate={{
                  backgroundColor: isCenter ? "#FFFFFF" : "transparent",
                  borderColor: isCenter ? "#7024EB" : "transparent",
                  x: isCenter ? -60 : 0,
                  scale: isCenter ? 1.02 : 0.95,
                }}
                transition={{ duration: 0.4 }}
                className={`p-2 rounded-[18px] border-2 cursor-pointer flex items-center gap-6 group relative overflow-hidden ${
                  isCenter ? 'shadow-sm' : 'shadow-none'
                }`}
              >
                <div className="w-14 h-14 rounded-full border-2 flex flex-shrink-0 items-center justify-center font-bold text-lg border-[#B2B2B2] text-[#1E0A40] bg-[#ECECEC]">
                  {item.id}
                </div>

                <div className="flex flex-col">
                  <h3 className={`font-bold transition-all ${isCenter ? 'text-xl font-semibold text-[#1E0A40]' : 'text-xl text-gray-400'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm mt-1 leading-relaxed max-w-[400px] transition-all ${isCenter ? 'text-gray-600' : 'text-[#B2B2B2]'}`}>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfiniteFeatureScroll;