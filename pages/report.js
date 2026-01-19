
// import React, { useState, useEffect } from 'react';
// import { IoIosArrowBack } from "react-icons/io";
// import { useRouter } from 'next/router';
// import { FaYoutube } from 'react-icons/fa';
// import Link from 'next/link';
// // import { useState, useEffect, useRef } from "react";
// import { Bell, Menu, X, User ,Mic,Users,Brain,Code,Target} from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { StreakBadge } from "@/components/dashboard/StreakBadge";

// function Report() {
//   const router = useRouter();

//   const [reportData, setReportData] = useState(null);
//   const [user, setUser] = useState('');
//   const [email, setEmail] = useState('');
//   const [jobRole, setJobRole] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [jobRoleId, setJobRoleId] = useState(null);
//   const [isEmailFetched, setIsEmailFetched] = useState(false);
//   const [youtubeVideos, setYoutubeVideos] = useState([]);
//   const [loadingVideos, setLoadingVideos] = useState(false);




//   const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  
//   const navItems = [
//     { label: "Dashboard", href: "/dashboard" },
//     { label: "Progress", href: "/progress" },
//     { label: "Reports", href: "/report" },
//     { label: "SoftSkills", href: "/practices" },
//   ];
  
//   const isActive = (path) => router.pathname === path;
  




//   // Function to render YouTube recommendations
//   const renderYoutubeRecommendations = () => {
//     if (loadingVideos) {
//       return (
//         <div className="text-center pt-20 py-8">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//           <p className="mt-2 text-gray-300">Finding helpful video recommendations...</p>
//         </div>
//       );
//     }
  
//      if (!youtubeVideos || youtubeVideos.length === 0) {
//        return (
//     //     <div className="text-center py-8">
//     //       <p className="text-gray-400">No video recommendations available at the moment.</p>
//     //     </div>
//     <div className="flex justify-center items-center pt-20 h-40">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//               <p className="mt-2 text-gray-300">Please wait for few second</p>
//             </div>
//        );
//      }
  
//     // Function to extract video ID from a YouTube URL
//     const extractVideoId = (url) => {
//       try {
//         const parsedUrl = new URL(url);
//         return parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
//       } catch (err) {
//         return null;
//       }
//     };
  
//     return (
//       <div className="mt-8 p-6 pt-20 rounded-lg">
//         <h2 className="flex items-center text-2xl font-bold mb-6 text-red-500">
//           <FaYoutube className="mr-2" /> Recommended Videos by Skill
//         </h2>
  
//         {youtubeVideos.map((group, groupIndex) => (
//           <div key={groupIndex} className="mb-10">
//             <h3 className="text-xl  font-semibold mb-4">{group.skill}</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {group.videos.map((video, videoIndex) => {
//                 const videoId = extractVideoId(video.url);
//                 return (
//                   <div
//                     key={videoIndex}
//                     className=" rounded-lg overflow-hidden shadow-lg transition-shadow duration-300"
//                   >
//                     <div className="aspect-w-16 aspect-h-9">
//                       <iframe
//                         className="w-full h-full"
//                         src={`https://www.youtube.com/embed/${videoId}`}
//                         title={video.title}
//                         frameBorder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                       ></iframe>
//                     </div>
//                     <div className="p-4">
//                       <h4 className="font-semibold line-clamp-2 mb-1">{video.title}</h4>
//                       <p className=" text-sm">{group.skill} Video</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   };
  

//   useEffect(() => {
//     if (!localStorage.getItem("token")) {
//       router.push(`${process.env.NEXT_PUBLIC_HOST}/login`);
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
//         setEmail(userFromStorage.email || '');  // Initialize email here directly
//       }
//     }
//   }, []);

//   const extractScoreAndFeedback = (reportAnalysis, category) => {
//     if (!reportAnalysis || typeof reportAnalysis !== 'string') {
//       console.log("reportAnalysis is null or not a string", reportAnalysis);
//       return { overallScore: 0 };
//     }
    
//     console.log("Extracting score for category:", category);
    
//     // Convert category to handle both "Overall Score" and "Overall"
//     const searchCategory = category.toLowerCase().includes("overall") ? "overall" : category;
    
//     try {
//       // Split the report into lines for easier processing
//       const lines = reportAnalysis.split('\n').filter(line => line.trim().length > 0);
      
//       // Look for category-specific scores (format: "Category: X" or "Category: X out of Y")
//       let score = 0;
      
