import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  UserPlus,
  Sparkles,
  Copy,
  Download,
  CheckCircle2,
  Zap,
  Building2,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function BatchSignup() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [count, setCount] = useState("10");
  const [interviewQuota, setInterviewQuota] = useState("2");
  const [batchLabel, setBatchLabel] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    const userFromStorage = localStorage.getItem("admin");

    if (!token || !userFromStorage) {
      router.push("/admin/login");
      return;
    }

    try {
      const parsedAdmin = JSON.parse(userFromStorage);
      setAdmin(parsedAdmin);
    } catch (e) {
      router.push("/admin/login");
    }
  }, [router]);

  const handleGenerateBatch = async () => {
    const num = parseInt(count, 10);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid count greater than 0");
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/admin/batchCreateUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("Admintoken")}`,
        },
        body: JSON.stringify({
          count: num,
          interviewQuota: parseInt(interviewQuota, 10) || 2,
          batchLabel: batchLabel.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.links) {
        setGeneratedLinks((prev) => [...data.links, ...prev]);
        toast.success(`Successfully provisioned ${data.count} student access links!`);
      } else {
        toast.error(data.message || "Failed to generate batch links");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (generatedLinks.length === 0) return;
    const allText = generatedLinks.map((item, idx) => `Student #${idx + 1}: ${item.loginLink}`).join("\n");
    navigator.clipboard.writeText(allText);
    toast.success(`Copied all ${generatedLinks.length} links to clipboard!`);
  };

  const handleDownloadCSV = () => {
    if (generatedLinks.length === 0) return;

    const headers = ["ID", "Permanent Login URL", "Placeholder Email", "Interview Quota", "Created At"];
    const rows = generatedLinks.map((item, idx) => [
      `"Student #${idx + 1}"`,
      `"${item.loginLink}"`,
      `"${item.email}"`,
      item.interviewQuota || 2,
      `"${new Date(item.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch_generated_links_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  return (
    <AdminLayout
      title="Batch User Generator"
      subtitle="Instantly generate multiple permanent student onboarding links with custom interview quotas"
      actionButton={
        generatedLinks.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <Copy size={15} />
              <span>Copy All ({generatedLinks.length})</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all"
            >
              <Download size={15} />
              <span>Download CSV</span>
            </button>
          </div>
        )
      }
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= GENERATOR CONFIGURATION CARD ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECECFA] text-[#6F24E8] text-xs font-bold mb-4 border border-purple-200">
            <Zap size={14} className="text-amber-500" />
            Instant Batch Provisioning
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Generate Student <span className="bg-gradient-to-r from-[#7060E7] to-[#0AADD8] bg-clip-text text-transparent">Onboarding Passes</span>
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Create pre-authenticated permanent login links in a single step. Students can click or scan their unique link to immediately begin AI Mock Interviews without needing email sign-ups.
          </p>

          {/* Preset Buttons */}
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Quick Presets
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {["5", "10", "25", "50", "100"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCount(preset)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    count === preset
                      ? "bg-[#6F24E8] text-white shadow-md shadow-purple-500/30 scale-105"
                      : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {preset} Accounts
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Number of Links
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Default Interview Quota
              </label>
              <select
                value={interviewQuota}
                onChange={(e) => setInterviewQuota(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              >
                <option value="1">1 Free Mock Interview</option>
                <option value="2">2 Free Mock Interviews (Standard)</option>
                <option value="3">3 Free Mock Interviews</option>
                <option value="5">5 Free Mock Interviews (Placement Drive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Batch / Stream Tag (Optional)
              </label>
              <input
                type="text"
                value={batchLabel}
                onChange={(e) => setBatchLabel(e.target.value)}
                placeholder="e.g. B.Tech 2026 / CSE"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>
          </div>

          {/* Submit Generator Button */}
          <button
            onClick={handleGenerateBatch}
            disabled={isGenerating}
            className={`
              px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2
              ${
                isGenerating
                  ? "bg-[#6F24E8]/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-purple-500/20"
              }
            `}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Generating {count} User Tokens...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Provision {count} Student Access Links</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= GENERATED LINKS TABLE ================= */}
      {generatedLinks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Newly Provisioned Student Links ({generatedLinks.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ready for instant student onboarding and distribution</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Copy size={14} />
                Copy All
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">Permanent Login Link</th>
                  <th className="px-6 py-3.5">Quota</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {generatedLinks.map((linkItem, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 font-mono">
                      #{idx + 1}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-purple-700 font-mono bg-[#ECECFA] px-3 py-1 rounded-lg border border-purple-200 truncate max-w-md">
                          {linkItem.loginLink}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-emerald-600 font-semibold">
                      {linkItem.interviewQuota || 2} Interviews
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CopyToClipboard
                          text={linkItem.loginLink}
                          onCopy={() => toast.success(`Link #${idx + 1} copied!`)}
                        >
                          <button
                            className="p-1.5 text-slate-400 hover:text-[#6F24E8] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy Link"
                          >
                            <Copy size={15} />
                          </button>
                        </CopyToClipboard>
                        <a
                          href={linkItem.loginLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Open Link in New Tab"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
