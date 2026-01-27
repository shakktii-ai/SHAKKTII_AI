
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { CiLock } from "react-icons/ci";
import { FaHandHoldingWater } from "react-icons/fa";
export default function UserLinks() {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingQRPDF, setIsGeneratingQRPDF] = useState(false);
  const router = useRouter();
  const qrRefs = useRef({});


  useEffect(() => {
  const adminStr = localStorage.getItem("admin");
  const token = localStorage.getItem("Admintoken");

  if (!adminStr || !token) {
    router.push("/admin/login");
    return;
  }

  try {
    const parsedAdmin = JSON.parse(adminStr);
    setAdmin(parsedAdmin);
  } catch (e) {
    localStorage.clear();
    router.push("/admin/login");
  }
}, [router]);


  useEffect(() => {
  if (!admin?.collageName) return; // wait till admin loads
  fetchUsers(admin.collageName);
}, [admin]);
const fetchUsers = async (collageName) => {
  try {
    const response = await fetch(
      `/api/admin/getAllUsers?collageName=${encodeURIComponent(collageName)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("Admintoken")}`,
        },
      }
    );

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
        format: [70, 120] // Card-like dimensions matching preview
      });

      const cardWidth = 70;
      const cardHeight = 120;
      const centerX = cardWidth / 2; // 40mm center

      // FRONT SIDE - EXACTLY like your preview
      // Dark gradient background (gray-800 to gray-900)
      doc.setFillColor(17, 24, 39); // gray-800 base
      // doc.rect(0, 0, cardWidth, cardHeight, 'F');
