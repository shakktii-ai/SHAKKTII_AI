

// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { Edit } from 'lucide-react';
// import EditPopup from '../../component/editPopup'; // Import the EditPopup modal
// import ReportDetailPopup from '../../component/reportDetailPopup'; // Import the ReportDetailPopup component

// function EmployeeProfiles() {
//   const [users, setUsers] = useState([]); // State to hold all employees
//   const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
//   const [isReportOpen, setIsReportOpen] = useState(false); // State to control report modal visibility
//   const [selectedUser, setSelectedUser] = useState(null); // State to hold the user currently being edited
//   const [selectedReport, setSelectedReport] = useState(null); // State to hold the report for the selected user
//   const [newFullName, setNewFullName] = useState('');
//   const [newLastName, setNewLastName] = useState('');
//   const [newDOB, setNewDOB] = useState('');
//   const [newMobileNo,setNewMobileNo] = useState('');
//     const[newAddress ,setNewAddress] = useState('');
//     const[newEducation ,setNewEducation] = useState('');
//   const [newEmail, setNewEmail] = useState('');
//   const collageName = 'SPPU'; // Replace with the actual company name

//   // Fetch user data and their report data in one go
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch(`/api/editStudentProfile?collageName=${collageName}`);
//         const data = await response.json();

//         if (data.users && data.users.length > 0) {
//           // Get all emails and fetch reports for all of them at once
//           const emails = data.users.map(user => user.email);
//           const reportResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?emails=${JSON.stringify(emails)}`);
//           const reportData = await reportResponse.json();

//           // Merge the user data and report data
//           const userReports = data.users.map(user => ({
//             ...user,
//             report: reportData.reports[user.email] || [],
//           }));

//           setUsers(userReports); // Set users with their reports
//         } else {
//           console.error('No users found for this company');
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };

//     fetchUserData();
//   }, [collageName]);

//   // Function to handle the update of the user profile
//   const updateUserProfile = async () => {
//     if (!selectedUser) return;

//     const updatedData = {
//       email: selectedUser.email, // Email stays constant for this update
//       updatedData: {
//        fullName:newFullName,
//         email: newEmail,
//         DOB: newDOB,
//         mobileNo: newMobileNo,
//         address: newAddress ,
//         education:newEducation
//       },
//     };

//     try {
//       const res = await fetch('/api/editStudentProfile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updatedData),
//       });

//       const result = await res.json();

//       if (res.status === 200) {
//         // Successfully updated the user profile
//         setUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             user.email === selectedUser.email
//               ? { ...user, fullName: newFullName, DOB: newDOB, email: newEmail, mobileNo: newMobileNo, address: newAddress,education:newEducation }
//               : user
//           )
//         );
//       } else {
//         console.error(result.message);
//         alert('Failed to update user profile');
//       }
//     } catch (error) {
//       console.error(error);
//       alert('Error updating user profile');
//     }
//   };

//   return (
//     <div className="grid grid-cols-3 gap-3 p-5 bg-[#6c57ec] bg-opacity-20 m-10 rounded-xl">
//       {users.map((user) => {
//         const userReport = user.report || []; // No need for a score field, just use the report array length

//         return (
//           <div key={user.email} className="h-[15rem] p-4 bg-white border border-gray-200 rounded-2xl shadow-md text-center relative">
//             <div className="flex items-center">
//               <Image
//                 src={user.profileImg || '/BOT.png'}
//                 width={60}
//                 height={60}
//                 alt="Profile Picture"
//                 className="rounded-full border-2 border-white shadow"
//               />
//               <div className="ml-10">
//                 <h1 className="text-lg text-start font-semibold">{user.fullName}</h1>
//                 <h2 className="text-sm text-start text-gray-600 font-bold">{user.education}</h2>
//                 <h2 className="text-sm text-start text-gray-600 font-bold">{user.DOB}</h2>
//                 <div className="text-xs text-start text-gray-500">{user.email}</div>
//               </div>
//             </div>
//             <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
//             <div className="mt-3 text-sm font-medium text-gray-600">NUMBER OF ASSESSMENT</div>
//             <div className="text-lg font-bold text-gray-700">{userReport.length}</div> {/* Show the number of reports */}
//             <div className="flex justify-between mt-4">
//               <button
//                 onClick={() => {
//                   setSelectedUser(user);
//                   setSelectedReport(userReport[0]); // Take the first report, or set null
//                   setIsReportOpen(true);
//                 }}
//                 className="w-1/2 mr-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
//               >
//                 Detail Report
//               </button>

