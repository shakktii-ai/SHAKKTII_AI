'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { IoMdLock } from 'react-icons/io';

// Import your custom form modal components here
import ProfileModal from '@/components/Stepper/ProfileModal';
import ResumeCheckModal from '@/components/Stepper/ResumeCheckModal';
import DecisionMakingModal from '@/components/Stepper/DecisionMakingModal';
import SoftSkillModal from '@/components/Stepper/SoftSkillModal';
import TechnicalModal from '@/components/Stepper/TechnicalModal';
import MockInterviewModal from '@/components/Stepper/MockInterviewModal';
import ReadyToApplyModal from '@/components/Stepper/ReadyToApplyModal';

const STEPS = [
  { id: 1, title: 'Profile', icon: '/step1.png' },
  { id: 2, title: 'Resume Check', icon: '/step2.png' },
  { id: 3, title: 'Decision Making', icon: '/step3.png' },
  { id: 4, title: 'Soft Skill', icon: '/step4.png' },
  { id: 5, title: 'Technical', icon: '/step5.png' },
  { id: 6, title: 'Mock Interview', icon: '/step4.png' },
  { id: 7, title: 'Ready to Apply', icon: '/step5.png' },
];

export default function StepWorkflow() {
  const [activeStepId, setActiveStepId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    const loadStepProgress = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userId = user?._id || user?.id || user?.userId;

        if (!userId) return;

        const res = await fetch(`/api/baseline/stepProgress?userId=${userId}`);
        const data = await res.json();
        const progress = data?.progress;

        if (!data?.success || !progress) return;

        const nextCompletedSteps = [
          progress.step1_profile && 1,
          progress.step2_resume && 2,
          progress.step3_decision && 3,
          progress.step4_softSkills?.isCompleted && 4,
          progress.step5_techSkills?.isCompleted && 5,
          progress.step6_mockInterview && 6,
          progress.step7_readyToApply && 7,
        ].filter(Boolean);

        setCompletedSteps(nextCompletedSteps);
      } catch (error) {
        console.error('Failed to load stepper progress:', error);
      }
    };

    loadStepProgress();
  }, []);

  // Unlocks steps 6 & 7 only when steps 1-5 are marked completed
  const areFirstFiveCompleted = [1, 2, 3, 4, 5].every((id) =>
    completedSteps.includes(id)
  );

  const handleCompleteStep = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
    setActiveStepId(null);
  };

  const closeModal = () => setActiveStepId(null);

  return (
    <div className="py-6 flex flex-col items-center">
      {/* Container Card */}
      <div className="w-full max-w-8xl rounded-[20px] bg-gradient-to-r from-[#1F4CBD] via-[#BFD8FF] to-[#FFFFFF] p-[1px]">
        <div className="rounded-[19px] bg-[linear-gradient(16deg,#C0D2FF_0%,#FFFFFF_40%,#FFFFFF_63%,#EEF3FF_79%,#C0D2FF_100%)] p-4">
          <h2 className="inline-block text-xl font-semibold bg-gradient-to-r from-[#1F4CBD] to-[#36BF98] bg-clip-text text-transparent mb-1">
            Turn Preparation Into Opportunity
          </h2>
          <p className="text-sm text-black mb-8">
            Complete step-by-step forms to unlock your personalized career path.
          </p>

          {/* Step Icon Bar */}
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isLockedStep = step.id > 5 && !areFirstFiveCompleted;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center group relative m-4 cursor-pointer min-w-[80px]">
                    <button
                      onClick={() => setActiveStepId(step.id)}
                      className={`relative w-16 h-16 rounded-full flex items-center group-hover:border-[#6F24E8] group-hover:shadow-[#6F24E8] justify-center transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.15)] ${
                        isCompleted
                          ? 'bg-white text-white ring-4 ring-emerald-100'
                          : 'bg-white border border-slate-200'
                      }`}
                    >
                      <div className="p-2 rounded-full text-white">
                        <img
                          src={step.icon}
                          alt={step.title}
                          className="w-12 h-12 object-contain"
                        />
                      </div>

                      {/* Completed Badge */}
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      {/* Locked Badge */}
                      {isLockedStep && (
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-white/80">
                          <IoMdLock className="w-5 h-5 text-black" />
                        </div>
                      )}
                    </button>

                    <span className="text-xs font-medium text-slate-600 group-hover:text-[#6F24E8] mt-2 text-center max-w-[90px] truncate">
                      {step.title}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-[1px] bg-[#4A4A4A] min-w-[20px] mb-6" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Individual Form Modals directly */}
      {activeStepId === 1 && (
        <ProfileModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(1)} 
        />
      )}

      {activeStepId === 2 && (
        <ResumeCheckModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(2)} 
        />
      )}

      {activeStepId === 3 && (
        <DecisionMakingModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(3)} 
        />
      )}

      {activeStepId === 4 && (
        <SoftSkillModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(4)} 
        />
      )}

      {activeStepId === 5 && (
        <TechnicalModal 
          isOpen={true} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(5)} 
        />
      )}

      {activeStepId === 6 && (
        <MockInterviewModal 
          isOpen={true} 
          isLocked={!areFirstFiveCompleted} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(6)} 
        />
      )}

      {activeStepId === 7 && (
        <ReadyToApplyModal 
          isOpen={true} 
          isLocked={!areFirstFiveCompleted} 
          onClose={closeModal} 
          onSuccess={() => handleCompleteStep(7)} 
        />
      )}
    </div>
  );
}
