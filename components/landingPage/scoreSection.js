import React from 'react';
import { motion } from 'framer-motion';
import { Play, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
const ScoreSection = () => {
  const scoreValue = 38; // Target percentage

  return (
    <section className="bg-[#ffffff] py-8 px-4 flex flex-col items-center select-none m-2 md:m-14 rounded-[32px]  border-t-4 border-[#6F24E8]">
      <div className="max-w-4xl w-full text-center">
        {/* Animated Heading */}
        <motion.h2 
       
        initial={{ opacity: 0,x:-20 }}
            whileInView={{ opacity: 1 }}
         
          transition={{delay:0.2}}
          className="font-manrope font-bold text-lg md:text-4xl text-[#4A3A89] mb-4 bg-gradient-to-b from-[#666666] to-[#6F24E8] bg-clip-text text-transparent"
        >
          Most candidates score <span style={{ WebkitTextFillColor: '#FF7046', color: '#FF7046' }} >under 50%</span> in their first mock interview
        </motion.h2>

        <p className="text-[#000000] mb-8 text-[11px] md:text-12px">
          You might feel prepared ... <br />
          but real performance tells a different story
        </p>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-[32px] p-6 shadow-lg border border-gray-200 max-w-2xl mx-auto text-left relative mb-4"
        >
          <p className="text-[#000000] mb-2">Your Score :</p>

          {/* Animated Score Number */}
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#FF7046] text-5xl font-bold mb-8"
          >
            {scoreValue}%
          </motion.h3>

          {/* Progress Bar Container */}
          <div className="relative w-full h-3 bg-[#EDE2F0] rounded-full mb-12">

            {/* THE ANIMATED PROGRESS FILL */}
            <motion.div
              initial={{ width: 0 }} // Starts at 0
              whileInView={{ width: `${scoreValue}%` }} // Moves to 38%
              viewport={{ once: true }} // Only animate the first time it's seen
              transition={{ duration: 1.5, ease: "easeOut" }} // Smooth 1.5s movement
              className="absolute top-0 left-0 h-full rounded-full z-10"
              style={{ background: 'linear-gradient(90.01deg, #FF7046 0.01%, #B3B3EA 172.54%);' }}
            />

            {/* Average Marker (50%) */}
            <div className="absolute left-[50%] -top-1 w-[0.5px] h-5 bg-[#000000] z-0">
              <span className="absolute top-7 left-1/2 -translate-x-1/2 text-[16px] text-[#FF7046] font-medium whitespace-nowrap">
                Average : 50%
              </span>
            </div>

            {/* Labels */}
            <div className="absolute left-0 top-7 text-[16px] text-[#000000] font-bold uppercase tracking-wider">0%</div>
            <div className="absolute right-0 top-7 text-[16px] text-[#000000] font-bold uppercase tracking-wider">100%</div>
          </div>

          {/* Insights with Staggered Animation */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#FF0000] text-sm font-medium flex items-center gap-2"
            >
              <span className="text-xs">📉</span> Below industry standard
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#FF0000] text-sm font-medium flex items-center gap-2"
            >
              <span className="text-xs">📑</span> Need improvement in 3 key areas
            </motion.p>
          </div>
        </motion.div>
        <div className="flex flex-col items-center">
     <Link href="/language">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 bg-gradient-to-b from-[#3E216E] to-[#4F1AA4] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2  transition-all " 
        > 
          Start Free Mock Interview <span className="text-xl">→</span>
        </motion.button>
        </Link>
        </div>
      </div>
    </section>
  );
};

export default ScoreSection;