//               <button
//                 onClick={() => {
//                   setSelectedUser(user);
//                   setNewFullName(user.fullName);
//                   setNewDOB(user.DOB);
//                   setNewEmail(user.email);
//                   setNewMobileNo(user.mobileNo);
//                   setNewEducation(user.education);
//                   setNewAddress(user.address);
//                   setIsModalOpen(true);
//                 }}
//                 className="w-1/2 flex items-center gap-1 px-4 py-2 bg-[#c3baf7] text-white rounded-lg hover:bg-purple-600"
//               >
//                 <Edit size={16} /> Edit
//               </button>
//             </div>
//           </div>
//         );
//       })}

//       {/* Edit Modal */}
//       {selectedUser && (
//         <EditPopup
//           user={selectedUser}
//           isOpen={isModalOpen}
//           setIsOpen={setIsModalOpen}
//           updateUserProfile={updateUserProfile}
//           setNewFullName={setNewFullName}
//           setNewDOB={setNewDOB}
//           setNewEmail={setNewEmail}
//           setNewAddress={setNewAddress}
          
//           setNewMobileNo={setNewMobileNo}
//           setNewEducation={setNewEducation}

//           newFullName={newFullName}
//           newDOB={newDOB}
//           newEmail={newEmail}
//           newEducation={newEducation}
//           newMobileNo={newMobileNo}
//           newAddress={newAddress}

//         />
//       )}

//       {/* Report Detail Modal */}
//       {isReportOpen && (
//         <ReportDetailPopup
//           user={selectedUser}
//           isOpen={isReportOpen}
//           setIsOpen={setIsReportOpen}
//         />
//       )}
//     </div>
//   );
// }

// export default EmployeeProfiles;


// import React, { useState, useEffect } from 'react'; 
// import Image from 'next/image'; 
// import { Edit } from 'lucide-react'; 
// import EditPopup from '../../components/editPopup'; 
// import ReportDetailPopup from '../../components/reportDetailPopup'; 
// import Chart from '../../components/chart'; // Import the Chart component/components/Chart'; // Import the Chart component
// import { useRouter } from 'next/router';

// function EmployeeProfiles() { 
//   const router = useRouter();
//   const [users, setUsers] = useState([]); 
//   const [isModalOpen, setIsModalOpen] = useState(false); 
//   const [isReportOpen, setIsReportOpen] = useState(false); 
//   const [selectedUser, setSelectedUser] = useState(null); 
//   const [selectedReport, setSelectedReport] = useState(null); 
//   const [newFullName, setNewFullName] = useState(''); 
//   const [newLastName, setNewLastName] = useState(''); 
//   const [newDOB, setNewDOB] = useState(''); 
//   const [newMobileNo, setNewMobileNo] = useState(''); 
//   const [newAddress, setNewAddress] = useState(''); 
//   const [newEducation, setNewEducation] = useState(''); 
//   const [newEmail, setNewEmail] = useState(''); 
//   const collageName = 'SPPU'; // Replace with the actual company name
//   const [showChart, setShowChart] = useState(false); // State to toggle chart visibility
//   const [chartData, setChartData] = useState([]); // Store chart data



