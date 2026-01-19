// import { useState } from "react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// export default function ProfileForm({ mode }) {
//   // mode = "signup" | "fill"
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     mobileNo: "",
//     address: "",
//     DOB: "",
//     education: "",
//     collageName: "",
//     profileImg: "",
//   });
//   const router = useRouter();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData((prev) => ({ ...prev, profileImg: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

// const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
  
//     let endpoint = "";
//     let body = { ...formData };
  
//     if (mode === "signup") {
//       endpoint = "/api/signup";
//     } else if (mode === "fill") {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Invalid session");
//         return;
//       }
//       endpoint = "/api/auth/fillProfile";
//       body = { token, ...formData };
//     }
  
//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
  
//     const data = await res.json();
  
//     if (data.success) {
//       // ✅ Save token & user for future visits
//       if (data.token && data.user) {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }
  
//       toast.success(
//         mode === "signup" ? "Signup successful!" : "Profile updated successfully!"
//       );
  
//       // Redirect user after saving
//       router.push("/dashboard"); // or "/profile"
//     } else {
//       toast.error(data.message || "Something went wrong");
//     }
//   };
  
//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-4 max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow"
//     >
//       <h2 className="text-2xl font-bold">
//         {mode === "signup" ? "Sign Up" : "Complete Your Profile"}
//       </h2>

//       <input
//         type="text"
//         name="fullName"
//         placeholder="Full Name"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="confirmPassword"
//         placeholder="Confirm Password"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="mobileNo"
//         placeholder="Mobile Number"
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="address"
//         placeholder="Address"
//         onChange={handleChange}
//       />
//       <input type="date" name="DOB" onChange={handleChange} />
//       <input
//         type="text"
//         name="education"
//         placeholder="Education"
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="collageName"
//         placeholder="College Name"
//         onChange={handleChange}
//       />
//       <input type="file" accept="image/*" onChange={handleImageChange} />

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white py-2 rounded"
//       >
//         {mode === "signup" ? "Sign Up" : "Save"}
//       </button>
//     </form>
//   );
// }


// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// export default function ProfileForm({ mode }) {
//   // mode = "signup" | "fill"
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     mobileNo: "",
//     address: "",
//     DOB: "",
//     education: "",
//     collageName: "",
//     profileImg: "",
//   });

//   const router = useRouter();

//   // 🔹 Check if user already exists and profile is filled
//   useEffect(() => {
//     if (mode === "fill") {
//       const storedUser = localStorage.getItem("user");
//       if (storedUser) {
//         const user = JSON.parse(storedUser);

//         // check if profile is already completed (you can adjust conditions)
//         if (user.fullName && user.mobileNo) {
//           router.push("/dashboard"); // redirect
//         } else {
//           // prefill form if some info already exists
//           setFormData((prev) => ({
//             ...prev,
//             ...user,
//             password: "",
//             confirmPassword: "",
//           }));
//         }
//       }
//     }
//   }, [mode, router]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData((prev) => ({ ...prev, profileImg: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     let endpoint = "";
//     let body = { ...formData };

//     if (mode === "signup") {
//       endpoint = "/api/signup";
//     } else if (mode === "fill") {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Invalid session");
//         return;
//       }
//       endpoint = "/api/auth/fillProfile";
//       body = { token, ...formData };
//     }

//     const res = await fetch(endpoint, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     const data = await res.json();

//     if (data.success) {
//       // ✅ Save token & user for future visits
//       if (data.token && data.user) {
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("user", JSON.stringify(data.user));
//       }

//       toast.success(
//         mode === "signup" ? "Signup successful!" : "Profile updated successfully!"
//       );

//       router.push("/dashboard");
//     } else {
//       toast.error(data.message || "Something went wrong");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-4 max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow"
//     >
//       <h2 className="text-2xl font-bold">
//         {mode === "signup" ? "Sign Up" : "Complete Your Profile"}
//       </h2>

