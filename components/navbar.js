
// import { useState, useEffect, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Menu, X, UserCircle } from "lucide-react";

// export default function Navbar({ Logout, user }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef();

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <nav className="pr-4 border-b-2 fixed w-full  bg-white z-50">

//       <div className="flex items-center justify-between">
//         {/* Logo */}
//         <div className="flex items-center space-x-2">
//           <Image src="/MM_LOGO.png" alt="Logo" width={40} height={40} />
//           <span className="text-2xl font-itim">MockMingle</span>
//         </div>

//         {/* Desktop Menu */}
//         <div className="hidden md:flex items-center space-x-6 relative">
//            <Link
//             href="/enterprise"
            
//           >
//             Login as Enterprise
//           </Link>
//          {/* <Link
//             href="#feature"
//              scroll={false}
//           >
//             Features
//           </Link>
//           <Link
//             href="#price"
//             scroll={false}
//           >
//             Pricing
//           </Link>
//           <Link
//             href="#contact"
// scroll={false}
//           >
//             Contact
//           </Link> */}
//           {user?.value ? (
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="flex items-center justify-center"
//               >
//                 <UserCircle size={30} className="hover:text-black" />
//               </button>
//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-md w-32 z-10">
//                   <div className="px-4 py-2 border-b text-sm">
//                     {user.name || "User"}
//                   </div>
//                   <button
//                     onClick={Logout}
//                     className="w-full px-4 py-2 text-left  text-sm"
//                   >
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link
//               href="/login"
//               className="border-2 border-white px-3 py-1 rounded  hover:bg-white hover:text-black transition"
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
//           {user?.value ? (
//             <>
//               <div className="flex items-center space-x-2">
//                 <UserCircle size={24} />
//                 <span>{user.name || "User"}</span>
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
//               className="border border-white px-3 py-1 rounded bg-gradient-to-t from-[#795E7F] to-[#FAE4FF] hover:bg-white hover:text-purple-700 transition"
//             >
//               Log in
//             </Link>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// }import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MdAccountCircle } from "react-icons/md";
import Link from "next/link";
export default function Navbar({ user, Logout }) {
  const [dropdown, setDropdown] = useState(false);
  const toggleDropdown = () => setDropdown((prev) => !prev);

  return (
    <nav
      className="sticky top-0 z-50 w-full max-w-full mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 py-4"
    >
      {/* Left: Logo + Name */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="relative w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] md:w-[48px] md:h-[48px] shrink-0">
          <Image
            src="/MM_LOGO.png"
            alt="MockMingle Logo"
            fill
            className="object-contain"
          />
        </div>

        <span
          className="truncate"
          style={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(20px, 4vw, 32px)",
            lineHeight: "1.2",
            letterSpacing: "0.01em",
            color: "#000000",
          }}
        >
          MockMingle
        </span>
      </Link>

      {/* Right: Login/Register or Profile */}
      <div className="flex items-center ml-3 shrink-0">
        {user?.value ? (
          <div className="relative">
            <MdAccountCircle
              className="cursor-pointer text-[#6F24E8] w-8 h-8 sm:w-9 sm:h-9"
              onClick={toggleDropdown}
            />

            {dropdown && (
              <div className="absolute right-0 mt-3 w-[170px] sm:w-[192px] bg-white rounded-[16px] shadow-xl border border-gray-100 overflow-hidden py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-[14px] font-bold hover:bg-gray-50 text-[#0A1C40]"
                >
                  Profile
                </Link>

                <button
                  onClick={Logout}
                  className="w-full text-left px-4 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button
              className="bg-[#6F24E8] rounded-[29.5px] h-[40px] sm:h-[44px] px-4 sm:px-6 md:px-8 text-white text-[13px] sm:text-[15px] md:text-[16px] font-semibold whitespace-nowrap"
              style={{
                fontFamily: "Manrope, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Login / Register
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}