import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import {
  CreditCard,
  QrCode,
  Download,
  Copy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ExternalLink,
  Plus,
  Building2,
  ShieldCheck
} from "lucide-react";

export default function UserLinks() {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'pending'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingQRPDF, setIsGeneratingQRPDF] = useState(false);
  const router = useRouter();
  const qrRefs = useRef({});

  useEffect(() => {
    const adminStr = localStorage.getItem("admin");
    const token = localStorage.getItem("Admintoken");

    if (!adminStr || !token) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminStr);
      setAdmin(parsedAdmin);
      fetchUsers(parsedAdmin.collageName);
    } catch (e) {
      localStorage.clear();
      router.push("/admin/login");
    }
  }, [router]);

  const fetchUsers = async (collageName) => {
    try {
      const response = await fetch(
        `/api/admin/getAllUsers?collageName=${encodeURIComponent(collageName || "")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("Admintoken")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    toast.success("Permanent Login link copied to clipboard!");
  };

  // Helper for QR code image in PDF
  const getQRDataUrl = async (user) => {
    try {
      const wrapper = qrRefs.current[user._id || user.permanentLoginToken];
      if (wrapper) {
        const canvas = wrapper.querySelector("canvas");
        if (canvas) {
          return canvas.toDataURL("image/png");
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Single Page Student Card PDF
  const generateUserPDF = async (user, idx = 0) => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [75, 125],
      });

      const w = 75;
      const h = 125;
      const cX = w / 2;

      // Card background
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(2, 2, w - 4, h - 4, 3, 3, "F");

      // Top Header
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("MockMingle AI", cX, 12, { align: "center" });

      doc.setTextColor(112, 96, 231);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(user.collageName || admin?.collageName || "Student Access Pass", cX, 17, { align: "center" });

      // QR Code Block
      const qrY = 22;
      const qrS = 28;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(cX - qrS / 2 - 1, qrY - 1, qrS + 2, qrS + 2, 2, 2, "F");

      const qrImg = await getQRDataUrl(user);
      if (qrImg) {
        doc.addImage(qrImg, "PNG", cX - qrS / 2, qrY, qrS, qrS);
      }

      // Serial & Student Info
      const serial = `ID-${String(idx + 1).padStart(3, "0")}`;
      doc.setTextColor(112, 96, 231);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`Pass Code: ${serial}`, cX, qrY + qrS + 6, { align: "center" });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.text(user.fullName || "Registered Student", cX, qrY + qrS + 12, { align: "center" });

      // Step instructions
      const startY = 74;
      const left = 8;
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");

      doc.text("1. Scan QR code using smartphone camera or browser", left, startY);
      doc.text("2. Auto-authenticates instant student interview portal", left, startY + 6);
      doc.text("3. Complete AI Mock Interviews, Academic & Tech Tests", left, startY + 12);
      doc.text("4. Instant feedback and competency reports generated", left, startY + 18);

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.text("MockMingle Platform • www.mockmingle.in", cX, h - 6, { align: "center" });

      const fileName = `${(user.fullName || "Student").replace(/[^a-zA-Z0-9]/g, "-")}-ID-Card.pdf`;
      doc.save(fileName);
      toast.success("Student ID Card downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF card");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Bulk Multi-Page Cards PDF
  const generateAllUsersPDF = async () => {
    if (users.length === 0) {
      toast.warning("No students to export");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [75, 125],
      });

      const w = 75;
      const h = 125;
      const cX = w / 2;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (i > 0) doc.addPage();

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(2, 2, w - 4, h - 4, 3, 3, "F");

        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("MockMingle AI", cX, 12, { align: "center" });

        doc.setTextColor(112, 96, 231);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(user.collageName || admin?.collageName || "Student Access Pass", cX, 17, { align: "center" });

        const qrY = 22;
        const qrS = 28;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cX - qrS / 2 - 1, qrY - 1, qrS + 2, qrS + 2, 2, 2, "F");

        const qrImg = await getQRDataUrl(user);
        if (qrImg) {
          doc.addImage(qrImg, "PNG", cX - qrS / 2, qrY, qrS, qrS);
        }

        const serial = `ID-${String(i + 1).padStart(3, "0")}`;
        doc.setTextColor(112, 96, 231);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(`Pass Code: ${serial}`, cX, qrY + qrS + 6, { align: "center" });

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);
        doc.text(user.fullName || "Registered Student", cX, qrY + qrS + 12, { align: "center" });

        const startY = 74;
        const left = 8;
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");

        doc.text("1. Scan QR code using smartphone camera or browser", left, startY);
        doc.text("2. Auto-authenticates instant student interview portal", left, startY + 6);
        doc.text("3. Complete AI Mock Interviews, Academic & Tech Tests", left, startY + 12);
        doc.text("4. Instant feedback and competency reports generated", left, startY + 18);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(6);
        doc.text("MockMingle Platform • www.mockmingle.in", cX, h - 6, { align: "center" });
      }

      doc.save(`All-Student-ID-Cards-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success(`${users.length} ID Cards generated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate bulk cards");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Bulk QR Sheet PDF
  const generateAllUsersQRPDF = async () => {
    if (users.length === 0) {
      toast.warning("No users to export");
      return;
    }

    setIsGeneratingQRPDF(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${admin?.collageName || "Campus"} - QR Code Badge Sheet`, 15, 18);

      let x = 15;
      let y = 28;
      const size = 38;
      const gap = 12;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (y + size + 15 > 280) {
          doc.addPage();
          y = 20;
          x = 15;
        }

        doc.setDrawColor(220, 220, 220);
        doc.rect(x - 2, y - 2, size + 4, size + 12);

        const qrImg = await getQRDataUrl(user);
        if (qrImg) {
          doc.addImage(qrImg, "PNG", x, y, size, size);
        }

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(user.fullName || `Student ${i + 1}`, x + size / 2, y + size + 4, { align: "center" });
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text(`ID-${String(i + 1).padStart(3, "0")}`, x + size / 2, y + size + 8, { align: "center" });

        x += size + gap;
        if (x + size > 195) {
          x = 15;
          y += size + 18;
        }
      }

      doc.save(`QR-Print-Sheet-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("QR Code Print Sheet generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export QR sheet");
    } finally {
      setIsGeneratingQRPDF(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.permanentLoginToken && u.permanentLoginToken.toLowerCase().includes(q));

    const isPending = u.email && u.email.includes("@placeholder.local");
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !isPending) ||
      (statusFilter === "pending" && isPending);

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout
      title="Student ID & QR Passes"
      subtitle="Preview digital passes, generate high-resolution QR codes, and export printable student ID credentials"
      actionButton={
        <div className="flex items-center gap-2">
          <button
            onClick={generateAllUsersQRPDF}
            disabled={isGeneratingQRPDF || users.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">QR Print Sheet</span>
          </button>
          <button
            onClick={generateAllUsersPDF}
            disabled={isGeneratingPDF || users.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            <Download size={15} />
            <span>Download {users.length} Cards</span>
          </button>
        </div>
      }
    >
      <ToastContainer theme="light" position="top-right" />

      {/* Hidden QR Code Renderers for PDF generation */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {users.map((u) => (
          <div
            key={u._id || u.permanentLoginToken}
            ref={(el) => {
              if (el) qrRefs.current[u._id || u.permanentLoginToken] = el;
            }}
          >
            <QRCodeCanvas value={u.loginLink} size={250} level="H" bgColor="#ffffff" fgColor="#000000" />
          </div>
        ))}
      </div>

      {/* ================= STATS SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Total Generated Passes</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ECECFA] border border-purple-100 flex items-center justify-center text-[#6F24E8]">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Active Claimed Accounts</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {users.filter((u) => !u.email?.includes("@placeholder.local")).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold text-slate-500">Pending Registration</p>
            <h3 className="text-2xl font-extrabold text-amber-500 mt-1">
              {users.filter((u) => u.email?.includes("@placeholder.local")).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or link token..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7060E7]"
          >
            <option value="all">All Passes</option>
            <option value="active">Active Accounts</option>
            <option value="pending">Pending Claim</option>
          </select>
        </div>
      </div>

      {/* ================= LIVE CARD MOCKUP PREVIEWS (Top 3) ================= */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          Live Student Card Mockup Preview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredUsers.slice(0, 3).map((user, idx) => (
            <div
              key={user._id || idx}
              className="relative aspect-[1.6/1] bg-gradient-to-r from-[#7060E7] to-[#0AADD8] rounded-2xl p-6 shadow-md text-white flex flex-col justify-between overflow-hidden group hover:scale-[1.01] transition-all duration-200"
            >
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs">
                    MM
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm leading-tight">MockMingle AI</h4>
                    <p className="text-[10px] text-white/80 font-medium tracking-wide">STUDENT PASS</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  ID-{String(idx + 1).padStart(3, "0")}
                </span>
              </div>

              {/* Card Body: QR + Details */}
              <div className="flex items-center gap-4 my-2">
                <div className="p-1.5 bg-white rounded-xl shadow-md shrink-0">
                  <QRCodeCanvas value={user.loginLink} size={60} level="M" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-white/80">Student Name</p>
                  <p className="text-sm font-extrabold text-white truncate">{user.fullName || "Student Pass"}</p>
                  <p className="text-[10px] text-white/80 truncate mt-0.5">
                    {user.email?.includes("@placeholder.local") ? "Access Token Ready" : user.email}
                  </p>
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[10px] text-white/90">
                <span>{user.collageName || admin?.collageName || "Campus Verified"}</span>
                <span className="text-[#FFD54A] font-bold">Active Quota</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FULL TABLE OF USER PASSES ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">All Student Pass Links</h3>
            <p className="text-xs text-slate-500">Showing {filteredUsers.length} total records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Permanent Login Link</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Pass Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user, idx) => {
                const isPending = user.email?.includes("@placeholder.local");

                return (
                  <tr key={user._id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                          {(user.fullName || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.fullName || `Student #${idx + 1}`}</p>
                          <span className="text-xs text-slate-400 font-mono">ID-{String(idx + 1).padStart(3, "0")}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={12} />
                          Pending Claim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Active User
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="text-xs text-slate-700 truncate font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {user.loginLink}
                        </span>
                        <CopyToClipboard text={user.loginLink} onCopy={handleCopy}>
                          <button
                            className="p-1.5 text-slate-400 hover:text-[#6F24E8] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy Direct URL"
                          >
                            <Copy size={15} />
                          </button>
                        </CopyToClipboard>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => generateUserPDF(user, idx)}
                          disabled={isGeneratingPDF}
                          className="p-2 text-[#7060E7] hover:text-[#5848c9] hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download PDF Card"
                        >
                          <Download size={16} />
                        </button>
                        <a
                          href={user.loginLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Open Student Portal"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}