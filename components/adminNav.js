import React from 'react'
import Link from 'next/link'

function AdminNav() {
  return (
    <aside className="w-96 bg-white shadow-lg p-6">
    <h1 className="text-3xl font-bold text-red-600 mb-6">SPPU</h1>
    <nav>
      <ul className="space-y-4">
        <li>
          <Link href="/admin" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            Dashboard Overview
          </Link>
        </li>
        <li>
          <Link href="/admin/studentProfiles" className="block  py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            Students Profiles
          </Link>
        </li>
        <li>
          <Link href="/admin/signup" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            Students Registration
          </Link>
        </li>
        {/* <li>
          <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            Query Management
          </Link>
        </li>
        <li>
          <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            Question Pattern Setting
          </Link>
        </li>
        <li>
          <Link href="#" className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-indigo-100">
            User Credential Management
          </Link>
        </li> */}
      </ul>
    </nav>
  </aside>
  
  )
}

export default AdminNav