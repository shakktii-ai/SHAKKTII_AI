import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle2, RotateCcw, Home, Info } from "lucide-react";

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initial Form State
  const initialFormState = {
    fullName: "",
    mobileNo: "",
    districtTaluka: "",
    gender: "",
    highestEducation: "",
    pastExperience: "",
    pastWorkDetails: "",
    preferredIndustries: [],
    relocationPreference: "",
    hasAadhaar: "",
    aadhaarNumber: "",
    hasResume: "",
    resumeUrl: "",
    hasPracticedInterview: "",
    interviewPracticeDetails: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Handle Text & Radio Input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Multi-select with max 2 limit for Preferred Industries
  const handleIndustryToggle = (industry) => {
    setFormData((prev) => {
      const current = prev.preferredIndustries;
      if (current.includes(industry)) {
        return {
          ...prev,
          preferredIndustries: current.filter((item) => item !== industry),
        };
      } else {
        if (current.length >= 2) {
          toast.info("You can select up to 2 preferred industries.", {
            position: "bottom-center",
            autoClose: 2000,
          });
          return prev;
        }
        return {
          ...prev,
          preferredIndustries: [...current, industry],
        };
      }
    });
  };

  // Reset form
  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all responses?")) {
      setFormData(initialFormState);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.fullName.trim()) {
      toast.error("Please enter your Full Name.");
      return;
    }

    const cleanMobile = formData.mobileNo.replace(/[^0-9]/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      toast.error("Please enter a valid 10-digit Mobile / WhatsApp number.");
      return;
    }

    if (!formData.districtTaluka.trim()) {
      toast.error("Please enter your District / Taluka.");
      return;
    }

    if (!formData.gender) {
      toast.error("Please select your Gender.");
      return;
    }

    if (!formData.highestEducation) {
      toast.error("Please select your Highest Education.");
      return;
    }

    if (!formData.pastExperience) {
      toast.error("Please select your Work Experience.");
      return;
    }

    if (formData.preferredIndustries.length === 0) {
      toast.error("Please select at least 1 preferred industry.");
      return;
    }

    if (!formData.relocationPreference) {
      toast.error("Please select where you want to work.");
      return;
    }

    if (!formData.hasAadhaar) {
      toast.error("Please answer if you have an Aadhaar Card.");
      return;
    }

    if (formData.hasAadhaar === "Yes") {
      const cleanAadhaar = formData.aadhaarNumber.replace(/[^0-9]/g, "");
      if (!cleanAadhaar || cleanAadhaar.length !== 12) {
        toast.error("Please enter a valid 12-digit Aadhaar Number.");
        return;
      }
    }

    if (!formData.hasResume) {
      toast.error("Please answer if you have a resume.");
      return;
    }

    if (!formData.hasPracticedInterview) {
      toast.error("Please answer if you have practiced interviews.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanAadhaar = formData.aadhaarNumber.replace(/[^0-9]/g, "");
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNo: cleanMobile,
        districtTaluka: formData.districtTaluka.trim(),
        gender: formData.gender,
        highestEducation: formData.highestEducation,
        pastExperience: formData.pastExperience,
        pastWorkDetails: formData.pastWorkDetails.trim(),
        preferredIndustries: formData.preferredIndustries,
        relocationPreference: formData.relocationPreference,
        hasAadhaar: formData.hasAadhaar,
        aadhaarNumber: formData.hasAadhaar === "Yes" ? cleanAadhaar : "",
        hasResume: formData.hasResume,
        resumeUrl: formData.hasResume === "Yes" ? formData.resumeUrl.trim() : "",
        hasPracticedInterview: formData.hasPracticedInterview,
        interviewPracticeDetails: formData.hasPracticedInterview === "Yes" ? formData.interviewPracticeDetails.trim() : "",
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(
          data.message || "Failed to submit form. Please check your details and try again.",
          {
            position: "bottom-center",
            autoClose: 5000,
          }
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Network or server error. Please check your connection and try again.", {
        position: "bottom-center",
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Education Options
  const educationOptions = [
    "Below 10th Pass",
    "10th Pass (SSC)",
    "12th Pass (HSC)",
    "ITI / Diploma / Technical Trade",
    "Graduate (BA, B.Com, B.Sc, etc.)",
    "Engineer / Technical Degree",
    "Post Graduate",
  ];

  // Work Experience Options
  const experienceOptions = [
    "No, I am a Fresher",
    "Yes, less than 1 year",
    "Yes, 1 to 3 years",
    "Yes, more than 3 years",
  ];

  // Preferred Industries
  const industryOptions = [
    "Factory / Production / Packaging",
    "Warehouse / Delivery / Logistics",
    "Sales / Shop Assistant / Customer Support",
    "Security Guard / Office Helper",
    "Driver / Field Work",
    "Computer / Data Entry / IT",
    "Healthcare / Hospital / Clinic",
    "Agriculture / Farming Support",
    "Any job that pays well",
  ];

  // Relocation Options
  const relocationOptions = [
    "Only in my local village / taluka",
    "Anywhere in my district",
    "Ready to relocate to nearby cities (e.g., Pune, Mumbai)",
  ];

  return (
    <>
      <Head>
        <title>Free Job Registration Form | Job Alerts Near You</title>
        <meta
          name="description"
          content="Register your name to get 100% free job alerts near you via WhatsApp or phone call."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#ede7f6] py-6 px-3 sm:px-6 font-sans text-gray-900">
        <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />

        <div className="max-w-2xl mx-auto">
          {/* Form Top Branding Bar */}
          <div className="flex items-center justify-between px-2 mb-3">
            <Link href="/" className="flex items-center gap-2 text-sm text-purple-900 font-semibold hover:underline">
              <img src="/MM_LOGO.png" alt="Logo" className="w-5 h-5 object-contain" />
              <span>MockMingle Jobs</span>
            </Link>
            <span className="text-xs text-gray-500 font-medium bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
              100% Free Service
            </span>
          </div>

          {/* Submission Confirmation Screen */}
          {isSubmitted ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-2.5 bg-[#673ab7]"></div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle2 size={36} className="shrink-0" />
                  <h1 className="text-2xl sm:text-3xl font-normal text-gray-900">
                    Your registration is successful!
                  </h1>
                </div>

                <div className="bg-purple-50 border border-purple-100 rounded-lg p-5 text-gray-800 text-base leading-relaxed space-y-2">
                  <p className="font-semibold text-purple-900">Thank you for registering.</p>
                  <p>
                    Your details are saved with us. When a job matching your education and location becomes available, our team will message you on WhatsApp or call you. Keep your phone active.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      setFormData(initialFormState);
                      setIsSubmitted(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[#673ab7] hover:bg-purple-50 font-medium px-4 py-2 rounded-md transition text-sm flex items-center gap-1.5"
                  >
                    <RotateCcw size={16} />
                    <span>Submit another response</span>
                  </button>

                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition flex items-center gap-1.5 ml-auto"
                  >
                    <Home size={16} />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Header Card (Google Form Style) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-3 bg-[#673ab7] w-full"></div>
                <div className="p-6 sm:p-8 space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-normal text-gray-900">
                    Free Job Registration Form
                  </h1>
                  <h2 className="text-lg font-medium text-[#673ab7]">
                    Register Your Name to Get Job Alerts Near You
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 bg-purple-50 border-l-4 border-[#673ab7] p-3 rounded-r-md">
                    Fill this form in 2 minutes. Whenever a matching job opens in your district or industry, we will call or WhatsApp you directly. <strong>100% Free.</strong>
                  </p>
                  <div className="pt-2 border-t border-gray-100 text-xs text-red-600">
                    * Indicates required question
                  </div>
                </div>
              </div>

              {/* 1. PERSONAL DETAILS CARD */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-semibold text-gray-900">1. Personal Details</h3>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Your answer"
                    className="w-full sm:w-3/4 border-b-2 border-gray-300 focus:border-[#673ab7] outline-none py-1.5 text-sm transition-colors placeholder-gray-400"
                  />
                </div>

                {/* Mobile / WhatsApp Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Mobile / WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-gray-500">Helper note: We will message you here</p>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNo}
                    onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full sm:w-3/4 border-b-2 border-gray-300 focus:border-[#673ab7] outline-none py-1.5 text-sm transition-colors placeholder-gray-400"
                  />
                </div>

                {/* Your District / Taluka */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Your District / Taluka <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.districtTaluka}
                    onChange={(e) => handleInputChange("districtTaluka", e.target.value)}
                    placeholder="e.g., Pune, Satara, Nashik"
                    className="w-full sm:w-3/4 border-b-2 border-gray-300 focus:border-[#673ab7] outline-none py-1.5 text-sm transition-colors placeholder-gray-400"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-medium text-gray-900">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {["Male", "Female", "Other"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer py-1 text-sm text-gray-800 hover:text-black"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option}
                          checked={formData.gender === option}
                          onChange={() => handleInputChange("gender", option)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. EDUCATION & QUALIFICATION CARD */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-semibold text-gray-900">2. Education & Qualification</h3>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Highest Education Completed <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-gray-500">Select one</p>

                  <div className="space-y-2.5">
                    {educationOptions.map((edu) => (
                      <label
                        key={edu}
                        className="flex items-center gap-3 cursor-pointer py-1 text-sm text-gray-800 hover:text-black"
                      >
                        <input
                          type="radio"
                          name="highestEducation"
                          value={edu}
                          checked={formData.highestEducation === edu}
                          onChange={() => handleInputChange("highestEducation", edu)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{edu}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. WORK EXPERIENCE CARD */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-semibold text-gray-900">3. Work Experience</h3>
                </div>

                {/* Experience Option */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Do you have past work experience? <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-2.5">
                    {experienceOptions.map((exp) => (
                      <label
                        key={exp}
                        className="flex items-center gap-3 cursor-pointer py-1 text-sm text-gray-800 hover:text-black"
                      >
                        <input
                          type="radio"
                          name="pastExperience"
                          value={exp}
                          checked={formData.pastExperience === exp}
                          onChange={() => handleInputChange("pastExperience", exp)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{exp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Past Work Type (Optional) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-gray-900">
                    What type of work did you do before? <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pastWorkDetails}
                    onChange={(e) => handleInputChange("pastWorkDetails", e.target.value)}
                    placeholder="e.g., Shop assistant, Driver, Factory worker, Electrician, Data entry, None"
                    className="w-full sm:w-3/4 border-b-2 border-gray-300 focus:border-[#673ab7] outline-none py-1.5 text-sm transition-colors placeholder-gray-400"
                  />
                </div>
              </div>

              {/* 4. WHAT JOB ARE YOU LOOKING FOR? */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-semibold text-gray-900">4. What Job Are You Looking For?</h3>
                </div>

                {/* Preferred Industry / Sector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-900">
                      Preferred Industry / Sector <span className="text-red-600">*</span>
                    </label>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                      Select up to 2 ({formData.preferredIndustries.length}/2 selected)
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {industryOptions.map((ind) => {
                      const isSelected = formData.preferredIndustries.includes(ind);
                      return (
                        <label
                          key={ind}
                          className="flex items-center gap-3 cursor-pointer py-1 text-sm text-gray-800 hover:text-black"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleIndustryToggle(ind)}
                            className="w-4 h-4 text-[#673ab7] rounded focus:ring-[#673ab7] accent-[#673ab7]"
                          />
                          <span>{ind}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Relocation / Location Preference */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-900">
                    Where do you want to work? <span className="text-red-600">*</span>
                  </label>

                  <div className="space-y-2.5">
                    {relocationOptions.map((loc) => (
                      <label
                        key={loc}
                        className="flex items-center gap-3 cursor-pointer py-1 text-sm text-gray-800 hover:text-black"
                      >
                        <input
                          type="radio"
                          name="relocationPreference"
                          value={loc}
                          checked={formData.relocationPreference === loc}
                          onChange={() => handleInputChange("relocationPreference", loc)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. VERIFICATION & FINAL STEP */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="border-b border-gray-100 pb-2">
                  <h3 className="text-base font-semibold text-gray-900">5. Verification & Final Step</h3>
                </div>

                {/* Aadhaar Card */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Do you have an Aadhaar Card? <span className="text-red-600">*</span>
                  </label>
                  <p className="text-xs text-gray-500">Builds identity trust for employers</p>
                  <div className="flex items-center gap-6 pt-1">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                        <input
                          type="radio"
                          name="hasAadhaar"
                          value={opt}
                          checked={formData.hasAadhaar === opt}
                          onChange={() => handleInputChange("hasAadhaar", opt)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {formData.hasAadhaar === "Yes" && (
                    <div className="mt-3 p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-md space-y-1.5 transition-all">
                      <label className="block text-xs font-semibold text-purple-950">
                        Enter 12-digit Aadhaar Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        value={formData.aadhaarNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 12);
                          const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                          handleInputChange("aadhaarNumber", formatted);
                        }}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full sm:w-3/4 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#673ab7] focus:ring-1 focus:ring-[#673ab7] outline-none transition placeholder-gray-400"
                      />
                      <p className="text-[11px] text-gray-500">
                        Your Aadhaar is secure and used only for verifying your candidate profile with employers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Resume */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-900">
                    Do you have a resume? <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-6 pt-1">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                        <input
                          type="radio"
                          name="hasResume"
                          value={opt}
                          checked={formData.hasResume === opt}
                          onChange={() => handleInputChange("hasResume", opt)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {formData.hasResume === "Yes" && (
                    <div className="mt-3 p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-md space-y-1.5 transition-all">
                      <label className="block text-xs font-semibold text-purple-950">
                        Resume Link or Note <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.resumeUrl}
                        onChange={(e) => handleInputChange("resumeUrl", e.target.value)}
                        placeholder="e.g., Google Drive link, LinkedIn link, or 'Will send on WhatsApp'"
                        className="w-full sm:w-3/4 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#673ab7] focus:ring-1 focus:ring-[#673ab7] outline-none transition placeholder-gray-400"
                      />
                      <p className="text-[11px] text-gray-500">
                        If you have a Google Drive link, paste it here. Otherwise, our team can collect it via WhatsApp.
                      </p>
                    </div>
                  )}
                </div>

                {/* Practiced Interviews */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-900">
                    Have you practiced interviews? <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-6 pt-1">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-800">
                        <input
                          type="radio"
                          name="hasPracticedInterview"
                          value={opt}
                          checked={formData.hasPracticedInterview === opt}
                          onChange={() => handleInputChange("hasPracticedInterview", opt)}
                          className="w-4 h-4 text-[#673ab7] focus:ring-[#673ab7] accent-[#673ab7]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>

                  {formData.hasPracticedInterview === "Yes" && (
                    <div className="mt-3 p-3.5 bg-purple-50/70 border border-purple-200/70 rounded-md space-y-1.5 transition-all">
                      <label className="block text-xs font-semibold text-purple-950">
                        Where or how did you practice? <span className="text-gray-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.interviewPracticeDetails}
                        onChange={(e) => handleInputChange("interviewPracticeDetails", e.target.value)}
                        placeholder="e.g., MockMingle AI, College Mock Interview, YouTube, Self-practice"
                        className="w-full sm:w-3/4 bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#673ab7] focus:ring-1 focus:ring-[#673ab7] outline-none transition placeholder-gray-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Submit & Clear Form) */}
              <div className="flex items-center justify-between pt-2 pb-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#673ab7] hover:bg-[#582fa1] active:bg-[#4a2889] text-white font-medium px-7 py-2.5 rounded shadow text-sm transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearForm}
                  className="text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-1.5 transition-colors"
                >
                  Clear form
                </button>
              </div>

              {/* Form Footer Note */}
              <div className="text-center text-xs text-gray-500 pb-10 space-y-1">
                <p>Never submit passwords through this form.</p>
                <p>This form was created for MockMingle Free Job Alerts.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
