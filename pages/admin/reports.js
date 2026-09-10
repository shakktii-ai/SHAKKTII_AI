import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jsPDF } from "jspdf";
import {
  FileText,
  Search,
  Filter,
  Download,
  Award,
  Sparkles,
  BookOpen,
  Brain,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  X,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function AssessmentReports() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all"); // 'all', 'interview', 'academic', 'technical', 'psychometric'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchReports(category);
  }, [category, router]);

  const fetchReports = async (cat) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Admintoken");
      const res = await fetch(`/api/admin/getAllReportsList?category=${cat}&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      } else {
        toast.error("Failed to load reports");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading assessment reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(category);
  };

  // Generate PDF for selected report
  const downloadReportPDF = (rep) => {
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("MockMingle AI Assessment Report", 105, y, { align: "center" });

      y += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Evaluation Type: ${rep.reportType}`, 15, y);
      y += 7;
      doc.text(`Subject / Role: ${rep.subjectOrRole || rep.title}`, 15, y);
      y += 7;
      doc.text(`Student: ${rep.studentName} (${rep.studentEmail})`, 15, y);
      y += 7;
      doc.text(`Score: ${rep.score}`, 15, y);
      y += 7;
      doc.text(`Date: ${new Date(rep.date).toLocaleString()}`, 15, y);

      y += 12;
      doc.setLineWidth(0.5);
      doc.line(15, y, 195, y);
      y += 10;

      doc.setFont("helvetica", "bold");
      doc.text("Analysis & Feedback:", 15, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      const contentText = rep.reportAnalysis || rep.rawReport?.feedback || JSON.stringify(rep.rawReport?.results || "Assessment successfully evaluated by AI evaluation engine.", null, 2);
      const lines = doc.splitTextToSize(contentText.replace(/<[^>]*>/g, " "), 180);

      lines.forEach((line) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y);
        y += 6;
      });

      doc.save(`${rep.studentName.replace(/[^a-zA-Z0-9]/g, "_")}_${rep.reportType}_Report.pdf`);
      toast.success("Assessment report PDF downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report");
    }
  };

  const getScoreColor = (scorePercent) => {
    if (scorePercent >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (scorePercent >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <AdminLayout
      title="Assessment Reports Hub"
      subtitle="Central database of all student assessment submissions across all 4 evaluation engines"
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= CATEGORY TABS & FILTER HEADER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-8 shadow-sm space-y-6">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { id: "all", label: "All Evaluations", icon: Award },
            { id: "interview", label: "AI Mock Interviews", icon: Sparkles },
            { id: "academic", label: "Academic Tests", icon: BookOpen },
            { id: "technical", label: "Technical MCQs", icon: FileText },
            { id: "psychometric", label: "Psychometrics", icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Action Toolbar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by student name, email, subject, or role..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#6F24E8] hover:bg-[#5b1dc4] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            Search Reports
          </button>
        </form>

      </div>

      {/* ================= REPORTS TABLE / LIST ================= */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-3 border-[#7060E7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading assessment records...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <FileText size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reports match the criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try switching categories or clearing your search keywords.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Evaluated Assessments ({reports.length})
            </h3>
            <span className="text-xs font-bold text-slate-400">Sorted by Most Recent</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assessment Category</th>
                  <th className="px-6 py-4">Subject / Role</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {rep.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{rep.studentName}</p>
                          <p className="text-xs text-slate-500 font-mono">{rep.studentEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Report Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECECFA] text-[#6F24E8] border border-purple-200">
                        {rep.reportType}
                      </span>
                    </td>

                    {/* Subject / Role */}
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {rep.subjectOrRole}
                    </td>

                    {/* Score Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border ${getScoreColor(rep.scorePercent)}`}>
                        {rep.score}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(rep.date).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          className="p-2 text-[#7060E7] hover:text-[#5848c9] hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Assessment Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => downloadReportPDF(rep)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Download PDF Report"
                        >
                          <Download size={16} />
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

      {/* ================= DETAILED REPORT MODAL ================= */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F24E8]">
                  {selectedReport.reportType}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedReport.subjectOrRole}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: <strong className="text-slate-800">{selectedReport.studentName}</strong> • {new Date(selectedReport.date).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadReportPDF(selectedReport)}
                  className="p-2 text-[#7060E7] hover:text-[#5848c9] hover:bg-purple-50 rounded-xl transition-colors"
                  title="Download PDF"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
              
              {/* Score Highlight Box */}
              <div className="bg-gradient-to-r from-[#7060E7] to-[#0AADD8] rounded-2xl p-6 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs uppercase font-bold text-white/80">Calculated Evaluation Score</span>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{selectedReport.score}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                  <Award size={28} />
                </div>
              </div>

              {/* Assessment Analysis & Text Feedback */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#7060E7]" />
                  Full Evaluation Feedback
                </h4>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-72 overflow-y-auto custom-scrollbar">
                  {selectedReport.reportAnalysis ||
                    selectedReport.rawReport?.feedback ||
                    JSON.stringify(selectedReport.rawReport?.results || "Assessment evaluated with standard competency criteria.", null, 2)}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => downloadReportPDF(selectedReport)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
