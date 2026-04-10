import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function TechnicalTestHistory() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const userObj = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;

    if (userObj && userObj.email) {
      setUserEmail(userObj.email);
      fetchTechnicalReports(userObj.email);
    } else {
      setLoading(false);
      setError('User not found. Please login again.');
    }
  }, []);

  const fetchTechnicalReports = async (email) => {
    try {
      const response = await fetch(`/api/getTechnicalReports?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports || []);
      } else {
        setError('Failed to fetch technical reports');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const handleShowMe = () => {
    router.push('/techMock');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 40) return '#ef4444';
    return '#dc2626';
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 p-6 rounded">
          <p>{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Technical Test History</title>
      </Head>

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Technical Test History</h1>

        <div className="text-center mb-6">
          <button
            onClick={handleShowMe}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            New Test
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center text-gray-500">
            No reports found
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={report._id} className="bg-white shadow p-5 rounded">

                {/* Header */}
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">Technical Assessment</h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12">
                      <CircularProgressbar
                        value={report.percentage}
                        text={`${report.percentage}%`}
                        styles={buildStyles({
                          textSize: '12px',
                          pathColor: getScoreColor(report.percentage),
                          textColor: '#000',
                        })}
                      />
                    </div>

                    <div>
                      <p
                        className="text-xl font-bold"
                        style={{ color: getScoreColor(report.percentage) }}
                      >
                        {report.percentage}%
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: getScoreColor(report.percentage) }}
                      >
                        {getPerformanceLevel(report.percentage)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p><b>Subject:</b> {report.subject}</p>
                    <p><b>Total Questions:</b> {report.totalQuestions}</p>
                    <p><b>Correct:</b> {report.score}</p>
                  </div>
                  <div>
                    <p><b>College:</b> {report.collageName}</p>
                    <p><b>Accuracy:</b> {report.percentage}%</p>
                  </div>
                </div>

                {/* Questions */}
                {report.questionResponses?.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Questions</h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {report.questionResponses.map((q, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded ${
                            q.isCorrect ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <p className="text-sm font-medium">
                            Q{i + 1}: {q.questionText?.substring(0, 80)}...
                          </p>
                          <p className="text-xs">
                            Your: {q.userAnswer}
                          </p>
                          <p className="text-xs">
                            Correct: {q.correctAnswer}
                          </p>

                          <p
                            className="text-xs font-bold mt-1"
                            style={{
                              color: q.isCorrect ? 'green' : 'red'
                            }}
                          >
                            {q.isCorrect ? 'Correct' : 'Incorrect'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}

export default TechnicalTestHistory;
