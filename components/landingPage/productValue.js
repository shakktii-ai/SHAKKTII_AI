import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'next/link'; // or 'react-router-dom'
import { UserCheck, BarChart3, MessageSquare, LineChart } from 'lucide-react';

const ProductValue = () => {
  const features = [
    {
      title: "Real Interview Simulation",
      description: "Feels like real evaluators—not bots",
      icon: <UserCheck size={24} />,
    },
    {
      title: "Performance Scoring",
      description: "Get scored on structure, clarity & delivery",
      icon: <BarChart3 size={24} />,
    },
    {
      title: "Actionable Feedback",
      description: "Fix weak points instantly",
      icon: <MessageSquare size={24} />,
    },
    {
      title: "Progress Visibility",
      description: "Track improvement across attempts",
      icon: <LineChart size={24} />,
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="bg-[#1E0A40] py-20 px-6 font-manrope text-center">
      <div className="max-w-6xl mx-auto">
        
        {/* Heading Section */}
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-[#D3D3D3] to-[#744DB4] bg-clip-text text-transparent mb-4"
        >
          Product <span className='text-[#FF7046]'>Value</span>
        </motion.h2>
        
        <p className="text-[#ffffff] mb-16 max-w-4xl mx-auto text-md md:text-2xl leading-relaxed">
          Watch how students prepare with AI interviews and land their dream jobs.
        </p>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.05 }} 
              className="bg-[#B3B3EA] p-4 rounded-3xl text-left flex flex-col h-full min-h-[250px] shadow-[0px_0px_8.6px_0px_#00000040,inset_0px_0px_2.3px_2px_#00000059]"
            >
              <div className="bg-[#FF7046] text-white p-4 rounded-md w-fit mb-6  shadow-[inset_0_0_2.3px_2px_#FFFFFF61]">
                {feature.icon}
              </div>
              <h3 className="text-[#1A0B3B] font-semibold text-2xl mb-3 leading-tight">
                {feature.title}
              </h3>
              <p className="text-[#ffffff] text-md font-medium leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Call to Action Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{once:true}}
          className="space-y-2"
        >
          <h3 className="text-xl md:text-4xl font-bold bg-gradient-to-b from-[#D3D3D3] to-[#6F24E8] bg-clip-text text-transparent">
            It's not about preparing more
          </h3>
          <h3  className="text-2xl md:text-4xl font-semibold text-[#FF7046]">
            It's about knowing how you perform
          </h3>
        </motion.div>

      </div>
    </section>
  );
};

export default ProductValue;