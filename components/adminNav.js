// import React from 'react'
// import Link from 'next/link'
// import Image from 'next/image'

// function AdminNav() {
//   return (
//     <aside className="w-96 bg-[#dee1f8] shadow-lg p-6">
//     <Image src="/image.png" alt="Logo" width={100} height={100} />
//     <nav>
//       <ul className="space-y-4">
//         <li>
//           <Link href="/admin" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             Dashboard Overview
//           </Link>
//         </li>
//         <li>
//           <Link href="/admin/studentProfiles" className="block  py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             Students Profiles
//           </Link>
//         </li>
//         <li>
//           <Link href="/admin/signup" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             Students Registration
//           </Link>
//         </li>
//         {/* <li>
//           <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             Query Management
//           </Link>
//         </li>
//         <li>
//           <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             Question Pattern Setting
//           </Link>
//         </li>
//         <li>
//           <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
//             User Credential Management
//           </Link>
//         </li> */}
//       </ul>
//     </nav>
//   </aside>
  
//   )
// }

// export default AdminNav

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LayoutDashboard, Users, UserPlus } from "lucide-react"

const navItems = [
  { 
    name: "Dashboard Overview", 
    link: "/admin", 
    icon: LayoutDashboard 
  },
  { 
    name: "Students Profiles", 
    link: "/admin/studentProfiles", 
    icon: Users 
  },
  { 
    name: "Students Registration", 
    link: "/admin/signup", 
    icon: UserPlus 
  },
]

export default function AdminNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between shadow-sm transition-all">
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative overflow-hidden rounded-lg shadow-sm border border-slate-100">
            <Image
              src="/image.png"
              alt="Logo"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">
            SHAKTI AI
          </span>
        </div>

        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all active:scale-95 focus:outline-none"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </header>

      {/* Spacer to prevent content overlap on mobile */}
      <div className="md:hidden h-16" />

      {/* ================= MOBILE OVERLAY ================= */}
      <div
        className={`
          fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-[70] h-full w-[280px] md:w-72 
          bg-white border-r border-slate-200 shadow-2xl md:shadow-none
          transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          md:translate-x-0 md:static md:h-screen flex flex-col shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 mb-2">
          <div className="flex items-center gap-3">
            <Image
              src="/image.png"
              alt="Logo"
              width={200}
              height={200}
              className="rounded-xl bg-black shadow-sm border border-slate-100"
            />
            <div className="flex flex-col">
              {/* <span className="font-bold text-slate-800 text-lg leading-none">SHAKTI AI</span>
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Admin Panel</span> */}
            </div>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
          <p className="px-4 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.link}
                    onClick={() => setOpen(false)}
                    className="
                      group flex items-center gap-3 px-4 py-3 rounded-xl
                      text-sm font-medium text-slate-600
                      transition-all duration-200 ease-in-out
                      hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm
                      active:bg-indigo-100
                    "
                  >
                    {/* Icon with hover effect */}
                    <Icon 
                      size={20} 
                      className="text-slate-400 group-hover:text-indigo-600 transition-colors duration-200" 
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>
    </>
  )
}