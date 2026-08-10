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
  const [savedResume, setSavedResume] = useState(null);
  const [loadingSavedResume, setLoadingSavedResume] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const handleUseExistingResume = async () => {
    try {
      setLoadingSavedResume(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      const res = await fetch(
        `/api/getResume?token=${encodeURIComponent(token)}`
      );

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Your session has expired. Please log in again.");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          router.push("/login");
        }, 1500);

        return;
      }

      if (!data.success) {
        toast.error(data.error || "Unable to load your saved resume.");
        return;
      }

      if (!data.data) {
        toast.error("No saved resume found for your account.");
        return;
      }

      setSavedResume(data.data);
       setResumeFile(null);
       setResumeFileName("");
      toast.success("Loaded your saved resume successfully.");
    } catch (error) {
      console.error("Error loading saved resume:", error);
      toast.error(
        "Something went wrong while loading your saved resume. Please try again."
      );
    } finally {
      setLoadingSavedResume(false);
    }
  };
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
      setSavedResume(null);
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
      setSavedResume(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const processResumeQuestions = async ({ resumeBase64, resumeData }) => {
    toast.success("Parsing resume and generating questions...");
    router.push("/BaseLine/resumeInstruction");

    let formattedQuestions = [];

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/resumeQuestionsFetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeBase64,
            resumeData,
            level,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to generate questions");
      }

      const responseData = await res.json();
      let fetchedQuestions = responseData.questions;

      if (typeof fetchedQuestions === "string") {
        const matches = [];
        const regex = /^\s*\d+\.\s+(.+)/gm;
        let match;

        while ((match = regex.exec(fetchedQuestions)) !== null) {
          matches.push(match[1].trim());
        }

        const firstName = user?.fullName?.split(" ")[0];

        formattedQuestions = [
          {
            questionText: `Hello ${firstName}, can you tell me about yourself, including your educational background and previous work experience?`,
            answer: null,
          },
          ...matches.map((q) => ({
            questionText: q,
            answer: null,
          })),
        ];
      }

      const saveRes = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/baseline/jobRoleAndQuestionsSave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobRole: "Resume Based",
            email,
            level,
            questions: formattedQuestions,
          }),
        }
      );

      const saveData = await saveRes.json();

      if (saveData?.data?._id) {
        localStorage.setItem("_id", saveData.data._id);
        localStorage.setItem("_idForReport", saveData.data._id);
        localStorage.setItem("apiResponseStatus", "success");
      }
    } catch (error) {
      console.error(error);
      localStorage.setItem("apiResponseStatus", "error");
      toast.error(error.message);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   localStorage.removeItem("apiResponseStatus");

  //   if (!resumeFile) {
  //     toast.error("Please upload your resume (PDF)");
  //     return;
  //   }

  //   toast.loading("Checking interview availability...");
  //   const userHasAvailableInterviews = await checkInterviewAvailability();
  //   toast.dismiss();

  //   if (!userHasAvailableInterviews) {
  //     setShowErrorModal(true);
  //     return;
  //   }

  //   toast.success("Parsing resume and generating questions...");

  //   // Convert resume to base64 to send to API
  //   const reader = new FileReader();
  //   reader.onload = async () => {
  //     const base64Resume = reader.result.split(",")[1];

  //     router.push("/resumeInstruction");

  //     let formattedQuestions = [];

  //     try {
  //       const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/resumeQuestionsFetch`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ resumeBase64: base64Resume, level ,resumeData }),
  //       });

  //       if (!res.ok) {
  //         const errorData = await res.json();
  //         throw new Error(errorData?.error || "Something went wrong. Please try again.");
  //       }

  //       const responseData = await res.json();
  //       let fetchedQuestions = responseData.questions;

  //       if (fetchedQuestions) {
  //         if (typeof fetchedQuestions === "string") {
  //           const matches = [];
  //           const patterns = [
  //             { regex: /\*\*\d+\.\s+([^*]+?)\*\*/g, type: "Bold with ** markers" },
  //             { regex: /^\s*\d+\.\s+([^(\n]+)/gm, type: "Regular numbered list" },
  //             { regex: /\d+\.\s+([^\n(]+)/g, type: "Simple number followed by text" },
  //           ];

  //           const questionText = fetchedQuestions.toString();

  //           for (const pattern of patterns) {
  //             let match;
  //             pattern.regex.lastIndex = 0;
  //             while ((match = pattern.regex.exec(questionText)) !== null) {
  //               if (match[1]) {
  //                 const question = match[1].trim();
  //                 matches.push(question);
  //               }
  //             }
  //             if (matches.length > 0) break;
  //           }

  //           const cleanedMatches = matches.map((q) => q.replace(/\*\*/g, "").trim());

  //           if (cleanedMatches.length > 0) {
  //             const firstName = user?.fullName?.split(" ")[0];
  //             formattedQuestions = [
  //               {
  //                 questionText: `Hello ${firstName}, can you tell me about yourself, including your educational background and previous work experience?`,
  //                 answer: null,
  //               },
  //             ];

  //             const additionalQuestions = cleanedMatches.map((qText) => ({
  //               questionText: qText.trim(),
  //               answer: null,
  //             }));

  //             formattedQuestions.push(...additionalQuestions);
  //           }
  //         }
  //       }

  //       if (formattedQuestions && formattedQuestions.length > 0) {
  //         const data = { jobRole: "Resume Based", email, level, questions: formattedQuestions };

  //         try {
  //           const saveRes = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/jobRoleAndQuestionsSave`, {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify(data),
  //           });

  //           if (!saveRes.ok) {
  //             const errorData = await saveRes.json();
  //             throw new Error(errorData?.error || "Something went wrong. Please try again.");
  //           }

  //           const response = await saveRes.json();

  //           if (response.data._id) {
  //             localStorage.removeItem("_id");
  //             localStorage.removeItem("_idForReport");
  //             localStorage.setItem("_id", response.data._id);
  //             localStorage.setItem("_idForReport", response.data._id);
  //           }

  //           localStorage.setItem("apiResponseStatus", "success");
  //         } catch (error) {
  //           console.error("Error saving questions:", error);
  //           localStorage.setItem("apiResponseStatus", "error");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error during resume question fetch:", error);
  //       localStorage.setItem("apiResponseStatus", "error");
  //     }
  //   };

  //   reader.readAsDataURL(resumeFile);
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("apiResponseStatus");

    if (!resumeFile && !savedResume) {
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
    // If existing resume was selected, use it directly
    if (savedResume) {
      await processResumeQuestions({
        resumeData: savedResume,
      });
      return;
    }
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Resume = reader.result.split(",")[1];

      await processResumeQuestions({
        resumeBase64: base64Resume,
      });
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
              className={`w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-700 hover:border-gray-500"
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

            <button
              type="button"
              onClick={handleUseExistingResume}
              className="mt-4 w-full rounded-lg border border-gray-700 py-3 text-sm font-medium transition hover:border-blue-500 hover:text-blue-500"
            >
              {loadingSavedResume ? "Loading..." : "Use Existing Resume"}
            </button>
          
              {savedResume && (
  <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-green-400">
          Existing Resume Selected
        </p>

      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowResumeModal(true)}
          className="rounded-lg border border-gray-600 px-3 py-1 text-xs text-gray-300 transition hover:bg-gray-800"
        >
          Preview
        </button>

        <button
          type="button"
          onClick={() => {
            setSavedResume(null);
            toast.success("Removed selected resume");
          }}
          className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
        >
          Remove
        </button>
      </div>
    </div>
  </div>
)}
            
          </div>

          {/* Level Selection */}
          <div>
            <h2 className="text-2xl font-normal text-center mb-6">Select Level</h2>
            <div className="space-y-4">
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                <label
                  key={lvl}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${level === lvl ? "border-black" : "border-gray-700"
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
      {showResumeModal && savedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray/20 p-2 sm:p-4">
          <div className="relative flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-700 bg-[#111827] shadow-2xl sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-700 px-4 py-4 sm:px-6">
              <div className="pr-4">
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Resume Preview
                </h2>
                <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Review your saved resume before continuing
                </p>
              </div>

              <button
                onClick={() => setShowResumeModal(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto px-3 py-4 sm:px-8 sm:py-6">
              <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-4 text-black shadow-lg sm:rounded-2xl sm:p-8">
                {(() => {
                  const formatDate = (date) => {
                    if (!date) return "";

                    if (typeof date === "string") {
                      const trimmed = date.trim();

                      if (
                        trimmed.toLowerCase() === "present" ||
                        trimmed.toLowerCase() === "current"
                      ) {
                        return "Present";
                      }

                      const parsed = new Date(trimmed);

                      if (!isNaN(parsed.getTime())) {
                        return parsed.toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        });
                      }

                      return trimmed;
                    }

                    if (date instanceof Date) {
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      });
                    }

                    if (typeof date === "object") {
                      if (date.month || date.year) {
                        return `${date.month || ""} ${date.year || ""}`.trim();
                      }

                      return Object.values(date).join(" ");
                    }

                    return String(date);
                  };

                  const summaryText =
                    typeof savedResume.summary === "string"
                      ? savedResume.summary
                      : savedResume.summary?.summary ||
                      savedResume.summary?.text ||
                      "";

                  const skillsList = Array.isArray(savedResume.skills)
                    ? savedResume.skills
                    : Object.values(savedResume.skills || {}).flat();

                  return (
                    <>
                      {/* Contact */}
                      <div className="border-b border-gray-200 pb-5 text-center">
                        <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                          {savedResume.contact?.name ||
                            savedResume.contact?.fullName ||
                            "Unnamed Candidate"}
                        </h1>

                        <div className="mt-3 flex flex-col items-center gap-1 text-sm text-gray-600 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                          {savedResume.contact?.email && (
                            <span className="break-all">
                              {savedResume.contact.email}
                            </span>
                          )}

                          {savedResume.contact?.phone && (
                            <span>{savedResume.contact.phone}</span>
                          )}

                          {savedResume.contact?.address && (
                            <span className="break-words">
                              {savedResume.contact.address}
                            </span>
                          )}

                          {savedResume.contact?.linkedin && (
                            <span className="break-all">
                              {savedResume.contact.linkedin}
                            </span>
                          )}

                          {savedResume.contact?.github && (
                            <span className="break-all">
                              {savedResume.contact.github}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Summary */}
                      {summaryText && (
                        <div className="mt-6">
                          <h3 className="mb-2 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                            Professional Summary
                          </h3>

                          <p className="text-sm leading-7 text-gray-700">
                            {summaryText}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {skillsList.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                            Skills
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            {skillsList.map((skill, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800 sm:text-sm"
                              >
                                {typeof skill === "string"
                                  ? skill
                                  : JSON.stringify(skill)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {savedResume.experience?.filter(
                        (exp) => exp?.company || exp?.jobTitle || exp?.role
                      ).length > 0 && (
                          <div className="mt-6">
                            <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                              Experience
                            </h3>

                            <div className="space-y-5">
                              {savedResume.experience
                                .filter(
                                  (exp) =>
                                    exp?.company || exp?.jobTitle || exp?.role
                                )
                                .map((exp, idx) => (
                                  <div key={idx}>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        {(exp.jobTitle || exp.role) && (
                                          <h4 className="break-words font-semibold text-gray-900">
                                            {exp.jobTitle || exp.role}
                                          </h4>
                                        )}

                                        {exp.company && (
                                          <p className="break-words text-sm text-gray-700">
                                            {exp.company}
                                          </p>
                                        )}
                                      </div>

                                      {(exp.start || exp.end) && (
                                        <p className="text-xs text-gray-500 sm:text-sm sm:whitespace-nowrap">
                                          {formatDate(exp.start)}
                                          {(exp.start || exp.end) && " - "}
                                          {exp.current
                                            ? "Present"
                                            : formatDate(exp.end) || "Present"}
                                        </p>
                                      )}
                                    </div>

                                    {exp.description && (
                                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
                                        {(Array.isArray(exp.description)
                                          ? exp.description
                                          : exp.description.split(
                                            /\r?\n|•|\. (?=[A-Z])/
                                          )
                                        )
                                          .map((line) => line.trim())
                                          .filter((line) => line.length > 0)
                                          .map((line, i) => (
                                            <li key={i}>
                                              {line.replace(/^[-•.\s]+/, "")}
                                            </li>
                                          ))}
                                      </ul>
                                    )}

                                    {exp.technologies && (
                                      <p className="mt-2 text-sm text-gray-600">
                                        {Array.isArray(exp.technologies)
                                          ? exp.technologies.join(", ")
                                          : exp.technologies}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Education */}
                      {savedResume.education?.filter(
                        (edu) => edu?.degree || edu?.school || edu?.college
                      ).length > 0 && (
                          <div className="mt-6">
                            <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                              Education
                            </h3>

                            <div className="space-y-4">
                              {savedResume.education
                                .filter(
                                  (edu) =>
                                    edu?.degree || edu?.school || edu?.college
                                )
                                .map((edu, idx) => (
                                  <div key={idx}>
                                    {edu.degree && (
                                      <h4 className="font-semibold text-gray-900">
                                        {edu.degree}
                                      </h4>
                                    )}

                                    {(edu.school || edu.college) && (
                                      <p className="text-sm text-gray-700">
                                        {edu.school || edu.college}
                                      </p>
                                    )}

                                    {(edu.start || edu.end) && (
                                      <p className="text-sm text-gray-500">
                                        {formatDate(edu.start)}
                                        {(edu.start || edu.end) && " - "}
                                        {formatDate(edu.end)}
                                      </p>
                                    )}

                                    {edu.institution && (
                                      <p className="text-sm text-gray-500">
                                        {edu.institution}
                                      </p>
                                    )}

                                    {(edu.gpa || edu.grade) && (
                                      <p className="text-sm text-gray-500">
                                        Grade: {edu.gpa || edu.grade}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Projects */}
                      {savedResume.projects?.filter(
                        (project) => project?.title || project?.name
                      ).length > 0 && (
                          <div className="mt-6">
                            <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                              Projects
                            </h3>

                            <div className="space-y-5">
                              {savedResume.projects
                                .filter(
                                  (project) => project?.title || project?.name
                                )
                                .map((project, idx) => (
                                  <div key={idx}>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <h4 className="break-words font-semibold text-gray-900">
                                          {project.title || project.name}
                                        </h4>
                                      </div>

                                      {(project.start || project.end) && (
                                        <p className="text-xs text-gray-500 sm:text-sm sm:whitespace-nowrap">
                                          {formatDate(project.start)}
                                          {(project.start || project.end) && " - "}
                                          {formatDate(project.end)}
                                        </p>
                                      )}
                                    </div>

                                    {project.technologies && (
                                      <p className="mt-1 text-sm text-blue-700 break-words">
                                        {Array.isArray(project.technologies)
                                          ? project.technologies.join(", ")
                                          : project.technologies}
                                      </p>
                                    )}

                                    {project.description && (
                                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700">
                                        {(Array.isArray(project.description)
                                          ? project.description
                                          : project.description.split(
                                            /\r?\n|•|\. (?=[A-Z])/
                                          )
                                        )
                                          .map((line) => line.trim())
                                          .filter((line) => line.length > 0)
                                          .map((line, i) => (
                                            <li key={i}>
                                              {line.replace(/^[-•.\s]+/, "")}
                                            </li>
                                          ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Certificates */}
                      {savedResume.certificates?.filter(
                        (cert) => cert?.name || cert?.title
                      ).length > 0 && (
                          <div className="mt-6">
                            <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                              Certificates
                            </h3>

                            <div className="space-y-4">
                              {savedResume.certificates
                                .filter((cert) => cert?.name || cert?.title)
                                .map((cert, idx) => (
                                  <div key={idx}>
                                    <h4 className="font-semibold text-gray-900">
                                      {cert.name || cert.title}
                                    </h4>

                                    {(cert.issuer || cert.organization) && (
                                      <p className="text-sm text-gray-700">
                                        {cert.issuer || cert.organization}
                                      </p>
                                    )}

                                    {(cert.date || cert.issuedOn) && (
                                      <p className="text-sm text-gray-500">
                                        {formatDate(cert.date || cert.issuedOn)}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Languages */}
                      {savedResume.languages?.length > 0 && (
                        <div className="mt-6">
                          <h3 className="mb-3 border-b border-gray-200 pb-1 text-base font-semibold uppercase tracking-wide text-blue-700 sm:text-lg">
                            Languages
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            {savedResume.languages.map((lang, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800 sm:text-sm"
                              >
                                {typeof lang === "string"
                                  ? lang
                                  : `${lang.language || lang.name || ""}${lang.proficiency || lang.level
                                    ? ` - ${lang.proficiency || lang.level
                                    }`
                                    : ""
                                  }`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-700 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setShowResumeModal(false)}
                className="w-full rounded-xl border border-gray-600 px-5 py-2 text-sm text-gray-300 transition hover:bg-gray-800 sm:w-auto"
              >
                Close
              </button>

              {/* <button
                type="button"
                onClick={async () => {
                  setShowResumeModal(false);

                  toast.success(
      "Resume selected. Now choose your level and click Start Resume Interview."
    );
                }}
                className="w-full rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-blue-400 sm:w-auto"
              >
                
              </button> */}
            </div>
          </div>
        </div>
      )}
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