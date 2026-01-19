// // components/Chart.js
// import { useRef, useEffect, useState } from "react";

// export default function Chart() {
//   const labelRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [frames, setFrames] = useState(0);
//   const [oDots, setODots] = useState([]); // State to store oDots

//   useEffect(() => {
//     const c = canvasRef.current;
//     const ctx = c.getContext("2d");
//     const cw = c.width = 700;
//     const ch = c.height = 350;
//     const cx = cw / 2, cy = ch / 2;
//     const rad = Math.PI / 180;

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#999";
//     ctx.fillStyle = "#ccc";
//     ctx.font = "14px monospace";

//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167,72%,60%,1)");
//     grd.addColorStop(1, "hsla(167,72%,60%,0)");

//     const oData = {
//       "2008": 10,
//       "2009": 39.9,
//       "2010": 17,
//       "2011": 30.0,
//       "2012": 5.3,
//       "2013": 38.4,
//       "2014": 15.7,
//       "2015": 9.0
//     };

//     const valuesRy = Object.values(oData);
//     const propsRy = Object.keys(oData);

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     // Chart axis drawing
//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     // Vertical axis drawing
//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     const a = [];
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";
//     for (let i = 0; i <= vData; i++) {
//       a[i] = {
//         x: A.x,
//         y: A.y + (i === 0 ? 25 : aStep * i),
//         val: Max - aStepValue * i
//       };
//       drawCoords(a[i], 3, 0);
//     }

//     // Horizontal axis drawing
//     const b = [];
//     ctx.textAlign = "center";
//     ctx.textBaseline = "hanging";
//     const bStep = chartWidth / (hData + 1);
//     for (let i = 0; i < hData; i++) {
//       b[i] = {
//         x: B.x + bStep * (i + 1),
//         y: B.y,
//         val: propsRy[i]
//       };
//       drawCoords(b[i], 0, 3);
//     }

//     function drawCoords(o, offX, offY) {
//       ctx.beginPath();
//       ctx.moveTo(o.x - offX, o.y - offY);
//       ctx.lineTo(o.x + offX, o.y + offY);
//       ctx.stroke();
//       ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
//     }

//     // Data points
//     const oDotsTemp = [];
//     const oFlat = [];
//     for (let i = 0; i < propsRy.length; i++) {
//       oDotsTemp.push({
//         x: b[i].x,
//         y: b[i].y - oData[propsRy[i]] * verticalUnit - 25,
//         val: oData[propsRy[i]]
//       });
//       oFlat.push({
//         x: b[i].x,
//         y: b[i].y - 25
//       });
//     }
//     setODots(oDotsTemp); // Update the oDots state

//     // Animation
//     function animateChart() {
//       requestAnimationFrame(animateChart);
//       setFrames((prev) => prev + speed);
//       ctx.clearRect(60, 0, cw, ch - 60);
//       for (let i = 0; i < oFlat.length; i++) {
//         if (oFlat[i].y > oDotsTemp[i].y) {
//           oFlat[i].y -= speed;
//         }
//       }
//       drawCurve(oFlat);
//       for (let i = 0; i < oFlat.length; i++) {
//         ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
//         ctx.beginPath();
//         ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
//         ctx.fill();
//       }
//     }

//     requestAnimationFrame(animateChart);

//     function drawCurve(p) {
//       const pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.lineTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
//       }
//       const n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
//       ctx.stroke();
//       ctx.fillStyle = grd;
//       ctx.fill();
//     }

//     function controlPoints(p) {
//       const pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         const dx = p[i - 1].x - p[i + 1].x;
//         const dy = p[i - 1].y - p[i + 1].y;
//         const x1 = p[i].x - dx * t;
//         const y1 = p[i].y - dy * t;
//         const o1 = { x: x1, y: y1 };
//         const x2 = p[i].x + dx * t;
//         const y2 = p[i].y + dy * t;
//         const o2 = { x: x2, y: y2 };
//         pc[i] = [o1, o2];
//       }
//       return pc;
//     }
//   }, []);

//   // Event handling for mouse hover over data points
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const label = labelRef.current;

