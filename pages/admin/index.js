import { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Index() {
  const router = useRouter();
  // State to hold the active test count, loading state, and total users
  const [activeTests, setActiveTests] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalCompleteTest, setTotalCompleteTest] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    const adminString = localStorage.getItem("admin");

    if (!token || !adminString) {
      // Admin not logged in → redirect to login
      router.push("/admin/login");
    } else {
      try {
        const userFromStorage = JSON.parse(adminString);
        setUser({ ...userFromStorage, role: "admin" }); // add role for consistency
      } catch (err) {
        console.error("Failed to parse admin data:", err);
        localStorage.removeItem("Admintoken");
        localStorage.removeItem("admin");
        router.push("/admin/login");
      }
    }
  }, [router]);

  useEffect(() => {
    const collageName = 'SPPU'; // Example company name

    const fetchActiveTests = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/isActive?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const collageData = data[0];
        if (collageData && collageData.isActive !== undefined) {
          return collageData.isActive;
        }
      }
      return 0; // Default value in case of error
    };

    const fetchTotalUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/totalUsers?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalUsers !== undefined) {
          return data.totalUsers;
        }
      }
      return 0; // Default value in case of error
    };

    const fetchCompletedTestReports = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/getReportByCollageName?collageName=${collageName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reports && Array.isArray(data.reports)) {
          return data.reports.length;
        }
      }
      return 0; // Default value in case of error
    };

    // Fetch all data concurrently
    const fetchData = async () => {
      try {
        const [activeTestsData, totalUsersData, completedTestData] = await Promise.all([
          fetchActiveTests(),
          fetchTotalUsers(),
          fetchCompletedTestReports(),
        ]);

        // Set the state once all data is fetched
        setActiveTests(activeTestsData);
        setTotalUsers(totalUsersData);
        setTotalCompleteTest(completedTestData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveTests(0);
        setTotalUsers(0);
        setTotalCompleteTest(0);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <main className="flex-1 p-8 bg-[#6c57ec] bg-opacity-20 m-20 rounded-xl">
        <div className="bg-white text-center flex items-center justify-around gap-4 p-4 rounded-lg">
          <div>
            <h2 className="text-4xl font-bold text-purple-700">Total User</h2>
            <h2 className="text-xl">Number of registered Students</h2>
          </div>
          <div className='bg-purple-200 p-5 rounded-full'>
            <p className="text-center rounded-lg text-4xl text-purple-700 font-bold">{totalUsers}</p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white mt-20 rounded-xl p-4">
          {/* Existing cards */}
          <div className="m-2">
            <h2 className="text-purple-700 font-bold text-lg">Active Tests</h2>
            <div className="bg-purple-200 rounded-2xl p-4 w-full shadow-md">
              <div className="flex items-center gap-4 mt-3">
                <div className="w-20 h-16">
                  <h2 className="text-center mt-2 text-4xl text-purple-700 font-bold">
                    {activeTests}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Active Test</p>
                  <p className="text-purple-600 text-sm">Ongoing tests being attempted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="m-2">
            <h2 className="text-purple-700 font-bold text-lg">Completed Tests</h2>
            <div className="bg-purple-200 rounded-2xl p-4 w-full shadow-md">
              <div className="flex items-center gap-4 mt-3">
                <div className="w-20 h-16">
                  <h2 className="text-center mt-2 text-4xl text-purple-700 font-bold">
                    {totalCompleteTest}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Completed Tests</p>
                  <p className="text-purple-600 text-sm">Total tests completed so far</p>
                </div>
              </div>
            </div>
          </div>

          {/* New User Links Card */}
          <div className="m-2">
            <h2 className="text-purple-700 font-bold text-lg">User Management</h2>
            <Link href="/admin/user-links">
              <div className="bg-purple-200 rounded-2xl p-4 w-full shadow-md cursor-pointer hover:bg-purple-300 transition-colors">
                <div className="flex items-center gap-4 mt-3">
                  <div className="w-20 h-16 flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold">Manage User Links</p>
                    <p className="text-purple-600 text-sm">View and manage all user signup links</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
