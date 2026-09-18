import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Eye, 
  EyeOff, 
  UserCheck, 
  BarChart3, 
  MessageSquare, 
  LineChart, 
  Sparkles, 
  Camera,
  CheckCircle2
} from "lucide-react";
import { IoArrowBackCircleOutline } from "react-icons/io5";

export default function RegisterPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      router.replace("/dashboard");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large. Please select an image smaller than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Seed jobs for the newly registered user based on their desired role
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

    if (!formData.jobTitle?.trim()) {
      toast.error("Please enter the job title or role you are looking for.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
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

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      if (data.success) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (data.user) {
          const userId = data.user._id || data.user.id;
          await seedJobsForNewUser(userId, formData.jobTitle);
        }

        toast.success("Account created successfully! Welcome to MockMingle.");
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#E8E8FB]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6F24E8]"></div>
          <p className="text-[#1E0A40] font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      title: "Real Interview Simulation",
      description: "Feels like real evaluators—not robotic bots",
      icon: <UserCheck className="w-5 h-5 text-[#FF7046]" />,
    },
    {
      title: "Performance Scoring",
      description: "Score on structure, clarity, depth & delivery",
      icon: <BarChart3 className="w-5 h-5 text-[#FF7046]" />,
    },
    {
      title: "Actionable Feedback",
      description: "Get instant tailored tips to improve weak spots",
      icon: <MessageSquare className="w-5 h-5 text-[#FF7046]" />,
    },
    {
      title: "Progress Visibility",
      description: "Track measurable score growth over practice runs",
      icon: <LineChart className="w-5 h-5 text-[#FF7046]" />,
    },
  ];

  return (
    <>
      <Head>
        <title>Create Your Account | MockMingle - AI Interview Coach</title>
        <meta
          name="description"
          content="Join MockMingle to practice real-time AI interviews, receive instant scoring, and land your dream job with confidence."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#E8E8FB] py-6 px-4 sm:px-6 lg:px-8 font-manrope">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

        {/* Top Header Bar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors font-medium text-sm sm:text-base"
          >
            <IoArrowBackCircleOutline size={26} />
            <span>Back to Home</span>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img src="/MM_LOGO.png" alt="MockMingle Logo" className="w-7 h-7 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
              MockMingle
            </span>
          </Link>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Platform Context & Social Proof */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div className="bg-gradient-to-br from-[#1E0A40] via-[#2A1158] to-[#1E0A40] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6F24E8]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="inline-flex items-center gap-2 bg-[#FF7046]/20 border border-[#FF7046]/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#FF7046] mb-4">
                <Sparkles size={14} />
                <span>Next-Gen AI Interview Prep</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
                Crack Every Interview <br />
                <span className="text-[#FF7046]">With AI Coaching</span>
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                Practice real interview scenarios, get instant AI-powered feedback, and land your dream job with confidence.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/10 bg-white/5 rounded-2xl px-3 mb-6">
                <div className="text-center">
                  <div className="font-extrabold text-lg sm:text-xl text-[#FF7046]">95%</div>
                  <div className="text-gray-400 text-xs font-medium">Success Rate</div>
                </div>
                <div className="text-center border-x border-white/10">
                  <div className="font-extrabold text-lg sm:text-xl text-white">2K+</div>
                  <div className="text-gray-400 text-xs font-medium">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-extrabold text-lg sm:text-xl text-[#33B29C]">1M+</div>
                  <div className="text-gray-400 text-xs font-medium">Sessions</div>
                </div>
              </div>

              {/* Key Platform Features */}
              <div className="space-y-3.5">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Why Candidates Choose MockMingle</p>
                {features.map((feat, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/15 transition-all">
                    <div className="p-2 rounded-lg bg-white/10 shrink-0">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{feat.title}</h4>
                      <p className="text-xs text-gray-300">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Guarantee badge */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 size={16} className="text-[#33B29C] shrink-0" />
                <span>Free access to baseline interview assessments upon registration</span>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form Card */}
          <div className="lg:col-span-7 bg-white backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D3D0D0]/60">
            
            {/* Top Auth Tab Switcher */}
            <div className="mx-auto flex w-full max-w-sm rounded-full bg-[#E8E8F8] p-1 shadow-inner mb-6">
              <Link
                href="/login"
                className="flex-1 rounded-full py-2.5 text-center text-sm font-medium text-gray-600 transition-all duration-300 hover:text-black"
              >
                Login
              </Link>
              <div
                className="flex-1 rounded-full bg-[#6C2CF0] py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all duration-300"
              >
                Register
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1E0A40]">Create Your Account</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in your details to start practicing your interviews</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Profile Photo Avatar */}
              <div className="flex flex-col items-center justify-center mb-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#6F24E8] bg-[#E8E8FB] flex items-center justify-center shadow-inner">
                    {formData.profileImg ? (
                      <img src={formData.profileImg} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-gray-400">👤</span>
                    )}
                  </div>
                  <label
                    htmlFor="profileImgInput"
                    className="absolute bottom-0 right-0 bg-[#6F24E8] hover:bg-[#581ec0] text-white p-1.5 rounded-full cursor-pointer shadow-md transition"
                    title="Upload Profile Photo"
                  >
                    <Camera size={14} />
                  </label>
                </div>
                <input
                  id="profileImgInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-[11px] text-gray-400 mt-1">Optional Profile Photo</span>
              </div>

              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="e.g. Alex Johnson"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="alex@example.com"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Row 2: Mobile Number & Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNo"
                    value={formData.mobileNo}
                    placeholder="+91 9876543210"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Row 3: Target Role (Job Title) & Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Desired Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    placeholder="e.g. Frontend Developer"
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Education / Degree
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    placeholder="e.g. B.Tech in Computer Science"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Row 4: College Name & City / Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="collageName"
                    value={formData.collageName}
                    placeholder="e.g. SPPU / University Name"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City / Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="e.g. Pune, Maharashtra"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              {/* Row 5: Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      placeholder="Create Password"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none pr-10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      placeholder="Repeat Password"
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-[#D3D0D0] rounded-xl bg-[#E8E8FB]/40 text-black text-sm focus:ring-2 focus:ring-[#6F24E8] focus:border-transparent outline-none pr-10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#6F24E8] hover:bg-[#581ec0] text-white font-semibold text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              </div>

              {/* Footnote / Links */}
              <div className="text-center pt-2">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-[#6F24E8] hover:underline">
                    Log in
                  </Link>
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  By registering, you agree to MockMingle's Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
