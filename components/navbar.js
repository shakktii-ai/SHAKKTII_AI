// // // components/Navbar.js
// // import Image from "next/image";
// // import Link from "next/link";

// // export default function Navbar() {
// //   return (
// //     <nav className="bg-[#795E7F] text-white px-6 py-3 flex items-center justify-between">
// //       <div className="flex items-center ">
// //   <Image src="/MM_LOGO.svg" alt="Logo" width={100} height={100} />
// //   <span className="text-2xl font-itim">MockMingle</span>
// // </div>

// //       <div className="flex items-center space-x-6">
// //         <Link href="#" className="hover:text-black">
// //           Home
// //         </Link>
// //         <Link href="#" className="hover:text-black">
// //           Features
// //         </Link>
// //         <Link href="#" className="hover:text-black">
// //           Pricing
// //         </Link>
// //         <Link href="#" className="hover:text-black">
// //           Contact
// //         </Link>
// //         <button className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition">
// //           Log in
// //         </button>
// //       </div>
// //     </nav>
// //   );
// // }


// // components/Navbar.js

// // import { useState } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { Menu, X } from "lucide-react";

// // export default function Navbar({ Logout, user }) {
// //   const [isOpen, setIsOpen] = useState(false);

// //   return (
// //     <nav className="bg-[#795E7F] text-white px-6 py-3">
// //       <div className="flex items-center justify-between">
// //         {/* Logo */}
// //         <div className="flex items-center ">
// //           <Image src="/MM_LOGO.svg" alt="Logo" width={100} height={100} />
// //           <span className="text-2xl font-itim">MockMingle</span>
// //         </div>

// //         {/* Desktop Menu */}
// //         <div className="hidden md:flex items-center space-x-6">
// //           <Link href="#" className="hover:text-black">Home</Link>
// //           <Link href="#" className="hover:text-black">Features</Link>
// //           <Link href="#" className="hover:text-black">Pricing</Link>
// //           <Link href="#" className="hover:text-black">Contact</Link>
// //           <button className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition">
// //             Log in
// //           </button>
// //         </div>

// //         {/* Hamburger Icon */}
// //         <button
// //           onClick={() => setIsOpen(!isOpen)}
// //           className="md:hidden focus:outline-none"
// //         >
// //           {isOpen ? <X size={28} /> : <Menu size={28} />}
// //         </button>
// //       </div>

// //       {/* Mobile Menu */}
// //       {isOpen && (
// //         <div className="md:hidden mt-3 space-y-2 flex flex-col items-start">
// //           <Link href="#" className="hover:text-black">Home</Link>
// //           <Link href="#" className="hover:text-black">Features</Link>
// //           <Link href="#" className="hover:text-black">Pricing</Link>
// //           <Link href="#" className="hover:text-black">Contact</Link>
// //           <button className="mt-2 border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition">
// //             Log in
// //           </button>
// //         </div>
// //       )}
// //     </nav>
// //   );
// // }


// // import { useState } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { Menu, X } from "lucide-react";

// // export default function Navbar({ Logout, user }) {
// //   const [isOpen, setIsOpen] = useState(false);

// //   return (
// //     <nav className="bg-[#795E7F] text-white px-6 py-3">
// //       <div className="flex items-center justify-between">
// //         {/* Logo */}
// //         <div className="flex items-center space-x-2">
// //           <Image src="/MM_LOGO.svg" alt="Logo" width={60} height={60} />
// //           <span className="text-2xl font-itim">MockMingle</span>
// //         </div>

// //         {/* Desktop Menu */}
// //         <div className="hidden md:flex items-center space-x-6">
// //           <Link href="#" className="hover:text-black">Home</Link>
// //           <Link href="#" className="hover:text-black">Features</Link>
// //           <Link href="#" className="hover:text-black">Pricing</Link>
// //           <Link href="#" className="hover:text-black">Contact</Link>
// //           {user ? (
// //             <>
// //               <span className="text-sm">Hi, {user.name}</span>
// //               <button
// //                 onClick={Logout}
// //                 className="border-2 border-white px-3 py-1 rounded bg-white text-purple-700 hover:bg-purple-100 transition"
// //               >
// //                 Logout
// //               </button>
// //             </>
// //           ) : (
// //             <Link
// //               href="/login"
// //               className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
// //             >
// //               Log in
// //             </Link>
// //           )}
// //         </div>