// const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (!localStorage.getItem("Admintoken")) {
//       router.push("/admin/login");
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('admin'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
        
//       }
//     }
//   }, []);


//   // Fetch user data and their report data in one go
//   useEffect(() => { 
//     const fetchUserData = async () => { 
//       try { 
//         const response = await fetch(`/api/editStudentProfile?collageName=${collageName}`); 
//         const data = await response.json(); 
//         if (data.users && data.users.length > 0) { 
//           // Get all emails and fetch reports for all of them at once 
//           const emails = data.users.map(user => user.email); 
//           const reportResponse = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?emails=${JSON.stringify(emails)}`); 
//           const reportData = await reportResponse.json(); 

//           // Merge the user data and report data 
//           const userReports = data.users.map(user => ({ 
//             ...user, 
//             report: reportData.reports[user.email] || [], 
//           })); 

//           setUsers(userReports); // Set users with their reports 
//         } else { 
//           console.error('No users found for this company'); 
//         } 
//       } catch (error) { 
//         console.error('Error fetching user data:', error); 
//       } 
//     };

//     fetchUserData();
//   }, [collageName]);
  
//   const fetchChartData = async (email) => {
//     try {
//       const res = await fetch(`/api/overallScore?email=${email}`);
//       const data = await res.json();
      
      
//       if (data.reports && data.reports.length > 0) {
//         // Prepare chart data
//         const scores = data.reports.map(report => ({
//           x: report.createdAt.toLocaleString(),
//           y: report.overallScore,
//         }));
//         setChartData(scores);
//       } else {
//         console.error('No score data available');
//       }
//     } catch (error) {
//       console.error('Error fetching score data:', error);
//     }
//   };
//   // Function to handle the update of the user profile
//   const updateUserProfile = async () => { 
//     if (!selectedUser) return;

//     const updatedData = { 
//       email: selectedUser.email, 
//       updatedData: { 
//         fullName: newFullName, 
//         email: newEmail, 
//         DOB: newDOB, 
//         mobileNo: newMobileNo, 
//         address: newAddress, 
//         education: newEducation, 
//       },
//     };

//     try { 
//       const res = await fetch('/api/editStudentProfile', { 
//         method: 'PUT', 
//         headers: { 
//           'Content-Type': 'application/json', 
//         }, 
//         body: JSON.stringify(updatedData), 
//       });

//       const result = await res.json();
//       if (res.status === 200) { 
//         // Successfully updated the user profile
//         setUsers((prevUsers) =>
//           prevUsers.map((user) =>
//             user.email === selectedUser.email
//               ? { ...user, fullName: newFullName, DOB: newDOB, email: newEmail, mobileNo: newMobileNo, address: newAddress, education: newEducation }
//               : user
//           )
//         );
//       } else { 
//         console.error(result.message); 
//         alert('Failed to update user profile'); 
//       } 
//     } catch (error) { 
//       console.error(error); 
//       alert('Error updating user profile'); 
//     } 
//   };

//   return (
//     <div className="grid grid-cols-3 gap-3 p-5 bg-[#6c57ec] bg-opacity-20 m-10 rounded-xl">
//       {users.map((user) => {
//         const userReport = user.report || [];
//         return (
//           <div key={user.email} className="h-[15rem] p-4 bg-white border border-gray-200 rounded-2xl shadow-md text-center relative">
//             <div className="flex items-center">
//               <Image
//                 src={user.profileImg || '/BOT.png'}
//                 width={60}
//                 height={60}
//                 alt="Profile Picture"
//                 className="rounded-full border-2 border-white shadow"
//               />
//               <div className="ml-10">
//                 <h1 className="text-lg text-start font-semibold">{user.fullName}</h1>
//                 <h2 className="text-sm text-start text-gray-600 font-bold">{user.education}</h2>
//                 <h2 className="text-sm text-start text-gray-600 font-bold">{user.DOB}</h2>
//                 <div className="text-xs text-start text-gray-500">{user.email}</div>
//               </div>
//             </div>
//             <hr className="h-px mt-2 bg-gray-200 border-0 dark:bg-gray-700" />
            
//             <div className="mt-3 text-sm font-medium text-gray-600">NUMBER OF ASSESSMENT</div>
//             <div className="text-lg font-bold text-gray-700">{userReport.length}</div>
//             <div className="flex justify-between mt-2">
//               <button
//                 onClick={() => {
//                   setSelectedUser(user);
//                   setSelectedReport(userReport[0]);
//                   setIsReportOpen(true);
//                 }}
//                 className="w-1/2 px-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
//               >
//                 Detail Report
//               </button>
//               <div className="w-full mt-4 text-center">
//   <button
//     onClick={() => {
//       setShowChart(!showChart);
//       if (!showChart) {
//         fetchChartData(user.email); // Fetch chart data when the chart is shown
//       }
//     }}
//     className="px-4 py-2 bg-[#c3baf7] text-white rounded-lg hover:bg-purple-600"
//   >
//     {showChart ? 'Hide Chart' : 'Show Chart'}
//   </button>
// </div>
//               <button
//                 onClick={() => {
//                   setSelectedUser(user);
//                   setNewFullName(user.fullName);
//                   setNewDOB(user.DOB);
//                   setNewEmail(user.email);
//                   setNewMobileNo(user.mobileNo);
//                   setNewEducation(user.education);
//                   setNewAddress(user.address);
//                   setIsModalOpen(true);
//                 }}
//                 className="w-1/2 flex items-center gap-1 px-4 py-2 bg-[#c3baf7] text-white rounded-lg hover:bg-purple-600"
//               >
//                 <Edit size={16} /> Edit
//               </button>
//             </div>
//           </div>
//         );
//       })}

//       {/* Chart Toggle Button */}
      

//       {/* Show Chart component if showChart is true */}
//       {/* {showChart && <Chart chartData={chartData} />} */}
//       {showChart && <Chart chartData={chartData} closeChart={() => setShowChart(false)} />}
//       {/* Edit Modal */}
//       {selectedUser && (
//         <EditPopup
//           user={selectedUser}
//           isOpen={isModalOpen}
//           setIsOpen={setIsModalOpen}
//           updateUserProfile={updateUserProfile}
//           setNewFullName={setNewFullName}
//           setNewDOB={setNewDOB}
//           setNewEmail={setNewEmail}
//           setNewAddress={setNewAddress}
//           setNewMobileNo={setNewMobileNo}
//           setNewEducation={setNewEducation}
//           newFullName={newFullName}
//           newDOB={newDOB}
//           newEmail={newEmail}
//           newEducation={newEducation}
//           newMobileNo={newMobileNo}
//           newAddress={newAddress}
//         />
//       )}

//       {/* Report Detail Modal */}
//       {isReportOpen && (
//         <ReportDetailPopup
//           user={selectedUser}
//           isOpen={isReportOpen}
//           setIsOpen={setIsReportOpen}
//         />
//       )}
//     </div>
//   );
// }

// export default EmployeeProfiles;


import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit } from 'lucide-react';
import EditPopup from '../../components/editPopup';
import ReportDetailPopup from '../../components/reportDetailPopup';
import Chart from '../../components/chart';
import { useRouter } from 'next/router';

