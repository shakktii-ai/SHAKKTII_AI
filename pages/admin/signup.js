// // pages/signup.js

// import React, { useState ,useEffect} from 'react'
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useRouter } from 'next/router';

// const SignUp = () => {
//     const router = useRouter()
 
//     const [fullName, setFullName] = useState("");
//     const [email, setEmail] = useState("");
//     const [mobileNo, setMobileNo] = useState("");
//     const [address, setAddress] = useState("");
//     const [collageName, setCollageName] = useState("SPPU");
//     const [education, setEducation] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [passwordError, setPasswordError] = useState("");
//     const [DOB, setDOB] = useState("");
//     const [profileImg, setProfileImg] = useState("");

// const [user, setUser] = useState(null);

//   useEffect(() => {
//     if (!localStorage.getItem("token")) {
//       router.push("/admin/login");
//     } else {
//       const userFromStorage = JSON.parse(localStorage.getItem('user'));
//       if (userFromStorage) {
//         setUser(userFromStorage);
        
//       }
//     }
//   }, []);


//     const handlePasswordChange = (e) => {
//         setPassword(e.target.value);
//     };

//     const handleConfirmPasswordChange = (e) => {
//         setConfirmPassword(e.target.value);
//     };

//     const handlePasswordToggle = (e, fieldId) => {
//         const field = document.getElementById(fieldId);
//         const type = field.type === "password" ? "text" : "password";
//         field.type = type;
//         e.target.textContent = type === "password" ? "👁️" : "🙈";
//     };

    
//     const handleChange = (e) => {
//         if (e.target.name == 'fullName') {
//             setFullName(e.target.value)
//         }
//         else if (e.target.name == 'email') {
//             setEmail(e.target.value)
//         }
//         else if (e.target.name == 'collageName') {
//             setCollageName(e.target.value)
//         }
//         else if (e.target.name == 'password') {
//             setPassword(e.target.value)
//         }
//         else if (e.target.name == 'mobileNo') {
//             setMobileNo(e.target.value)
//         }
//         else if (e.target.name == 'address') {
//             setAddress(e.target.value)
//         }
//         else if (e.target.name == 'education') {
//             setEducation(e.target.value)
//         }else if (e.target.name == 'DOB') {
//             setDOB(e.target.value)
//         }else if (e.target.name == "profileImg") {
//             const file = e.target.files[0];
//             if (file) {
//               const reader = new FileReader();
//               reader.onloadend = () => {
//                 setProfileImg(reader.result);
//               };
//               reader.readAsDataURL(file);
//             }
//           }
//     }

// const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//         setPasswordError("Passwords do not match!");
//         return;
//     } else {
//         setPasswordError("");
//     }

//     const data = { profileImg, fullName, email, DOB, password, mobileNo, address, education,collageName };

//     try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/signup`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         });

//         // Check if response is not OK
//         if (!res.ok) {
//             const errorData = await res.json();
//             throw new Error(errorData?.error || "Something went wrong. Please try again.");
//         }

//         const response = await res.json();
//         if (response.success) {
//             setProfileImg('');
//             setMobileNo('');
//             setConfirmPassword('');
//             setAddress('');
//             setEducation('');
//             setCollageName('');
//             setDOB('');
//             setEmail('');
//             setFullName('');
//             setPassword('');

//             toast.success('Your account has been created!', {
//                 position: "top-left",
//                 autoClose: 3000,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 progress: undefined,
//                 theme: "light",
//             });
//         }

//     } catch (error) {
//         toast.error(`Error: ${error.message}`, {
//             position: "top-left",
//             autoClose: 5000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: true,
//             draggable: true,
//             progress: undefined,
//             theme: "light",
//         });
//     }
// };


//     return (<> 
//     <ToastContainer
//         position="top-left"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//     />
//        <div className="relative grid grid-cols-1 place-items-center w-full min-h-screen">
//     <img
//         src="/bg.gif"
//         alt="background"
//         className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
//     />
//     <img
//         src="/Logoo.png"
//         alt="Shakti AI Logo"
//         className="absolute top-4 right-8 w-20 mb-5"
//     />

//     <div className="container ml-2 mr-2 w-full max-w-5xl p-4 rounded-lg bg-white bg-opacity-30">
//         <h1 className="text-2xl text-white mb-4">
//             Create an <span className="text-pink-400">Account!</span>
//         </h1>

