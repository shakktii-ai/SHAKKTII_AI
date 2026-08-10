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
import Link from "next/link";
import { useRouter } from "next/router";
import { Eye, EyeOff } from "lucide-react";
import { IoArrowBackCircleOutline } from 'react-icons/io5';
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
    jobTitle: "",
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
  const seedJobsForNewUser = async (userId, jobTitle) => {
    if (!userId || !jobTitle?.trim()) return;

    try {
      const res = await fetch(
        `/api/jobs?q=${encodeURIComponent(jobTitle.trim())}&userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        console.warn("Signup seed jobs request failed", res.status);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.jobs) && data.jobs.length > 0) {
        localStorage.setItem("jobfind_local_history", JSON.stringify(data.jobs.slice(0, 10)));
      }
    } catch (error) {
      console.error("Failed to seed signup jobs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "signup" && !formData.jobTitle?.trim()) {
      toast.error("Please enter the job title or role you are looking for.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const requestData = { ...formData };
    delete requestData.confirmPassword;

    try {
      const token = localStorage.getItem("token");

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

        if (mode === "signup" && data.user) {
          const userId = data.user._id || data.user.id;
          await seedJobsForNewUser(userId, formData.jobTitle);
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
    <div className="flex flex-col justify-center items-center bg-[#E8E8FB] min-h-screen px-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {mode === 'signup' && <><div className="absolute top-4 left-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-black "
        >
          <IoArrowBackCircleOutline size={24} />

        </button>
      </div>
        <div className="flex justify-center items-center mb-4">
          <img src="MM_LOGO.png" width={24} height={24} />
          <h2 className="text-xl ml-2 font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
            MockMingle
          </h2>
        </div></>}
      <div className="bg-white backdrop-blur-lg max-w-3xl w-full p-8 rounded-2xl shadow-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <h2 className="text-3xl font-bold text-center text-[#6F24E8]">
            {mode === "signup" ? <div className="mx-auto flex w-full max-w-md rounded-full bg-[#E8E8F8] p-1 shadow-inner">
              <Link
                href="/login"
                className="flex-1 rounded-full py-3 text-center text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="flex-1 rounded-full bg-[#6C2CF0] py-3 text-center text-sm font-medium text-white shadow-lg transition-all duration-300"
              >
                Register
              </Link>
            </div> : "Complete Your Profile"}
          </h2>

          {/* Full Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Mobile + Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="mobileNo"
              placeholder="Mobile Number"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="date"
              name="DOB"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none pr-10"
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
                className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none pr-10"
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
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              name="education"
              placeholder="Education"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(mode === "signup") && (
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Desired Job Title"
                required
                className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}
            <input
              type="text"
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* College + Profile Image */}


          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-[#D3D0D0] rounded-full bg-[#E8E8FB] focus:ring-2 focus:ring-blue-500 outline-none"
          />


          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#6F24E8] text-white py-2 rounded-full font-semibold transition duration-200"
          >
            {mode === "signup" ? "Sign Up" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}