function EmployeeProfiles() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [collageName, setCollageName] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const [newFullName, setNewFullName] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newMobileNo, setNewMobileNo] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState([]);

  /* ---------------- AUTH + ADMIN LOAD ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    const adminStr = localStorage.getItem("admin");

    if (!token || !adminStr) {
      router.push("/admin/login");
      return;
    }

    try {
      const admin = JSON.parse(adminStr);
      setUser(admin);
      setCollageName(admin.collageName); // ✅ KEY LINE
    } catch (err) {
      localStorage.clear();
      router.push("/admin/login");
    }
  }, []);

  /* ---------------- FETCH STUDENTS (COLLAGE WISE) ---------------- */
  useEffect(() => {
    if (!collageName) return;

    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `/api/editStudentProfile?collageName=${encodeURIComponent(collageName)}`
        );
        const data = await response.json();

        if (data.users?.length) {
          const emails = data.users.map(u => u.email);

          const reportRes = await fetch(
            `${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?emails=${JSON.stringify(emails)}`
          );
          const reportData = await reportRes.json();

          const merged = data.users.map(u => ({
            ...u,
            report: reportData.reports?.[u.email] || [],
          }));

          setUsers(merged);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchUserData();
  }, [collageName]);

  /* ---------------- CHART DATA ---------------- */
  const fetchChartData = async (email) => {
    try {
      const res = await fetch(`/api/overallScore?email=${email}`);
      const data = await res.json();

      if (data.reports?.length) {
        setChartData(
          data.reports.map(r => ({
            x: new Date(r.createdAt).toLocaleString(),
            y: r.overallScore,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateUserProfile = async () => {
    if (!selectedUser) return;

    const payload = {
      email: selectedUser.email,
      updatedData: {
        fullName: newFullName,
        email: newEmail,
        DOB: newDOB,
        mobileNo: newMobileNo,
        address: newAddress,
        education: newEducation,
      },
    };

    try {
      const res = await fetch('/api/editStudentProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.email === selectedUser.email
              ? { ...u, ...payload.updatedData }
              : u
          )
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */

return (
<div className="flex-1 w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 font-sans text-gray-600 pt-16 md:pt-0">    {/* Main Content Container */}
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-lg border border-white/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-800 tracking-tight">
            Student Profiles
          </h1>
          <p className="text-gray-600 text-sm mt-1.5 font-medium">
            Manage student registrations and performance insights
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 p-2 pr-5 rounded-2xl border border-white/40 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Students</span>
             <span className="text-lg font-bold text-indigo-800 leading-none">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => {
          const userReport = user.report || [];
          const hasReport = userReport.length > 0;
          
          return (
            <div 
              key={user.email} 
              className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Header & Profile */}
              <div className="p-6 pb-4 flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <div className="bg-white rounded-[14px] w-full h-full overflow-hidden">
                      <Image
                        src={user.profileImg || '/BOT.png'}
                        width={64}
                        height={64}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  {/* Status Indicator Dot */}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-sm"></span>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="text-lg font-bold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
                    {user.fullName || 'Unknown User'}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 truncate mb-2">{user.education || 'Student'}</p>
                  
                  <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 max-w-full">
                    <svg className="w-3 h-3 text-indigo-400 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-indigo-700 font-medium truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="px-6 py-3 mx-6 bg-white/50 rounded-xl border border-white/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-full bg-purple-100 text-purple-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Reports</span>
                        <span className="text-sm font-bold text-gray-700 leading-none">{userReport.length}</span>
                     </div>
                  </div>
                  <div className="h-8 w-px bg-indigo-200/40"></div>
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Joined</span>
                        <span className="text-xs font-bold text-gray-700 leading-none">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                     </div>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 mt-auto grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedReport(userReport[0]);
                    setIsReportOpen(true);
                  }}
                  disabled={!hasReport}
                  className={`col-span-1 py-2.5 px-4 text-sm font-semibold rounded-xl border transition-all duration-200 
                    ${!hasReport
                      ? 'bg-white/40 text-gray-400 border-white/40 cursor-not-allowed' 
                      : 'bg-white text-gray-700 border-white/60 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm'}`}
                >
                  View Report
                </button>

                <button
                  onClick={() => {
                      fetchChartData(user.email);
                      setShowChart(true);
                  }}
                  disabled={!hasReport}
                  className={`col-span-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md
                      ${!hasReport
                          ? 'bg-white/40 text-gray-400 border border-white/40 cursor-not-allowed shadow-none'
                          : 'bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200'}`}
                >
                    <svg className="w-4 h-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Analytics
                </button>

                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setNewFullName(user.fullName);
                    setNewDOB(user.DOB);
                    setNewEmail(user.email);
                    setNewMobileNo(user.mobileNo);
                    setNewEducation(user.education);
                    setNewAddress(user.address);
                    setIsModalOpen(true);
                  }}
                  className="col-span-2 mt-2 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-500 hover:text-indigo-700 transition-colors duration-200 group/edit"
                >
                  <Edit size={14} className="group-hover/edit:scale-110 transition-transform text-indigo-400" />
                  Edit Profile Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* MODALS SECTION */}

    {/* Analytics Chart Modal */}
    {showChart && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div>
                  <h3 className="text-xl font-bold text-gray-800">Performance Analytics</h3>
                  <p className="text-gray-500 text-sm">Visualizing user progress over time</p>
              </div>
              <button 
                  onClick={() => setShowChart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <Chart chartData={chartData} closeChart={() => setShowChart(false)} />
          </div>
        </div>
      </div>
    )}

    {/* Edit Profile Modal */}
    {selectedUser && (
      <EditPopup
        user={selectedUser}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        updateUserProfile={updateUserProfile}
        setNewFullName={setNewFullName}
        setNewDOB={setNewDOB}
        setNewEmail={setNewEmail}
        setNewAddress={setNewAddress}
        setNewMobileNo={setNewMobileNo}
        setNewEducation={setNewEducation}
        newFullName={newFullName}
        newDOB={newDOB}
        newEmail={newEmail}
        newEducation={newEducation}
        newMobileNo={newMobileNo}
        newAddress={newAddress}
      />
    )}

    {/* Report Detail Modal */}
    {isReportOpen && (
      <ReportDetailPopup
        user={selectedUser}
        isOpen={isReportOpen}
        setIsOpen={setIsReportOpen}
      />
    )}
  </div>
);
}

export default EmployeeProfiles;