//     function oMousePos(evt) {
//       const ClientRect = canvas.getBoundingClientRect();
//       return { x: Math.round(evt.clientX - ClientRect.left), y: Math.round(evt.clientY - ClientRect.top) };
//     }

//     const handleMouseMove = (e) => {
//       label.style.display = "none";
//       const m = oMousePos(e);
//       for (let i = 0; i < oDots.length; i++) {
//         output(m, i);
//       }
//     };

//     canvas.addEventListener("mousemove", handleMouseMove);

//     function output(m, i) {
//       const ctx = canvas.getContext("2d");
//       ctx.beginPath();
//       ctx.arc(oDots[i].x, oDots[i].y, 20, 0, 2 * Math.PI);
//       if (ctx.isPointInPath(m.x, m.y)) {
//         label.style.display = "block";
//         label.style.top = m.y + 10 + "px";
//         label.style.left = m.x + 10 + "px";
//         label.innerHTML = `<strong>${oDots[i].val}</strong>: ${oDots[i].val}%`;
//         canvas.style.cursor = "pointer";
//       }
//     }

//     return () => {
//       canvas.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, [oDots]); // Re-run this effect when oDots change

//   return (
//     <div className="relative w-[700px] h-[350px] border border-[#555] mx-auto my-16">
//       <canvas ref={canvasRef}></canvas>
//       <div ref={labelRef} className="absolute text-black bg-white text-xs p-2 hidden"></div>
//     </div>
//   );
// }



// import { useRef, useEffect, useState } from "react";

// export default function Chart({ chartData }) {
//   const labelRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [oDots, setODots] = useState([]); // State to store oDots

//   useEffect(() => {
//     const c = canvasRef.current;
//     const ctx = c.getContext("2d");
//     const cw = c.width = 700;
//     const ch = c.height = 350;
//     const cx = cw / 2, cy = ch / 2;
//     const rad = Math.PI / 180;

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#999";
//     ctx.fillStyle = "#ccc";
//     ctx.font = "14px monospace";

//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167,72%,60%,1)");
//     grd.addColorStop(1, "hsla(167,72%,60%,0)");

//     // Extract values from chartData
//     const valuesRy = chartData.map(data => data.y);  // Extract the 'y' values (scores)
//     const propsRy = chartData.map(data => new Date(data.x).toLocaleString());  // Extract 'x' values (timestamps)

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     // Chart axis drawing
//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     // Vertical axis drawing
//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     const a = [];
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";
//     for (let i = 0; i <= vData; i++) {
//       a[i] = {
//         x: A.x,
//         y: A.y + (i === 0 ? 25 : aStep * i),
//         val: Max - aStepValue * i
//       };
//       drawCoords(a[i], 3, 0);
//     }

//     // Horizontal axis drawing
//     const b = [];
//     ctx.textAlign = "center";
//     ctx.textBaseline = "hanging";
//     const bStep = chartWidth / (hData + 1);
//     for (let i = 0; i < hData; i++) {
//       b[i] = {
//         x: B.x + bStep * (i + 1),
//         y: B.y,
//         val: propsRy[i]
//       };
//       drawCoords(b[i], 0, 3);
//     }

//     function drawCoords(o, offX, offY) {
//       ctx.beginPath();
//       ctx.moveTo(o.x - offX, o.y - offY);
//       ctx.lineTo(o.x + offX, o.y + offY);
//       ctx.stroke();
//       ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
//     }

//     // Data points
//     const oDotsTemp = [];
//     const oFlat = [];
//     for (let i = 0; i < propsRy.length; i++) {
//       oDotsTemp.push({
//         x: b[i].x,
//         y: b[i].y - valuesRy[i] * verticalUnit - 25,
//         val: valuesRy[i]
//       });
//       oFlat.push({
//         x: b[i].x,
//         y: b[i].y - 25
//       });
//     }
//     setODots(oDotsTemp); // Update the oDots state

//     // Animation
//     function animateChart() {
//       requestAnimationFrame(animateChart);
//       ctx.clearRect(60, 0, cw, ch - 60);
//       for (let i = 0; i < oFlat.length; i++) {
//         if (oFlat[i].y > oDotsTemp[i].y) {
//           oFlat[i].y -= speed;
//         }
//       }
//       drawCurve(oFlat);
//       for (let i = 0; i < oFlat.length; i++) {
//         ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
//         ctx.beginPath();
//         ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
//         ctx.fill();
//       }
//     }

