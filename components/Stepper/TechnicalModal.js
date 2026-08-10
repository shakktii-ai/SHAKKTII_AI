import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import { HiOutlineDesktopComputer } from 'react-icons/hi';
import { useRouter } from 'next/router';

export default function TechnicalSkillsModal({ onClose, onStart }) {
  const router = useRouter();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define modules with custom IDs and navigation routes
  const modules = [
    { id: "excel", name: "Excel Assessment", route: "/BaseLine/excelTest" },
    { id: "role", name: "Role-Based Assessment", route: "/BaseLine/techMock" },
  ];

  const roleExamples = [
    {
      role: "UI/UX Designer",
      tags: ["Figma", "Wireframe", "UX Principles"],
    },
    {
      role: "Software Engineer",
      tags: ["DSA", "SQL", "OOP"],
    },
  ];

  const rewards = [
    "Technical Score",
    "Skill gap Report",
  ];

  // Fetch progress from DB via API endpoint on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = user.id || user._id || user.userId;

        if (userId) {
          const res = await fetch(`/api/baseline/stepProgress?userId=${userId}`);
          const data = await res.json();

          if (data.success) {
            setProgress(data.progress);
          }
        }
      } catch (err) {
        console.error("Failed to load step progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleModuleClick = (module) => {
    if (onClose) onClose();
    if (onStart) {
      onStart(module);
    } else {
      router.push(module.route);
    }
  };

  const handleRedirect = () => {
    if (onClose) onClose();
    router.push('/BaseLine/techSkills');
  };

const technicalProgress = progress?.step5_techSkills || {};

const isExcelCompleted = !!technicalProgress.excelAssessment;
const isRoleCompleted = !!technicalProgress.technicalMcq;

const isStep5Completed = !!technicalProgress.isCompleted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Outer Modal Container with Fixed Height Limit */}
      <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl font-sans">
        
        {/* ================= 1. FIXED TOP HEADER ================= */}
        <div className="shrink-0 relative bg-[#1B9F76] p-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="Close modal"
          >
            <IoClose className="text-xl" />
          </button>

          <div className="flex items-start gap-4">
            {/* Laptop Icon Container */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            <img
                src="/step5img.svg" // Replace with your asset path
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
              <span className="text-xs font-normal tracking-wider text-emerald-100 uppercase">
                Step 5 of 7
              </span>
              <h2 className="text-xl font-bold leading-tight mt-0.5">
                Validate Your Technical Skills
              </h2>

              {/* Status Badge */}
              <div className="mt-3 flex items-center text-xs font-medium">
                <span className="rounded-full bg-white px-3 py-1 text-gray-900">
                  • {loading ? "Loading..." : isStep5Completed ? "Completed" : "Pending"}
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
              Technical screening is the most common interview fitter. Role specific assessment prove you can do the job not just talk about it.
            </div>
          </div>

          {/* Modules to Complete */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-800 uppercase mb-3">
              📋 Modules to Complete
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {modules.map((item) => {
  const isCompleted =
    item.id === "excel"
      ? isExcelCompleted
      : item.id === "role"
      ? isRoleCompleted
      : false;

  return (
    <button
      key={item.id}
      onClick={() => handleModuleClick(item)}
      disabled={loading}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-all duration-150 active:scale-95 ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
          : "border-black/16 bg-[#F4F4F4] text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30"
      }`}
    >
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${
          isCompleted
            ? "border border-[#0F9D70] bg-[#0F9D70] text-white"
            : "border border-gray-300 bg-gray-200/60"
        }`}
      >
        {isCompleted && <FaCheck className="text-[10px]" />}
      </div>

      <span className="truncate">{item.name}</span>
    </button>
  );
})}
            </div>
          </div>

          {/* Role-Specific Examples */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-wider text-gray-700 uppercase mb-3">
              💼 Role-Specific Examples
            </h3>
            <div className="space-y-3">
              {roleExamples.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-100 bg-[#F4F4F4] p-3.5"
                >
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {item.role}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="rounded-full border border-[#6F24E8] bg-[3424E8]/20 px-3 py-1 text-xs font-medium text-[#6F24E8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                  className="rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-600"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B9F76] py-3.5 px-6 text-base font-semibold text-white hover:bg-[#0c835d] transition-colors shadow-lg shadow-emerald-100"
          >
            Start Technical Assessment <FaArrowRight className="text-sm" />
          </button>
        </div>

      </div>
    </div>
  );
}