//       if (searchCategory.toLowerCase().includes("overall")) {
//         // For overall score, look for patterns like "Overall: 36 out of 50"
//         for (const line of lines) {
//           if (line.toLowerCase().includes("overall")) {
//             const overallMatch = line.match(/(\d+)\s*(?:out of|\/)\s*(\d+)/);
//             if (overallMatch) {
//               score = parseInt(overallMatch[1], 10);
//               console.log("Found overall score:", score);
//               return { overallScore: score };
//             }
//           }
//         }
//       } else {
//         // For other categories (format: "Category: X")
//         for (const line of lines) {
//           if (line.toLowerCase().includes(searchCategory.toLowerCase())) {
//             const match = line.match(/(\d+)/);
//             if (match) {
//               score = parseInt(match[1], 10);
//               console.log(`Found ${searchCategory} score:`, score);
//               return { overallScore: score };
//             }
//           }
//         }
//       }
      
//       console.log(`No score found for ${searchCategory}`);
//       return { overallScore: 0 };
//     } catch (error) {
//       console.error("Error parsing report for scores:", error);
//       return { overallScore: 0 };
//     }
//   };

//   // Fetch YouTube recommendations based on report text
//   const fetchYoutubeRecommendations = async (reportText) => {
//     console.log("Fetching YouTube recommendations for report text:", reportText);
//     try {
//       setLoadingVideos(true);
//       const response = await fetch('https://youtube-recommender-x79p.onrender.com/api/recommendations', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           report: reportText,
//           max_videos: 7
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch YouTube recommendations');
//       }
      
//       const data = await response.json();
//       console.log("Fetched responseData:", data);
//       console.log("Fetched responseData:", data.recommendations);
//       // Save to our database
//       if (data && data.recommendations && data.recommendations.length > 0) {
//         const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/youtube`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             userId: user?._id,
//             userEmail: email,
//             recommendations: data.recommendations // ✅ updated key
//           }),
//         });
      
//         if (saveResponse.ok) {
//           setYoutubeVideos(data.recommendations);
//         }
//       }
      
//       return data.videos || [];
      
//     } catch (error) {
//       console.error('Error fetching YouTube recommendations:', error);
//       return [];
//     } finally {
//       setLoadingVideos(false);
//     }
//   };

//   // Store the score function - Make sure this is declared before it's called
//   const storeScore = async (jobRole, email, overallScore) => {
//     try {
//       const collageName = user?.collageName || "Unknown Collage";
  
//       // Log the data before sending it
//       const requestData = {
//         role: jobRole,
//         email,
//         collageName,
//         overallScore,
//       };
//       console.log('Sending request data:', requestData);  // This will help debug
      
      
  
//       const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/overallScore`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestData),
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }
  
//       const result = await response.json();
//       console.log('Score stored successfully:', result);
//     } catch (error) {
//       console.error('Error storing score:', error.message);
//     }
//   };
  

//   // Fetch job role data if jobRoleId exists
//   useEffect(() => {
//     localStorage.removeItem('_id');
//     const idFromLocalStorage = localStorage.getItem('_idForReport');

//     const emailFromLocalStorage = localStorage.getItem('user'); // Retrieve user data from localStorage

//     if (emailFromLocalStorage) {
//       const parsedUser = JSON.parse(emailFromLocalStorage); // Parse the stringified user object
//       const email = parsedUser.email; // Access the email field from the parsed object
//       console.log(email); // Output the email

//       if (idFromLocalStorage) {
//         // If jobRoleId is available, set the jobRoleId
//         setJobRoleId(idFromLocalStorage);
//       } else {
//         // If jobRoleId is missing, set the email and show previous reports
//         setEmail(email);
//         setIsEmailFetched(true);
//       }
//     } else {
//       // If neither jobRoleId nor email is available, show an error
//       setError('Missing job role ID and email');
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!jobRoleId) return;

//     const fetchJobRole = async () => {
//       try {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/getReadyQuestionsAndAnswers?jobRoleId=${jobRoleId}`);
//         localStorage.setItem('status', "processing");
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();
//         setReportData(data.data);
//         localStorage.removeItem('status');
//         localStorage.removeItem('_idForReport');
//         localStorage.setItem('status', "model processing");

//         const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/reportFromModel`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             data: data.data,
//           }),
//         });

//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData?.error || "Something went wrong. Please try again.");
//         }

//         const analysisData = await res.json();
//         console.log("Model returned this report", analysisData);
//         // Extract the report text from the response object
//         const reportText = analysisData.report || "";

//         // After storing score, fetch YouTube recommendations if report data is available
       
        
//         // Extract overallScore from report data using the extractScoreAndFeedback function
//         const { overallScore } = extractScoreAndFeedback(reportText, "Overall Score"||"Overall");
        
