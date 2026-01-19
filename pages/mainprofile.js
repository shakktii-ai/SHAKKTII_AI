 {/* <div className="flex justify-between items-center p-3 bg-[#29064b] rounded-lg cursor-pointer">
              <span className="text-sm">⚙️ Mode (Dark & Light)</span>
              <label className="relative inline-block w-10 h-6">
                <input type="checkbox" className="opacity-0 w-0 h-0" />
                <span className="absolute inset-0 bg-gray-400 rounded-full transition-all"></span>
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform transform"></span>
              </label>
            </div> */}
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserEdit, FaLock, FaShare, FaInfoCircle, FaClipboardList } from "react-icons/fa";
import { IoIosArrowBack, IoMdSettings } from "react-icons/io";
import { BsBarChartFill, BsFileEarmarkText } from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";
import { useRouter } from "next/router";
import InterviewProgress from "../components/InterviewProgress";

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [email, setEmail] = useState('')
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    profileImg: '',
    no_of_interviews: 1,
    no_of_interviews_completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
      useEffect(() => {
        if (!localStorage.getItem("token")) {
          router.push("/login");
        } else {
          const userFromStorage = JSON.parse(localStorage.getItem('user'));
          if (userFromStorage) {
            setUser(userFromStorage);
            setEmail(userFromStorage.email || '');  // Initialize email here directly
          }
        }
      }, []);
  useEffect(() => {
    setIsLoading(true);
    // Fetch user data from localStorage first
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
      setUserData({
        fullName: user.fullName,
        email: user.email,
        profileImg: user.profileImg || '/default-avatar.png', // Default avatar if none exists
        no_of_interviews: user.no_of_interviews || 1,
        no_of_interviews_completed: user.no_of_interviews_completed || 0,
      });
      
      // Also fetch latest user data from the server to get up-to-date interview stats
      const fetchUserData = async () => {
        try {
          // First try to get the user stats specifically
          const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/getUserStats?email=${encodeURIComponent(user.email)}`);
          
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success && statsData.stats) {
              // Update interview stats in local state
              setUserData(prevData => ({
                ...prevData,
                no_of_interviews: statsData.stats.no_of_interviews || 1,
                no_of_interviews_completed: statsData.stats.no_of_interviews_completed || 0,
              }));
              
              // Also update user in local storage with these stats
              const updatedUser = {
                ...user,
                no_of_interviews: statsData.stats.no_of_interviews || 1,
                no_of_interviews_completed: statsData.stats.no_of_interviews_completed || 0,
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } else {
            // Fallback to the editStudentProfile API
            const response = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/editStudentProfile`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                updatedData: {}
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                // Update local storage with latest user data
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Update state
                setUserData(prevData => ({
                  ...prevData,
                  no_of_interviews: data.user.no_of_interviews || 1,
                  no_of_interviews_completed: data.user.no_of_interviews_completed || 0,
                }));
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, []);
      const goBack = () => {
        router.push('/dashboard'); // This will take the user to the previous page
      };
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-[#1c0032] to-black">
        <img
          src="/bg.gif"
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40 z-[-1]"
        />

        {/* Header with Back button */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#1a013a] bg-opacity-80 shadow-md">
          <div onClick={goBack} className="text-white text-2xl cursor-pointer hover:text-[#e600ff] transition-colors">
            <IoIosArrowBack />
          </div>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
          <div className="w-5"></div> {/* Empty div for spacing */}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#e600ff]"></div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Profile Card */}
            <div className="bg-[#29064b] bg-opacity-80 rounded-xl shadow-lg overflow-hidden mb-8 transition-all hover:shadow-[#e600ff]/20 hover:shadow-lg">
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#e600ff] shadow-lg shadow-purple-500/30">
                      <img 
                        src={userData.profileImg || '/default-avatar.png'} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[#e600ff] rounded-full p-1">
                      <MdOutlineVerified className="text-white text-lg" />
                    </div>
                  </div>
                  <div className="md:flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-1">{userData.fullName || 'User'}</h2>
                    <p className="text-gray-300 text-sm mb-4 flex items-center justify-center md:justify-start">
                      <span className="bg-[#e600ff] h-2 w-2 rounded-full mr-2"></span>
                      {userData.email}
                    </p>
                    
                    {/* Interview Statistics Card */}
                    <div className="bg-[#1a0035] rounded-lg p-4 shadow-inner">
                      <h3 className="text-[#e600ff] text-sm font-semibold mb-3 flex items-center">
                        <BsBarChartFill className="mr-2" />
                        INTERVIEW STATISTICS
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#3a0a5c] p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-300 mb-1">AVAILABLE</p>
                          <p className="text-xl font-bold text-white">
                            {userData.no_of_interviews - userData.no_of_interviews_completed}
                          </p>
                        </div>
                        <div className="bg-[#3a0a5c] p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-300 mb-1">COMPLETED</p>
                          <p className="text-xl font-bold text-white">{userData.no_of_interviews_completed}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <InterviewProgress userData={userData} />
                      </div>
                      <Link href="/purchase-interviews">
                        <button className="w-full mt-4 py-2 bg-gradient-to-r from-[#8000ff] to-[#e600ff] text-white rounded-lg font-semibold text-sm transition-transform hover:scale-105 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Buy More Interviews
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Reports */}
              <Link href="/oldreport">
                <div className="bg-[#29064b] bg-opacity-80 p-5 rounded-lg flex items-center gap-4 cursor-pointer transition-all hover:bg-[#3a0a5c] hover:shadow-md">
                  <div className="bg-[#e600ff] p-3 rounded-full">
                    <BsFileEarmarkText className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">My Reports</h3>
                    <p className="text-gray-300 text-xs">View your interview reports</p>
                  </div>
                </div>
              </Link>

              {/* Edit Profile */}
              <Link href="/editProfile">
                <div className="bg-[#29064b] bg-opacity-80 p-5 rounded-lg flex items-center gap-4 cursor-pointer transition-all hover:bg-[#3a0a5c] hover:shadow-md">
                  <div className="bg-[#e600ff] p-3 rounded-full">
                    <FaUserEdit className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Edit Profile</h3>
                    <p className="text-gray-300 text-xs">Update your personal information</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Settings & Info */}
            <div className="bg-[#29064b] bg-opacity-80 rounded-xl overflow-hidden shadow-lg mb-8">
              <div className="p-4 bg-[#3a0a5c]">
                <h3 className="text-white font-semibold flex items-center">
                  <IoMdSettings className="mr-2" />
                  Settings & Information
                </h3>
              </div>
              <div className="divide-y divide-[#3a0a5c]">
                <div className="flex justify-between items-center p-4 hover:bg-[#3a0a5c] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FaLock className="text-[#e600ff]" />
                    <span className="text-white">Change Password</span>
                  </div>
                  <div className="text-gray-400">
                    <span>›</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 hover:bg-[#3a0a5c] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FaInfoCircle className="text-[#e600ff]" />
                    <span className="text-white">About App</span>
                  </div>
                  <div className="text-gray-400">
                    <span>›</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 hover:bg-[#3a0a5c] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FaLock className="text-[#e600ff]" />
                    <span className="text-white">Privacy Policy</span>
                  </div>
                  <div className="text-gray-400">
                    <span>›</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 hover:bg-[#3a0a5c] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <FaShare className="text-[#e600ff]" />
                    <span className="text-white">Share This App</span>
                  </div>
                  <div className="text-gray-400">
                    <span>›</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 mb-8">
              <Link href="/role">
                <button className="bg-gradient-to-r from-[#e600ff] to-[#8000ff] text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                  Start New Interview
                </button>
              </Link>
              <Link href="/purchase-interviews">
                <button className="bg-[#3a0a5c] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-[#500d80] transition-all transform hover:scale-105 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Buy More Interviews
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }
  

// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";

// export default function Profile() {
//   const [user, setUser] = useState(null);

//   const router = useRouter();
//   useEffect(() => {
//     const stored = localStorage.getItem("user");
//     if (stored) {
//       setUser(JSON.parse(stored));
//       router.push("/dashboard");
//     }
//   }, []);

//   if (!user) return <p className="text-center mt-10">Loading...</p>;

//   return (
//     <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
//       <p><strong>Name:</strong> {user.fullName}</p>
//       <p><strong>Email:</strong> {user.email}</p>
//       <p><strong>Mobile:</strong> {user.mobileNo}</p>
//       <p><strong>Address:</strong> {user.address}</p>
//       <p><strong>Education:</strong> {user.education}</p>
//       <p><strong>College:</strong> {user.collageName}</p>
//       {user.profileImg && <img src={user.profileImg} alt="Profile" className="mt-4 w-32 h-32 rounded-full" />}
//     </div>
//   );
// }
