import React, { useState, useEffect } from "react";
import AdminNav from "../adminNav";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Search,
  Plus,
  UserCheck,
  ChevronRight,
  Sparkles,
  Building2
} from "lucide-react";

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("Admintoken");
      const adminStr = localStorage.getItem("admin");

      if (!token || !adminStr) {
        router.push("/admin/login");
        return;
      }

      setAdmin(JSON.parse(adminStr));
    } catch (e) {
      console.error(e);
      router.push("/admin/login");
    }
  }, [router]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/studentProfiles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fd] font-sans text-slate-900 overflow-x-hidden selection:bg-[#7060E7] selection:text-white">
      {/* Sidebar Navigation */}
      <AdminNav />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fd]">
        
        {/* ================= TOP APP BAR ================= */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-sm">
          
          {/* Breadcrumb / Title Context */}
          <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
            <span className="font-bold text-[#6F24E8]">Admin</span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-800 truncate">
              {title || "Dashboard"}
            </span>
          </div>

          {/* Center Search Bar */}
          <form onSubmit={handleGlobalSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email or ID..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all shadow-inner"
              />
            </div>
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Action button if provided */}
            {actionButton ? (
              actionButton
            ) : (
              <Link
                href="/admin/signup"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Batch User Generator</span>
                <span className="sm:hidden">Generate</span>
              </Link>
            )}

            {/* View College Roster Quick Link */}
            <Link
              href="/admin/studentProfiles"
              className="p-2 text-slate-500 hover:text-[#6F24E8] hover:bg-[#ECECFA] rounded-xl transition-all"
              title="Student Profiles"
            >
              <UserCheck size={18} />
            </Link>

            {/* Institution Badge Pill */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-[#ECECFA] border border-purple-200 flex items-center justify-center text-[#6F24E8] font-bold text-xs shadow-sm">
                {(admin?.collageName || "C").charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {admin?.collageName || "Campus Admin"}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Center</span>
              </div>
            </div>

          </div>
        </header>

        {/* ================= MAIN CONTENT BODY ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
