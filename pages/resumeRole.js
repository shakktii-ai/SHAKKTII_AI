import { useEffect } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoCloudUploadOutline } from "react-icons/io5";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

export default function ResumeRole() {
  const router = useRouter();
  const [level, setLevel] = useState("Beginner");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [hasAvailableInterviews, setHasAvailableInterviews] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      const userFromStorage = JSON.parse(localStorage.getItem("user"));
      if (userFromStorage) {
        setUser(userFromStorage);
        setEmail(userFromStorage.email || "");

        const completedInterviews = userFromStorage.no_of_interviews_completed || 0;
        const totalInterviews = userFromStorage.no_of_interviews || 1;

        if (completedInterviews >= totalInterviews) {
          setHasAvailableInterviews(false);
        } else {
          setHasAvailableInterviews(true);
        }
      }
    }
  }, [router]);

  const checkInterviewAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const userFromStorage = JSON.parse(localStorage.getItem("user"));
      if (!userFromStorage || !userFromStorage.email) {
        toast.error("User information not found. Please login again.");
        setIsCheckingAvailability(false);
        return false;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST || ""}/api/getUserStats?email=${encodeURIComponent(userFromStorage.email)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          const completedInterviews = data.stats.no_of_interviews_completed || 0;
          const totalInterviews = data.stats.no_of_interviews || 1;

          const updatedUser = {
            ...userFromStorage,
            no_of_interviews: totalInterviews,
            no_of_interviews_completed: completedInterviews,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          setHasAvailableInterviews(completedInterviews < totalInterviews);
          return completedInterviews < totalInterviews;
        }
      }

      const completedInterviews = userFromStorage.no_of_interviews_completed || 0;
      const totalInterviews = userFromStorage.no_of_interviews || 1;
      setHasAvailableInterviews(completedInterviews < totalInterviews);
      return completedInterviews < totalInterviews;
    } catch (error) {
      console.error("Error checking interview availability:", error);
      toast.error("Error checking interview availability. Please try again.");
      return false;
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        return;
      }
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB.");
        return;
      }
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("apiResponseStatus");

    if (!resumeFile) {
      toast.error("Please upload your resume (PDF)");
      return;
    }

    toast.loading("Checking interview availability...");
    const userHasAvailableInterviews = await checkInterviewAvailability();
    toast.dismiss();

    if (!userHasAvailableInterviews) {
      setShowErrorModal(true);
      return;
    }

    toast.success("Parsing resume and generating questions...");

    // Convert resume to base64 to send to API
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Resume = reader.result.split(",")[1];

      router.push("/resumeInstruction");

      let formattedQuestions = [];

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/resumeQuestionsFetch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeBase64: base64Resume, level }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Something went wrong. Please try again.");
        }

        const responseData = await res.json();
        let fetchedQuestions = responseData.questions;

        if (fetchedQuestions) {
          if (typeof fetchedQuestions === "string") {
            const matches = [];
            const patterns = [
              { regex: /\*\*\d+\.\s+([^*]+?)\*\*/g, type: "Bold with ** markers" },
              { regex: /^\s*\d+\.\s+([^(\n]+)/gm, type: "Regular numbered list" },
              { regex: /\d+\.\s+([^\n(]+)/g, type: "Simple number followed by text" },
            ];

            const questionText = fetchedQuestions.toString();

            for (const pattern of patterns) {
              let match;
              pattern.regex.lastIndex = 0;
              while ((match = pattern.regex.exec(questionText)) !== null) {
                if (match[1]) {
                  const question = match[1].trim();
                  matches.push(question);
                }
              }
              if (matches.length > 0) break;
            }

            const cleanedMatches = matches.map((q) => q.replace(/\*\*/g, "").trim());

            if (cleanedMatches.length > 0) {
              const firstName = user?.fullName?.split(" ")[0];
              formattedQuestions = [
                {
                  questionText: `Hello ${firstName}, can you tell me about yourself, including your educational background and previous work experience?`,
                  answer: null,
                },
              ];

              const additionalQuestions = cleanedMatches.map((qText) => ({
                questionText: qText.trim(),
                answer: null,
              }));

              formattedQuestions.push(...additionalQuestions);
            }
          }
        }

        if (formattedQuestions && formattedQuestions.length > 0) {
          const data = { jobRole: "Resume Based", email, level, questions: formattedQuestions };

          try {
            const saveRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/jobRoleAndQuestionsSave`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });

            if (!saveRes.ok) {
              const errorData = await saveRes.json();
              throw new Error(errorData?.error || "Something went wrong. Please try again.");
            }

            const response = await saveRes.json();

            if (response.data._id) {
              localStorage.removeItem("_id");
              localStorage.removeItem("_idForReport");
              localStorage.setItem("_id", response.data._id);
              localStorage.setItem("_idForReport", response.data._id);
            }

            localStorage.setItem("apiResponseStatus", "success");
          } catch (error) {
            console.error("Error saving questions:", error);
            localStorage.setItem("apiResponseStatus", "error");
          }
        }
      } catch (error) {
        console.error("Error during resume question fetch:", error);
        localStorage.setItem("apiResponseStatus", "error");
      }
    };

    reader.readAsDataURL(resumeFile);
  };

  return (
    <div className="min-h-screen p-6">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Link href="/dashboard" className="block mb-12">
        <div className="text-2xl w-8 h-8 flex items-center justify-center">
          <IoIosArrowBack />
        </div>
      </Link>

      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Resume Upload */}
          <div>
            <h1 className="text-2xl font-normal text-center mb-4">Upload Your Resume</h1>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-700 hover:border-gray-500"
              }`}
              onClick={() => document.getElementById("resumeInput").click()}
            >
              <IoCloudUploadOutline className="text-4xl text-gray-400 mb-3" />
              {resumeFileName ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">✓ {resumeFileName}</p>
                  <p className="text-xs text-gray-500 mt-1">Click to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium">Drag & drop your resume here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse — PDF only, max 5MB</p>
                </div>
              )}
              <input
                id="resumeInput"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <h2 className="text-2xl font-normal text-center mb-6">Select Level</h2>
            <div className="space-y-4">
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                <label
                  key={lvl}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    level === lvl ? "border-black" : "border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="level"
                    value={lvl}
                    checked={level === lvl}
                    onChange={() => setLevel(lvl)}
                    className="h-5 w-5"
                  />
                  <span className="ml-3 text-lg">{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-black font-medium py-3 px-6 rounded-lg text-lg disabled:opacity-60"
            disabled={isCheckingAvailability}
          >
            {isCheckingAvailability ? "Checking..." : "Start Resume Interview"}
          </button>
        </form>

        {/* Hidden email input */}
        <input type="email" name="email" value={email} readOnly className="hidden" />
      </div>

      {/* No interviews available modal */}
      {showErrorModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md border border-red-500 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">No Available Interviews</h2>
              <p className="text-gray-300 mb-4">You have used all your available interviews. Please contact the administrator to request more.</p>
              <div className="flex justify-center space-x-4">
                <Link href="/profile">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200">
                    View Profile
                  </button>
                </Link>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}