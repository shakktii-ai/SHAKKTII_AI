import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Mail, Hourglass, Repeat } from 'lucide-react';

const RealCostOfFailing = () => {
    const steps = [
        {
            title: "Interview Day",
            description: "You give it your best shot",
            icon: <CalendarDays className="w-6 h-6 text-[#000000]" />,
            emoji: "",
            position: "left",
        },
        {
            title: "Rejection Email",
            description: "No Explanation, No Feedback",
            icon: <Mail className="w-6 h-6 text-[#000000]" />,
            emoji: "",
            position: "right",
        },
        {
            title: "Wait 4-8 Weeks",
            description: "Job search continues, time lost",
            icon: <Hourglass className="w-6 h-6 text-[#000000]" />,
            emoji: "",
            position: "left",
        },
        {
            title: "Repeat Mistakes",
            description: "Same errors in 3-5 Interviews",
            icon: <Repeat className="w-6 h-6 text-[#F000000]" />,
            emoji: "",
            position: "right",
        },
    ];

    // Animation Variants
    const textVariant = {
        hidden: { opacity: 0, y: 20 },
        visible: (customDelay = 0) => ({
            opacity: 1,
            y: 0,
            transition: { delay: customDelay, duration: 0.6 }
        }),
    };

    const lineVariant = {
        hidden: { scaleY: 0 },
        visible: {
            scaleY: 1,
            transition: { duration: 1, ease: "easeInOut", delay: 0.4 },
        },
    };

    const nodeVariant = {
        hidden: { scale: 0, opacity: 0 },
        visible: (i) => ({
            scale: 1,
            opacity: 1,
            transition: { delay: 1.2 + i * 0.3, duration: 0.5, type: "spring", stiffness: 100 },
        }),
    };

    const boxVariant = {
        hidden: (pos) => ({
            opacity: 0,
            x: pos === "left" ? -50 : 50,
        }),
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: 1.4 + i * 0.3, duration: 0.6 },
        }),
    };

    return (
        <section className="bg-white py-12 px-6 font-manrope text-center">
            <div className="max-w-4xl mx-auto">

                {/* Title Section */}
                <motion.h2
                    custom={0}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={textVariant}
                    className="text-xl md:text-5xl font-semibold bg-gradient-to-b from-[#666666] to-[#6F24E8] bg-clip-text text-transparent mb-4"
                >
                    The Real Cost of <span className="text-[#FF7046]">Failing</span>
                </motion.h2>

                <motion.p
                    custom={0.2}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={textVariant}
                    className="text-sm md:text-xl text-black font-medium mb-4 md:mb-16"
                >
                    One interview failure creates a domino effect
                </motion.p>

               
{/* Timeline Container */}
<div className="relative flex justify-center mt-14 md:mt-20 min-h-[400px]">

  {/* Center Line */}
  <motion.div
    className="absolute top-0 bottom-0 left-6 md:left-1/2 w-0.5 bg-[#FF7046] origin-top rounded-full"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={lineVariant}
    style={{ translateX: "-50%" }}
  />

  <div className="relative w-full flex flex-col items-center">
    {steps.map((step, index) => (
      <div
        key={index}
        className={`relative w-full flex items-center mb-12 md:mb-16 last:mb-0
          ${
            step.position === 'left'
              ? 'justify-start md:justify-end pl-16 md:pl-0 md:pr-[calc(50%+4rem)]'
              : 'justify-start pl-16 md:pl-[calc(50%+4rem)]'
          }`}
      >
        {/* Node */}
        <motion.div
          className="absolute left-6 md:left-1/2 bg-white rounded-full p-2 border-4 border-[#FF7046] z-10 shadow-[0_0_0_6px_rgba(255,112,70,0.12),0_0_20px_rgba(255,112,70,0.25),0_4px_10px_rgba(255,112,70,0.3)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          custom={index}
          variants={nodeVariant}
style={{ translateX: "-50%" }}
        >
          {step.icon}
        </motion.div>

        {/* Content Block */}
        <motion.div
          className="bg-[linear-gradient(90deg,rgba(111,36,232,0.61)_0%,rgba(62,20,130,0.61)_98.56%)] p-5 md:p-4 rounded-xl w-full max-w-[340px] shadow-[0_8px_30px_rgba(147,112,219,0.2)] text-left flex flex-col relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          custom={step.position}
          variants={boxVariant}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#9370DB] z-[-1]
              ${step.position === 'left' ? 'left-[-8px] md:left-auto md:-right-2' : 'left-[-8px]'}
            `}
          />

          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl leading-tight">
              {step.title}
            </h3>
          </div>

          <p className="text-[#1E0A40] text-sm sm:text-base font-medium leading-relaxed">
            {step.description}
          </p>
        </motion.div>
      </div>
    ))}
  </div>
</div>

            </div>
        </section>
    );
};

export default RealCostOfFailing;