//     requestAnimationFrame(animateChart);

//     function drawCurve(p) {
//       const pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.lineTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
//       }
//       const n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
//       ctx.stroke();
//       ctx.fillStyle = grd;
//       ctx.fill();
//     }

//     function controlPoints(p) {
//       const pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         const dx = p[i - 1].x - p[i + 1].x;
//         const dy = p[i - 1].y - p[i + 1].y;
//         const x1 = p[i].x - dx * t;
//         const y1 = p[i].y - dy * t;
//         const o1 = { x: x1, y: y1 };
//         const x2 = p[i].x + dx * t;
//         const y2 = p[i].y + dy * t;
//         const o2 = { x: x2, y: y2 };
//         pc[i] = [o1, o2];
//       }
//       return pc;
//     }
//   }, [chartData]); // Re-run effect when chartData changes

//   return (
//     <div className="relative w-[700px] h-[350px] border border-[#555] mx-auto my-16">
//       <canvas ref={canvasRef}></canvas>
//       <div ref={labelRef} className="absolute text-black bg-white text-xs p-2 hidden"></div>
//     </div>
//   );
// }

// import { useRef, useEffect, useState } from "react";

// export default function Chart({ chartData }) {
//   const labelRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [oDots, setODots] = useState([]); // State to store oDots

//   useEffect(() => {
//     const c = canvasRef.current;
//     const ctx = c.getContext("2d");
//     const cw = c.width = 700;
//     const ch = c.height = 350;
//     const cx = cw / 2, cy = ch / 2;
//     const rad = Math.PI / 180;

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#999";
//     ctx.fillStyle = "#ccc";
//     ctx.font = "14px monospace";

//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167,72%,60%,1)");
//     grd.addColorStop(1, "hsla(167,72%,60%,0)");

//     // Extract values from chartData
//     const valuesRy = chartData.map(data => data.y);  // Extract the 'y' values (scores)
//     const propsRy = chartData.map(data => new Date(data.x).toLocaleString());  // Extract 'x' values (timestamps)

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     // Chart axis drawing
//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     // Vertical axis drawing
//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     const a = [];
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";
//     for (let i = 0; i <= vData; i++) {
//       a[i] = {
//         x: A.x,
//         y: A.y + (i === 0 ? 25 : aStep * i),
//         val: Max - aStepValue * i
//       };
//       drawCoords(a[i], 3, 0);
//     }

//     // Horizontal axis drawing
//     const b = [];
//     ctx.textAlign = "center";
//     ctx.textBaseline = "hanging";
//     const bStep = chartWidth / (hData + 1);
//     for (let i = 0; i < hData; i++) {
//       b[i] = {
//         x: B.x + bStep * (i + 1),
//         y: B.y,
//         val: propsRy[i]
//       };
//       drawCoords(b[i], 0, 3);
//     }

//     function drawCoords(o, offX, offY) {
//       ctx.beginPath();
//       ctx.moveTo(o.x - offX, o.y - offY);
//       ctx.lineTo(o.x + offX, o.y + offY);
//       ctx.stroke();
//       ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
//     }

//     // Data points
//     const oDotsTemp = [];
//     const oFlat = [];
//     for (let i = 0; i < propsRy.length; i++) {
//       oDotsTemp.push({
//         x: b[i].x,
//         y: b[i].y - valuesRy[i] * verticalUnit - 25,
//         val: valuesRy[i]
//       });
//       oFlat.push({
//         x: b[i].x,
//         y: b[i].y - 25
//       });
//     }
//     setODots(oDotsTemp); // Update the oDots state

//     // Animation
//     function animateChart() {
//       requestAnimationFrame(animateChart);
//       ctx.clearRect(60, 0, cw, ch - 60);
      
//       // Start the points at the correct vertical position
//       for (let i = 0; i < oFlat.length; i++) {
//         if (oFlat[i].y > oDotsTemp[i].y) {
//           oFlat[i].y -= speed;
//         }
//       }

