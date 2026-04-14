

import React from 'react';
import { motion } from 'framer-motion';

const WhyFail = () => {
  const stats = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ),
      percentage: '2-5%',
      title: 'You Only Get One Real Chance',
      subtext: 'Get shortlisted'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      percentage: '70-80%',
      title: 'Misjudged Performance',
      subtext: 'Think they did well'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
          <polyline points="17 18 23 18 23 12"></polyline>
        </svg>
      ),
      percentage: '60%',
      title: 'Pressure Kills Performance',
      subtext: 'Underperformance due to anxiety'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      percentage: '75%',
      title: 'No Feedback Loop',
      subtext: 'Never receive feedback'
    }
  ];

  // Variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <section
      id="why-fail"
      className="p-2 md:p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(213.53% 213.53% at 50% 37.21%, #FFFFFF 0%, #B3B3EA 100%)'
      }}
    >
      <div className="max-w-[1440px] mx-auto px-[6px] md:px-[73px]">

        {/* Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-[12px] md:mb-[60px]"
        >
          <h2 className="text-[25px] md:text-[50px] font-bold tracking-[0.01em]" style={{ fontFamily: 'Manrope' }}>
            <span style={{
              background: 'linear-gradient(180deg, #666666 0%, #6F24E8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Why Candidates
            </span>
            <span style={{ color: '#FF7046' }}> Fail</span>
          </h2>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-stretch justify-center max-w-[1200px] mx-auto">

          {/* Left Column: Stat Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-[20px]"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="w-full max-w-[512px] h-auto md:h-[157px] rounded-[17px] p-[25px] flex items-center gap-[25px] border-[1px] border-[#6F24E8]"
                style={{
                  background: 'linear-gradient(90deg, rgba(111, 36, 232, 0.06) 0%, rgba(62, 20, 130, 0.06) 100%)',
                  boxSizing: 'border-box'
                }}
              >
                {/* Icon Box */}
                <div className="w-[60px] h-[60px] bg-[#FF7046] rounded-[12px] flex items-center justify-center shrink-0">
                  {stat.icon}
                </div>

                <div className="flex flex-col">
                  {/* Row 1: Percentage */}
                  <span className="text-[28px] md:text-[32px] font-bold text-[#FF7046] leading-tight">
                    {stat.percentage}
                  </span>
                  {/* Row 2: Title */}
                  <span className="text-[18px] md:text-[22px] font-bold text-[#1E0A40] leading-tight mt-[4px]">
                    {stat.title}
                  </span>
                  {/* Row 3: Subtext */}
                  <span className="text-[15px] md:text-[17px] text-[#666666] mt-[6px]">
                    {stat.subtext}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column: Chart Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[666px] bg-white border border-[#6F24E8] rounded-[17px] pt-[20px] px-[16px] sm:px-[24px] md:pt-[35px] md:px-[50px] pb-[40px] md:pb-[60px] flex flex-col"
            style={{ boxSizing: "border-box" }}
          >
            <h3
              className="text-[22px] sm:text-[26px] md:text-[32px] font-bold text-[#1E0A40] mb-[35px] md:mb-[55px]"
              style={{ fontFamily: "Manrope" }}
            >
              Interview Success Reality
            </h3>

            {/* Horizontal Bar Chart */}
            <div className="flex flex-col gap-[28px] md:gap-[65px] flex-grow relative pb-[50px] md:pb-[70px]">
              {/* Y-Axis Line - Desktop only */}
              <div className="hidden md:block absolute left-[180px] top-0 bottom-[106px] w-[1.5px] bg-black"></div>
              <GraphBar
                label="Got Shortlisted"
                width="8%"
                color="#B3B3EA"
                index={0}
                labelClassName="w-[90px] sm:w-[120px] md:w-[170px] text-[12px] sm:text-[14px] md:text-[16px]"
              />

              <GraphBar
                label="Thought They Did Well"
                width="74%"
                color="#6F24E8"
                index={1}
                labelClassName="w-[90px] sm:w-[120px] md:w-[170px] text-[12px] sm:text-[14px] md:text-[16px]"
              />

              <GraphBar
                label="Actually Got Offers"
                width="22%"
                color="#FF7046"
                index={2}
                labelClassName="w-[90px] sm:w-[120px] md:w-[170px] text-[12px] sm:text-[14px] md:text-[16px]"
              />

              <GraphBar
                label="Received Feedback"
                width="22%"
                color="#1E0A40"
                index={3}
                labelClassName="w-[90px] sm:w-[120px] md:w-[170px] text-[12px] sm:text-[14px] md:text-[16px]"
              />

              {/* X-Axis and Labels */}
              <div className="hidden md:block absolute left-[180px] right-0 bottom-[70px]">
                <div className="w-full border-t-[1.5px] border-black flex justify-between pt-[10px]">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <span
                      key={val}
                      className="text-[18px] font-bold text-black opacity-80"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1 }}
              viewport={{ once: true }}
              className="flex items-start gap-[10px] mt-[16px] md:mt-[20px] relative z-20"
            >
              <span className="text-[18px] md:text-[20px] shrink-0">⚠️</span>
              <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#1E0A40] leading-relaxed font-medium">
                The gap between perception and reality is costing you opportunities.
              </p>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

const GraphBar = ({ label, width, color, index }) => {
  return (
    <div className="z-10 w-full">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-2 md:hidden">
        <span className="text-[14px] text-[#1E0A40] font-medium leading-tight">
          {label}
        </span>

        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 h-[18px] bg-transparent overflow-hidden rounded-r-[6px]">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width }}
              viewport={{ once: true }}
              transition={{
                duration: 1,
                delay: 0.5 + index * 0.1,
                ease: "easeOut",
              }}
              className="h-full rounded-r-[6px]"
              style={{ backgroundColor: color }}
            />
          </div>

          <span className="text-[12px] font-semibold text-[#1E0A40] min-w-[34px]">
            {width}
          </span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-[1.5px] h-[25px]">
        <span className="w-[180px] text-[16px] md:text-[18px] text-[#1E0A40] font-medium pr-[15px] text-right leading-tight">
          {label}
        </span>

        <div className="flex-grow h-full rounded-r-[6px] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: 0.5 + index * 0.1,
              ease: "easeOut",
            }}
            className="h-full rounded-r-[6px]"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};
export default WhyFail;