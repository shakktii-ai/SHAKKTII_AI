import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserPlus,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export const navItems = [
  {
    name: "Dashboard Overview",
    link: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Students Profiles",
    link: "/admin/studentProfiles",
    icon: Users,
    badge: null,
  },
  {
    name: "Student ID & QR Passes",
    link: "/admin/user-links",
    icon: CreditCard,
    badge: "ID Print",
  },
  {
    name: "Batch User Generator",
    link: "/admin/signup",
    icon: UserPlus,
    badge: "Instant",
  },
  {
    name: "Assessment Reports",
    link: "/admin/reports",
    icon: FileText,
    badge: "4 Engines",
  },
  {
    name: "Cohort Analytics",
    link: "/admin/analytics",
    icon: BarChart3,
    badge: "AI Insights",
  },
  {
    name: "Curriculum & Tests",
    link: "/admin/assessments",
    icon: BookOpen,
    badge: null,
  },
  {
    name: "Institution Settings",
    link: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const adminStr = localStorage.getItem("admin");
      if (adminStr) {
        setAdmin(JSON.parse(adminStr));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Admintoken");
    localStorage.removeItem("admin");
    setOpen(false);
    router.push("/admin/login");
  };

  const isActive = (pathname) => {
    if (pathname === "/admin") {
      return router.pathname === "/admin";
    }
    return router.pathname.startsWith(pathname);
  };

  return (
    <>
      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
              <Image
                src="/MM_LOGO1.png"
                alt="Logo"
                width={28}
                height={28}
                className="object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
                MockMingle
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#ECECFA] text-[#6F24E8] border border-purple-200 rounded-full font-bold">
                ADMIN
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
              {admin?.collageName || "Campus Portal"}
            </span>
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="p-2 text-slate-600 hover:text-[#6F24E8] hover:bg-[#ECECFA] rounded-xl transition-all active:scale-95 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Spacer */}
      <div className="lg:hidden h-16" />

      {/* ================= MOBILE OVERLAY ================= */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-[70] h-full w-[290px] lg:w-[280px]
          bg-white border-r border-slate-200 text-slate-700 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:h-screen flex flex-col shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center p-1">
                <Image
                  src="/MM_LOGO1.png"
                  alt="Logo"
                  width={30}
                  height={30}
                  className="object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
                  MockMingle
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#ECECFA] text-[#6F24E8] font-bold border border-purple-200">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Campus Portal Suite
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* College Profile Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-2xl bg-[#ECECFA]/70 border border-purple-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#6F24E8] shadow-sm shrink-0">
            <Building2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-purple-600">Institution</p>
            <p className="text-sm font-bold text-slate-800 truncate">{admin?.collageName || "Campus Center"}</p>
          </div>
          <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1 custom-scrollbar">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Management
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.link);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.link}
                    onClick={() => setOpen(false)}
                    className={`
                      group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                      text-sm font-semibold transition-all duration-200
                      ${
                        active
                          ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20 font-bold"
                          : "text-slate-600 hover:bg-[#ECECFA] hover:text-[#6F24E8] active:bg-purple-100"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        active ? "text-white" : "text-slate-400 group-hover:text-[#6F24E8]"
                      }`}
                    />

                    <span className="flex-1 truncate">{item.name}</span>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          active
                            ? "bg-white/25 text-white"
                            : "bg-[#ECECFA] text-[#6F24E8] border border-purple-200 group-hover:bg-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {!item.badge && active && (
                      <ChevronRight size={15} className="text-white/80 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#7060E7] to-[#0AADD8] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {(admin?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{admin?.email || "admin@campus.edu"}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Verified Active
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut size={16} />
            Sign Out Admin
          </button>
        </div>
      </aside>
    </>
  );
}