//         console.log("Extracted overall score:", overallScore);
//         // Store the extracted overall score
//         await storeScore(data.data.role, data.data.email, overallScore);
//         // Store the report analysis
//         await storeReport(data.data.role, data.data.email, reportText);

//         setEmail(data.data.email);
//         setJobRole(data.data.role);

//         // Fetch YouTube recommendations after report is generated
//         try {
//           await fetchYoutubeRecommendations(reportText);
//         } catch (err) {
//           console.error('Error fetching YouTube recommendations:', err);
//           // Don't block the UI if YouTube recommendations fail
//         }

//         localStorage.removeItem('status');
//         localStorage.setItem('status', "model 5 min");
//         setIsEmailFetched(true);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobRole();
//   }, [jobRoleId]);

//   const storeReport = async (jobRole, email, reportAnalysis) => {
//     // Ensure collageName has a default value if it's undefined
//     const collageName = user?.collageName || 'Unknown College';
    
//     console.log("Storing report for:", { jobRole, email, reportAnalysis, collageName });
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           role: jobRole,
//           email,
//           collageName,
//           reportAnalysis,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to store report');
//       }

//       const result = await response.json();
//       console.log('Report stored successfully:', result);

//     } catch (err) {
//       console.error('Error storing report:', err);
//     }
//   };

//   if (error) {
//     return console.log(error);
//   }

//   const goBack = () => {
//         router.push('/'); // This will take the user to the previous page
//       };
    
//   return (
//     <div className="min-h-screen  ">
//       {/* Header */}
//       <header className="fixed top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border-light">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center gap-8">
//             <Link href="/" className="flex items-center gap-2">
//               <div className="h-9 w-9 rounded-lg gradient-blue-teal flex items-center justify-center">
//                 <span className="text-lg font-bold text-primary-foreground"><img src="MM_LOGO1.png" alt="" className="w-6 h-6" /></span>
//               </div>
//               <span className="text-xl font-bold text-gradient-blue-teal hidden sm:inline">MockMingle</span>
//             </Link>
            
//             {/* Desktop Nav */}
//             <nav className="hidden md:flex items-center gap-1">
//               {navItems.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                       active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
//                     }`}
//                   >
//                     {item.label}
//                   </Link>
//                 );
//               })}
//             </nav>
//           </div>
          
//           {/* Right side */}
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:block">
//               <StreakBadge days={3} />
//             </div>
            
//             <Button variant="ghost" size="icon" className="relative">
//               <Bell className="h-5 w-5 text-muted-foreground" />
//               <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
//                 2
//               </span>
//             </Button>
//             {user?._id ? (
//             <Button variant="ghost" size="icon" className="rounded-full">
//               <div className="h-8 w-8 rounded-full gradient-purple-indigo flex items-center justify-center">
//                 <User className="h-4 w-4 text-primary-foreground" />
//               </div>
//             </Button>
          
//              ) : (
//               <Link href="/login">
//                 <button className="px-4 py-2 bg-red-200 rounded-full  transition duration-300 shadow-lg hover:shadow-xl font-medium">
//                   Login
//                 </button>
//               </Link>
//             )}
//             {/* Mobile menu button */}
//             <Button
//               variant="ghost"
//               size="icon"
//               className="md:hidden"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//             </Button>
//           </div>
//         </div>
        
//         {/* Mobile Nav */}
//         {isMenuOpen && (
//           <nav className="md:hidden py-4 border-t border-border-light animate-fade-in">
//             <div className="flex flex-col gap-1">
//               {navItems.map((item) => {
//                 const active = isActive(item.href);
//                 return (
//                   <Link
//                     key={item.label}
//                     href={item.href}
//                     className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
//                       active
//                         ? "text-primary bg-lavender"
//                         : "text-muted-foreground hover:text-purple hover:bg-lavender/50"
//                     }`}
//                   >
//                     {item.label}
//                   </Link>
//                 );
//               })}
//             </div>
//             <div className="mt-4 px-4">
//               <StreakBadge days={3} />
//             </div>
//           </nav>
//         )}
//       </div>
//     </header>
      
//       {/* YouTube Recommendations Section */}
//       {renderYoutubeRecommendations()}
//     </div>
//   );

// }

// export default Report;



