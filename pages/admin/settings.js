import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../components/admin/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Settings,
  Building2,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  Globe,
  Save,
  CheckCircle2,
  KeyRound,
  Sliders,
  Sparkles,
  Award
} from "lucide-react";

export default function AdminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'security', 'preferences'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [collegeData, setCollegeData] = useState({
    collageName: "",
    email: "",
    contactPersonName: "",
    contactNumber: "",
    designation: "",
    department: "",
    address: "",
    website: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    defaultQuota: "2",
    allowSelfRegistration: true,
    emailAlertsOnCompletion: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("Admintoken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchCollegeProfile();
  }, [router]);

  const fetchCollegeProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Admintoken");
      const res = await fetch("/api/admin/updateCollegeProfile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && data.college) {
        setCollegeData({
          collageName: data.college.collageName || "",
          email: data.college.email || "",
          contactPersonName: data.college.contactPersonName || "",
          contactNumber: data.college.contactNumber || "",
          designation: data.college.designation || "",
          department: data.college.department || "",
          address: data.college.address || "",
          website: data.college.website || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("Admintoken");
      const res = await fetch("/api/admin/updateCollegeProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(collegeData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Institution profile updated successfully!");
        const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
        localStorage.setItem(
          "admin",
          JSON.stringify({ ...currentAdmin, ...collegeData })
        );
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Server connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("Admintoken");
      const res = await fetch("/api/admin/updateCollegeProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Administrator password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Password change failed");
      }
    } catch (err) {
      toast.error("Server connection error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Institution Settings & Profile"
      subtitle="Configure campus contact information, administrator security credentials, and interview quotas"
    >
      <ToastContainer theme="light" position="top-right" />

      {/* ================= HERO BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7060E7] via-[#5B4FE1] to-[#0AADD8] p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15 mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
            <Building2 size={14} className="text-yellow-300" />
            <span>Campus Configuration Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Institutional Settings & Controls
          </h2>
          <p className="text-sm text-purple-100 leading-relaxed font-medium">
            Manage your university contact credentials, change administrative login security, and calibrate campus assessment allocations.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ================= SETTINGS TABS ================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "profile", label: "Institution Profile", icon: Building2 },
            { id: "security", label: "Security & Credentials", icon: KeyRound },
            { id: "preferences", label: "Assessment Quotas", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: INSTITUTION PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Campus Information</h3>
              <p className="text-xs text-slate-500">Institutional identity displayed across student ID passes, QR credentials, and reports</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECECFA] border border-purple-200 flex items-center justify-center text-[#6F24E8]">
              <Building2 size={20} />
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">College / Institution Name</label>
                <input
                  type="text"
                  value={collegeData.collageName}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Campus identifier assigned during platform provisioning</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Institutional Email Address</label>
                <input
                  type="email"
                  value={collegeData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Contact Person Name</label>
                <input
                  type="text"
                  value={collegeData.contactPersonName}
                  onChange={(e) => setCollegeData({ ...collegeData, contactPersonName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Contact Phone Number</label>
                <input
                  type="text"
                  value={collegeData.contactNumber}
                  onChange={(e) => setCollegeData({ ...collegeData, contactNumber: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Designation</label>
                <input
                  type="text"
                  value={collegeData.designation}
                  onChange={(e) => setCollegeData({ ...collegeData, designation: e.target.value })}
                  placeholder="e.g. Head of Placement / Dean"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Department / Faculty</label>
                <input
                  type="text"
                  value={collegeData.department}
                  onChange={(e) => setCollegeData({ ...collegeData, department: e.target.value })}
                  placeholder="e.g. Training & Placement Cell"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Campus Physical Address</label>
              <input
                type="text"
                value={collegeData.address}
                onChange={(e) => setCollegeData({ ...collegeData, address: e.target.value })}
                placeholder="Ganeshkhind Road, Pune, Maharashtra 411007"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Official Website URL</label>
              <input
                type="url"
                value={collegeData.website}
                onChange={(e) => setCollegeData({ ...collegeData, website: e.target.value })}
                placeholder="https://www.college.edu.in"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save size={16} />
                <span>{saving ? "Saving Changes..." : "Save Campus Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 2: SECURITY & PASSWORD ================= */}
      {activeTab === "security" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl">
          <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Administrator Credentials</h3>
              <p className="text-xs text-slate-500">Update your administrative access password</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECECFA] border border-purple-200 flex items-center justify-center text-[#6F24E8]">
              <KeyRound size={20} />
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Minimum 6 characters with letters and numbers</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Lock size={16} />
                <span>{saving ? "Updating Password..." : "Change Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 3: ASSESSMENT QUOTAS ================= */}
      {activeTab === "preferences" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
          <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Default Assessment Quota Parameters</h3>
              <p className="text-xs text-slate-500">Control interview counts allocated when new student links are generated</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECECFA] border border-purple-200 flex items-center justify-center text-[#6F24E8]">
              <Sliders size={20} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Default Mock Interview Quota per Student
              </label>
              <select
                value={preferences.defaultQuota}
                onChange={(e) => {
                  setPreferences({ ...preferences, defaultQuota: e.target.value });
                  toast.success("Default quota updated");
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              >
                <option value="1">1 Free Assessment per link</option>
                <option value="2">2 Free Assessments (Standard Campus Quota)</option>
                <option value="3">3 Free Assessments</option>
                <option value="5">5 Free Assessments (Placement Drive Mode)</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Instant QR Direct Onboarding</h4>
                <p className="text-xs text-slate-500">Allow students scanning QR code to directly launch without OTP verification</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                Enabled
              </span>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
