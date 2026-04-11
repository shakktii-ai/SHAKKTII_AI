import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Added to handle Next.js SSR safely and trigger mobile view
  useEffect(() => {
    const checkRes = () => setIsMobile(window.innerWidth < 1024);
    checkRes();
    window.addEventListener('resize', checkRes);
    return () => window.removeEventListener('resize', checkRes);
  }, []);

  const testimonials = [
    {
      name: "PRIYA SHARMA",
      role: "Software Engineer at Google",
      image: "/priya_sharma.jpeg",
      quote: "\u201cMockMingle helped me identify my weak areas and improve drastically. Landed my dream job at Google within 2 months!\u201d"
    },
    {
      name: "RAHUL VARMA",
      role: "Product Manager at Microsoft",
      image: "/rahul_varma.jpeg",
      quote: "\u201cThe AI feedback is incredibly detailed. It\u2019s like having a personal interview coach available 24/7. Landed my dream job within a month!\u201d"
    },
    {
      name: "ANANYA GUPTA",
      role: "Software Engineer at Microsoft",
      image: "/ananya_gupta.jpeg",
      quote: "\u201cThe mock interviews and peer learning from colleagues made all the difference in my preparation process!\u201d"
    }
  ];

  const handleNext = () => {
    if (rightIndex !== null) {
      setDirection(1);
      setActiveIndex(rightIndex);
    }
  };

  const handlePrev = () => {
    if (leftIndex !== null) {
      setDirection(-1);
      setActiveIndex(leftIndex);
    }
  };

  const getNeighbors = (index) => {
    if (index === 1) return { left: 0, right: 2 }; 
    if (index === 2) return { left: 1, right: 0 }; 
    if (index === 0) return { left: 2, right: 1 }; 
    return { left: null, right: null };
  };

  const { left: leftIndex, right: rightIndex } = getNeighbors(activeIndex);

  const isBackDisabled = activeIndex === 1;
  const isForwardDisabled = activeIndex === 0;

  const cardVariants = {
    enter: (dir) => ({ opacity: 0, y: dir > 0 ? 18 : -18 }),
    center: { opacity: 1, y: 0 },
    exit: (dir) => ({ opacity: 0, y: dir > 0 ? -18 : 18 }),
  };

  const cardTransition = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };
  const avatarSpring = { type: 'spring', stiffness: 280, damping: 28 };

  return (
    <section
      id="testimonials"
      className="relative w-full min-h-[500px] flex flex-col items-center overflow-hidden"
      style={{ background: '#E9E4FA' }}
    >
      {/* SECTION HEADING */}
      <div className="relative z-10 w-full flex flex-col items-center pt-4 md:pt-12 pb-4 lg:pb-16 px-4 text-center" style={{ background: '#F0F0FB' }}>
        <div className="max-w-5xl">
          <h2
            className="font-extrabold pb-2 text-[16px] lg:text-[50px] leading-tight lg:leading-[1.2]"
            style={{ fontFamily: "'Manrope', sans-serif", letterSpacing: '0.01em' }}
          >
            <span style={{ background: 'linear-gradient(180deg, #666666 0%, #6F24E8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Hear From Job Seekers Who
            </span>
            <span style={{ color: '#FF7046' }}> Got Hired</span>
            <br />
            <span style={{ color: '#FF7046' }}>Faster</span>
          </h2>
        </div>
      </div>

      {/* MOBILE VIEW (Shows only on small screens) */}
      {isMobile ? (
        <div className="relative z-20 flex flex-col items-center px-6 pb-20 w-full max-w-md">
           <div className="bg-white rounded-3xl p-8 shadow-xl text-center mt-10 border-t-4 border-[#7024EB]">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[#EEEEFA]">
                <img src={testimonials[activeIndex].image} className="w-full h-full object-cover" alt="avatar" />
              </div>
              <h3 className="font-bold text-xl text-[#1E0A40]">{testimonials[activeIndex].name}</h3>
              <p className="text-[#7024EB] font-medium mb-4">{testimonials[activeIndex].role}</p>
              <p className="text-[#6F24E7] font-semibold italic">{testimonials[activeIndex].quote}</p>
              
              <div className="flex justify-between items-center mt-8">
                <button 
                  onClick={handlePrev} 
                  disabled={isBackDisabled} 
                  className={`p-3 rounded-full bg-[#FF7046] text-white shadow-md ${isBackDisabled ? 'opacity-30' : ''}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div className="flex gap-2">
                   {testimonials.map((_, i) => (
                     <div key={i} className={`h-2 rounded-full ${i === activeIndex ? 'w-6 bg-[#7024EB]' : 'w-2 bg-[#7024EB]/30'}`} />
                   ))}
                </div>
                <button 
                  onClick={handleNext} 
                  disabled={isForwardDisabled} 
                  className={`p-3 rounded-full bg-[#FF7046] text-white shadow-md ${isForwardDisabled ? 'opacity-30' : ''}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
           </div>
        </div>
      ) : (
        /* ORIGINAL DESKTOP VIEW (Kept exactly as provided) */
        <div className="relative w-full max-w-[1445px] aspect-[1445/673] mx-auto flex items-center justify-center scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 origin-center transition-transform duration-500 overflow-visible">
          {/* STRAIGHT HORIZONTAL DIVIDER */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[1px] bg-black opacity-40 z-10" />

          {/* SVG BACKGROUND LAYER */}
          <svg
            viewBox="0 0 1445 673"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <path d="M0 0C183.466 82.2998 432.628 134.735 710.93 136.091L726.96 137.006L743.682 136.013C1017.84 133.392 1262.9 81.2975 1445 0V673H0V0Z" fill="#E9E4FA" />
            <path d="M0 0C183.466 82.2998 432.628 134.735 710.93 136.091L726.96 137.006L743.682 136.013C1017.84 133.392 1262.9 81.2975 1445 0H0V0Z" fill="#F0F0FB" />
            <path d="M0 0C183.466 82.2998 432.628 134.735 710.93 136.091L726.96 137.006L743.682 136.013C1017.84 133.392 1262.9 81.2975 1445 0" stroke="#B2B2B2" strokeWidth="2" />
          </svg>

          {/* LEFT AVATAR */}
          <div key="left-avatar" className="absolute" style={{ left: 'calc(50% - 247.5px)', top: '43px', transform: 'translateX(-50%)', zIndex: 5 }}>
            <AnimatePresence mode="popLayout">
              {leftIndex !== null && (
                <motion.div
                  key={testimonials[leftIndex].name}
                  layoutId={`avatar-${testimonials[leftIndex].name}`}
                  onClick={handlePrev}
                  className="cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={avatarSpring}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-[190px] h-[190px] rounded-full overflow-hidden border-[3px] border-[#EEEEFA] bg-white shadow-sm">
                    <img src={testimonials[leftIndex].image} className="w-full h-full object-cover transition-all duration-300" style={{ objectPosition: 'top center' }} alt="previous" />
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6))' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT AVATAR */}
          <div key="right-avatar" className="absolute" style={{ left: 'calc(50% + 251.5px)', top: '43px', transform: 'translateX(-50%)', zIndex: 5 }}>
            <AnimatePresence mode="popLayout">
              {rightIndex !== null && (
                <motion.div
                  key={testimonials[rightIndex].name}
                  layoutId={`avatar-${testimonials[rightIndex].name}`}
                  onClick={handleNext}
                  className="cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={avatarSpring}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative w-[190px] h-[190px] rounded-full overflow-hidden border-[3px] border-[#EEEEFA] bg-white shadow-sm">
                    <img src={testimonials[rightIndex].image} className="w-full h-full object-cover transition-all duration-300" style={{ objectPosition: 'top center' }} alt="next" />
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6))' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACTIVE CENTER AVATAR */}
          <div key="center-avatar" className="absolute" style={{ left: '50%', top: '21px', transform: 'translateX(-50%)', zIndex: 50 }}>
            <motion.div
              key={testimonials[activeIndex].name}
              layoutId={`avatar-${testimonials[activeIndex].name}`}
              className="relative rounded-full border-[3px] border-[#7024EB] p-0.5 shadow-xl bg-white"
              transition={avatarSpring}
            >
              <div className="relative w-[240px] h-[240px] rounded-full overflow-hidden">
                <img src={testimonials[activeIndex].image} className="w-full h-full object-cover" style={{ objectPosition: 'top center' }} alt="active" />
              </div>
            </motion.div>
          </div>

          {/* LEFT NEIGHBOR TEXT */}
          <div className="absolute pointer-events-none text-center" style={{ left: 'calc(50% - 1079.5px)', top: '310px', width: '626px', opacity: 0.5, zIndex: 5 }}>
            <AnimatePresence mode="wait">
              {leftIndex !== null && (
                <motion.div
                  key={`ltext-${leftIndex}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <p className="font-bold text-[30px] leading-[41px] text-[#1E0A40] tracking-[0.01em]" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[leftIndex].name}</p>
                  <p className="font-medium text-[20px] leading-[27px] text-[#7024EB] tracking-[0.01em] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[leftIndex].role}</p>
                  <p className="font-semibold text-[20px] leading-[27px] text-[#6F24E7] tracking-[0.04em] mt-6" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[leftIndex].quote}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT NEIGHBOR TEXT */}
          <div className="absolute pointer-events-none text-center" style={{ left: 'calc(50% + 453.5px)', top: '310px', width: '626px', opacity: 0.5, zIndex: 5 }}>
            <AnimatePresence mode="wait">
              {rightIndex !== null && (
                <motion.div
                  key={`rtext-${rightIndex}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <p className="font-bold text-[32px] leading-[44px] text-[#1E0A40] tracking-[0.01em]" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[rightIndex].name}</p>
                  <p className="font-medium text-[20px] leading-[27px] text-[#7024EB] tracking-[0.01em] mt-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[rightIndex].role}</p>
                  <p className="font-semibold text-[20px] leading-[27px] text-[#6F24E7] tracking-[0.04em] mt-6" style={{ fontFamily: "'Manrope', sans-serif" }}>{testimonials[rightIndex].quote}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TESTIMONIAL GLASS CARD */}
          <div
            className="absolute flex flex-col items-center justify-center text-center p-8"
            style={{ left: '50%', top: '274px', width: '803px', height: '251px', transform: 'translateX(-50%)', zIndex: 20, background: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 4px rgba(0, 0, 0, 0.25)' }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={cardTransition}
                className="flex flex-col items-center w-full"
              >
                <h3 className="font-extrabold text-[32px] leading-[44px] text-[#1E0A40] mb-1 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {testimonials[activeIndex].name}
                </h3>
                <p className="text-[20px] text-[#7024EB] font-medium tracking-wide mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {testimonials[activeIndex].role}
                </p>
                <p className="text-[20px] leading-[27px] text-[#6F24E7] max-w-2xl font-semibold px-4 tracking-[0.04em]" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  {testimonials[activeIndex].quote}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Indicators */}
            <div className="flex items-center gap-2 mt-4">
              {testimonials.map((_, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => { setDirection(idx > activeIndex ? 1 : -1); setActiveIndex(idx); }}
                  className="cursor-pointer rounded-full bg-[#7024EB]"
                  animate={{ width: idx === activeIndex ? 35 : 8, height: 8, opacity: idx === activeIndex ? 1 : 0.3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              ))}
            </div>
          </div>

          {/* NAVIGATION CONTROLS */}
          <motion.button
            onClick={handlePrev}
            disabled={isBackDisabled}
            style={{ left: 'calc(50% - 423.5px)', top: '381px', width: '44px', height: '43px', background: '#FF7046', position: 'absolute', zIndex: 40 }}
            className="flex items-center justify-center rounded-full text-white shadow-md transform -translate-x-1/2"
            animate={{ opacity: isBackDisabled ? 0.4 : 1 }}
            whileHover={!isBackDisabled ? { scale: 1.12 } : {}}
            whileTap={!isBackDisabled ? { scale: 0.92 } : {}}
            transition={{ duration: 0.2 }}
            aria-label="Previous testimonial"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12L12 5M5 12L12 19" />
            </svg>
          </motion.button>

          <motion.button
            onClick={handleNext}
            disabled={isForwardDisabled}
            style={{ left: 'calc(50% + 379.5px)', top: '381px', width: '44px', height: '43px', background: '#FF7046', position: 'absolute', zIndex: 40 }}
            className="flex items-center justify-center rounded-full text-white shadow-md transform -translate-x-1/2"
            animate={{ opacity: isForwardDisabled ? 0.4 : 1 }}
            whileHover={!isForwardDisabled ? { scale: 1.12 } : {}}
            whileTap={!isForwardDisabled ? { scale: 0.92 } : {}}
            transition={{ duration: 0.2 }}
            aria-label="Next testimonial"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" />
            </svg>
          </motion.button>
        </div>
      )}

      {/* Bottom border line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black z-50" />
    </section>
  );
};

export default Testimonials;