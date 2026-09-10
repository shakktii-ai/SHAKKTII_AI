import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Award,
  BookOpen,
  Brain,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Table as TableIcon,
  ChevronRight,
  UserCheck,
  Plus
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentProfiles() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collageName, setCollageName] = useState("");

  // Filters and views
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'completed', 'pending'
  const [sortBy, setSortBy] = useState("latest"); // 'latest', 'name', 'reports'

  // Selected student for detailed assessment dossier
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [studentDossier, setStudentDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("interviews"); // 'interviews', 'academic', 'technical', 'psychometric'

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    mobileNo: "",
    DOB: "",
    education: "",
    address: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    const adminStr = localStorage.getItem("admin");

    if (!token || !adminStr) {
      router.push("/admin/login");
      return;
    }

    try {
      const admin = JSON.parse(adminStr);
      setCollageName(admin.collageName);
      fetchStudents(admin.collageName);
    } catch (err) {
      router.push("/admin/login");
    }
  }, [router]);

  // Handle search query from query params
  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search);
    }
  }, [router.query]);

  const fetchStudents = async (college) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/editStudentProfile?collageName=${encodeURIComponent(college)}`);
      const data = await res.json();

      if (data.users?.length) {
        const emails = data.users.map((u) => u.email).filter(Boolean);

        let reportsMap = {};
        try {
          const reportRes = await fetch(
            `${process.env.NEXT_PUBLIC_HOST || ""}/api/saveAndGetReport?emails=${JSON.stringify(emails)}`
          );
          const reportData = await reportRes.json();
          reportsMap = reportData.reports || {};
        } catch (e) {
          console.error("Error fetching reports map:", e);
        }

        const merged = data.users.map((u) => ({
          ...u,
          report: reportsMap[u.email] || [],
        }));

        setUsers(merged);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      toast.error("Failed to load student profiles");
    } finally {
      setLoading(false);
    }
  };

  /* Open Comprehensive Student Dossier Drawer */
  const openStudentDossier = async (email) => {
    setSelectedStudentEmail(email);
    setDossierLoading(true);
    setActiveTab("interviews");

    try {
      const token = localStorage.getItem("Admintoken");
      const res = await fetch(`/api/admin/getStudentFullProfile?email=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setStudentDossier(data);
      } else {
        toast.error("Failed to fetch full assessment records");
      }
    } catch (err) {
      console.error("Dossier fetch error:", err);
      toast.error("Error fetching student details");
    } finally {
      setDossierLoading(false);
    }
  };

  /* Open Edit Modal */
  const openEditModal = (user) => {
    setEditUser(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      mobileNo: user.mobileNo || "",
      DOB: user.DOB || "",
      education: user.education || "",
      address: user.address || "",
    });
    setIsEditOpen(true);
  };

  /* Save Edit Profile */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/editStudentProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editUser.email,
          updatedData: editFormData,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.email === editUser.email ? { ...u, ...editFormData } : u
          )
        );
        toast.success("Student profile updated successfully");
        setIsEditOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Server error updating profile");
    }
  };

  /* CSV Export Function */
  const handleExportCSV = () => {
    if (users.length === 0) {
      toast.warning("No students to export");
      return;
    }

    const headers = ["Full Name", "Email", "Mobile", "Education", "Joined Date", "Completed Assessments"];
    const rows = users.map((u) => [
      `"${u.fullName || "N/A"}"`,
      `"${u.email || "N/A"}"`,
      `"${u.mobileNo || "N/A"}"`,
      `"${u.education || "N/A"}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}"`,
      u.report?.length || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_roster_${collageName || "campus"}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Student roster CSV downloaded");
  };

  /* Filtered and Sorted Students */
  const filteredUsers = users
    .filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (user.fullName && user.fullName.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.education && user.education.toLowerCase().includes(q)) ||
        (user.mobileNo && user.mobileNo.includes(q));

      const isCompleted = user.report && user.report.length > 0;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && isCompleted) ||
        (statusFilter === "pending" && !isCompleted);

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      }
      if (sortBy === "reports") {
        return (b.report?.length || 0) - (a.report?.length || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <AdminLayout
      title="Student Directory & Profiles"
      subtitle="Comprehensive roster, individual assessment dossier, and performance records"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => router.push("/admin/signup")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create Students</span>
          </button>
        </div>
      }
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= CONTROLS & FILTER BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, education..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Filter Badges & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7060E7] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Evaluated / Completed</option>
            <option value="pending">Pending Assessment</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7060E7] cursor-pointer"
          >
            <option value="latest">Sort: Latest Joined</option>
            <option value="name">Sort: Student Name</option>
            <option value="reports">Sort: Assessments Count</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-white text-[#7060E7] shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={17} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table" ? "bg-white text-[#7060E7] shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Dense Table View"
            >
              <TableIcon size={17} />
            </button>
          </div>

        </div>
      </div>

      {/* ================= STUDENT LISTING ================= */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-3 border-[#7060E7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading student roster...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <Users size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or generate new student access links in Batch User Generator.
          </p>
          <button
            onClick={() => router.push("/admin/signup")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#6F24E8] hover:bg-[#5b1dc4] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            Generate Access Links
          </button>
        </div>
      ) : viewMode === "grid" ? (
        
        /* ===== CARD GRID VIEW ===== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((student) => {
            const hasReports = student.report && student.report.length > 0;
            const isPlaceholder = student.email && student.email.includes("@placeholder.local");

            return (
              <div
                key={student.email || student._id}
                className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Card Header & Avatar */}
                <div className="p-6 pb-4 flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-0.5 shadow-sm">
                      <div className="bg-white rounded-[14px] w-full h-full overflow-hidden flex items-center justify-center font-bold text-[#6F24E8] text-lg">
                        {student.profileImg ? (
                          <Image
                            src={student.profileImg}
                            width={56}
                            height={56}
                            alt="Avatar"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          (student.fullName || "S").charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    {/* Status Dot */}
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        hasReports ? "bg-emerald-500" : isPlaceholder ? "bg-amber-500" : "bg-[#7060E7]"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#6F24E8] transition-colors">
                      {student.fullName || (isPlaceholder ? "Registered Access Link" : "Student User")}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mb-2">
                      {student.education || "General Student"}
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 max-w-full text-xs text-slate-600 font-medium truncate">
                      <Mail size={12} className="text-[#7060E7] shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="px-6 py-3 mx-6 my-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-purple-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluations</span>
                      <span className="font-bold text-slate-800">{student.report?.length || 0} Reports</span>
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200" />

                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-600" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Joined</span>
                      <span className="font-bold text-slate-800">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 pt-3 mt-auto grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => openStudentDossier(student.email)}
                    className="col-span-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <BarChart3 size={15} />
                    View Dossier
                  </button>

                  <button
                    onClick={() => openEditModal(student)}
                    className="col-span-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    Edit Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        
        /* ===== DENSE TABLE VIEW ===== */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Education / Batch</th>
                  <th className="px-6 py-4">Assessments</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((student) => (
                  <tr key={student.email || student._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {(student.fullName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{student.fullName || "Student"}</p>
                          <p className="text-xs text-slate-500">{student.mobileNo || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                      {student.education || "General"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECECFA] text-[#6F24E8] border border-purple-200">
                        <Award size={13} />
                        {student.report?.length || 0} Reports
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStudentDossier(student.email)}
                          className="p-2 text-[#7060E7] hover:text-[#5848c9] hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Assessment Dossier"
                        >
                          <BarChart3 size={17} />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= STUDENT ASSESSMENT DOSSIER DRAWER / MODAL ================= */}
      {selectedStudentEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-0.5 shadow-md">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-[#6F24E8] text-lg">
                    {(studentDossier?.student?.fullName || "S").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {studentDossier?.student?.fullName || selectedStudentEmail}
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{studentDossier?.student?.education || "Student"}</span>
                    <span>•</span>
                    <span className="text-[#6F24E8] font-mono">{selectedStudentEmail}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentEmail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
              {dossierLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-2 border-[#7060E7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-semibold">Aggregating assessment history across all engines...</p>
                </div>
              ) : (
                <>
                  {/* Category Tabs */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
                    {[
                      { id: "interviews", label: "AI Mock Interviews", count: studentDossier?.assessments?.mockInterviews?.length || 0, icon: Sparkles },
                      { id: "academic", label: "Academic Tests", count: studentDossier?.assessments?.academicTests?.length || 0, icon: BookOpen },
                      { id: "technical", label: "Technical MCQs", count: studentDossier?.assessments?.technicalTests?.length || 0, icon: Award },
                      { id: "psychometric", label: "Psychometrics", count: studentDossier?.assessments?.psychometric?.length || 0, icon: Brain },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === tab.id
                              ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <Icon size={15} />
                          <span>{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB 1: AI Mock Interviews */}
                  {activeTab === "interviews" && (
                    <div className="space-y-4">
                      {studentDossier?.assessments?.mockInterviews?.length > 0 ? (
                        studentDossier.assessments.mockInterviews.map((item, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F24E8]">Mock Interview</span>
                                <h3 className="text-base font-bold text-slate-900">{item.role || "Job Interview Evaluation"}</h3>
                                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-extrabold text-emerald-600">{item.parsedScores?.overall || 80}%</span>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Overall Score</span>
                              </div>
                            </div>

                            {/* Competency Meter */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                              {[
                                { label: "Technical", score: item.parsedScores?.technical || 7 },
                                { label: "Communication", score: item.parsedScores?.communication || 8 },
                                { label: "Decision Making", score: item.parsedScores?.decisionMaking || 7 },
                                { label: "Confidence", score: item.parsedScores?.confidence || 8 },
                                { label: "Fluency", score: item.parsedScores?.fluency || 8 },
                              ].map((c, i) => (
                                <div key={i} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-200">
                                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">{c.label}</span>
                                  <span className="text-sm font-extrabold text-slate-900">{c.score} / 10</span>
                                </div>
                              ))}
                            </div>

                            {/* Analysis Extract */}
                            {item.reportAnalysis && (
                              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar border border-slate-200">
                                <p className="font-bold text-slate-900 mb-1">AI Evaluation Analysis:</p>
                                <p className="whitespace-pre-line">{item.reportAnalysis.slice(0, 500)}...</p>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-600">No AI Mock Interviews taken yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Academic Tests */}
                  {activeTab === "academic" && (
                    <div className="space-y-4">
                      {studentDossier?.assessments?.academicTests?.length > 0 ? (
                        studentDossier.assessments.academicTests.map((item, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7060E7]">Academic Assessment</span>
                                <h3 className="text-base font-bold text-slate-900">{item.subject || "Subject Test"} ({item.stream || "General"})</h3>
                                <p className="text-xs text-slate-500">{new Date(item.completedAt || item.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-extrabold text-[#7060E7]">{item.overallScore || 0}%</span>
                                <span className="text-[10px] text-amber-500 font-bold block">{"★".repeat(item.stars || 4)}</span>
                              </div>
                            </div>
                            {item.feedback && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">{item.feedback}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-600">No Academic Tests taken yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Technical MCQs */}
                  {activeTab === "technical" && (
                    <div className="space-y-4">
                      {studentDossier?.assessments?.technicalTests?.length > 0 ? (
                        studentDossier.assessments.technicalTests.map((item, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Technical Test</span>
                                <h3 className="text-base font-bold text-slate-900">{item.subject || "Technical Subject"}</h3>
                                <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-extrabold text-blue-600">
                                  {item.percentage || (item.score && item.totalQuestions ? Math.round((item.score / item.totalQuestions) * 100) : 0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-600">No Technical MCQs taken yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Psychometrics */}
                  {activeTab === "psychometric" && (
                    <div className="space-y-4">
                      {studentDossier?.assessments?.psychometric?.length > 0 ? (
                        studentDossier.assessments.psychometric.map((item, idx) => (
                          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                            <h3 className="text-base font-bold text-slate-900">Behavioral & Psychometric Profile</h3>
                            <p className="text-xs text-slate-500">{new Date(item.completedAt || item.createdAt).toLocaleString()}</p>
                            {item.results?.careerPathRecommendations && (
                              <div className="mt-3">
                                <span className="text-xs font-bold text-[#6F24E8] block mb-1">Recommended Career Pathways:</span>
                                <div className="flex flex-wrap gap-2">
                                  {item.results.careerPathRecommendations.map((career, cIdx) => (
                                    <span key={cIdx} className="px-3 py-1 bg-[#ECECFA] text-[#6F24E8] text-xs font-semibold rounded-lg border border-purple-200">
                                      {career}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                          <p className="text-sm font-semibold text-slate-600">No Psychometric evaluations recorded yet.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ================= EDIT STUDENT PROFILE MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Edit Student Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Education / Stream</label>
                <input
                  type="text"
                  value={editFormData.education}
                  onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editFormData.mobileNo}
                    onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editFormData.DOB}
                    onChange={(e) => setEditFormData({ ...editFormData, DOB: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