import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Target, Calendar, TrendingUp, CalendarDays, Loader2 } from "lucide-react";
import PremiumNavbar from '@/components/navbar';
import ReportsHeader from '@/components/premium/ReportsHeader';
import StatCard from '@/components/premium/StatCard';
import SkillItem from '@/components/premium/SkillItem';
// Lazy load the heavy DetailedReportModal component
const DetailedReportModal = dynamic(() => import('@/components/premium/DetailedReportModal'), {
  ssr: false,
  loading: () => null // Or a small spinner if preferred
});
import { FaYoutube } from 'react-icons/fa';
import { extractSkillFeedback, extractSkillOpportunities } from '@/utils/feedbackParser';

// --- Skeleton Components ---
const StatCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
      <div className="w-12 h-4 bg-slate-50 rounded-lg" />
    </div>
    <div className="w-20 h-8 bg-slate-100 rounded-lg mb-2" />
    <div className="w-24 h-4 bg-slate-50 rounded-lg" />
  </div>
);

const SkillItemSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
        <div>
          <div className="w-32 h-5 bg-slate-100 rounded-lg mb-2" />
          <div className="w-20 h-4 bg-slate-50 rounded-lg" />
        </div>
      </div>
      <div className="w-16 h-8 bg-slate-100 rounded-full" />
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full mb-4" />
    <div className="w-full h-16 bg-slate-50 rounded-xl" />
  </div>
);

const VideoSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
    <div className="aspect-w-16 aspect-h-9 bg-slate-200" />
    <div className="p-4">
      <div className="h-4 w-full bg-slate-100 rounded-lg mb-2" />
      <div className="h-4 w-2/3 bg-slate-50 rounded-lg mb-3" />
      <div className="w-16 h-5 bg-red-100 rounded-full" />
    </div>
  </div>
);

