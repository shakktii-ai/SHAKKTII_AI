import { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Link = dynamic(() => import('next/link'), {
  ssr: false, // Optional: if you want to skip SSR for links (usually not recommended for SEO but fits "lazy")
});

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

    if (!user?.collageName) return; // wait till user loads

    const collageName = user.collageName;
    // Example company name

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
  }, [user]); // Added 'user' to dependency array to ensure effect runs when user state is set

  return (
    <>
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 min-h-screen">

        {/* ===== Dashboard Header ===== */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of students activity and test performance
          </p>
        </div>

        {/* ===== Total Users Card ===== */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-indigo-800">
              Total Registered Students
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Overall student count in your college
            </p>
          </div>

          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">
              {totalUsers}
            </span>
          </div>
        </div>

        {/* ===== Stats Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">

          {/* Active Tests */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition">
            <h3 className="text-indigo-700 font-semibold mb-4">
              Active Tests
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-indigo-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-indigo-700">
                  {activeTests}
                </span>
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  Ongoing Exams
                </p>
                <p className="text-sm text-gray-500">
                  Currently active tests
                </p>
              </div>
            </div>
          </div>

          {/* Completed Tests */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition">
            <h3 className="text-indigo-700 font-semibold mb-4">
              Completed Tests
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-purple-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-purple-700">
                  {totalCompleteTest}
                </span>
              </div>

              <div>
                <p className="font-medium text-gray-700">
                  Tests Finished
                </p>
                <p className="text-sm text-gray-500">
                  Successfully completed exams
                </p>
              </div>
            </div>
          </div>

          {/* User Management */}
          <Link href="/admin/user-links">
            <div className="cursor-pointer bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-lg hover:scale-[1.02] transition group">
              <h3 className="text-indigo-700 font-semibold mb-4">
                User Management
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 transition">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    Manage Student Links
                  </p>
                  <p className="text-sm text-gray-500">
                    Control registration & access
                  </p>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </main>
    </>
  );
}