//       <input
//         type="text"
//         name="fullName"
//         placeholder="Full Name"
//         value={formData.fullName}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         value={formData.email}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         value={formData.password}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="confirmPassword"
//         placeholder="Confirm Password"
//         value={formData.confirmPassword}
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="text"
//         name="mobileNo"
//         placeholder="Mobile Number"
//         value={formData.mobileNo}
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="address"
//         placeholder="Address"
//         value={formData.address}
//         onChange={handleChange}
//       />
//       <input type="date" name="DOB" value={formData.DOB} onChange={handleChange} />
//       <input
//         type="text"
//         name="education"
//         placeholder="Education"
//         value={formData.education}
//         onChange={handleChange}
//       />
//       <input
//         type="text"
//         name="collageName"
//         placeholder="College Name"
//         value={formData.collageName}
//         onChange={handleChange}
//       />
//       <input type="file" accept="image/*" onChange={handleImageChange} />

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white py-2 rounded"
//       >
//         {mode === "signup" ? "Sign Up" : "Save"}
//       </button>
//     </form>
//   );
// }


import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";

import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
export default function ProfileForm({ mode }) {
   const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    address: "",
    DOB: "",
    education: "",
    collageName: "",
    profileImg: "",
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

 // In components/ProfileForm.js - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  const requestData = { ...formData };
  delete requestData.confirmPassword;

  try {
    const token = localStorage.getItem("token");
    console.log('Token from localStorage:', token); // Debug log
    
    if (!token && mode === "fill") {
      toast.error("Please log in to update your profile");
      return;
    }

    const endpoint = mode === "signup" ? "/api/signup" : "/api/auth/fillProfile";
    const headers = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header in fill mode
    if (mode === "fill") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log('Sending request to:', endpoint); // Debug log
    console.log('Request headers:', headers); // Debug log

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    console.log('Response data:', data); // Debug log

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    if (data.success) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success(
        mode === "signup" ? "Signup successful!" : "Profile updated successfully!"
      );
      router.push("/dashboard");
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error(error.message || "An error occurred. Please try again.");
  }
};
  
  return (
    <div className="flex justify-center items-center bg-black min-h-screen px-4">
       <ToastContainer position="top-right" autoClose={3000} theme="colored" />
       {mode==='signup'&& <div className="absolute top-4 left-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <svg width="55" height="54" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.2929 27.2929C13.9024 27.6834 13.9024 28.3166 14.2929 28.7071L20.6569 35.0711C21.0474 35.4616 21.6805 35.4616 22.0711 35.0711C22.4616 34.6805 22.4616 34.0474 22.0711 33.6569L16.4142 28L22.0711 22.3431C22.4616 21.9526 22.4616 21.3195 22.0711 20.9289C21.6805 20.5384 21.0474 20.5384 20.6569 20.9289L14.2929 27.2929ZM42 28V27L15 27V28V29L42 29V28Z" fill="white" />
                        <path d="M27.5 0.5C42.4204 0.5 54.5 12.3731 54.5 27C54.5 41.6269 42.4204 53.5 27.5 53.5C12.5796 53.5 0.5 41.6269 0.5 27C0.5 12.3731 12.5796 0.5 27.5 0.5Z" stroke="white" />
                    </svg>

                </button>
            </div>}
  <div className="bg-[#D2E9FA] backdrop-blur-lg max-w-3xl w-full p-8 rounded-2xl shadow-lg space-y-6">
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        {mode === "signup" ? "Sign Up" : "Complete Your Profile"}
      </h2>

      {/* Full Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      {/* Mobile + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="mobileNo"
          placeholder="Mobile Number"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
         <input
          type="date"
          name="DOB"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
       
      </div>
      {/* Password + Confirm Password */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Password Field */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Confirm Password Field */}
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
        >
          {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

     

      {/* DOB + Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <input
          type="text"
          name="collageName"
          placeholder="College Name"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="text"
          name="education"
          placeholder="Education"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* College + Profile Image */}
      
        
         <input
          type="text"
          name="address"
          placeholder="Address"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
     

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-black to-gray-500 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
      >
        {mode === "signup" ? "Sign Up" : "Save"}
      </button>
    </form>
  </div>
</div>
 );
}