//         <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
//             <input
//                 type="file"
//                 name="profileImg"
//                 accept="image/*"
//                 onChange={handleChange}
//                 placeholder="fullName"
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="fullName"
//                 value={fullName}
//                 onChange={handleChange}
//                 placeholder="Full Name"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="email"
//                 name="email"
//                 value={email}
//                 onChange={handleChange}
//                 placeholder="Email Address"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="mobileNo"
//                 value={mobileNo}
//                 onChange={handleChange}
//                 placeholder="Mobile Number"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="address"
//                 value={address}
//                 onChange={handleChange}
//                 placeholder="Address"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="DOB"
//                 value={DOB}
//                 onChange={handleChange}
//                 placeholder="DOB"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="education"
//                 value={education}
//                 onChange={handleChange}
//                 placeholder="Education"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />
//             <input
//                 type="text"
//                 name="collageName"
//                 value={collageName}
//                 onChange={handleChange}
//                 placeholder="College Name"
//                 required
//                 className="p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//             />

//             <div className="relative">
//                 <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     value={password}
//                     onChange={handlePasswordChange}
//                     placeholder="🔒 Password"
//                     required
//                     className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//                 />
//                 <span
//                     className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-white"
//                     onClick={(e) => handlePasswordToggle(e, "password")}
//                 >
//                     👁️
//                 </span>
//             </div>

//             <div className="relative">
//                 <input
//                     type="password"
//                     id="confirm-password"
//                     value={confirmPassword}
//                     onChange={handleConfirmPasswordChange}
//                     placeholder="🔒 Confirm Password"
//                     required
//                     className="w-full p-3 rounded-md bg-white bg-opacity-20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400"
//                 />
//                 <span
//                     className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-white"
//                     onClick={(e) => handlePasswordToggle(e, "confirm-password")}
//                 >
//                     👁️
//                 </span>
//             </div>

//             {passwordError && <p className="text-red-500 mt-2">{passwordError}</p>}

//             <button
//                 type="submit"
//                 className="p-3 text-white bg-pink-400 rounded-md hover:bg-pink-500 transition duration-300"
//             >
//                 Sign Up
//             </button>
//         </form>
//     </div>
// </div>

//         </>
//     );
// };

// export default SignUp;

// pages/signup.js

import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";

const SignUp = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [count, setCount] = useState(""); // number of links input

  useEffect(() => {
    if (!localStorage.getItem("Admintoken")) {
      router.push("/admin/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem("admin"));
      if (userFromStorage) {
        setUser(userFromStorage);
      }
    }
  }, []);

 const handleCreateMultipleUsers = async () => {
  const num = parseInt(count, 10);

  if (isNaN(num) || num <= 0) {
    toast.error("Please enter a valid number greater than 0");
    return;
  }

  const newLinks = [];

  try {
    for (let i = 0; i < num; i++) {
      const res = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Admintoken")}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        newLinks.push(data.loginLink);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    }

    setGeneratedLinks((prev) => [...prev, ...newLinks]);
    toast.success(`${newLinks.length} user(s) created successfully`);
  } catch (err) {
    toast.error("Server error");
  }
};


return (
  <>
    <ToastContainer />

    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      {/* Background */}
      <img
        src="/bg.gif"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* Logo */}
      <img
        src="/Logoo.png"
        alt="Logo"
        className="absolute top-4 right-4 md:top-6 md:right-10 w-16 md:w-20"
      />

      {/* Centered Card */}
      <div className="w-full max-w-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-6 md:p-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Create <span className="text-pink-400">User Links</span>
        </h1>
        <p className="text-white/80 mb-6">
          Generate multiple login links instantly
        </p>

        {/* Input + Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
          <input
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Enter number of links"
            className="w-full sm:w-2/3 px-4 py-3 rounded-xl border border-white/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-800"
          />
          <button
            onClick={handleCreateMultipleUsers}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white shadow-lg hover:scale-105 transition"
          >
            Generate
          </button>
        </div>

        {/* Generated Links */}
        {generatedLinks.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl p-5 text-left shadow-lg">
            <p className="font-semibold text-gray-800 mb-3">
              Generated Login Links
            </p>

            <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {generatedLinks.map((link, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  </>
);

};

export default SignUp;