//       // Draw curve and points
//       drawCurve(oFlat);
//       for (let i = 0; i < oFlat.length; i++) {
//         ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
//         ctx.beginPath();
//         ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
//         ctx.fill();
//       }
//     }

//     requestAnimationFrame(animateChart);

//     function drawCurve(p) {
//       const pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.lineTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1].x, pc[1][1].y, p[1].x, p[1].y);
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(pc[i][0].x, pc[i][0].y, pc[i + 1][1].x, pc[i + 1][1].y, p[i + 1].x, p[i + 1].y);
//       }
//       const n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0].x, pc[n - 1][0].y, p[n].x, p[n].y);
//       ctx.stroke();
//       ctx.fillStyle = grd;
//       ctx.fill();
//     }

//     function controlPoints(p) {
//       const pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         const dx = p[i - 1].x - p[i + 1].x;
//         const dy = p[i - 1].y - p[i + 1].y;
//         const x1 = p[i].x - dx * t;
//         const y1 = p[i].y - dy * t;
//         const o1 = { x: x1, y: y1 };
//         const x2 = p[i].x + dx * t;
//         const y2 = p[i].y + dy * t;
//         const o2 = { x: x2, y: y2 };
//         pc[i] = [o1, o2];
//       }
//       return pc;
//     }
//   }, [chartData]); // Re-run effect when chartData changes

//   return (
//     <div className="relative w-[700px] h-[350px] border border-[#555] mx-auto my-16">
//       <canvas ref={canvasRef}></canvas>
//       <div ref={labelRef} className="absolute text-black bg-white text-xs p-2 hidden"></div>
//     </div>
//   );
// }


// import { useRef, useEffect, useState } from "react";

// export default function Chart({ chartData }) {
//   const labelRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [oDots, setODots] = useState([]); // State to store oDots

//   useEffect(() => {
//     const c = canvasRef.current;
//     const ctx = c.getContext("2d");
//     const cw = c.width = 700;
//     const ch = c.height = 350;
//     const cx = cw / 2, cy = ch / 2;
//     const rad = Math.PI / 180;

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#999";
//     ctx.fillStyle = "#ccc";
//     ctx.font = "14px monospace";

//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167,72%,60%,1)");
//     grd.addColorStop(1, "hsla(167,72%,60%,0)");

//     // Extract values from chartData
//     const valuesRy = chartData.map(data => data.y);  // Extract the 'y' values (scores)
//     const propsRy = chartData.map(data => new Date(data.x).toLocaleString());  // Extract 'x' values (timestamps)

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     // Chart axis drawing
//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     // Vertical axis drawing
//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     const a = [];
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";
//     for (let i = 0; i <= vData; i++) {
//       a[i] = {
//         x: A.x,
//         y: A.y + (i === 0 ? 25 : aStep * i),
//         val: Max - aStepValue * i
//       };
//       drawCoords(a[i], 3, 0);
//     }

//     // Horizontal axis drawing
//     const b = [];
//     ctx.textAlign = "center";
//     ctx.textBaseline = "hanging";
//     const bStep = chartWidth / (hData + 1);
//     for (let i = 0; i < hData; i++) {
//       b[i] = {
//         x: B.x + bStep * (i + 1),
//         y: B.y,
//         val: propsRy[i]
//       };
//       drawCoords(b[i], 0, 3);
//     }

//     function drawCoords(o, offX, offY) {
//       ctx.beginPath();
//       ctx.moveTo(o.x - offX, o.y - offY);
//       ctx.lineTo(o.x + offX, o.y + offY);
//       ctx.stroke();
//       ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
//     }

//     // Data points
//     const oDotsTemp = [];
//     const oFlat = [];
//     for (let i = 0; i < propsRy.length; i++) {
//       oDotsTemp.push({
//         x: b[i].x,
//         y: b[i].y - valuesRy[i] * verticalUnit - 25,
//         val: valuesRy[i]
//       });
//       oFlat.push({
//         x: b[i].x,
//         y: b[i].y - 25
//       });
//     }
//     setODots(oDotsTemp); // Update the oDots state

//     // Animation
//     function animateChart() {
//       requestAnimationFrame(animateChart);
//       ctx.clearRect(60, 0, cw, ch - 60);

