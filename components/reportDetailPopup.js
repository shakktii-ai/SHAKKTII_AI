

import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/router';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { jsPDF } from "jspdf";

function ReportDetailPopup({ user, isOpen, setIsOpen }) {
  if (!isOpen ) return null;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [isEmailFetched, setIsEmailFetched] = useState(false);
  const [visibility, setVisibility] = useState({
    report: false,
    previousReports: false,
  });
  const [reportVisibility, setReportVisibility] = useState([]);

  const handleClosee = (e) => {
    e.stopPropagation();  // Prevent the click event from propagating to the parent
    setIsOpen(false); // Close the modal
  };

  const extractScore = (report, scoreType) => {
    // console.log("Extracting score from:", report);s

    if (!report || !report.reportAnalysis) {
      return 0; // Return 0 if no report or reportAnalysis field is available
    }



    // const match = report.reportAnalysis.match(scoreRegex);
    const regexNoParentheses = new RegExp(`${scoreType}:\\s*(\\d+\\/10)`, 'i');

    // Regex to match '(2/10)' with parentheses
    const regexWithParentheses = new RegExp(`${scoreType}:\\s*\\((\\d+\\/10)\\)`, 'i');


    const match = report.reportAnalysis.match(regexNoParentheses) || report.reportAnalysis.match(regexWithParentheses);


    if (match) {
      return parseInt(match[1], 10); // Return the numeric value found
    }

    return 0; // Return 0 if no score is found
  };
  
  const extractScoreAndFeedback = (report, category) => {
    // console.log(report);

    if (!report || !report.reportAnalysis) {
      return { score: 0, feedback: 'No data available.' };
    }

    // Regex to extract score (format: "Technical Proficiency: 2/10")
    const scoreRegex = new RegExp(`${category}:\\s*(\\d+\\/10)`, 'i');//**Technical Proficiency: 0/10**
    const regexWithParentheses = new RegExp(`${category}:\\s*\\((\\d+\\/10)\\)`, 'i');//**Technical Proficiency: (0/10)**
    const scoreStarRegex = new RegExp(`${category}:\\*\\*\\s*(\\d+/10)`, 'i');  //**Technical Proficiency:** 0/10

    const scoreoverallRegex = new RegExp(`${category}:\\s*(\\d+\\/50)`, 'i');
    const regexWithoverallParentheses = new RegExp(`${category}:\\s*\\((\\d+\\/50)\\)`, 'i');
    const scoreStarOverallRegex = new RegExp(`${category}:\\*\\*\\s*(\\d+/50)`, 'i');

    const feedbackRegex = new RegExp(`${category}:\\s*(\\d+/10)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i');
    const feedbackRegexParentheses = new RegExp(`${category}:\\s*\\((\\d+/10)\\)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall Report|$)`, 'i');
    const feedbackRegexStarParentheses = new RegExp(`${category}:\\*\\*\\s*(\\d+/10)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall Report|$)`, 'i');
    
    const feedbackOverallRegex = new RegExp(`${category}:\\s*(\\d+/50)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall|$)`, 'i');
    const feedbackRegexOverallParentheses = new RegExp(`${category}:\\s*\\((\\d+/50)\\)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall Report|$)`, 'i');
    const feedbackRegexStarOverallParentheses = new RegExp(`${category}:\\*\\*\\s*(\\d+/50)\\s*([^]*?)(?=\n[A-Z][a-zA-Z ]+:|Overall Report|$)`, 'i');



    const scoreMatch = report.reportAnalysis.match(scoreRegex) || report.reportAnalysis.match(regexWithParentheses) || report.reportAnalysis.match(scoreoverallRegex) || report.reportAnalysis.match(regexWithoverallParentheses)||report.reportAnalysis.match(scoreStarRegex)||report.reportAnalysis.match(scoreStarOverallRegex)
    const feedbackMatch = report.reportAnalysis.match(feedbackRegex) || report.reportAnalysis.match(feedbackRegexParentheses) ||report.reportAnalysis.match(feedbackOverallRegex) || report.reportAnalysis.match(feedbackRegexOverallParentheses)||report.reportAnalysis.match(feedbackRegexStarParentheses)||report.reportAnalysis.match(feedbackRegexStarOverallParentheses)
    // console.log(feedbackMatch);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
    const feedback = feedbackMatch ? feedbackMatch[0] : 'No feedback available.';

    return { score, feedback };
  };

  // Extract Overall Score

  // Extract Recommendations
  const extractRecommendations = (report) => {
    const regex = /Recommendation:([\s\S]*?)(?=(\n|$))/i;
    const match = report.reportAnalysis.match(regex);
    return match ? match[1].trim() : 'No recommendations available.';
  };

  // Fetch email from localStorage
  useEffect(() => {
    const userFromStorage = user
    if (userFromStorage) {
      // const parsedUser = JSON.parse(userFromStorage);
      const email = userFromStorage.email;

      if (email) {
        setEmail(email);
        setIsEmailFetched(true);
        setVisibility((prevVisibility) => ({
          ...prevVisibility,
          previousReports: true,
        }));
      } else {
        setError("Email is missing in localStorage");
      }
    } else {
      setError("No user data found in localStorage");
    }
  }, []);

  // Fetch reports when email is set
  useEffect(() => {
    if (email && isEmailFetched) {
      const fetchReportsByEmail = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/saveAndGetReport?email=${email}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch reports, status: ${response.status}`);
          }
          const data = await response.json();
          if (data.reports && data.reports.length > 0) {
            const sortedReports = data.reports.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA;
            });
            setReports(sortedReports);
            setReportVisibility(new Array(sortedReports.length).fill(false));
          } else {
            setReports([]);
          }
        } catch (err) {
          setError(`Error fetching reports: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchReportsByEmail();
    }
  }, [email, isEmailFetched]);

  // Handle Go Back Logic
  const goBack = () => {
    if (document.referrer.includes('/report')) {
      router.push('/');
    } else {
      router.back('/');
    }
  };

  // Handle toggle visibility of report sections
  const toggleVisibility = (section) => {
    setVisibility((prevVisibility) => ({
      ...prevVisibility,
      [section]: !prevVisibility[section],
    }));
  };

  // Toggle visibility for individual reports
  const toggleIndividualReportVisibility = (index) => {
    setReportVisibility((prevVisibility) => {
      const newVisibility = [...prevVisibility];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // Generate PDF Report
  const downloadReport = (reportContent, report) => {
    const doc = new jsPDF();
    const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown Date";
    let marginX = 20;
    let marginY = 20;
    let pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(20);
    doc.text("Interview Report", doc.internal.pageSize.width / 2, marginY, { align: "center" });

    // Report Role and Date
    marginY += 15;
    doc.setFontSize(14);
    doc.text(`Role: ${report.role}`, marginX, marginY);
    marginY += 10;
    doc.text(`Date: ${reportDate}`, marginX, marginY);

    // Analysis Header
    marginY += 15;
    doc.setFontSize(14);
    doc.text("Analysis:", marginX, marginY);

    // Wrap long content
    doc.setFontSize(12);
    marginY += 10;
    let wrappedText = doc.splitTextToSize(reportContent.replace(/<[^>]*>/g, ' '), 170);
    wrappedText.forEach(line => {
      if (marginY + 10 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.text(line, marginX, marginY);
      marginY += 7;
    });

    // Scores Section
    marginY += 10;
    const scores = [
      { label: 'Technical Proficiency', score: extractScore(report, 'Technical Proficiency') },
      { label: 'Communication', score: extractScore(report, 'Communication') },
      { label: 'Decision-Making', score: extractScore(report, 'Decision-Making') },
      { label: 'Confidence', score: extractScore(report, 'Confidence') },
      { label: 'Language Fluency', score: extractScore(report, 'Language Fluency') },
      { label: 'Overall Score', score: extractScore(report, 'Overall Score') },
    ];

    scores.forEach((score) => {
      if (marginY + 15 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.setFontSize(12);
      doc.text(`${score.label}:`, marginX, marginY);

      // Progress Bar (Replaces Circle)
      let progressWidth = (score.score / 10) * 50;
      doc.setFillColor(50, 150, 250); // Blue color
      doc.rect(marginX + 80, marginY - 5, progressWidth, 5, "F"); // Progress bar
      doc.text(`${score.score}/10`, marginX + 140, marginY);

      marginY += 15;
    });

    // Separator Line
    if (marginY + 10 > pageHeight - 20) {
      doc.addPage();
      marginY = 20;
    }
    doc.setLineWidth(0.5);
    doc.line(marginX, marginY, 190, marginY);
    marginY += 10;

    // Recommendations Section
    if (marginY + 10 > pageHeight - 20) {
      doc.addPage();
      marginY = 20;
    }
    doc.setFontSize(12);
    doc.text("Recommendations:", marginX, marginY);
    marginY += 10;
    doc.setFontSize(12);
    doc.text(extractRecommendations(report), marginX, marginY);

    // Save the PDF
    doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }




  const ScoreCard = ({ label, score, feedback }) => {
    const isOverallScore = label === 'Overall Score';
    const maxScore = isOverallScore ? 50 : 10;  // Set max score to 50 for Overall Score, else 10
    const scoreText = isOverallScore ? `${score}/50` : `${score}/10`; // Display score accordingly
    
    return (
      <div className="card-container text-black">
        <div className="card relative w-full h-full">
          {/* Front Side */}
          <div className="front flex justify-center items-center p-4 bg-[#b393f8] rounded-lg">
            <div>
              <h5 className="text-xl font-semibold">{label}</h5>
              <div className="mt-4">
                <CircularProgressbar
                  value={score}
                  maxValue={maxScore} // Dynamically set maxValue
                  text={scoreText}  // Dynamically set text
                  strokeWidth={12}
                  styles={{
                    path: { stroke: '#0700e7' },
                    trail: { stroke: '#e0e0e0' },
                    text: { fill: '#000000', fontSize: '18px', fontWeight: 'bold' },
                  }}
                />
              </div>
            </div>
          </div>
  
          {/* Back Side */}
          <div className="back flex flex-col justify-center items-center p-4 bg-[#b393f8] rounded-lg overflow-y-auto">
            <h5 className="text-xl font-semibold">{label} - Details</h5>
            <p className="mt-4 text-sm">
              {feedback.split(" ").slice(0, 32).join(" ")}...
            </p>
  
            <p className="mt-4 text-sm">Learn More</p>
          </div>
        </div>
      </div>
    );
  };
  

return (
    <div
      className="modal-background text-white"
      onClick={handleClosee} // Close modal if clicked outside
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()} // Prevent closing if clicked inside modal
      >
        <div className="modal-header">
          <div className="back-button" onClick={handleClosee}>
            <IoIosArrowBack />
          </div>
          <h1 className="text-center">Interview Report</h1>
        </div>
        
        <div className="mx-auto mt-5">
          {visibility.previousReports && (
            <div className="mx-auto">
              {reports && reports.length > 0 ? (
                reports.map((report, index) => (
                  <div
                    key={index}
                    className="bg-transparent shadow-lg rounded-lg p-2 max-w-2xl mx-auto"
                  >
                    <div
                      className="bg-purple-500 text-white p-4 rounded-t-lg cursor-pointer flex justify-between items-center"
                      onClick={() => toggleIndividualReportVisibility(index)}
                    >
                      {/* Hide the toggle text if the report is visible */}
                      <span>{reportVisibility[index] ? 'Hide Report' : 'Show Report'} ▼</span>
                      <span className="text-sm">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>

                    {reportVisibility[index] && (
                      <div className="p-4">
                        <h2 className="text-lg font-semibold">
                          <strong>Role:</strong> {report.role}
                        </h2>
                        <div className="report-analysis mt-4">
                          <h4 className="text-xl font-semibold mb-2">
                            <strong>Analysis</strong>
                          </h4>

                          <div className="score-cards-container">
                            {['Technical Proficiency', 'Communication', 'Decision-Making', 'Confidence', 'Language Fluency', 'Overall Score'].map((category) => {
                              const { score, feedback } = extractScoreAndFeedback(report, category);
                              return <ScoreCard key={category} label={category} score={score} feedback={feedback} />;
                            })}
                          </div>

                          <button
                            className="button mt-4"
                            onClick={() => downloadReport(report.reportAnalysis, report)}
                          >
                            Download Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center mt-5 text-gray-600">For Report Visit After 5 Min</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}

export default ReportDetailPopup;
