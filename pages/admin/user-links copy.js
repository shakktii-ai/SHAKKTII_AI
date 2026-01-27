
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function UserLinks() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const router = useRouter();
  const qrRefs = useRef({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/getAllUsers");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCopy = () => {
    toast.success("Link copied to clipboard!");
  };

  // Generate QR code by capturing from existing QRCodeCanvas
  const generateQRImageFromCanvas = async (user) => {
    try {
      const canvasWrapper = qrRefs.current[user._id];
      if (canvasWrapper && canvasWrapper.querySelector) {
        const qrCanvas = canvasWrapper.querySelector("canvas");
        if (qrCanvas) {
          // Export as high-res by drawing to a bigger canvas
          const scale = 4; // 4x sharper
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = qrCanvas.width * scale;
          tmpCanvas.height = qrCanvas.height * scale;
  
          const ctx = tmpCanvas.getContext("2d");
          ctx.scale(scale, scale);
          ctx.drawImage(qrCanvas, 0, 0);
  
          return tmpCanvas.toDataURL("image/png", 1.0);
        }
      }
  
      // Fallback: generate fresh QR code with large size
      return await createQRCanvas(user.loginLink, 1000);
    } catch (error) {
      console.error("Error generating QR from canvas:", error);
      return await createQRCanvas(user.loginLink, 1000);
    }
  };
  

  // Create QR code canvas programmatically
  const createQRCanvas = (text, size = 400) => {
    return new Promise((resolve) => {
      try {
        // Create temporary container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        // Create QR code component
        const tempCanvas = document.createElement('canvas');
        container.appendChild(tempCanvas);

        // Use QR.js library if available (you'll need to install: npm install qrcode)
        if (window.QRCode) {
          window.QRCode.toCanvas(tempCanvas, text, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H'
          }, (error) => {
            document.body.removeChild(container);
            if (error) {
              resolve(createFallbackQR(size));
            } else {
              resolve(tempCanvas.toDataURL('image/png', 1.0));
            }
          });
        } else {
          document.body.removeChild(container);
          resolve(createFallbackQR(size));
        }
      } catch (error) {
        resolve(createFallbackQR(size));
      }
    });
  };

  
// High-quality QR code generator for PDF
// High-quality QR code generator for PDF
const generateQRPattern = async (text, size = 400) => {
    return new Promise((resolve) => {
      try {
        // Create high-resolution canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
  
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
  
        // Calculate module size for high resolution
        const modules = 25;
        const moduleSize = size / modules;
        const quietZone = Math.floor(moduleSize * 2);
  
        // QR code pattern generation (simplified but high quality)
        const pattern = generateQRPattern(text, modules);
        
        // Draw QR modules with sharp edges
        ctx.imageSmoothingEnabled = false; // Prevent blur
        
        for (let row = 0; row < modules; row++) {
          for (let col = 0; col < modules; col++) {
            if (pattern[row] && pattern[row][col]) {
              ctx.fillRect(
                col * moduleSize,
                row * moduleSize,
                Math.ceil(moduleSize), // Ensure no gaps
                Math.ceil(moduleSize)
              );
            }
          }
        }
  
        // Return high-quality data URL
        resolve(canvas.toDataURL('image/png', 1.0)); // Maximum quality
        
      } catch (error) {
        console.error('Error generating high-quality QR:', error);
        resolve(null);
      }
    });
  };
  
  
  

  const generateQRImage = (text, size = 400) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a temporary QR code with higher resolution
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      const qrCanvas = document.createElement('canvas');
      const QRCode = require('qrcode');
      
      QRCode.toCanvas(qrCanvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }, (error) => {
        document.body.removeChild(tempDiv);
        if (error) {
          console.error(error);
          resolve(null);
        } else {
          resolve(qrCanvas.toDataURL('image/png', 1.0));
        }
      });
    });
  };

  // Single page PDF that looks EXACTLY like your preview card
  
  const generateUserPDF = async (user, userIndex = 0) => {
    setIsGeneratingPDF(true);
    try {
      // Create PDF with preview card dimensions
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120] // Card-like dimensions matching preview
      });
  
      const cardWidth = 80;
      const cardHeight = 120;
      const centerX = cardWidth / 2; // 40mm center
  
      // FRONT SIDE - EXACTLY like your preview
      // Dark gradient background (gray-800 to gray-900)
      doc.setFillColor(17, 24, 39); // gray-800 base
      doc.rect(0, 0, cardWidth, cardHeight, 'F');
      
      // Gradient overlay for depth
      doc.setFillColor(17, 24, 39); // gray-900 overlay
      doc.rect(0, 0, cardWidth, 50, 'F');
  
      // Center content like preview
      const topMargin = 15;
  
      // Logo area - EXACTLY like preview
      const logoY = topMargin;
      
    // Cyan square logo background
