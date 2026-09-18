import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, User, Mail, Lock, Phone, Briefcase, GraduationCap, Building, MapPin, Calendar, Camera } from "lucide-react";
import { IoArrowBackCircleOutline } from "react-icons/io5";

export default function Register() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNo: "",
    jobTitle: "",
    collageName: "",
    education: "",
    address: "",
    DOB: "",
    profileImg: "",
  });

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Compress & convert profile image to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 600;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setFormData((prev) => ({ ...prev, profileImg: compressedBase64 }));
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, profileImg: event.target.result }));
      };
    };
    reader.readAsDataURL(file);
  };

  // Seed suggested jobs for new user
  const seedJobsForNewUser = async (userId, jobTitle) => {
    if (!userId || !jobTitle?.trim()) return;

    try {
      const res = await fetch(
        `/api/jobs?q=${encodeURIComponent(jobTitle.trim())}&userId=${encodeURIComponent(userId)}`
      );

      if (!res.ok) {
        console.warn("Register seed jobs request failed", res.status);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.jobs) && data.jobs.length > 0) {
        localStorage.setItem("jobfind_local_history", JSON.stringify(data.jobs.slice(0, 10)));
      }
    } catch (error) {
      console.error("Failed to seed register jobs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!formData.jobTitle.trim()) {
      toast.error("Please enter your desired job title or role.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const requestData = { ...formData };
    delete requestData.confirmPassword;

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Registration failed. Please try again.");
      }

      // Store session data
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Seed initial job opportunities based on target role
      if (data.user) {
        const userId = data.user._id || data.user.id;
        await seedJobsForNewUser(userId, formData.jobTitle);
      }

      toast.success("Account created successfully! Welcome to MockMingle.");

      // Smooth redirection to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Something went wrong during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | MockMingle - AI Interview Trainer</title>
        <meta
          name="description"
          content="Create your MockMingle account to prepare for AI mock interviews, track skill scores, and accelerate your career journey."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col justify-center items-center bg-[#E8E8FB] min-h-screen py-8 px-4 sm:px-6 relative">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

        {/* Back Navigation */}
        <div className="absolute top-5 left-5 sm:left-8">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors"
          >
            <IoArrowBackCircleOutline size={28} />
          </Link>
        </div>

        {/* Brand Header */}
        <Link href="/" className="flex items-center justify-center mb-5 hover:opacity-90 transition-opacity">
          <img src="/MM_LOGO.png" alt="MockMingle Logo" className="w-8 h-8 object-contain" />
          <h1 className="text-2xl ml-2.5 font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
            MockMingle
          </h1>
        </Link>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 space-y-6">
          
          {/* Top Pill Navigation (Login / Register Switcher) */}
          <div className="mx-auto flex w-full max-w-sm rounded-full bg-[#E8E8F8] p-1 shadow-inner">
            <Link
              href="/login"
              className="flex-1 rounded-full py-2.5 text-center text-sm font-semibold text-gray-600 hover:text-black transition-all duration-200"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="flex-1 rounded-full bg-[#6C2CF0] py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all duration-200"
            >
              Register
            </Link>
          </div>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E0A40]">
              Create Your Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Join thousands of job seekers mastering their interview skills
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Profile Avatar Upload */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#E8E8FB] border-2 border-[#6F24E8]/30 flex items-center justify-center shadow-inner">
                  {formData.profileImg ? (
                    <img
                      src={formData.profileImg}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-[#6F24E8]/60" />
                  )}
                </div>

                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-[#6F24E8] hover:bg-[#5E1FD4] text-white p-2 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105"
                  title="Upload Profile Photo"
                >
                  <Camera size={14} />
                  <input
                    id="profile-upload"
                    type="file"
                    name="profileImg"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-xs text-gray-400 mt-1.5">Profile Photo (Optional)</span>
            </div>

            {/* Section: Basic Account Info */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="Full Name *"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email Address *"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    placeholder="Password (6+ chars) *"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    placeholder="Confirm Password *"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Section: Career & Academic Details */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Desired Job Title */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase size={18} />
                  </div>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    placeholder="Target Role / Job Title *"
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    placeholder="Mobile Number"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* College / Institution Name */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building size={18} />
                  </div>
                  <input
                    type="text"
                    name="collageName"
                    value={formData.collageName}
                    placeholder="College / Institute Name"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Education */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap size={18} />
                  </div>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    placeholder="Highest Degree / Qualification"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Address */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="City / Address"
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Date of Birth */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#D3D0D0] rounded-full bg-[#E8E8FB]/60 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Privacy note */}
            <p className="text-xs text-gray-500 text-center pt-2">
              By creating an account, you agree to our Terms of Service & Privacy Policy.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-full text-white font-semibold text-base transition-all duration-200 shadow-md ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6F24E8] hover:bg-[#5E1FD4] active:scale-[0.99]"
              } flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                "Complete Registration"
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#6F24E8] hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
