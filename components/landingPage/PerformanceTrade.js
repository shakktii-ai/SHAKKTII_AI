import React from 'react';
import { motion } from 'framer-motion';

const PerformanceTrade = () => {
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section
      id="performance-trade"
      className="relative w-full py-[40px] md:py-[5px] overflow-hidden"
    >
      <motion.div 
        className="max-w-[1440px] mx-auto px-[20px] md:px-[73px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="flex flex-col items-center text-center mb-[25px] md:mb-[45px]">
          <h3 className="font-manrope font-normal text-md md:text-xl leading-[44px] tracking-[0.01em] text-black mb-[10px]"
           
          >
            Answer this question in your head
          </h3>
          <h2 className='text-2xl md:text-4xl text-[#6F24E8] font-bold md:mb-[10px] text-center px-4 leading-[1.2] italic'>
            “Tell me about yourself”
          </h2>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] lg:gap-[60px] items-start">

          {/* Left Column: Your Score */}
          <motion.div variants={fadeInUp} className="flex flex-col items-start h-full">
            <div className="h-[60px] flex flex-col justify-start">
              <h4
                style={{
                  fontFamily: 'Manrope',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: 'min(32px, 5vw)',
                  lineHeight: '44px',
                  letterSpacing: '0.01em',
                  color: '#000000'
                }}
              >
                Now imagine being scored on it.
              </h4>
            </div>

            {/* Score Card */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="w-full max-w-[550px] bg-transperent border-[1px] border-white rounded-[17px] p-[30px] md:p-[40px] md:mt-[30px]"
              style={{
                boxSizing: 'border-box',
                boxShadow: '0px 0px 16.7px 2px rgba(0, 0, 0, 0.17)',
              }}
            >
              <div className="flex items-center gap-[20px] mb-[30px]">
                {/* Score Circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                  viewport={{once:true}}
                  className="relative rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: '67px',
                    height: '68px',
                    backgroundColor: '#FF7046'
                  }}
                >
                  <span className="font-bold text-[20px] text-[#1E0A40]">42%</span>
                </motion.div>

                <div className="flex flex-col">
                  <span className="text-[20px] font-medium text-[#1E0A40]">Your Score</span>
                  <div className="flex gap-[4px] mt-[4px]">
                    {[1, 2, 3, 4, 5].map((star, i) => (
                      <motion.span 
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.7 + (i * 0.1) }}
                        viewport={{once:true}}
                        className={`${i < 2 ? 'text-[#FF7046]' : 'text-[#E0E0E0]'} text-[20px]`}
                      >
                        ★
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Points */}
              <div className="flex flex-col gap-[20px]">
                {["Weak structure", "Unclear delivery", "Rambling narrative"].map((text, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + (i * 0.2) }}
                    viewport={{once:true}}
                    className="flex items-center gap-[15px]"
                  >
                    <span className="text-[#FF7046]">⚠️</span>
                    <span style={{ fontFamily: 'Manrope', fontSize: '20px', color: '#1E0A40' }}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Performance Trade */}
          <motion.div variants={fadeInUp} className="flex flex-col items-start h-full">
            <div className="h-[60px] flex flex-col justify-start">
              <div className="flex items-center gap-[12px] mb-[0px]">
                <motion.div 
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  viewport={{once:true}}
                  className="w-[32px] h-[32px] flex items-center justify-center border-[1.5px] border-black rounded-[8px]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </motion.div>
                <h4
                  style={{
                    fontFamily: 'Manrope',
                    fontWeight: '400',
                    fontSize: 'min(32px, 5vw)',
                    lineHeight: '44px',
                    letterSpacing: '0.01em',
                    color: '#000000'
                  }}
                >
                  Performance Trade
                </h4>
              </div>

              <p
                style={{
                  fontFamily: 'Manrope',
                  fontWeight: '400',
                  fontSize: '18px',
                  lineHeight: '27px',
                  letterSpacing: '0.01em',
                  color: '#666666',
                  paddingLeft: '44px'
                }}
              >
                Score declining over time
              </p>
            </div>

            {/* Graph Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-[550px] bg-transparent rounded-[17px] overflow-hidden mt-[30px]"
              style={{
                boxSizing: 'border-box',
                boxShadow: '0px 0px 16.7px 2px rgba(0, 0, 0, 0.17)',
                aspectRatio: '587/303'
              }}
            >
              <img
                src="/graph.png"
                alt="Performance Graph"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>

        </div>

        {/* Footer Text */}
        <motion.div variants={fadeInUp} className="mt-[40px] max-w-[650px]">
          <p className="text-[14px] md:text-[20px] font-medium leading-[28px]" style={{ fontFamily: 'Manrope', color: '#6F24E8' }}>
            MockMingle <span className="text-[#333]">shows you how you</span> <span className="text-[#FF7046]">actually perform</span>
          </p>
          <p className="text-[14px] md:text-[20px] font-medium leading-[28px]" style={{ fontFamily: 'Manrope', color: '#333' }}>
            -not how you think you perform
          </p>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default PerformanceTrade;