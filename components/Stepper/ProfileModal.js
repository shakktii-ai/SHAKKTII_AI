'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check } from 'lucide-react';

export default function ProfileModal({ isOpen = true, onClose, userData: propUser }) {
  const router = useRouter();
  const [user, setUser] = useState(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [isUpdated, setIsUpdated] = useState(false);

  // 1. Fetch logged-in user details if not passed as props
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const email = storedUser ? JSON.parse(storedUser)?.email : null;

        if (email) {
          const res = await fetch(`/api/getUser?email=${encodeURIComponent(email)}`, {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          });
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to load user data for modal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [propUser]);

  // 2. Define tasks based on standard User schema fields BEFORE running completion checks
  const tasks = [
    {
      id: 'profileImg',
      label: 'Upload Profile Photo',
      isCompleted: Boolean(user?.profileImg && user.profileImg.trim() !== ''),
    },
    {
      id: 'fullName',
      label: 'Add Full Name',
      isCompleted: Boolean(user?.fullName && user.fullName.trim() !== ''),
    },
    {
      id: 'education',
      label: 'Add Education',
      isCompleted: Boolean(
        user?.education &&
          (Array.isArray(user.education) ? user.education.length > 0 : String(user.education).trim() !== '')
      ),
    },
    {
      id: 'collageName',
      label: 'Add College Name',
      isCompleted: Boolean(user?.collageName && user.collageName.trim() !== ''),
    },
    {
      id: 'mobileNo',
      label: 'Add Contact Details',
      isCompleted: Boolean(user?.mobileNo && String(user.mobileNo).trim() !== ''),
    },
    {
      id: 'address',
      label: 'Add Address',
      isCompleted: Boolean(user?.address && user.address.trim() !== ''),
    },
  ];

  // 3. Calculate Completion Metrics
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // 4. Trigger DB update when profile is 100% complete
  useEffect(() => {
    const syncStepProgress = async () => {
      const userId = user?._id || user?.id;

      if (completionPercentage === 100 && userId && !isUpdated) {
        try {
          const res = await fetch('/api/baseline/stepProgress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              stepKey: 'step1_profile',
              score: completionPercentage,
            }),
          });

          const data = await res.json();
          if (data.success) {
            setIsUpdated(true);
            console.log('Step 1 successfully marked as completed!');
          }
        } catch (error) {
          console.error('Failed to sync profile progress:', error);
        }
      }
    };

    syncStepProgress();
  }, [completionPercentage, user, isUpdated]);

  if (!isOpen) return null;

  // Redirection handler
  const handleRedirectToProfile = () => {
    if (onClose) onClose();
    router.push('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-3 sm:p-4 overflow-y-auto no-scrollbar">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Blue Header Section */}
        <div className="bg-[#336DED] text-white p-5 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-6 h-6 rounded-[4px] bg-white shadow-md hover:bg-white/90 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-black" />
          </button>

          <div className="flex items-center space-x-3.5 mb-4">
            <div className="w-14 h-14 rounded-md bg-[#B0C9FF] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={user?.profileImg || '/stepimg1.svg'}
                alt="Profile"
                className="w-10 h-10 object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
                }}
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-white/80 uppercase">
                Step 1 of 7
              </span>
              <h3 className="text-xl font-bold leading-tight">
                Complete Your Profile
              </h3>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-white/90 font-medium mb-2">
            <span>
              {completedCount} of {totalTasks} tasks done
            </span>
            <span>• {completionPercentage}% Complete</span>
          </div>

          <div className="w-full h-1.5 bg-[#6795FC] rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto no-scrollbar space-y-5 flex-1 text-slate-800">
          <div>
            <div className="flex items-center space-x-1.5 mb-2">
              <span className="text-base">🎯</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Why This Matters
              </h4>
            </div>
            <div className="bg-[#F4F4F4] rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
              Complete your profile so recruiters and AI can accurately evaluate
              your skills and match you to the right roles.
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-1.5 mb-2.5">
              <span className="text-base">📝</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Tasks to Complete
              </h4>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              {loading ? (
                <p className="text-slate-400 text-center py-4">Loading tasks...</p>
              ) : (
                tasks.map((task) =>
                  task.isCompleted ? (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/80 text-emerald-700"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="font-semibold">{task.label}</span>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[11px]">
                        Done
                      </span>
                    </div>
                  ) : (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 bg-slate-100/70 p-3 rounded-xl text-slate-500"
                    >
                      <div className="w-4 h-4 rounded bg-slate-300 flex-shrink-0" />
                      <span>{task.label}</span>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex-shrink-0 text-center space-y-2">
          <button
            onClick={handleRedirectToProfile}
            className="w-full py-3 px-4 bg-[#2B66F6] hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
          >
            <span>Complete Profile</span>
            <span className="text-lg leading-none">→</span>
          </button>
          <p className="text-[11px] text-slate-400 font-medium">
            Estimated time: 3 min
          </p>
        </div>
      </div>
    </div>
  );
}
