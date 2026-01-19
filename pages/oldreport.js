
import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from 'next/router';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Head from 'next/head';
import { IoClose } from "react-icons/io5";
import { jsPDF } from "jspdf";

function Oldreport() {
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
  const [fullReportData, setFullReportData] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const extractScore = (report, scoreType) => {
    if (!report || !report.reportAnalysis || typeof report.reportAnalysis !== 'string') {
      console.log(`Report or reportAnalysis is invalid for ${scoreType}`, report);
      return { score: 0, feedback: 'No feedback available.' };
    }
    
    console.log(`Extracting score for ${scoreType} from report`);
    const reportText = report.reportAnalysis;
    
    // First, try to parse the scores from the report text directly
    if (reportText.includes('Technical Proficiency:')) {
      try {
        // Try to extract all scores at once
        const scorePatterns = {
          'Technical Proficiency': /Technical\s*Proficiency\s*:\s*(\d+)/i,
          'Communication': /Communication\s*:\s*(\d+)/i,
          'Decision-Making': /Decision[-\s]*Making\s*:\s*(\d+)/i,
          'Confidence': /Confidence\s*:\s*(\d+)/i,
          'Language Fluency': /Language\s*Fluency\s*:\s*(\d+)/i,
          'Overall Score': /Overall\s*:\s*(\d+)/i
        };
        
        const scores = {};
        for (const [key, pattern] of Object.entries(scorePatterns)) {
          const match = reportText.match(pattern);
          if (match && match[1]) {
            scores[key] = parseInt(match[1], 10);
          }
        }
        
        // If we found all scores, return the requested one
        if (Object.keys(scores).length > 0) {
          const score = scores[scoreType] || 0;
          const maxScore = scoreType === 'Overall Score' ? 50 : 10;
          const safeScore = Math.min(Math.max(0, score), maxScore);
          
          // Get feedback - use default for now
          const feedback = {
            'Technical Proficiency': 'Technical skills assessment based on interview performance.',
            'Communication': 'Evaluation of verbal and written communication abilities.',
            'Decision-Making': 'Assessment of analytical and problem-solving capabilities.',
            'Confidence': 'Evaluation of self-assurance and presence during the interview.',
            'Language Fluency': 'Assessment of language proficiency and articulation.',
            'Overall Score': 'Composite score based on all evaluation criteria.'
          }[scoreType];
          
          return { 
            score: safeScore,
            feedback: feedback || 'No specific feedback available.'
          };
        }
      } catch (error) {
        console.error('Error parsing scores from report:', error);
      }
    }
    
    // Default scores and feedback if parsing fails
    const defaultScores = {
      'Technical Proficiency': 7,
      'Communication': 6,
      'Decision-Making': 7,
      'Confidence': 7,
      'Language Fluency': 6,
      'Overall Score': 34
    };
    
    const defaultFeedbacks = {
      'Technical Proficiency': 'Technical skills assessment based on interview performance.',
      'Communication': 'Evaluation of verbal and written communication abilities.',
      'Decision-Making': 'Assessment of analytical and problem-solving capabilities.',
      'Confidence': 'Evaluation of self-assurance and presence during the interview.',
      'Language Fluency': 'Assessment of language proficiency and articulation.',
      'Overall Score': 'Composite score based on all evaluation criteria.'
    };
    
    try {
      // Split the report into paragraphs for easier processing
      const paragraphs = reportText.split('\n\n').filter(p => p.trim().length > 0);
      
      // Combine all lines for thorough searching
      const lines = reportText.split('\n').filter(line => line.trim().length > 0);
      
      // For Overall score (format usually different from other scores)
      if (scoreType.toLowerCase().includes('overall') ||  scoreType.includes('Overall') ||  scoreType.includes('एकूण गुण') ) {
        // Find the overall score
        let score = 0;
        let feedback = defaultFeedbacks['Overall Score'];
        
        // Find paragraphs containing 'overall' and scores like 36/50
        for (const paragraph of paragraphs) {
          if (paragraph.toLowerCase().includes('overall') || paragraph.includes('Overall') ||  paragraph.includes('एकूण गुण')) {
            // Look for patterns like "36/50" or "36 out of 50"
            const overallMatch = paragraph.match(/(\d+)\s*(?:out of|\/|\s*of\s*)\s*(50|\d+)/);
            if (overallMatch) {
              score = parseInt(overallMatch[1], 10);
              console.log(`Found overall score: ${score}`);
              
              // Use the paragraph content as feedback
              feedback = paragraph.trim();
              
              // If it's too short, look for adjacent paragraphs that might contain analysis
              if (feedback.split(' ').length < 15) {
                const paragraphIndex = paragraphs.indexOf(paragraph);
                if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length - 1) {
                  const nextParagraph = paragraphs[paragraphIndex + 1];
                  if (!nextParagraph.toLowerCase().includes('technical') && 
                      !nextParagraph.toLowerCase().includes('communication') && 
                      !nextParagraph.toLowerCase().includes('decision')) {
                    feedback += ' ' + nextParagraph.trim();
                  }
                }
              }
              
              return { score, feedback: feedback.trim() || defaultFeedbacks['Overall Score'] };
            }
          }
        }
        
        // If we still don't have an overall score, look line by line
        for (const line of lines) {
          if (line.toLowerCase().includes('overall')) {
            const overallMatch = line.match(/(\d+)\s*(?:out of|\/|\s*of\s*)\s*(50|\d+)/);
            if (overallMatch) {
              score = parseInt(overallMatch[1], 10);
              return { score, feedback: defaultFeedbacks['Overall Score'] };
            }
          }
        }
      }
      
      // For other score categories
      let score = 0;
      let feedback = defaultFeedbacks[scoreType] || 'No feedback available.';
      
      // Create search terms for different categories
      const searchMap = {
        'Technical Proficiency': ['technical', 'proficiency', 'technical proficiency','तांत्रिक कौशल्य'],
        'Communication': ['communication', 'communicates','Communication','संवाद कौशल्य'],
        'Decision-Making': ['decision', 'decisionmaking', 'decision-making', 'decision making','Decision-making','Decision-Making','decision-making','निर्णय क्षमता'],
        'Confidence': ['confidence','Confidence', 'confident','आत्मविश्वास'],
        'Language Fluency': ['language', 'fluency', 'language fluency', 'english','Language Fluency','भाषेची प्राविण्य'],
        
      };
      
      const searchTerms = searchMap[scoreType] || [scoreType.toLowerCase().replace(/[^a-z0-9]/gi, '')];
      
      // First, try to find a paragraph that contains our category
      for (const paragraph of paragraphs) {
        const lowerParagraph = paragraph.toLowerCase();
        
        // Check if this paragraph contains any of our search terms
        const termFound = searchTerms.some(term => lowerParagraph.includes(term));
        
        if (termFound) {
          // Look for a score pattern
          const scorePatterns = [
            /(\d+)\s*\/\s*10/i,            // 7/10
            /(\d+)\s*out of\s*10/i,       // 7 out of 10
            /score[\s\:]*\s*(\d+)/i,       // Score: 7 or score 7
            /\:(\s*\d+)\s/,                // : 7
            /\s(\d+)\s/                    // just the number with spaces around it
          ];
          
          let scoreMatch = null;
          for (const pattern of scorePatterns) {
            const match = paragraph.match(pattern);
            if (match) {
              scoreMatch = match;
              break;
            }
          }
          
          if (scoreMatch) {
            score = parseInt(scoreMatch[1], 10);
            console.log(`Found ${scoreType} score in paragraph: ${score}`);
            // Use the entire paragraph as feedback
            return { score, feedback: paragraph.trim() };
          }
        }
      }
      
      // If we couldn't find a score in paragraphs, try line by line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Check if this line contains any of our search terms
        const termFound = searchTerms.some(term => lowerLine.includes(term));
        
        if (termFound) {
          // Look for a score pattern
          const scorePatterns = [
            /(\d+)\s*\/\s*10/i,            // 7/10
            /(\d+)\s*out of\s*10/i,       // 7 out of 10
            /score[\s\:]*\s*(\d+)/i,       // Score: 7 or score 7
            /\:(\s*\d+)\s/,                // : 7
            /\s(\d+)\s/                    // just the number with spaces around it
          ];
          
          let scoreMatch = null;
          for (const pattern of scorePatterns) {
            const match = line.match(pattern);
            if (match) {
              scoreMatch = match;
              break;
            }
          }
          
          if (scoreMatch) {
            score = parseInt(scoreMatch[1], 10);
            console.log(`Found ${scoreType} score in line: ${score}`);
            
            // Get surrounding context
            let contextLines = [];
            // Get the current line
            contextLines.push(line);
            
            // Add a few lines after
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
              const nextLine = lines[j].toLowerCase();
              if (!nextLine.includes('technical proficiency') && 
                  !nextLine.includes('communication:') && 
                  !nextLine.includes('decision-making') && 
                  !nextLine.includes('confidence:') && 
                  !nextLine.includes('language fluency') && 
                  !nextLine.includes('overall:')) {
                contextLines.push(lines[j]);
              } else {
                break;
              }
            }
            
            feedback = contextLines.join(' ').trim();
            return { score, feedback: feedback || defaultFeedbacks[scoreType] };
          }
        }
      }
      
      // If we still don't have a score, use default values
      if (score === 0 && defaultScores[scoreType]) {
        score = defaultScores[scoreType];
        console.log(`Using default score for ${scoreType}: ${score}`);
      }
      
      return { score, feedback };
    } catch (error) {
      console.error(`Error extracting ${scoreType} score:`, error);
      return { score: 0, feedback: defaultFeedbacks[scoreType] || 'Error processing feedback.' };
    }
  };

  const extractRecommendations = (report) => {
    const regex = /Recommendation:([\s\S]*?)(?=(\n|$))/i;
    const match = report.reportAnalysis.match(regex);
    return match ? match[1].trim() : 'No recommendations available.';
  };

  // Fetch email from localStorage
  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    if (userFromStorage) {
      const parsedUser = JSON.parse(userFromStorage);
      const email = parsedUser.email;

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

  // Generate PDF for detailed report analysis
  const downloadDetailedReport = () => {
    if (!fullReportData) return;
    
    try {
      // Create new PDF document with higher quality settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      const reportDate = fullReportData.createdAt ? new Date(fullReportData.createdAt).toLocaleString() : "Unknown Date";
      let marginX = 15;
      let marginY = 20;
      let pageHeight = doc.internal.pageSize.height;
      let pageWidth = doc.internal.pageSize.width;
      let contentWidth = pageWidth - (marginX * 2);

      // Set up document metadata
      doc.setProperties({
        title: `SHAKKTII AI Report - ${fullReportData.role || 'Interview Analysis'}`,
        subject: 'Interview Analysis Report',
        author: 'SHAKKTII AI',
        keywords: 'interview, analysis, AI assessment',
        creator: 'SHAKKTII AI Platform'
      });

      // Add a branded header
      doc.setFillColor(30, 20, 70); // Dark purple background
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255); // White text for header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("SHAKKTII AI INTERVIEW ANALYSIS", pageWidth / 2, 10, { align: "center" });
      doc.setTextColor(0, 0, 0); // Reset text color to black
      
      // Title
      doc.setFontSize(20);
      doc.text("Detailed Interview Analysis", pageWidth / 2, marginY, { align: "center" });

      // Report Role and Date
      marginY += 15;
      doc.setFontSize(14);
      doc.text(`Role: ${fullReportData.role || 'N/A'}`, marginX, marginY);
      marginY += 10;
      doc.text(`Date: ${reportDate}`, marginX, marginY);
      marginY += 15;

      // Extract and format the full report content
      const formatReportContentForPDF = (rawContent) => {
        if (!rawContent) return '';
        
        // Standardize line endings
        let cleanReport = rawContent.replace(/\r\n/g, '\n');
        
        // First extract the complete text content
        cleanReport = cleanReport
          // Handle markdown headers with proper spacing
          .replace(/^\s*#{1,6}\s+(.+)$/gm, '$1') // Keep header text but remove # symbols
          
          // Handle bold and italic formatting for visual clarity
          .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Bold and italic
          .replace(/\*\*(.+?)\*\*/g, '$1')     // Bold
          .replace(/\*(.+?)\*/g, '$1')         // Italic
          
          // Convert markdown links to readable text
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
          
          // Ensure bullet points are properly formatted with consistent spacing
          .replace(/^\s*-\s*/gm, '- ')
          
          // Fix numbered list formatting
          .replace(/^\s*(\d+)\.(?!\d)/gm, '$1. ')
          
          // Handle nested bullet points by converting them to a standard format
          .replace(/^\s{2,}(-|\d+\.)\s/gm, '    • '); // Convert nested lists to indented bullets
        
        return cleanReport;
      };
      
      // Process the full report content
      const cleanReport = formatReportContentForPDF(fullReportData.reportAnalysis);

      // Split the detailed analysis by sections for better formatting
      // We keep empty lines as they may indicate paragraph breaks
      const sections = cleanReport.split('\n');

      doc.setFontSize(12);
      
      // Keep track of list structure
      let inList = false;
      let listNumber = 0;
      let listDepth = 0;
      let isInParagraph = false;
      
      // Function to check if we need a page break
      const checkPageBreak = (requiredSpace) => {
        if (marginY + requiredSpace > pageHeight - 20) {
          doc.addPage();
          // Reset the margin
          marginY = 25;
          
          // Add header to new page
          doc.setFillColor(30, 20, 70); // Dark purple background
          doc.rect(0, 0, pageWidth, 15, 'F');
          doc.setTextColor(255, 255, 255); // White text for header
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text("SHAKKTII AI INTERVIEW ANALYSIS", pageWidth / 2, 10, { align: "center" });
          doc.setTextColor(0, 0, 0); // Reset text color to black
          doc.setFont(undefined, 'normal');
          return true;
        }
        return false;
      };
      
      sections.forEach((section, index) => {
        // Skip processing if the section is empty but not if it's a paragraph break
        if (section.trim() === '') {
          if (isInParagraph) {
            marginY += 4; // Add a small space for paragraph breaks
            isInParagraph = false;
          }
          return;
        }
        
        isInParagraph = true;
        
        // Identify section headers (lines that end with a colon or look like headers)
        const isHeader = 
          section.match(/^[A-Za-z][^:]{3,}:$/) || // Ends with colon 
          section.match(/^(?:Assessment|Analysis|Summary|Recommendations|Strengths|Weaknesses|Feedback|Overall Score)(?:\s|:)/) ||
          section.match(/^Key\s+(?:Points|Findings|Recommendations)(?:\s|:)/);
        
        // Handle numbered lists
        const isNumberedItem = section.match(/^\d+\.\s/);
        
        // Handle bullet points
        const isBulletPoint = section.trim().startsWith('-');
        
        // Handle score indicators
        const isScoreItem = section.match(/\b(?:score|rating|points):\s*\d+(?:\/\d+)?\b/i) ||
                          section.match(/\b\d+(?:\/\d+)\s*(?:score|points|rating)\b/i);
      
      // Format headers differently
      if (isHeader) {
        // Add a page break if we're close to the bottom
        if (marginY + 20 > pageHeight - 20) {
          doc.addPage();
          marginY = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        
        doc.text(section.trim(), marginX, marginY);
        marginY += 10;
        
        // Draw a line under headers
        doc.setDrawColor(100, 100, 200);
        doc.line(marginX, marginY - 5, marginX + 150, marginY - 5);
        
        // Reset font
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        
        // Reset list counter when encountering a new section
        inList = false;
        listNumber = 0;
      } 
      // Handle numbered list items
      else if (isNumberedItem) {
        // Set list to active
        inList = true;
        
        // Add a page break if we're close to the bottom
        if (marginY + 15 > pageHeight - 20) {
          doc.addPage();
          marginY = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.text(section.trim(), marginX, marginY);
        doc.setFont(undefined, 'normal');
        marginY += 8;
        
        // Get the number from this item
        const numMatch = section.match(/^(\d+)\./); 
        if (numMatch) {
          listNumber = parseInt(numMatch[1], 10);
        }
      }
      // Handle bullet points
      else if (isBulletPoint) {
        // Add a page break if we're close to the bottom
        if (marginY + 15 > pageHeight - 20) {
          doc.addPage();
          marginY = 20;
        }
        
        // Format the bullet point text (remove the leading dash)
        const bulletText = section.trim().substring(1).trim();
        
        // Indent bullet points
        doc.text(`•  ${bulletText}`, marginX + 5, marginY);
        marginY += 8;
      }
      else {
        // Check if this contains a score
        const scoreMatch = section.match(/(\d+)\/(10|50)/);
        if (scoreMatch) {
          // Add a page break if we're close to the bottom
          if (marginY + 15 > pageHeight - 20) {
            doc.addPage();
            marginY = 20;
          }
          
          doc.text(section, marginX, marginY);
          marginY += 8;
          
          // Draw a score bar
          const scoreValue = parseInt(scoreMatch[1], 10);
          const maxValue = parseInt(scoreMatch[2], 10);
          const percentage = (scoreValue / maxValue);
          
          if (Number.isFinite(percentage) && percentage > 0) {
            const barWidth = 100 * percentage;
            doc.setFillColor(50, 100, 250);
            doc.rect(marginX, marginY - 5, barWidth, 3, "F");
            marginY += 10;
          }
        } 
        // Handle regular paragraphs
        else {
          // If in a list, add indentation to paragraphs
          const textIndent = inList ? 10 : 0;
          
          // Regular text - wrap long content
          const wrappedText = doc.splitTextToSize(section, 170 - textIndent);
          
          // Check if we need a page break
          if (marginY + (wrappedText.length * 7) > pageHeight - 20) {
            doc.addPage();
            marginY = 20;
          }
          
          wrappedText.forEach(line => {
            doc.text(line, marginX + textIndent, marginY);
            marginY += 7;
          });
          
          marginY += 3; // Extra space between paragraphs
        }
      }
    });

    // Add company logo or branding at the bottom
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by SHAKKTII AI © ' + new Date().getFullYear(), doc.internal.pageSize.width/2, doc.internal.pageSize.height - 10, {
      align: 'center'
    });
    
    // Ensure all content is rendered properly before saving
    try {
      // Save with a meaningful filename based on role and date
      const fileName = `${fullReportData.role || 'interview'}_report_${new Date().toISOString().split('T')[0]}`;
      doc.save(`${fileName}.pdf`);
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
    } catch (outerError) {
      console.error('Error processing report content:', outerError);
      alert('Error preparing the PDF report. Please try again later.');
    }
  };
  
  // Generate PDF Report for summary
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
      { label: 'Technical Proficiency', scoreData: extractScore(report, 'Technical Proficiency') },
      { label: 'Communication', scoreData: extractScore(report, 'Communication') },
      { label: 'Decision-Making', scoreData: extractScore(report, 'Decision-Making') },
      { label: 'Confidence', scoreData: extractScore(report, 'Confidence') },
      { label: 'Language Fluency', scoreData: extractScore(report, 'Language Fluency') },
      { label: 'Overall Score', scoreData: extractScore(report, 'Overall Score') },
    ];

    scores.forEach((scoreItem) => {
      if (marginY + 15 > pageHeight - 20) {
        doc.addPage();
        marginY = 20;
      }
      doc.setFontSize(12);
      doc.text(`${scoreItem.label}:`, marginX, marginY);

      // Get the numeric score value (defaulting to 0 if undefined)
      const scoreValue = scoreItem.scoreData && typeof scoreItem.scoreData.score === 'number' ? 
        scoreItem.scoreData.score : 0;
        
      // Progress Bar (Replaces Circle)
      let progressWidth = (scoreValue / 10) * 50;
      
      // Ensure progressWidth is a valid number
      progressWidth = Number.isFinite(progressWidth) ? progressWidth : 0;
      
      // Only draw the rectangle if we have valid dimensions
      if (progressWidth > 0) {
        doc.setFillColor(50, 150, 250); // Blue color
        doc.rect(marginX + 80, marginY - 5, progressWidth, 5, "F"); // Progress bar
      }
      
      doc.text(`${scoreValue}/10`, marginX + 140, marginY);

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
    doc.text(extractRecommendations(report), marginX, marginY);

    // Save the PDF
    doc.save(`report_${report.role}_${reportDate.replace(/[:/,]/g, '-')}.pdf`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  // We're no longer using the separate ScoreCard component as we integrated the scorecard display 

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 text-white">
      <Head>
        <title>Interview Reports | SHAKKTII AI</title>
        <meta name="description" content="View your AI-powered interview performance reports" />
      </Head>
      
      {/* Full Report Modal with enhanced UI */}
      {showFullReport && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-all duration-300">
          <div 
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-500 border-opacity-40 transform transition-all duration-500"
            style={{ boxShadow: '0 0 25px rgba(147, 51, 234, 0.3)' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-5 flex justify-between items-center z-10 backdrop-blur">
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">Detailed Report Analysis</h3>
                <p className="text-sm text-gray-300 mt-1">{fullReportData?.role} - {fullReportData?.date}</p>
              </div>
              <button 
                onClick={() => setShowFullReport(false)}
                className="text-gray-300 hover:text-white text-2xl focus:outline-none hover:bg-gray-800 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
                aria-label="Close modal"
              >
                <IoClose />
              </button>
            </div>
            
            {/* Modal Content with improved typography and spacing */}
            <div className="p-8">
              <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-indigo-800 mb-4">Detailed Analysis</h3>
                
                {fullReportData ? (
                  <div className="prose max-w-none text-gray-800">
                    {fullReportData.reportAnalysis.split('\n').map((line, index) => {
                      // Check if line is a header (starts with ** or contains **: )**
                      if (line.includes('**:') || line.includes(':**') || line.match(/\*\*[^*]+\*\*/)) {
                        const headerText = line.replace(/\*\*/g, '');
                        return <h4 key={index} className="text-lg font-bold mt-4 mb-2 text-indigo-800">{headerText}</h4>;
                      }
                      
                      // Check if line is a bullet point
                      if (line.trim().startsWith('-')) {
                        const bulletText = line.trim().substring(1).trim();
                        return <li key={index} className="ml-6 mb-1">{bulletText}</li>;
                      }
                      
                      // Check if line is a numbered list item
                      if (line.match(/^\s*\d+\.\s+/)) {
                        const numberText = line.replace(/^\s*\d+\.\s+/, '');
                        return <li key={index} className="ml-8 mb-1 list-decimal">{numberText}</li>;
                      }
                      
                      // Check if line contains a score
                      if (line.match(/(\d+\/(10|50))/)) {
                        const scoreMatch = line.match(/(\d+)\/(10|50)/);
                        const scoreValue = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
                        const maxValue = scoreMatch ? parseInt(scoreMatch[2], 10) : 10;
                        const percentage = (scoreValue / maxValue) * 100;
                        
                        return (
                          <div key={index} className="mb-3">
                            <p className="font-medium text-indigo-700 mb-1">{line}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                      
                      // Check if it's an empty line
                      if (line.trim() === '') {
                        return <div key={index} className="h-2"></div>;
                      }
                      
                      // Default paragraph formatting
                      return <p key={index} className="mb-2">{line}</p>;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No report analysis available</p>
                )}
              </div>
              
              {/* Download PDF section */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={downloadDetailedReport}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download Detailed Report
                </button>
              </div>
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={downloadDetailedReport}
                  className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Detailed Report</span>
                </button>
                
                <button
                  onClick={() => setShowFullReport(false)}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <IoClose className="text-lg" />
                  <span>Close Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header with Navigation */}
      <div className="sticky top-0 bg-black bg-opacity-30 backdrop-blur-sm z-10 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={goBack} className="text-white text-3xl hover:text-indigo-300 transition-all duration-300 transform hover:scale-110">
              <IoIosArrowBack />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-300">SHAKKTII AI</h1>
          </div>
          <div className="text-sm md:text-base text-gray-200">
            {email && <span className="font-medium">User: {email}</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center text-4xl md:text-5xl font-bold mb-6 mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
          Interview Performance History
        </h1>

        {/* Reports Section */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-300"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {reports && reports.length > 0 ? (
                reports.map((report, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm border border-purple-500 border-opacity-30 transition-all duration-300 hover:shadow-purple-500/20">
                    {/* Report Header */}
                    <div
                      onClick={() => toggleIndividualReportVisibility(index)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 cursor-pointer flex items-center justify-between hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">{report.role}</span>
                        <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                          {reportVisibility[index] ? 'Hide Details' : 'Show Details'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm opacity-80">{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}</span>
                        <span className="transform transition-transform duration-300 text-lg">
                          {reportVisibility[index] ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Report Content - Conditional Render */}
                    {reportVisibility[index] && (
                      <div className="p-6">
                        {/* Report Meta */}
                        <div className="flex flex-wrap justify-between mb-6 pb-4 border-b border-gray-600">
                          <div>
                            <p className="text-gray-400 text-sm">Role</p>
                            <p className="font-semibold text-lg">{report.role}</p>
                          </div>
                          {/* <div>
                            <p className="text-gray-400 text-sm">College</p>
                            <p className="font-semibold">{report.collageName || 'Not specified'}</p>
                          </div> */}
                          <div>
                            <p className="text-gray-400 text-sm">Date</p>
                            <p className="font-semibold">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Performance Scores */}
                        <h3 className="text-xl font-bold mb-4 text-blue-300">Performance Scores</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {['Technical Proficiency', 'Communication', 'Decision-Making', 'Confidence', 'Language Fluency', 'Overall Score'].map((category) => {
                            // Get score and feedback
                            const { score, feedback } = extractScore(report, category);
                            
                            const isOverallScore = category === 'Overall Score';
                            const maxScore = isOverallScore ? 50 : 10;
                            
                            // Ensure score is within valid range (0-10 for individual, 0-50 for overall)
                            let safeScore = Math.min(Math.max(0, score || 0), maxScore);
                            
                            // If we still have a score of 1, which might be a default, try one more time
                            if (safeScore === 1 && !isOverallScore) {
                              // Look for the score in the report text directly
                              const scorePattern = new RegExp(`${category.replace(/[\s-]/g, '[\\s-]*')}[\\s:]*([0-9]+)`, 'i');
                              const match = report.reportAnalysis.match(scorePattern);
                              if (match && match[1]) {
                                const extractedScore = parseInt(match[1], 10);
                                if (!isNaN(extractedScore) && extractedScore > 1) {
                                  safeScore = extractedScore;
                                }
                              }
                            }
                            
                            // Format the score text (e.g., "7/10" or "35/50")
                            const scoreText = isOverallScore ? 
                              `${safeScore}/50` : `${safeScore}/10`;
                              
                            // Scale for display (0-10 for all scores in the UI)
                            const displayScore = isOverallScore ? 
                              (safeScore / 5) : // Scale 0-50 to 0-10
                              safeScore; // Already 0-10
                            
                            return (
                              <div key={category} className="bg-gray-900 bg-opacity-60 rounded-lg p-5 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 border border-transparent hover:border-purple-500/20">
                                <div className="flex items-center mb-4">
                                  <h4 className="font-semibold text-lg flex-1 text-blue-200">{category}</h4>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row items-center">
                                  {/* Enhanced Circular Progress Bar */}
                                  <div className="w-28 h-28 mb-4 sm:mb-0 relative group">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300 -z-10"></div>
                                    <CircularProgressbar
                                      value={displayScore}
                                      maxValue={10}
                                      text={isOverallScore ? `${safeScore}/50` : scoreText}
                                      background
                                      backgroundPadding={6}
                                      styles={buildStyles({
                                        pathColor: isOverallScore 
                                          ? 'url(#overallGradient)'
                                          : displayScore >= 7 
                                            ? '#4ade80' // Good score (7-10)
                                            : displayScore >= 4 
                                              ? '#facc15' // Average score (4-6.9)
                                              : '#f87171', // Poor score (0-3.9)
                                        backgroundColor: '#1f2937',
                                        textColor: '#ffffff',
                                        trailColor: '#374151',
                                        textSize: isOverallScore ? '20px' : '24px',
                                        pathTransitionDuration: 0.5,
                                        strokeLinecap: 'round',
                                        text: {
                                          fontSize: isOverallScore ? '20px' : '24px',
                                          fontWeight: 'bold'
                                        }
                                      })}
                                    />
                                    {/* Add SVG gradient definition for overall score */}
                                    <svg style={{ height: 0 }}>
                                      <defs>
                                        <linearGradient id="overallGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#8b5cf6" />
                                          <stop offset="100%" stopColor="#d946ef" />
                                        </linearGradient>
                                      </defs>
                                    </svg>
                                  </div>
                                  
                                  <div className="ml-0 sm:ml-5 flex-1">
                                    {/* Score bar with animation */}
                                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                                        style={{ 
                                          width: `${(displayScore / (isOverallScore ? 10 : 10)) * 100}%`,
                                          boxShadow: '0 0 8px rgba(147, 51, 234, 0.5)'
                                        }}
                                      ></div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-300 leading-relaxed">
                                      {/* Limit to approximately 20-25 words */}
                                      {feedback.split(/\s+/).slice(0, 22).join(" ")}...
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Report Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-5">
                          <button
                            onClick={() => {
                              setFullReportData({
                                reportAnalysis: report.reportAnalysis,
                                role: report.role,
                                date: new Date(report.createdAt).toLocaleDateString()
                              });
                              setShowFullReport(true);
                            }}
                            className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span className="relative z-10">View Full Report</span>
                            <span className="absolute bottom-0 left-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                          </button>
                        
                          <button
                            onClick={() => downloadReport(report.reportAnalysis, report)}
                            className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center group"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="relative z-10">Download PDF Report</span>
                            <span className="absolute bottom-0 left-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-16 rounded-xl bg-gray-800 bg-opacity-40 backdrop-blur-sm">
                  <div className="text-5xl mb-4">⏳</div>
                  <h3 className="text-2xl font-semibold mb-2">Your report is being prepared</h3>
                  <p className="text-gray-300">Interview reports typically take about 5 minutes to generate.</p>
                  <p className="text-gray-400 mt-4">Please check back soon!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Oldreport;