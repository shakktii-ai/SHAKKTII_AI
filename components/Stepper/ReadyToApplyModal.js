import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaLock, FaCheck } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import { useRouter } from "next/router";

export default function ReadyToApplyModal({ onClose, onUnlock }) {
  const [progress, setProgress] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const prerequisiteSteps = [
    {
      title: "Profile",
      completed: progress?.step1_profile,
    },
    {
      title: "Strength Assessment",
      completed: progress?.step2_resume,
    },
    {
      title: "Weakness Assessment",
      completed: progress?.step3_decision,
    },
    {
      title: "Soft Skills",
      completed: progress?.step4_softSkills?.isCompleted,
    },
    {
      title: "Technical Skills",
      completed: progress?.step5_techSkills?.isCompleted,
    },
  ];

  const features = [
    "AI Job Matching",
    "Resume Match %",
    "One-Click Apply",
    "Interview Readiness Score",
    "Recruiter Visibility",
  ];

  // =========================
  // FETCH USER PROGRESS
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        console.log("User from localStorage:", user);
        console.log("user._id:", user?._id);
        console.log("user.id:", user?.id);
        console.log("user.userId:", user?.userId);

        const userId = user?._id || user?.id || user?.userId;

        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const res = await fetch(
          `/api/baseline/stepProgress?userId=${userId}`
        );

        const data = await res.json();

        console.log("Step progress:", data);

        if (data.success) {
          setProgress(data.progress);
          setReadiness(data.readiness || null);
        }
      } catch (err) {
        console.error("Failed to load step progress:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =========================
  // CHECK IF ALL STEPS COMPLETE
  // =========================
  const isUnlocked =
    !!progress?.step1_profile &&
    !!progress?.step2_resume &&
    !!progress?.step3_decision &&
    !!progress?.step4_softSkills?.isCompleted &&
    !!progress?.step5_techSkills?.isCompleted;
  const readinessScore = readiness?.overallReadiness ?? 0;

  // =========================
  // BUTTON CLICK
  // =========================
 const handleClick = () => {
  if (!isUnlocked) return;

  // Close the modal first
  onClose?.();

  // Let the parent Dashboard handle scrolling
  requestAnimationFrame(() => {
    onUnlock?.();
  });
};

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
   <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl font-sans">
          
      {/* ================= 1. FIXED TOP HEADER ================= */}
      <div className="relative shrink-0 bg-[#4E6077] p-6 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="Close modal"
        >
          <IoClose className="text-xl" />
        </button>

        <div className="flex items-start gap-4">
          
          {/* Rocket Icon Container */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🚀
          </div>

          <div>
            <span className="text-xs font-normal uppercase tracking-wider text-slate-200">
              Step 7 of 7
            </span>

            <h2 className="mt-0.5 text-xl font-bold leading-tight">
              You're Almost Ready to Apply
            </h2>

            {/* Status Badge */}
            <div className="mt-3 flex items-center text-xs font-medium">
              <span className="rounded-full bg-white px-3 py-1 text-gray-900">
                {loading
                  ? "Checking..."
                  : isUnlocked
                  ? "Unlocked"
                  : "Locked"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. SCROLLABLE MIDDLE SECTION ================= */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Why This Matters */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
            🎯 Why This Matters
          </h3>

          <div className="rounded-xl border border-black/16 bg-[#F4F4F4] p-4 text-sm leading-relaxed text-gray-600">
            Complete all steps to earn your Interview Readiness Score, get AI
            job matching, and land directly on recruiter shortlists.
          </div>
        </div>

        {/* Complete This First */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            🔒 COMPLETE THIS FIRST
          </h3>

          <div className="space-y-2">
            {prerequisiteSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-black/16 bg-[#F4F4F4] p-3 text-sm font-medium text-gray-700"
              >
                {step.completed ? (
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <FaCheck className="text-[9px] text-white" />
                  </div>
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border-2 border-dashed border-gray-400" />
                )}

                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Application Features Grid */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-800">
            🔓 WHAT YOU'LL UNLOCK
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-[#99FFE8]/10 p-3 text-xs font-medium text-gray-800"
              >
                <FiPlusCircle className="shrink-0 text-base text-emerald-600" />

                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Ready Score Banner */}
        <div className="rounded-2xl border border-gray-100 bg-[#F4F4F4] p-4 text-center">
          <p className="mb-1 text-sm font-medium text-[#4A4A4A]">
            Interview Ready Score
          </p>

          <p className="text-2xl font-extrabold text-[#16A34A]">
            {readinessScore}%
          </p>
        </div>
      </div>

      {/* ================= 3. FIXED BOTTOM FOOTER ================= */}
      <div className="shrink-0 border-t border-gray-100 bg-white p-6 pt-4 text-center">
        <button
          disabled={!isUnlocked}
          onClick={handleClick}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-md transition ${
            isUnlocked
              ? "bg-green-600 text-white hover:bg-green-700"
              : "cursor-not-allowed bg-[#4F637B] text-white opacity-80"
          }`}
        >
          {isUnlocked ? (
            <>
              🚀 Ready to Apply
            </>
          ) : (
            <>
              <FaLock className="text-sm text-yellow-400" />
              Locked - Complete Previous Steps
            </>
          )}
        </button>
      </div>
    </div>
    </div>
  );
}