doc.roundedRect(2, 2, cardWidth - 4, cardHeight - 4, 4, 4, 'F');
      // Gradient overlay for depth
      // doc.setFillColor(17, 24, 39); // gray-900 overlay
      // doc.rect(0, 0, cardWidth, 50, 'F');

      // Center content like preview
      const topMargin = 15;

      // Logo area - EXACTLY like preview
      const logoY = topMargin;

      // Cyan square logo background
      //const logoSize = 10

      // Load logo as base64 inline and add it
      const logoResponse = await fetch("/MM_LOGO2.png"); // MM_LOGO.png must be in /public
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });

      // Add the logo image on top of the cyan square
      doc.addImage(logoBase64, "PNG", centerX - 20, logoY, 9, 12);

      // Example: Add text below the logo
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(user.name || "User Name", centerX, logoY + 30, { align: "center" });

      // Save PDF
      // doc.save(`user_card_${userIndex + 1}.pdf`);

      // "MockMingle" text next to logo
      doc.setTextColor(14, 165, 233); // cyan-400 like preview
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MockMingle", centerX - 10, logoY + 6);

      // Subtitle below logo
      doc.setTextColor(3, 105, 161); // cyan-300
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Student Login Card", centerX + 2, logoY + 10, { align: 'center' });

      // QR Code section - EXACTLY centered like preview
      const qrY = 30;
      const qrSize = 25;
      const qrPadding = 1;

      // White rounded background for QR
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        centerX - (qrSize / 2) - qrPadding,
        qrY - qrPadding,
        qrSize + (qrPadding * 2),
        qrSize + (qrPadding * 2),
        2, 2, 'F'
      );

      // Cyan border/glow effect like preview
      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.5);
      doc.roundedRect(
        centerX - (qrSize / 2) - qrPadding,
        qrY - qrPadding,
        qrSize + (qrPadding * 2),
        qrSize + (qrPadding * 2),
        2, 2, 'D'
      );

      // Add QR code
      try {
        const qrDataUrl = await generateQRImage(user.loginLink);
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, "PNG", centerX - (qrSize / 2), qrY, qrSize, qrSize);
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
                centerX - (qrSize / 2) + (i * moduleSize),
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
      const label = "Serial No: ";
      const fullText = label + serialNo;
      // Measure total width
      const fullWidth = doc.getTextWidth(fullText);
      // Calculate starting X to center both parts together
      const startX = centerX - fullWidth / 2;
      // Draw label in cyan
      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label, startX, qrY + qrSize + 8);
      // Draw serial number in gray
      doc.setTextColor(125, 211, 252);
      doc.text(serialNo, startX + doc.getTextWidth(label), qrY + qrSize + 8);


      // Instructions with numbered circles - EXACTLY like preview
      const instrStartY = 70;
      const leftMargin = 18;
      const stepHeight = 9;

      // Step 1
      const lockIconResponse = await fetch("/card1.png");
      const lockIconBlob = await lockIconResponse.blob();
      const lockIconBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob);
      });

      // Place icon at desired position
      const iconSize = 6; // 6mm square
      doc.addImage(lockIconBase64, "PNG", leftMargin, instrStartY - iconSize / 2, iconSize, iconSize);

      // Step 1 text
      doc.setTextColor(125, 211, 252); // gray-300 like preview
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Scan the QR code or visit", leftMargin + 8, instrStartY - 1);
      doc.setTextColor(3, 105, 161); // cyan-400 for URL
      doc.setFont("helvetica", "bold");
      doc.text("www.mockmingle.in", leftMargin + 8, instrStartY + 2.5);

      // Step 2
      const lockIconResponse1 = await fetch("/card2.png");
      const lockIconBlob1 = await lockIconResponse1.blob();
      const lockIconBase641 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob1);
      });

      // Place icon at desired position
      const iconSize1 = 6; // 6mm square
      doc.addImage(lockIconBase641, "PNG", leftMargin, instrStartY + stepHeight- iconSize1 / 2, iconSize1, iconSize1);

      doc.setTextColor(125, 211, 252);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Enter your Login ID &", leftMargin + 8, instrStartY + stepHeight - 1);
      doc.text("Password (see front)", leftMargin + 8, instrStartY + stepHeight + 2);

      // Step 3
      const lockIconResponse2 = await fetch("/hand.png");
      const lockIconBlob2 = await lockIconResponse2.blob();
      const lockIconBase642 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob2);
      });

      // Place icon at desired position
      const iconSize2 = 6; // 6mm square
      doc.addImage(lockIconBase642, "PNG", leftMargin, instrStartY+ (stepHeight*2) - iconSize2 / 2, iconSize2, iconSize2);

      doc.setTextColor(125, 211, 252);
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
        // doc.setFillColor(17, 24, 39);
        // doc.rect(0, 0, cardWidth, 50, 'F');

        const topMargin = 15;

        // Logo

        const logoY = topMargin;
        const logoSize = 8;
        const logoResponse = await fetch("/MM_LOGO2.png"); // MM_LOGO.png must be in /public
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });

        // Add the logo image on top of the cyan square
        doc.addImage(logoBase64, "PNG", centerX - 20, logoY - 2, 9, 12);
        doc.setTextColor(14, 165, 233);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("MockMingle", centerX - 10, logoY + 4);
        doc.setTextColor(3, 105, 161);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text("Student Login Card", centerX + 2, logoY + 8, { align: 'center' });

        // QR Code
        const qrY = 30;
        const qrSize = 25;
        const qrPadding = 2;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(centerX - (qrSize / 2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'F');
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(1);
        doc.roundedRect(centerX - (qrSize / 2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'D');

        try {
          const qrDataUrl = await generateQRImage(user.loginLink);
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, "PNG", centerX - (qrSize / 2), qrY, qrSize, qrSize);
          }
        } catch (error) {
          doc.setFillColor(0, 0, 0);
          const moduleSize = qrSize / 21;
          for (let x = 0; x < 21; x++) {
            for (let y = 0; y < 21; y++) {
              if ((x + y) % 3 === 1) {
                doc.rect(centerX - (qrSize / 2) + (x * moduleSize), qrY + (y * moduleSize), moduleSize, moduleSize, 'F');
              }
            }
          }
        }

        // Serial number
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        const serialNo = user.serialNumber || `SIMCA${String(i + 1).padStart(2, '0')}`;
        const label = "Serial No: ";
        const fullText = label + serialNo;
        // Total width of both pieces
        const fullWidth = doc.getTextWidth(fullText);
        // Starting X to center the whole string
        const startX = centerX - fullWidth / 2;
        // Draw label in blue
        doc.setTextColor(3, 105, 161);
        doc.text(label, startX, qrY + qrSize + 8);
        // Draw serial number in gray
        doc.setTextColor(125, 211, 252);
        doc.text(serialNo, startX + doc.getTextWidth(label), qrY + qrSize + 8);


        // Instructions
        const instrStartY = 70;
        const leftMargin = 18;
        const stepHeight = 9;

        // Step 1
        // doc.setFillColor(6, 182, 212);
        // doc.circle(leftMargin + 3, instrStartY, 3, 'F');
        // doc.setTextColor(255, 255, 255);
        // doc.setFont("helvetica", "bold");
        // doc.setFontSize(10);
        // doc.text("1", leftMargin + 2, instrStartY + 1.5);
         // Step 1
      const lockIconResponse = await fetch("/card1.png");
      const lockIconBlob = await lockIconResponse.blob();
      const lockIconBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob);
      });

      // Place icon at desired position
      const iconSize = 6; // 6mm square
      doc.addImage(lockIconBase64, "PNG", leftMargin, instrStartY - iconSize / 2, iconSize, iconSize);
      //step text
        doc.setTextColor(125, 211, 252);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Scan the QR code or visit", leftMargin + 8, instrStartY - 1);
        doc.setTextColor(3, 105, 161);
        doc.setFont("helvetica", "bold");
        doc.text("www.mockmingle.in", leftMargin + 8, instrStartY + 2.5);

        // Step 2
      const lockIconResponse1 = await fetch("/card2.png");
      const lockIconBlob1 = await lockIconResponse1.blob();
      const lockIconBase641 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob1);
      });

      // Place icon at desired position
      const iconSize1 = 6; // 6mm square
      doc.addImage(lockIconBase641, "PNG", leftMargin, instrStartY + stepHeight- iconSize1 / 2, iconSize1, iconSize1);

        doc.setTextColor(125, 211, 252);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text("Enter your Login ID &", leftMargin + 8, instrStartY + stepHeight - 1);
        doc.text("Password (see back)", leftMargin + 8, instrStartY + stepHeight + 2);

        // Step 3
        const lockIconResponse2 = await fetch("/hand.png");
      const lockIconBlob2 = await lockIconResponse2.blob();
      const lockIconBase642 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(lockIconBlob2);
      });

      // Place icon at desired position
      const iconSize2 = 6; // 6mm square
      doc.addImage(lockIconBase642, "PNG", leftMargin, instrStartY+ (stepHeight*2) - iconSize2 / 2, iconSize2, iconSize2);

        doc.setTextColor(125, 211, 252);
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
//Generate pdf for all QR Code Only
const generateAllUsersQRPDF = async () => {
    if (users.length === 0) {
      toast.warning("No users to export");
      return;
    }

    setIsGeneratingQRPDF(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [60, 80]
      });

      const cardWidth = 60;
      const cardHeight = 80;
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
        // doc.setFillColor(17, 24, 39);
        // doc.rect(0, 0, cardWidth, 50, 'F');
        // QR Code
        const qrY = 15;
        const qrSize = 30;
        const qrPadding = 2;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(centerX - (qrSize / 2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'F');
        doc.setDrawColor(6, 182, 212);
        doc.setLineWidth(1);
        doc.roundedRect(centerX - (qrSize / 2) - qrPadding, qrY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 4, 4, 'D');

        try {
          const qrDataUrl = await generateQRImage(user.loginLink);
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, "PNG", centerX - (qrSize / 2), qrY, qrSize, qrSize);
          }
        } catch (error) {
          doc.setFillColor(0, 0, 0);
          const moduleSize = qrSize / 21;
          for (let x = 0; x < 21; x++) {
            for (let y = 0; y < 21; y++) {
              if ((x + y) % 3 === 1) {
                doc.rect(centerX - (qrSize / 2) + (x * moduleSize), qrY + (y * moduleSize), moduleSize, moduleSize, 'F');
              }
            }
          }
        }
        // Student name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(user.fullName || "N/A", centerX, cardHeight - 8, { align: 'center' });
      }

      const fileName = `all-student-QR-Code-cards-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(`${users.length} cards generated successfully!`);

    } catch (error) {
      console.error("Error generating bulk PDF:", error);
      toast.error(`Error generating bulk PDF: ${error.message}`);
    } finally {
      setIsGeneratingQRPDF(false);
    }
  };


if (loading) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="relative flex items-center justify-center">
        <div className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-20"></div>
        <div className="relative inline-flex h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
      <h2 className="mt-6 text-base font-medium text-slate-600 animate-pulse">
        Loading student records...
      </h2>
    </div>
  );
}

return (
  <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Student Identity Cards
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
            Manage student access credentials, preview ID cards, and export QR codes for physical printing or digital distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => router.push("/admin")}
            className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm focus:ring-2 focus:ring-slate-200"
          >
            Dashboard
          </button>
          
          <button
            onClick={generateAllUsersQRPDF}
            disabled={isGeneratingQRPDF || users.length === 0}
            className={`flex-1 lg:flex-none px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm border border-transparent transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
              isGeneratingQRPDF || users.length === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
            }`}
          >
            {isGeneratingQRPDF ? "Processing..." : "Export QR Codes"}
          </button>

          <button
            onClick={generateAllUsersPDF}
            disabled={isGeneratingPDF || users.length === 0}
            className={`flex-1 lg:flex-none px-5 py-2.5 text-white text-sm font-semibold rounded-lg shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
              isGeneratingPDF || users.length === 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
            }`}
          >
            {isGeneratingPDF ? "Generating PDF..." : `Download ${users.length} Cards`}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Records</span>
            <span className="text-2xl font-bold text-slate-800 mt-1">{users.length}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-2 -mt-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 z-10">Active Users</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 z-10">
              {users.filter(u => !u.email?.includes("@placeholder.local")).length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-2 -mt-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 z-10">Pending Registration</span>
            <span className="text-2xl font-bold text-amber-500 mt-1 z-10">
              {users.filter(u => u.email?.includes("@placeholder.local")).length}
            </span>
          </div>
        </div>
      )}

      {/* Card Preview Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-800">Live Card Preview</h2>
        </div>
        
        {/* Horizontal Scroll / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {users.slice(0, 3).map((user, idx) => (
            <div key={user._id} className="flex flex-col items-center">
              {/* ID Card Mockup */}
              <div className="relative w-full max-w-[340px] aspect-[1.586/1] bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 text-white flex flex-col group hover:shadow-2xl transition-all duration-300">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900"></div>
                
                {/* Card Content */}
                <div className="relative z-10 flex flex-col h-full p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <img src="/MM_LOGO2.png" alt="Logo" className="w-8 h-8 object-contain" />
                       <div className="leading-tight">
                          <h3 className="font-bold text-lg tracking-tight">MockMingle</h3>
                          <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Student Pass</p>
                       </div>
                    </div>
                  </div>

                  {/* Body: QR & Details */}
                  <div className="flex flex-1 items-center gap-5">
                    <div className="bg-white p-1.5 rounded-lg shrink-0" ref={(el) => { if (el) qrRefs.current[user._id] = el; }}>
                       <QRCodeCanvas
                         value={user.loginLink}
                         size={80}
                         level="H"
                         bgColor="#ffffff"
                         fgColor="#000000"
                       />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Student Name</p>
                      <p className="text-lg font-bold truncate text-white mb-2">{user.fullName || "Unknown User"}</p>
                      
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">ID Number</p>
                      <p className="font-mono text-sm text-indigo-300">{user.collageName?.split(" ").map(word => word.charAt(0)).join("")}{String(idx + 1).padStart(2, "0")}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
              </div>
              
              <p className="mt-3 text-sm text-slate-500 font-medium">Card {idx + 1} Preview</p>
            </div>
          ))}
        </div>
      </div>

      {/* Student Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800">All Students</h3>
          <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
             Sorted by Latest
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {["Student Info", "Email Address", "Status", "Joined", "Quick Actions"].map((header, i) => (
                  <th 
                    key={i} 
                    className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user, idx) => (
                <tr key={user._id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {(user.fullName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{user.fullName || "N/A"}</span>
                        <span className="text-xs text-slate-400 font-mono">{user.collageName?.split(" ").map(word => word.charAt(0)).join("")}{String(idx + 1).padStart(2, "0")}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.email?.includes("@placeholder.local") ? (
                      <span className="italic text-slate-400">No email registered</span>
                    ) : (
                      user.email
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email?.includes("@placeholder.local") ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CopyToClipboard text={user.loginLink} onCopy={handleCopy}>
                        <button 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Copy Link"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </CopyToClipboard>

                      <button
                        onClick={() => generateUserPDF(user, idx)}
                        disabled={isGeneratingPDF}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State if no users */}
        {users.length === 0 && (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
               <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
            </div>
            <h3 className="text-sm font-medium text-slate-900">No students found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating new user links in the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
}