const logoSize = 10
// Load logo as base64 inline and add it
const logoResponse = await fetch("/MM_LOGO.png"); // MM_LOGO.png must be in /public
const logoBlob = await logoResponse.blob();
const logoBase64 = await new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(logoBlob);
});

// Add the logo image on top of the cyan square
doc.addImage(logoBase64, "PNG", centerX - 20, logoY,logoSize, logoSize,);

// Example: Add text below the logo
doc.setTextColor(255, 255, 255);
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text(user.name || "User Name", centerX, logoY + 30, { align: "center" });

// Save PDF
// doc.save(`user_card_${userIndex + 1}.pdf`);

      // "MockMingle" text next to logo
      doc.setTextColor(6, 182, 212); // cyan-400 like preview
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MockMingle", centerX - 10, logoY + 6);
  
      // Subtitle below logo
      doc.setTextColor(34, 211, 238); // cyan-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Student Login Card", centerX, logoY + 12, { align: 'center' });
  
      // QR Code section - EXACTLY centered like preview
      const qrY = 35;
      const qrSize = 25;
      const qrPadding = 4;
      
      // White rounded background for QR
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        centerX - (qrSize/2) - qrPadding, 
        qrY - qrPadding, 
        qrSize + (qrPadding * 2), 
        qrSize + (qrPadding * 2), 
        4, 4, 'F'
      );
      
      // Cyan border/glow effect like preview
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(2);
      doc.roundedRect(
        centerX - (qrSize/2) - qrPadding, 
        qrY - qrPadding, 
        qrSize + (qrPadding * 2), 
        qrSize + (qrPadding * 2), 
        4, 4, 'D'
      );
      
      // Add QR code
      try {
        const qrDataUrl = await generateQRImage(user.loginLink);
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, "PNG", centerX - (qrSize/2), qrY, qrSize, qrSize);
        }
      } catch (error) {
        console.error('Error adding QR code:', error);
        // Simple fallback pattern
        doc.setFillColor(0, 0, 0);
        const moduleSize = qrSize / 21;
        for (let i = 0; i < 21; i++) {
          for (let j = 0; j < 21; j++) {
            if ((i + j) % 3 === 1) {
              doc.rect(
                centerX - (qrSize/2) + (i * moduleSize), 
                qrY + (j * moduleSize), 
                moduleSize, 
                moduleSize, 
                'F'
              );
            }
          }
        }
      }
  
      // Serial number below QR - like preview
      const serialNo = user.serialNumber || `SIMCA${String(userIndex + 1).padStart(2, '0')}`;
      doc.setTextColor(6, 182, 212); // cyan-400
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`Serial No: ${serialNo}`, centerX, qrY + qrSize + 8, { align: 'center' });
  
      // Instructions with numbered circles - EXACTLY like preview
      const instrStartY = 78;
      const leftMargin = 6;
      const stepHeight = 9;
      
      // Step 1
      doc.setFillColor(6, 182, 212); // cyan-500
      doc.circle(leftMargin + 3, instrStartY, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("1", leftMargin + 2, instrStartY + 1.5);
      
      // Step 1 text
      doc.setTextColor(209, 213, 219); // gray-300 like preview
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Scan the QR code or visit", leftMargin + 8, instrStartY - 1);
      doc.setTextColor(6, 182, 212); // cyan-400 for URL
      doc.setFont("helvetica", "bold");
      doc.text("www.mockmingle.in", leftMargin + 8, instrStartY + 2.5);
  
      // Step 2
      doc.setFillColor(6, 182, 212);
      doc.circle(leftMargin + 3, instrStartY + stepHeight, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("2", leftMargin + 2, instrStartY + stepHeight + 1.5);
      
      doc.setTextColor(209, 213, 219);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Enter your Login ID &", leftMargin + 8, instrStartY + stepHeight - 1);
      doc.text("Password (see back)", leftMargin + 8, instrStartY + stepHeight + 2);
  
      // Step 3
      doc.setFillColor(6, 182, 212);
      doc.circle(leftMargin + 3, instrStartY + (stepHeight * 2), 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("3", leftMargin + 2, instrStartY + (stepHeight * 2) + 1.5);
      
      doc.setTextColor(209, 213, 219);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Begin your journey with", leftMargin + 8, instrStartY + (stepHeight * 2) - 1);
      doc.text("Mock Interviews, Skill Maps", leftMargin + 8, instrStartY + (stepHeight * 2) + 2.5);
      doc.text("& Learning Pathways", leftMargin + 8, instrStartY + (stepHeight * 2) + 6);
  
      // Student name at bottom - like preview
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(user.fullName || "N/A", centerX, cardHeight - 8, { align: 'center' });
  
      // Save the single page PDF
      const fileName = `${(user.fullName || "user").replace(/[^a-zA-Z0-9]/g, '-')}-card.pdf`;
      doc.save(fileName);
      toast.success("Card downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(`Error generating PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Generate ALL users as individual single-page cards
  const generateAllUsersPDF = async () => {
    if (users.length === 0) {
      toast.warning("No users to export");
      return;
    }
  
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120]
      });
  
      const cardWidth = 80;
      const cardHeight = 120;
      const centerX = cardWidth / 2;
  
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        if (i > 0) {
          doc.addPage();
        }
  
        // Same design for each card
        // Background
        doc.setFillColor(31, 41, 55);
        doc.rect(0, 0, cardWidth, cardHeight, 'F');
        doc.setFillColor(17, 24, 39);
        doc.rect(0, 0, cardWidth, 50, 'F');
  
        const topMargin = 15;
  
        // Logo
        const logoY = topMargin;
        const logoSize = 8;
        doc.setFillColor(6, 182, 212);
        doc.roundedRect(centerX - 20, logoY, logoSize, logoSize, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("M", centerX - 16, logoY + 6);
        doc.setTextColor(6, 182, 212);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("MockMingle", centerX - 10, logoY + 6);
        doc.setTextColor(34, 211, 238);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Student Login Card", centerX, logoY + 12, { align: 'center' });
  
        // QR Code
        const qrY = 35;
        const qrSize = 25;
        const qrPadding = 4;
        
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(centerX - (qrSize/2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'F');
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(2);
        doc.roundedRect(centerX - (qrSize/2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'D');
        
        try {
          const qrDataUrl = await generateQRImage(user.loginLink);
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, "PNG", centerX - (qrSize/2), qrY, qrSize, qrSize);
          }
        } catch (error) {
          doc.setFillColor(0, 0, 0);
          const moduleSize = qrSize / 21;
          for (let x = 0; x < 21; x++) {
            for (let y = 0; y < 21; y++) {
              if ((x + y) % 3 === 1) {
                doc.rect(centerX - (qrSize/2) + (x * moduleSize), qrY + (y * moduleSize), moduleSize, moduleSize, 'F');
              }
            }
          }
        }
  
        // Serial number
        const serialNo = user.serialNumber || `SIMCA${String(i + 1).padStart(2, '0')}`;
        doc.setTextColor(6, 182, 212);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`Serial No: ${serialNo}`, centerX, qrY + qrSize + 8, { align: 'center' });
  
        // Instructions
        const instrStartY = 78;
        const leftMargin = 6;
        const stepHeight = 9;
        
        // Step 1
        doc.setFillColor(6, 182, 212);
        doc.circle(leftMargin + 3, instrStartY, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("1", leftMargin + 2, instrStartY + 1.5);
        doc.setTextColor(209, 213, 219);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Scan the QR code or visit", leftMargin + 8, instrStartY - 1);
        doc.setTextColor(6, 182, 212);
        doc.setFont("helvetica", "bold");
        doc.text("www.mockmingle.in", leftMargin + 8, instrStartY + 2.5);
  
        // Step 2
        doc.setFillColor(6, 182, 212);
        doc.circle(leftMargin + 3, instrStartY + stepHeight, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("2", leftMargin + 2, instrStartY + stepHeight + 1.5);
        doc.setTextColor(209, 213, 219);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Enter your Login ID &", leftMargin + 8, instrStartY + stepHeight - 1);
        doc.text("Password (see back)", leftMargin + 8, instrStartY + stepHeight + 2);
  
        // Step 3
        doc.setFillColor(6, 182, 212);
        doc.circle(leftMargin + 3, instrStartY + (stepHeight * 2), 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("3", leftMargin + 2, instrStartY + (stepHeight * 2) + 1.5);
        doc.setTextColor(209, 213, 219);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Begin your journey with", leftMargin + 8, instrStartY + (stepHeight * 2) - 1);
        doc.text("Mock Interviews, Skill Maps", leftMargin + 8, instrStartY + (stepHeight * 2) + 2.5);
        doc.text("& Learning Pathways", leftMargin + 8, instrStartY + (stepHeight * 2) + 6);
  
        // Student name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(user.fullName || "N/A", centerX, cardHeight - 8, { align: 'center' });
      }
  
      const fileName = `all-student-cards-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(`${users.length} cards generated successfully!`);
      
    } catch (error) {
      console.error("Error generating bulk PDF:", error);
      toast.error(`Error generating bulk PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  // Generate PDF for all users as MockMingle cards
 
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-700">
            Loading user links...
          </h1>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-2xl rounded-3xl p-5 sm:p-8 border border-gray-100">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              MockMingle Student Cards
            </h1>
            <p className="text-gray-600 mt-1">
              Generate professional student login cards with QR codes
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={generateAllUsersPDF}
              disabled={isGeneratingPDF || users.length === 0}
              className={`px-5 py-3 text-white text-sm font-medium rounded-xl shadow-lg transition-all hover:scale-105 ${
                isGeneratingPDF || users.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              }`}
            >
              {isGeneratingPDF ? "Generating..." : `📱 Download ${users.length} Cards`}
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-100 p-5 rounded-xl border border-cyan-200">
              <p className="text-sm text-cyan-600">Total Cards</p>
              <p className="text-2xl font-bold text-cyan-800">{users.length}</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
              <p className="text-sm text-green-600">Active Students</p>
              <p className="text-2xl font-bold text-green-800">
                {users.filter(u => !u.email?.includes("@placeholder.local")).length}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-600">Pending</p>
              <p className="text-2xl font-bold text-orange-800">
                {users.filter(u => u.email?.includes("@placeholder.local")).length}
              </p>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            📋 Card Preview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {users.slice(0, 3).map((user, idx) => (
              <div key={user._id} className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl scale-95">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-cyan-400">
                          MockMingle
                        </h2>
                        <p className="text-cyan-300 text-sm">
                          Student Login Card
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl mb-4 inline-block border-2 border-cyan-400 shadow-lg">
                      <QRCodeCanvas
                        value={user.loginLink}
                        size={100}
                        level="H"
                        includeMargin={false}
                        ref={(el) => {
                          if (el) qrRefs.current[user._id] = el.parentElement;
                        }}
                      />
                    </div>

                    <p className="text-cyan-400 text-sm">
                      Serial No:{" "}
                      <span className="font-bold">
                        SIMCA{String(idx + 1).padStart(2, "0")}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-center mt-2 font-medium text-gray-700">
                  {user.fullName || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  {["Student", "Email", "Status", "Created", "QR", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {users.map((user, idx) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {(user.fullName || "U")[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{user.fullName || "N/A"}</p>
                          <p className="text-xs text-gray-500">
                            SIMCA{String(idx + 1).padStart(2, "0")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {user.email?.includes("@placeholder.local")
                        ? "Not registered yet"
                        : user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.email?.includes("@placeholder.local")
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.email?.includes("@placeholder.local")
                          ? "Pending"
                          : "Active"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <QRCodeCanvas value={user.loginLink} size={60} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <CopyToClipboard text={user.loginLink} onCopy={handleCopy}>
                          <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm">
                            Copy
                          </button>
                        </CopyToClipboard>

                        <button
                          onClick={() => generateUserPDF(user, idx)}
                          disabled={isGeneratingPDF}
                          className="px-3 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
);

}