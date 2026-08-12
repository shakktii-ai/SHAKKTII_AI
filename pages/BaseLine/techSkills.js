import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Brain,
  GitBranch,
  FileSpreadsheet,
  FlaskConical,
  CircleCheck,
  Timer,
  ShuffleIcon,
} from "lucide-react";
import Footer from '@/components/dashboard/Footer';
function techSkills() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      // Get user info from localStorage
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      if (userFromStorage) {
        setUserName(userFromStorage.fullName || '');
      }
    }
  }, []);

  const practiceCards = [
    {
      id: 1,
      title: "Technical Training",
      subtitle: "Know yourself first",
      description:
        "Evaluate your technical knowledge and subject understanding through structured tests designed for skill improvement.",
      category: "Technical",
      duration: "15 min",
      questions: 20,
      icon: Brain,
      color: "#7F3FEE",
      lightColor: "#E9E1FF",
      link: "#",///BaseLine/techMock
    },

    // {
    //   id: 2,
    //   title: "Decision Making",
    //   subtitle: "Think sharper under pressure",
    //   description:
    //     "Sharpen your decision-making skills with interactive scenarios across business, ethical, and personal contexts.",
    //   category: "Critical Thinking",
    //   duration: "20 min",
    //   questions: 25,
    //   icon: ShuffleIcon,
    //   color: "#534AE5",
    //   lightColor: "#D9D8FF",
    //   link: "/decisionScenario",
    // },

    {
      id: 2,
      title: "Excel Test",
      subtitle: "Data fluency matters",
      description:
        "Test and improve your Excel knowledge across formulas, data processing and analysis.",
      category: "Technical",
      duration: "30 min",
      questions: 30,
      icon: FileSpreadsheet,
      color: "#18BB85",
      lightColor: "#DDF7EC",
      link: "/BaseLine/excelTest",
    },

    // {
    //   id: 4,
    //   title: "Psychometric Test",
    //   subtitle: "Full aptitude profile",
    //   description:
    //     "Evaluate your personality, aptitude, and decision-making style through a structured psychometric assessment.",
    //   category: "Aptitude",
    //   duration: "35 min",
    //   questions: 50,
    //   icon: FlaskConical,
    //   color: "#17A8EA",
    //   lightColor: "#DDF3FF",
    //   link: "/psychometricTest",
    // },
  ];

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Practice Tests</title>
      </Head>
      <div className="min-h-screen bg-[#f5f5ff]">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between ">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <svg width="30" height="54" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.2929 27.2929C13.9024 27.6834 13.9024 28.3166 14.2929 28.7071L20.6569 35.0711C21.0474 35.4616 21.6805 35.4616 22.0711 35.0711C22.4616 34.6805 22.4616 34.0474 22.0711 33.6569L16.4142 28L22.0711 22.3431C22.4616 21.9526 22.4616 21.3195 22.0711 20.9289C21.6805 20.5384 21.0474 20.5384 20.6569 20.9289L14.2929 27.2929ZM42 28V27L15 27V28V29L42 29V28Z" fill="black" />
                  <path d="M27.5 0.5C42.4204 0.5 54.5 12.3731 54.5 27C54.5 41.6269 42.4204 53.5 27.5 53.5C12.5796 53.5 0.5 41.6269 0.5 27C0.5 12.3731 12.5796 0.5 27.5 0.5Z" stroke="black" />
                </svg>

              </button>
            </div>
            {/* <div className="flex items-center ">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-lg text-purple-900">{userName}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <img src="/logoo.png" alt="Logo" className="w-10 h-10" />
              </div>
            </div> */}
          </div>

          {/* Title */}
          <div className="text-center  mb-12">
            <h1 className="text-[36px] font-bold  text-[#1F4CBD] ">Practice Assessments</h1>
            <p className="text-[18px] text-[#1F4CBD] mt-1 font-medium">
              Enhance your skills through our specialized practice sessions
            </p>
            {/* <button
              onClick={() => router.push('/practiceProgress')}
              className="mt-4 bg-[#C4D6F6] py-2 px-6 rounded-full text-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              View Your Progress
            </button> */}
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 px-4">
            {practiceCards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(card.link)}
                className="relative overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
              >
                {/* Top Gradient */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(to right, ${card.color}, ${card.lightColor})`,
                  }}
                />

                {/* Background Circle */}
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full" style={{ backgroundColor: `${card.color}10` }}></div>

                <div className="relative p-6 flex flex-col h-full">

                  {/* Icon + Badge */}
                  <div className="flex items-start justify-between mb-8">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${card.lightColor}90` }}
                    >
                      <card.icon
                        className="w-6 h-6"
                        style={{ color: card.color }}
                      />
                    </div>

                    <span
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{
                        background: `${card.lightColor}30`,
                        color: card.color,
                        borderColor: `${card.color}20`,
                        
                      }}
                    >
                      {card.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {card.title}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="text-sm font-normal mt-1"
                    style={{ color: card.color }}
                  >
                    {card.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-6 mt-4 flex-1">
                    {card.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 text-gray-400 text-xs mt-2">
                    <span className='flex gap-2 items-center'><Timer size={12}/> {card.duration}</span>
                    <span className='flex gap-2 items-center'><CircleCheck size={12}/> {card.questions} questions</span>
                  </div>

                  {/* Button */}
                  <button
                    className="mt-4 w-full py-2 rounded-xl font-semibold transition"
                    style={{
                      background: `${card.lightColor}35`,
                      color: card.color,
                      border: `1px solid ${card.lightColor}`,
                    }}
                  >
                    Start Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );
}

export default techSkills;
