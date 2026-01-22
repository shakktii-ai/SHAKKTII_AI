

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#6c57ec] bg-opacity-20 m-10 rounded-xl">

      {users.map((u) => {
        const reports = u.report || [];

        return (
          <div
            key={u.email}
            className="p-4 bg-white rounded-2xl shadow-md border text-center"
          >
            <div className="flex items-center gap-4">
              <Image
                src={u.profileImg || "/BOT.png"}
                width={60}
                height={60}
                className="rounded-full"
                alt="Profile"
              />
              <div className="text-left">
                <h1 className="font-semibold">{(() => {
    const name = u.fullName || "";

    // if looks like token / placeholder email
    if (name.includes("@placeholder.local")) {
      return name
        .replace(/[^a-zA-Z]/g, "") // letters only
        .slice(0, 10);             // first 10 letters
    }

    // normal full name
    return name;
  })()}</h1>
                <p className="text-sm text-gray-600">{u.education}</p>
                <p className="text-xs text-gray-500">{(() => {
    const name = u.email || "";

    // if looks like token / placeholder email
    if (name.includes("@placeholder.local")) {
      return name
        .replace(/[^a-zA-Z]/g, "") // letters only
        .slice(0, 10);             // first 10 letters
    }

    // normal full name
    return name;
  })()}</p>
              </div>
            </div>

            <hr className="my-3" />

            <p className="text-sm text-gray-600">NUMBER OF ASSESSMENT</p>
            <p className="text-lg font-bold">{reports.length}</p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedUser(u);
                  setSelectedReport(reports[0]);
                  setIsReportOpen(true);
                }}
                className="flex-1 border rounded-lg py-1"
              >
                Report
              </button>

              <button
                onClick={() => {
                  setShowChart(!showChart);
                  fetchChartData(u.email);
                }}
                className="flex-1 bg-[#c3baf7] text-white rounded-lg"
              >
                Chart
              </button>

              <button
                onClick={() => {
                  setSelectedUser(u);
                  setNewFullName(u.fullName);
                  setNewDOB(u.DOB);
                  setNewEmail(u.email);
                  setNewMobileNo(u.mobileNo);
                  setNewEducation(u.education);
                  setNewAddress(u.address);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-purple-500 text-white rounded-lg flex items-center justify-center gap-1"
              >
                <Edit size={14} /> Edit
              </button>
            </div>
          </div>
        );
      })}

      {showChart && <Chart chartData={chartData} closeChart={() => setShowChart(false)} />}

      {selectedUser && (
        <EditPopup
          user={selectedUser}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          updateUserProfile={updateUserProfile}
          {...{
            newFullName,
            newDOB,
            newEmail,
            newEducation,
            newMobileNo,
            newAddress,
            setNewFullName,
            setNewDOB,
            setNewEmail,
            setNewEducation,
            setNewMobileNo,
            setNewAddress,
          }}
        />
      )}

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
