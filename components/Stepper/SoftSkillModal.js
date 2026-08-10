import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/router';
export default function SoftSkillsModal({ onClose, onStart }) {
    const router = useRouter();
  const modules = [
    "Speaking Test",
    "Listening Test",
    "Reading Test",
    "Writting Test",
   
  ];

  const rewards = [
    "Communication Score",
    "Fluency Score",
    "Confidence Rating",
  ];
 const handleRedirect = () => {
    if (onClose) onClose();
    router.push('/BaseLine/skills');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Modal Card Container with Fixed Height Limit */}
      <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl font-sans">
        
        {/* ================= 1. FIXED TOP HEADER ================= */}
        <div className="shrink-0 relative bg-[#8142EE] p-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close modal"
          >
            <IoClose className="text-xl" />
          </button>

          <div className="flex items-start gap-4">
            {/* Header Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-white/20 text-3xl">
               <img
                src="/step4img.svg" // Replace with your asset path
                alt="Brain Icon"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback fallback icon
                  e.currentTarget.src =
                    'https://cdn-icons-png.flaticon.com/512/2491/2491921.png';
                }}
              />
            </div>

            <div>
              <span className="text-xs font-normal tracking-wider text-purple-200 uppercase">
                Step 4 of 7
              </span>
              <h3 className="text-md font-bold leading-tight">
                Improve Workplace Communication
              </h3>

              {/* Status Badges */}
              <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                {/* <span className="rounded-full bg-white px-3 py-1 text-gray-900">
                  • Pending
                </span> */}
                <span className="rounded-full bg-white/20 px-3 py-1 text-purple-100">
                  20-25 min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 2. SCROLLABLE MIDDLE SECTION ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Why This Matters */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-2">
              🎯 Why This Matters
            </h3>
            <div className="rounded-xl bg-gray-50 border border-black/16 p-4 text-sm text-[#4A4A4A] leading-relaxed">
              85% of job success comes from soft skills. Employers rank communication as their #1 priority when making hiring decisions.
            </div>
          </div>

          {/* Modules to Complete */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-3">
              📋 Modules to Complete
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {modules.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-black/16 bg-[#F4F4F4] p-3 text-sm font-medium text-gray-700"
                >
                  <div className="h-5 w-5 rounded border border-gray-300 bg-gray-200/60" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What You'll Receive */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-3">
              🏆 What You'll Receive
            </h3>
            <div className="flex flex-wrap gap-2">
              {rewards.map((reward, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-[#336DED] bg-[#336DED]/30 px-2 py-1.5 text-xs font-medium text-[#336DED]"
                >
                  {reward}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* ================= 3. FIXED BOTTOM FOOTER ================= */}
        <div className="shrink-0 border-t border-gray-100 bg-white p-6 pt-4 text-center">
          <button
            onClick={handleRedirect}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8142EE] py-3.5 px-6 text-base font-semibold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Start Soft Skills Test <FaArrowRight className="text-sm" />
          </button>
          <p className="mt-2 text-xs text-gray-500 font-medium">
            Estimated time: 20-25 min
          </p>
        </div>

      </div>
    </div>
  );
}