// //         {/* Hamburger Icon */}
// //         <button
// //           onClick={() => setIsOpen(!isOpen)}
// //           className="md:hidden focus:outline-none"
// //         >
// //           {isOpen ? <X size={28} /> : <Menu size={28} />}
// //         </button>
// //       </div>

// //       {/* Mobile Menu */}
// //       {isOpen && (
// //         <div className="md:hidden mt-3 space-y-2 flex flex-col items-start">
// //           <Link href="#" className="hover:text-black">Home</Link>
// //           <Link href="#" className="hover:text-black">Features</Link>
// //           <Link href="#" className="hover:text-black">Pricing</Link>
// //           <Link href="#" className="hover:text-black">Contact</Link>
// //           {user ? (
// //             <>
// //               <span className="text-sm">Hi, {user.name}</span>
// //               <button
// //                 onClick={() => {
// //                   setIsOpen(false);
// //                   Logout();
// //                 }}
// //                 className="border-2 border-white px-3 py-1 rounded bg-white text-purple-700 hover:bg-purple-100 transition"
// //               >
// //                 Logout
// //               </button>
// //             </>
// //           ) : (
// //             <Link
// //               href="/login"
// //               className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
// //             >
// //               Log in
// //             </Link>
// //           )}
// //         </div>
// //       )}
// //     </nav>
// //   );
// // }

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Menu, X, UserCircle } from "lucide-react";

// export default function Navbar({ Logout, user }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);

//   return (
//     <nav className="bg-black text-white px-6 border-b-2 border-white">
//       <div className="flex items-center justify-between">
//         {/* Logo */}
//         <div className="flex items-center space-x-2">
//           <Image src="/MM_LOGO.svg" alt="Logo" width={100} height={100} />
//           <span className="text-2xl font-itim">MockMingle</span>
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center space-x-6 relative">


//           {user ? (
//             <div className="relative">
//               <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="flex items-center justify-center"
//               >
//                 <UserCircle size={30} className="hover:text-black" />
//               </button>
//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-md w-32 z-10">
//                   <div className="px-4 py-2 border-b text-sm">{user.name}</div>
//                   <button
//                     onClick={Logout}
//                     className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link
//               href="/login"
//               className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
//             >
//               Log in
//             </Link>
//           )}
//         </div>

//         {/* Hamburger Icon */}
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="md:hidden focus:outline-none"
//         >
//           {isOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {isOpen && (
//         <div className="md:hidden mt-3 space-y-2 flex flex-col items-start">

//           {user ? (
//             <>
//               <div className="flex items-center space-x-2">
//                 <UserCircle size={24} />
//                 <span>{user.name}</span>
//               </div>
//               <button
//                 onClick={() => {
//                   setIsOpen(false);
//                   Logout();
//                 }}
//                 className="border-2 border-white px-3 py-1 rounded bg-white text-purple-700 hover:bg-purple-100 transition"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link
//               href="/login"
//               className="border-2 border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
//             >
//               Log in
//             </Link>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }


// components/Navbar.js


import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, UserCircle } from "lucide-react";

export default function Navbar({ Logout, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="pr-4 border-b-2 fixed w-full  bg-white z-50">

      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image src="/MM_LOGO.png" alt="Logo" width={40} height={40} />
          <span className="text-2xl font-itim">MockMingle</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 relative">
          {/* <Link
            href="/"
            
          >
            Home
          </Link>
          <Link
            href="#feature"
             scroll={false}
          >
            Features
          </Link>
          <Link
            href="#price"
            scroll={false}
          >
            Pricing
          </Link>
          <Link
            href="#contact"
scroll={false}
          >
            Contact
          </Link> */}
          {user?.value ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center"
              >
                <UserCircle size={30} className="hover:text-black" />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-md w-32 z-10">
                  <div className="px-4 py-2 border-b text-sm">
                    {user.name || "User"}
                  </div>
                  <button
                    onClick={Logout}
                    className="w-full px-4 py-2 text-left  text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="border-2 border-white px-3 py-1 rounded  hover:bg-white hover:text-black transition"
            >
              Log in
            </Link>
          )}
        </div>
        

        {/* Hamburger Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 space-y-2 flex flex-col items-start">
          {user?.value ? (
            <>
              <div className="flex items-center space-x-2">
                <UserCircle size={24} />
                <span>{user.name || "User"}</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  Logout();
                }}
                className="border-2 border-white px-3 py-1 rounded bg-white text-purple-700 hover:bg-purple-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="border border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