export default function Report() {
  const router = useRouter();

  const [reportData, setReportData] = useState(null);
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobRoleId, setJobRoleId] = useState(null);
  const [isEmailFetched, setIsEmailFetched] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push(`${process.env.NEXT_PUBLIC_HOST}/login`);
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUser(userFromStorage);
        setEmail(userFromStorage.email || '');
      }
    }
  }, []);

  // Reuse the logic to extract score
  const extractScoreAndFeedback = (reportAnalysis, category) => {
    if (!reportAnalysis || typeof reportAnalysis !== 'string') return { overallScore: 0 };

    const searchCategory = category.toLowerCase().includes("overall") ? "overall" : category;
    const lines = reportAnalysis.split('\n').filter(line => line.trim().length > 0);
    let score = 0;

    if (searchCategory.toLowerCase().includes("overall")) {
      for (const line of lines) {
        if (line.toLowerCase().includes("overall")) {
          const overallMatch = line.match(/(\d+)\s*(?:out of|\/)\s*(\d+)/);
          if (overallMatch) {
            score = parseInt(overallMatch[1], 10);
            return { overallScore: score };
          }
        }
      }
    } else {
      for (const line of lines) {
        if (line.toLowerCase().includes(searchCategory.toLowerCase())) {
          const match = line.match(/(\d+)/);
          if (match) {
            score = parseInt(match[1], 10);
            return { overallScore: score };
          }
        }
      }
    }
    return { overallScore: 0 };
  };

  const fetchYoutubeRecommendations = async (reportText) => {
    try {
      setLoadingVideos(true);
      const response = await fetch('https://youtube-recommender-x79p.onrender.com/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report: reportText,
          max_videos: 7
        })
      });

      if (!response.ok) throw new Error('Failed to fetch YouTube recommendations');

      const data = await response.json();

      if (data && data.recommendations && data.recommendations.length > 0) {
        const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/youtube`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?._id,
            userEmail: email,
            recommendations: data.recommendations
          }),
        });

        if (saveResponse.ok) {
          setYoutubeVideos(data.recommendations);
        }
      }
      return data.videos || [];
    } catch (error) {
      console.error('Error fetching YouTube recommendations:', error);
      return [];
    } finally {
      setLoadingVideos(false);
    }
  };

  const storeScore = async (jobRole, email, overallScore) => {
    try {
      const collageName = user?.collageName || "Unknown Collage";
      await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/overallScore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: jobRole, email, collageName, overallScore }),
      });
    } catch (error) {
      console.error('Error storing score:', error.message);
    }
  };

  const storeReport = async (jobRole, email, reportAnalysis) => {
    try {
      const collageName = user?.collageName || 'Unknown College';
      await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: jobRole, email, collageName, reportAnalysis }),
      });
    } catch (err) {
      console.error('Error storing report:', err);
    }
  };

  useEffect(() => {
    localStorage.removeItem('_id');
    const idFromLocalStorage = localStorage.getItem('_idForReport');
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      const email = parsedUser.email;

      if (idFromLocalStorage) {
        setJobRoleId(idFromLocalStorage);
      } else {
        // If jobRoleId is missing, redirect to the history page
        router.push('/reports');
      }
    } else {
      setError('Missing job role ID and email');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobRoleId) return;

    const fetchJobRole = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/getReadyQuestionsAndAnswers?jobRoleId=${jobRoleId}`);
        localStorage.setItem('status', "processing");
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setReportData(data.data);
        localStorage.removeItem('status');
        localStorage.removeItem('_idForReport');
        localStorage.setItem('status', "model processing");

        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/reportFromModel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: data.data }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Something went wrong.");
        }

        const analysisData = await res.json();
        const reportText = analysisData.report || "";
        setAnalysisText(reportText);

        const { overallScore } = extractScoreAndFeedback(reportText, "Overall Score" || "Overall");
        setOverallScore(overallScore);

        await storeScore(data.data.role, data.data.email, overallScore);
        await storeReport(data.data.role, data.data.email, reportText);

        setEmail(data.data.email);
        setJobRole(data.data.role);

        // Fetch YouTube recommendations
        fetchYoutubeRecommendations(reportText).catch(console.error);

        localStorage.removeItem('status');
        localStorage.setItem('status', "model 5 min");
        setIsEmailFetched(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobRole();
  }, [jobRoleId]);

  const getSkillData = (reportText, skillName) => {
    if (!reportText) return null;
    const scoreMatch = reportText.match(new RegExp(`${skillName}:\\s*(\\d+)\\/10`, 'i'));
    const scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    return {
      skill: skillName,
      score: scoreValue || 0,
      status: scoreValue >= 8 ? "Strong" : scoreValue >= 5 ? "Good" : "Needs Improvement",
      lastTested: new Date().toLocaleDateString(),
      progressColor: "#7C3AED",
      summary: `Performance analysis for ${skillName}.`,
      detailedFeedback: extractSkillFeedback(reportText, skillName),
      opportunities: extractSkillOpportunities(reportText, skillName)
    };
  };

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
    } catch (err) {
      return null;
    }
  };


  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F5FF]">
        <div className="text-red-500 font-bold text-xl">{error}</div>
      </div>
    )
  }

  const skillsList = ["Technical Proficiency", "Communication", "Decision-Making", "Confidence", "Language Fluency"];
  const skills = skillsList.map(s => getSkillData(analysisText, s));

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Head>
        <title>Your Report | SHAKKTII AI</title>
      </Head>
      <PremiumNavbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ReportsHeader onViewFullReport={() => setIsModalOpen(true)} />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Overall Score"
                value={overallScore.toString()}
                subValue="/50"
                icon={Target}
                iconColor="text-white"
                iconBg="bg-[#0D9488]"
              />
              <StatCard
                label="Job Role"
                value={jobRole || "N/A"}
                icon={Calendar}
                iconColor="text-[#7C3AED]"
                iconBg="bg-[#F3E8FF]"
              />
            </>
          )}
        </div>

        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0F172A]">
              {loading ? (
                <div className="h-7 w-64 bg-slate-200 rounded-lg animate-pulse" />
              ) : "Detailed Skill Analysis"}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {loading ? (
                <div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse mt-2" />
              ) : "Breakdown of your performance in this session"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {loading ? (
              <>
                <SkillItemSkeleton />
                <SkillItemSkeleton />
                <SkillItemSkeleton />
              </>
            ) : (
              skills.map((skillItem) => (
                <SkillItem key={skillItem.skill} {...skillItem} />
              ))
            )}
          </div>
        </div>

        {/* YouTube Recommendations Section - Redesigned */}
        <div className="mt-16">
          <div className="flex items-center gap-2 mb-8">
            <FaYoutube className="text-3xl text-red-500" />
            <h2 className="text-xl font-bold text-[#0F172A]">Recommended Learning Resources</h2>
          </div>

          {loadingVideos || loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <VideoSkeleton />
              <VideoSkeleton />
              <VideoSkeleton />
            </div>
          ) : (
            <div className="space-y-10">
              {youtubeVideos.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="text-lg font-semibold text-slate-700 mb-4">{group.skill}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.videos.map((video, videoIndex) => {
                      const videoId = extractVideoId(video.url);
                      return (
                        <div key={videoIndex} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100">
                          <div className="aspect-w-16 aspect-h-9">
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-slate-800 line-clamp-2 mb-2 leading-relaxed">{video.title}</h4>
                            <span className="inline-block px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                              YouTube
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DetailedReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportData={reportData}
        jobRole={jobRole}
        date={reportData ? new Date(reportData.createdAt).toLocaleDateString() : ''}
      />
    </div>
  );
}
