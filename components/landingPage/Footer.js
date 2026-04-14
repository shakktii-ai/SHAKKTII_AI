// import React from "react";

// const Icons = [
//   { name: "instagram", src: "/Instagram.png" },
//   { name: "facebook", src: "/Facebook.png" },
//   { name: "linkedin", src: "/LinkedIn.png" },
//   { name: "twitter", src: "/Twitter.png" },
// ];

// const Footer = () => {
//   return (
//     <footer className="bg-[#1E0A40] text-white py-16 px-10">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex items-center justify-center flex-col">
//           <div className="flex items-center gap-3 mb-4 flex-col md:flex-row">
//             <img
//               src="/MM_LOGO.png"
//               alt="MockMingle Logo"
//               className="w-[4rem] h-[5rem]"
//             />
//             <h2 className="text-4xl font-bold tracking-widest text-[#B3B3EA]">
//               MOCKMINGLE
//             </h2>
//           </div>
//           <p className="text-white max-w-[40rem] text-sm md:text-[1rem] mb-12">
//             AI-powered mock interviews & real-time career insights.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 justify-center max-w-[1200px] mx-auto">
//           {/* Column 1 */}
//           <div>
//             <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">
//               COMMUNITY & SOCIAL
//             </h4>

//             <div className="flex gap-3 mb-8">
//               {Icons.map((social) => (
//                 <div
//                   key={social.name}
//                   className="w-10 h-10 bg-white rounded flex items-center justify-center"
//                 >
//                   <img
//                     src={social.src}
//                     alt={social.name}
//                     className="w-8 h-8 object-contain"
//                   />
//                 </div>
//               ))}
//             </div>

//             <ul className="space-y-3 text-white">
//               <li>Debate Rooms</li>
//               <li>GD Rooms</li>
//               <li>Connections Hub</li>
//             </ul>
//           </div>

//           {/* Column 2 */}
//           <div>
//             <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">SERVICES</h4>
//             <ul className="space-y-3 text-white">
//               <li>• Mock Test Interviews</li>
//               <li>• Skill Tests</li>
//               <li>• Resume Analyzer</li>
//               <li>• AI Career Insights</li>
//               <li>• Temperament & Communication Score</li>
//             </ul>
//           </div>

//           {/* Column 3 */}
//           <div>
//             <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">
//               CONTACT US
//             </h4>
//             <div className="space-y-4 text-white">
//               <p>
//                 Call:
//                 <br />
//                 +91 8956668867
//               </p>
//               <p>
//                 Email:
//                 <br />
//                 info@shakktii.in
//               </p>
//               <p>
//                 Address:
//                 <br />
//                 Shakktii AI, 1145, Sadashiv Peth, Perugate, Pune 411030
//               </p>
//             </div>
//           </div>

//           {/* Column 4 */}
//           <div>
//             <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">LEGAL</h4>
//             <ul className="space-y-3 text-white">
//               <li>• Terms & Conditions</li>
//               <li>• Privacy Policy</li>
//               <li>• Refund & Cancellation</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import React from "react";

const Icons = [
  { name: "instagram", src: "/Instagram.png", link: "https://www.instagram.com/shakktii_ai/" },
  { 
    name: "linkedin", 
    src: "/Linkedin.png", 
    link: "https://www.linkedin.com/company/shakktii-ai/posts/" 
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#1E0A40] text-white py-16 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center gap-3 mb-4 flex-col md:flex-row">
            <img
              src="/MM_LOGO.png"
              alt="MockMingle Logo"
              className="w-[4rem] h-[5rem]"
            />
            <h2 className="text-4xl font-bold tracking-widest text-[#B3B3EA]">
              MOCKMINGLE
            </h2>
          </div>
          <p className="text-white max-w-[40rem] text-sm md:text-[1rem] mb-12">
            AI-powered mock interviews & real-time career insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 justify-center max-w-[1200px] mx-auto">
          {/* Column 1 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">
              COMMUNITY & SOCIAL
            </h4>

            <div className="flex gap-3 mb-8">
              {Icons.map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <img
                    src={social.src}
                    alt={social.name}
                    className="w-8 h-8 object-contain"
                  />
                </a>
              ))}
            </div>

            <ul className="space-y-3 text-white">
              <li>Debate Rooms</li>
              <li>GD Rooms</li>
              <li>Connections Hub</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">SERVICES</h4>
            <ul className="space-y-3 text-white">
              <li>• Mock Test Interviews</li>
              <li>• Skill Tests</li>
              <li>• Resume Analyzer</li>
              <li>• AI Career Insights</li>
              <li>• Temperament & Communication Score</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">
              CONTACT US
            </h4>
            <div className="space-y-4 text-white">
              <p>
                Call:
                <br />
                +91 8956668867
              </p>
              <p>
                Email:
                <br />
                info@shakktii.in
              </p>
              <p>
                Address:
                <br />
                Shakktii AI, 1145, Sadashiv Peth, Perugate, Pune 411030
              </p>
            </div>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#B3B3EA]">LEGAL</h4>
            <ul className="space-y-3 text-white">
              <li>• Terms & Conditions</li>
              <li>• Privacy Policy</li>
              <li>• Refund & Cancellation</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;