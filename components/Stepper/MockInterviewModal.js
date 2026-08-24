import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaLock } from 'react-icons/fa';
import { BiUserCheck } from 'react-icons/bi';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
export default function MockInterviewModal({ onClose }) {
    const [progress, setProgress] = useState(null);
const [loading, setLoading] = useState(true);
const router = useRouter();
  const interviewTypes = [
    "HR Interview",
    "Technical Interview",
    "Resume-Based Interview",
    "AI Adaptive Interview",
  ];

 const prerequisiteSteps = [
  {
    title: "Profile",
    completed: progress?.step1_profile,
  },
  {
    title: "Resume",
    completed: progress?.step2_resume,
  },
  {
    title: "Decision Assessment",
    completed: progress?.step3_decision,
  },
  // {
  //   title: "Soft Skills",
  //   completed: progress?.step4_softSkills?.isCompleted,
  // },
  {
    title: "Technical Skills",
    completed: progress?.step5_techSkills?.isCompleted,
  },
];

  const rewards = [
    "Confidence Score",
    "Communication Score",
    "Technical Score",
    "AI Feedback Report",
    "Improvement Suggestions",
  ];
  

const handleClick = () => {
  if (isUnlocked) {
    router.push("/BaseLine/role");
  }
};
useEffect(() => {
  const load = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
console.log("User from localStorage:", user);
console.log("user._id:", user?._id);
console.log("user.id:", user?.id);
console.log("user.userId:", user?.userId);
    const res = await fetch(
  `/api/baseline/stepProgress?userId=${user.id}`
);

      const data = await res.json();

      if (data.success) {
        setProgress(data.progress);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, []);
const isUnlocked =
  progress?.step1_profile &&
  progress?.step2_resume &&
  progress?.step3_decision &&
  // progress?.step4_softSkills?.isCompleted &&
  progress?.step5_techSkills?.isCompleted;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Outer Modal Container with Fixed Height Limit */}
      <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl font-sans">
        
        {/* ================= 1. FIXED TOP HEADER ================= */}
        <div className="shrink-0 relative bg-[#4E6077] p-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close modal"
          >
            <IoClose className="text-xl" />
          </button>

          <div className="flex items-start gap-4">
            {/* Interviewer Icon Container */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
              <img
                src="/step6img.svg" // Replace with your asset path
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
              <span className="text-xs font-normal tracking-wider text-slate-200 uppercase">
                Step 6 of 7
              </span>
              <h2 className="text-xl font-bold leading-tight mt-0.5">
                Practice Like a Real Interview
              </h2>

              {/* Status Badge */}
              <div className="mt-3 flex items-center text-xs font-medium">
                <span className="rounded-full bg-white px-3 py-1 text-gray-900">
                  {isUnlocked ? "Unlocked" : "Locked"}
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
            <div className="rounded-xl bg-[#F4F4F4] border border-black/16 p-4 text-sm text-gray-600 leading-relaxed">
              Practice reduces interview anxiety by 67%, Real-time AI feedback tells you exactly what to improve before you face a real interviewer.
            </div>
          </div>

          {/* Interview Types */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-3">
              📋 Interview Types
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {interviewTypes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-black/16 bg-[#F4F4F4] p-3 text-sm font-medium text-gray-700"
                >
                  <div className="h-5 w-5 rounded border border-gray-300 bg-gray-200/60 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete This First */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-3">
              🔒 Complete This First
            </h3>
            <div className="space-y-2">
              {prerequisiteSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#F4F4F4] p-3 text-sm font-medium text-gray-700"
                >
               {step.completed ? (
  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">
    ✓
  </div>
) : (
  <div className="h-4 w-4 rounded-full border-2 border-dashed border-gray-400" />
)}
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What You'll Receive */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase mb-3">
              🏆 What You'll Receive
            </h3>
            <div className="flex flex-wrap gap-2">
              {rewards.map((reward, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-[#4E6077] bg-[#336DED]/30 px-2 py-1.5 text-xs font-medium text-[#4E6077]"
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
  disabled={!isUnlocked}
  onClick={handleClick}
  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-base font-semibold transition

    ${
      isUnlocked
        ? "bg-[#4E6077]  text-white"
        : "bg-[#4E6077] text-white opacity-80 cursor-not-allowed"
    }`}
>
            {isUnlocked ? (
  <BiUserCheck className="text-white text-lg" />
) : (
  <FaLock className="text-yellow-400 text-sm" />
)} {isUnlocked
  ? "Start Mock Interview"
  : "Locked • Complete Previous Steps"}
          </button>
        </div>

      </div>
    </div>
  );
}