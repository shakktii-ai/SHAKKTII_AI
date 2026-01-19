import React, { useState, useEffect ,useCallback} from "react";
import { useRouter } from "next/router";

function ExcelTest() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [submitting, setSubmitting] = useState(false); // loader state
  const [timerId, setTimerId] = useState(null); // store interval ID
  const [userId, setUserId] = useState(null);
  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/excelTest/questions");
      const data = await res.json();
      setQuestions(data?.questions || []);
      setShowInstructions(true);
    } catch (err) {
      console.error("Error fetching questions", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);
useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && (user._id || user.id)) {
        setUserId(user._id || user.id);
      }
    } catch (e) {
      console.error("Error getting user ID:", e);
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
      return;
    }

    fetchQuestions();
  }, [fetchQuestions, router]);
  // Start global timer
  const startTest = () => {
    setShowInstructions(false);
    setTimeLeft(600); // reset 10 min
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          evaluateTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      evaluateTest();
    }
  };

  const evaluateTest = async () => {
    if (!userId) {
      console.error("❌ No userId found, cannot evaluate test");
      return;
    }

    try {
      setSubmitting(true);
      if (timerId) clearInterval(timerId);

      const formattedAnswers = questions.map((q) => ({
        id: q.id,
        question: q.question,
        correctAnswer: q.answer,
        userAnswer: answers[q.id] || null,
      }));

      const res = await fetch(
        `/api/excelTest/evaluate?userId=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions, answers: formattedAnswers }),
        }
      );

      const result = await res.json();
      setReport(result.data);
      setShowResult(true);
    } catch (err) {
      console.error("Error evaluating test", err);
    } finally {
      setSubmitting(false);
    }
  };

  const restartTest = async () => {
    if (timerId) clearInterval(timerId);
    setAnswers({});
    setCurrentQ(0);
    setShowResult(false);
    setReport(null);
    setShowInstructions(false);
    setLoading(true);
    setTimeLeft(600);
    setSubmitting(false);

    try {
      const res = await fetch("/api/excelTest/questions");
      const data = await res.json();
      setQuestions(data?.questions || []);
      setShowInstructions(true);
    } catch (err) {
      console.error("Error fetching questions", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Loading
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading questions...</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center text-xl">No questions available</div>;

  // Instructions
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Excel Assessment Test</h1>
        <div className="max-w-2xl w-full bg-[#D2E9FA] rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Instructions</h2>
            <div className="prose max-w-none text-gray-700 mb-8">
              <p className="mb-4"> This Excel test consists of <b>{questions.length}</b> questions designed to assess your knowledge of Excel functions, formulas, and practical usage. </p>
              <p className="mb-4"> You have a total of <b>10 minutes</b> to complete the test. The timer will start as soon as the first question is shown. </p>
              <p className="mb-6"> Once started, you cannot go back to previous questions. Answer carefully and within the given time. </p>
              <div className="bg-white p-4 rounded-lg border shadow-inner border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2"> Tips for best performance: </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Read each question carefully</li>
                  <li>Answer within the time limit</li>
                  <li> Some questions may look simple, but check details like cell ranges or formulas </li>
                </ul>
              </div>
            </div>
            <button onClick={startTest} className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700">Start Test</button>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Test Completed</h2>
          <p className="mb-2">Score: {report?.score ?? 0}/{questions.length}</p>
          <p className="mb-2">Percentage: {report?.percentage ?? 0}%</p>
          <p className="mb-2">Feedback: {report?.feedback ?? "No feedback"}</p>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={restartTest} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Restart Test</button>
            <button onClick={() => router.push('/practices')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Back to Practices</button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Question {currentQ + 1} of {questions.length}</h2>
          <span className="text-red-600 font-semibold">Time Left: {formatTime(timeLeft)}</span>
        </div>
        <p className="mb-4">{questions[currentQ].question}</p>
        {questions[currentQ].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setAnswers({ ...answers, [questions[currentQ].id]: option })}
            className={`block w-full mb-2 p-2 rounded ${answers[questions[currentQ].id] === option ? "bg-blue-50 border border-blue-300 text-black" : "bg-white border border-blue-300 hover:bg-blue-100"}`}
            disabled={submitting} // disable while submitting
          >
            {option}
          </button>
        ))}

        <div className="flex justify-end mt-4">
          {currentQ < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={!answers[questions[currentQ].id] || submitting}
            >
              Next
            </button>
          ) : (
            <button
              onClick={evaluateTest}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={!answers[questions[currentQ].id] || submitting}
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                  Submitting...
                </>
              ) : (
                "Submit Test"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExcelTest;