//       // Start the points at the correct vertical position
//       for (let i = 0; i < oFlat.length; i++) {
//         if (oFlat[i].y > oDotsTemp[i].y) {
//           oFlat[i].y -= speed;
//         }
//       }

//       // Draw curve and points
//       drawCurve(oFlat);
//       for (let i = 0; i < oFlat.length; i++) {
//         ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
//         ctx.beginPath();
//         ctx.arc(oFlat[i].x, oFlat[i].y, 3, 0, 2 * Math.PI);
//         ctx.fill();
//       }
//     }

//     requestAnimationFrame(animateChart);

//     function drawCurve(p) {
//       // Check if p is a valid array and has at least two points
//       if (!p || p.length < 2) {
//         console.error('Invalid points array', p);
//         return;
//       }

//       const pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.lineTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1]?.x, pc[1][1]?.y, p[1].x, p[1].y);

//       // Ensure that pc has enough control points for the curves
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(
//           pc[i][0]?.x, pc[i][0]?.y, 
//           pc[i + 1][1]?.x, pc[i + 1][1]?.y, 
//           p[i + 1].x, p[i + 1].y
//         );
//       }
      
//       const n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0]?.x, pc[n - 1][0]?.y, p[n]?.x, p[n]?.y);
//       ctx.stroke();
//       ctx.fillStyle = grd;
//       ctx.fill();
//     }

//     function controlPoints(p) {
//       const pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         const dx = p[i - 1].x - p[i + 1].x;
//         const dy = p[i - 1].y - p[i + 1].y;
//         const x1 = p[i].x - dx * t;
//         const y1 = p[i].y - dy * t;
//         const o1 = { x: x1, y: y1 };
//         const x2 = p[i].x + dx * t;
//         const y2 = p[i].y + dy * t;
//         const o2 = { x: x2, y: y2 };
//         pc[i] = [o1, o2];
//       }
//       return pc;
//     }
//   }, [chartData]); // Re-run effect when chartData changes

//   return (
//     <div className="relative w-[700px] h-[350px] border border-[#555] mx-auto my-16">
//       <canvas ref={canvasRef}></canvas>
//       <div ref={labelRef} className="absolute text-black bg-white text-xs p-2 hidden"></div>
//     </div>
//   );
// }



// import { useRef, useEffect, useState } from "react";

// export default function Chart({ chartData ,closeChart}) {
//   const labelRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [oDots, setODots] = useState([]); // State to store oDots

//   useEffect(() => {
//     const c = canvasRef.current;
//     const ctx = c.getContext("2d");
//     const cw = c.width = 700;
//     const ch = c.height = 350;
//     const cx = cw / 2, cy = ch / 2;
//     const rad = Math.PI / 180;

//     ctx.lineWidth = 1;
//     ctx.strokeStyle = "#999";
//     ctx.fillStyle = "#ccc";
//     ctx.font = "14px monospace";

//     const grd = ctx.createLinearGradient(0, 0, 0, cy);
//     grd.addColorStop(0, "hsla(167,72%,60%,1)");
//     grd.addColorStop(1, "hsla(167,72%,60%,0)");

//     // Ensure chartData is not empty
//     if (!chartData || chartData.length === 0) {
//       console.error('chartData is empty');
//       return; // Don't proceed if there's no data
//     }

//     const valuesRy = chartData.map(data => data.y);  // Extract the 'y' values (scores)
//     const propsRy = chartData.map(data => new Date(data.x).toLocaleDateString());  // Extract 'x' values (timestamps)

//     console.log('ValuesRy:', valuesRy);
//     console.log('PropsRy:', propsRy);

//     // Ensure data arrays are not empty
//     if (valuesRy.length === 0 || propsRy.length === 0) {
//       console.error('Extracted data arrays are empty');
//       return;
//     }

//     const vData = 4;
//     const hData = valuesRy.length;
//     const offset = 50.5;
//     const chartHeight = ch - 2 * offset;
//     const chartWidth = cw - 2 * offset;
//     const t = 1 / 7;
//     const speed = 2;

//     const A = { x: offset, y: offset };
//     const B = { x: offset, y: offset + chartHeight };
//     const C = { x: offset + chartWidth, y: offset + chartHeight };

//     // Chart axis drawing
//     ctx.beginPath();
//     ctx.moveTo(A.x, A.y);
//     ctx.lineTo(B.x, B.y);
//     ctx.lineTo(C.x, C.y);
//     ctx.stroke();

//     // Vertical axis drawing
//     const aStep = (chartHeight - 50) / vData;
//     const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
//     const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
//     const aStepValue = (Max - Min) / vData;
//     const verticalUnit = aStep / aStepValue;

//     const a = [];
//     ctx.textAlign = "right";
//     ctx.textBaseline = "middle";
//     for (let i = 0; i <= vData; i++) {
//       a[i] = {
//         x: A.x,
//         y: A.y + (i === 0 ? 25 : aStep * i),
//         val: Max - aStepValue * i
//       };
//       drawCoords(a[i], 3, 0);
//     }

//     // Horizontal axis drawing
//     const b = [];
//     ctx.textAlign = "center";
//     ctx.textBaseline = "hanging";
//     const bStep = chartWidth / (hData + 1);
//     for (let i = 0; i < hData; i++) {
//       b[i] = {
//         x: B.x + bStep * (i + 1),
//         y: B.y,
//         val: propsRy[i]
//       };
//       drawCoords(b[i], 0, 3);
//     }

//     function drawCoords(o, offX, offY) {
//       ctx.beginPath();
//       ctx.moveTo(o.x - offX, o.y - offY);
//       ctx.lineTo(o.x + offX, o.y + offY);
//       ctx.stroke();
//       ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
//     }

//     // Data points
//     // Data points
// const oDotsTemp = [];
// const oFlat = [];
// for (let i = 0; i < propsRy.length; i++) {
//   oDotsTemp.push({
//     x: b[i].x,
//     y: b[i].y - valuesRy[i] * verticalUnit - 25,
//     val: valuesRy[i]
//   });
//   oFlat.push({
//     x: b[i].x,
//     y: b[i].y - 25
//   });
// }
// setODots(oDotsTemp); // Update the oDots state

// // Animation
// function animateChart() {
//   requestAnimationFrame(animateChart);
//   ctx.clearRect(60, 0, cw, ch - 60);

//   // Ensure oFlat is populated before drawing the curve
//   if (oFlat.length > 0) {
//     // Start the points at the correct vertical position
//     for (let i = 0; i < oFlat.length; i++) {
//       if (oFlat[i].y > oDotsTemp[i].y) {
//         oFlat[i].y -= speed;
//       }
//     }

//     // Draw curve and points
//     drawCurve(oFlat);

//     // Highlighting the points: change color and size here
//     for (let i = 0; i < oFlat.length; i++) {
//       ctx.fillStyle = '#ff000';  // Highlight color
//       ctx.beginPath();
//       ctx.arc(oFlat[i].x, oFlat[i].y, 6, 0, 2 * Math.PI); // Increased point size
//       ctx.fill();

//       ctx.fillStyle = '#ffff'; // Optional: Change label color if needed
//       ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
//     }
//   } else {
//     console.error('oFlat is empty, skipping curve drawing');
//   }
// }


//     requestAnimationFrame(animateChart);

//     function drawCurve(p) {
//       // Check if p is a valid array and has at least two points
//       if (!p || p.length < 2) {
//         console.error('Invalid points array', p);
//         return;
//       }

//       const pc = controlPoints(p);
//       ctx.beginPath();
//       ctx.lineTo(p[0].x, p[0].y);
//       ctx.quadraticCurveTo(pc[1][1]?.x, pc[1][1]?.y, p[1].x, p[1].y);

//       // Ensure that pc has enough control points for the curves
//       for (let i = 1; i < p.length - 2; i++) {
//         ctx.bezierCurveTo(
//           pc[i][0]?.x, pc[i][0]?.y, 
//           pc[i + 1][1]?.x, pc[i + 1][1]?.y, 
//           p[i + 1].x, p[i + 1].y
//         );
//       }

//       const n = p.length - 1;
//       ctx.quadraticCurveTo(pc[n - 1][0]?.x, pc[n - 1][0]?.y, p[n]?.x, p[n]?.y);
//       ctx.stroke();
//       ctx.fillStyle = grd;
//       ctx.fill();
//     }

//     function controlPoints(p) {
//       const pc = [];
//       for (let i = 1; i < p.length - 1; i++) {
//         const dx = p[i - 1].x - p[i + 1].x;
//         const dy = p[i - 1].y - p[i + 1].y;
//         const x1 = p[i].x - dx * t;
//         const y1 = p[i].y - dy * t;
//         const o1 = { x: x1, y: y1 };
//         const x2 = p[i].x + dx * t;
//         const y2 = p[i].y + dy * t;
//         const o2 = { x: x2, y: y2 };
//         pc[i] = [o1, o2];
//       }
//       return pc;
//     }
//   }, [chartData]); // Re-run effect when chartData changes

//   return (
//     <div className="absolute mt-52 ml-32 w-[700px] h-[350px] border bg-purple-600 bg-opacity-80 border-[#555]  ">
//     <canvas ref={canvasRef}></canvas>
//     <button 
//       onClick={closeChart}
//       className=" top-0 right-0 p-2 bg-red-500 text-white rounded"
//     >
//       Close
//     </button>
//     <div ref={labelRef} className="absolute text-black bg-white text-xs p-2 hidden"></div>
//   </div>
//   );
// }



import { useRef, useEffect, useState } from "react";

export default function Chart({ chartData, closeChart }) {
  const labelRef = useRef(null);
  const canvasRef = useRef(null);

  const [oDots, setODots] = useState([]); // State to store oDots

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const cw = c.width = 700;
    const ch = c.height = 350;
    const cx = cw / 2, cy = ch / 2;
    const rad = Math.PI / 180;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "#999";
    ctx.fillStyle = "#ccc";
    ctx.font = "14px monospace";

    const grd = ctx.createLinearGradient(0, 0, 0, cy);
    grd.addColorStop(0, "hsla(167,72%,60%,1)");
    grd.addColorStop(1, "hsla(167,72%,60%,0)");

    // Ensure chartData is not empty
    if (!chartData || chartData.length === 0) {
      console.error('chartData is empty');
      return; // Don't proceed if there's no data
    }

    const valuesRy = chartData.map(data => data.y);  // Extract the 'y' values (scores)
    const propsRy = chartData.map(data => new Date(data.x).toLocaleDateString());  // Extract 'x' values (timestamps)

    console.log('ValuesRy:', valuesRy);
    console.log('PropsRy:', propsRy);

    // Ensure data arrays are not empty
    if (valuesRy.length === 0 || propsRy.length === 0) {
      console.error('Extracted data arrays are empty');
      return;
    }

    const vData = 4;
    const hData = valuesRy.length;
    const offset = 50.5;
    const chartHeight = ch - 2 * offset;
    const chartWidth = cw - 2 * offset;
    const t = 1 / 7;
    const speed = 2;

    const A = { x: offset, y: offset };
    const B = { x: offset, y: offset + chartHeight };
    const C = { x: offset + chartWidth, y: offset + chartHeight };

    // Chart axis drawing
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.stroke();

    // Vertical axis drawing
    const aStep = (chartHeight - 50) / vData;
    const Max = Math.ceil(Math.max(...valuesRy) / 10) * 10;
    const Min = Math.floor(Math.min(...valuesRy) / 10) * 10;
    const aStepValue = (Max - Min) / vData;
    const verticalUnit = aStep / aStepValue;

    const a = [];
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i <= vData; i++) {
      a[i] = {
        x: A.x,
        y: A.y + (i === 0 ? 25 : aStep * i),
        val: Max - aStepValue * i
      };
      drawCoords(a[i], 3, 0);
    }

    // Horizontal axis drawing
    const b = [];
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    const bStep = chartWidth / (hData + 1);
    for (let i = 0; i < hData; i++) {
      b[i] = {
        x: B.x + bStep * (i + 1),
        y: B.y,
        val: propsRy[i]
      };
      drawCoords(b[i], 0, 3);
    }

    function drawCoords(o, offX, offY) {
      ctx.beginPath();
      ctx.moveTo(o.x - offX, o.y - offY);
      ctx.lineTo(o.x + offX, o.y + offY);
      ctx.stroke();

      // Rotate the x-axis labels to avoid overlap
      if (offY === 3) {
        ctx.save(); // Save the current state of the canvas
        ctx.translate(o.x, o.y + 10); // Move the origin to where the label is
        ctx.rotate(-Math.PI / 4); // Rotate the text counterclockwise
        ctx.fillText(o.val, 0, 0); // Draw the label at the rotated position
        ctx.restore(); // Restore the original canvas state
      } else {
        ctx.fillText(o.val, o.x - 2 * offX, o.y + 2 * offY);
      }
    }

    // Data points
    const oDotsTemp = [];
    const oFlat = [];
    for (let i = 0; i < propsRy.length; i++) {
      oDotsTemp.push({
        x: b[i].x,
        y: b[i].y - valuesRy[i] * verticalUnit - 25,
        val: valuesRy[i]
      });
      oFlat.push({
        x: b[i].x,
        y: b[i].y - 25
      });
    }
    setODots(oDotsTemp); // Update the oDots state

    // Animation
    function animateChart() {
      requestAnimationFrame(animateChart);
      ctx.clearRect(60, 0, cw, ch - 60);

      // Ensure oFlat is populated before drawing the curve
      if (oFlat.length > 0) {
        // Start the points at the correct vertical position
        for (let i = 0; i < oFlat.length; i++) {
          if (oFlat[i].y > oDotsTemp[i].y) {
            oFlat[i].y -= speed;
          }
        }

        // Draw curve and points
        drawCurve(oFlat);

        // Highlighting the points: change color and size here
        for (let i = 0; i < oFlat.length; i++) {
          ctx.fillStyle = '#ff000';  // Highlight color
          ctx.beginPath();
          ctx.arc(oFlat[i].x, oFlat[i].y, 6, 0, 2 * Math.PI); // Increased point size
          ctx.fill();

          ctx.fillStyle = '#ffff'; // Optional: Change label color if needed
          ctx.fillText(oDotsTemp[i].val, oFlat[i].x, oFlat[i].y - 25);
        }
      } else {
        console.error('oFlat is empty, skipping curve drawing');
      }
    }

    requestAnimationFrame(animateChart);

    function drawCurve(p) {
      // Check if p is a valid array and has at least two points
      if (!p || p.length < 2) {
        console.error('Invalid points array', p);
        return;
      }

      const pc = controlPoints(p);
      ctx.beginPath();
      ctx.lineTo(p[0].x, p[0].y);
      ctx.quadraticCurveTo(pc[1][1]?.x, pc[1][1]?.y, p[1].x, p[1].y);

      // Ensure that pc has enough control points for the curves
      for (let i = 1; i < p.length - 2; i++) {
        ctx.bezierCurveTo(
          pc[i][0]?.x, pc[i][0]?.y, 
          pc[i + 1][1]?.x, pc[i + 1][1]?.y, 
          p[i + 1].x, p[i + 1].y
        );
      }

      const n = p.length - 1;
      ctx.quadraticCurveTo(pc[n - 1][0]?.x, pc[n - 1][0]?.y, p[n]?.x, p[n]?.y);
      ctx.stroke();
      ctx.fillStyle = grd;
      ctx.fill();
    }

    function controlPoints(p) {
      const pc = [];
      for (let i = 1; i < p.length - 1; i++) {
        const dx = p[i - 1].x - p[i + 1].x;
        const dy = p[i - 1].y - p[i + 1].y;
        const x1 = p[i].x - dx * t;
        const y1 = p[i].y - dy * t;
        const o1 = { x: x1, y: y1 };
        const x2 = p[i].x + dx * t;
        const y2 = p[i].y + dy * t;
        const o2 = { x: x2, y: y2 };
        pc[i] = [o1, o2];
      }
      return pc;
    }
  }, [chartData]); // Re-run effect when chartData changes

  return (
    <div className="absolute mt-52 ml-32 w-[700px] h-[350px] border bg-purple-600 bg-opacity-80 border-[#555]">
      <canvas ref={canvasRef}></canvas>
      <button 
        onClick={closeChart}
        className="top-0 right-0 p-2 bg-red-500 text-white rounded"
      >
        Close
      </button>
    </div>
  );
}
