import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function Practices() {
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
      title: "Speaking Practice",
      description: "Improve your speaking skills with interactive exercises at different difficulty levels.",
      image: "/speaking.png",
      bgColor: "from-pink-600 to-rose-800",
      link: "/speakingPractice"
    },
    {
      id: 2,
      title: "Listening Practice",
      description: "Enhance your listening comprehension with guided audio exercises and real-world scenarios.",
      image: "/listening.png",
      bgColor: "from-blue-600 to-cyan-800",
      link: "/listeningPractice"
    },
    {
      id: 3,
      title: "Reading & Writing",
      description: "Develop your reading comprehension and written expression through structured activities.",
      image: "/reading.png",
      bgColor: "from-emerald-600 to-teal-800",
      link: "/readingWritingPractice"
    },
    
  ];

  return (
    <>
      <Head>
        <title>SHAKKTII AI - Practice Tests</title>
      </Head>
      <div className="min-h-screen bg-[#f5f5ff]">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <svg width="55" height="54" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.2929 27.2929C13.9024 27.6834 13.9024 28.3166 14.2929 28.7071L20.6569 35.0711C21.0474 35.4616 21.6805 35.4616 22.0711 35.0711C22.4616 34.6805 22.4616 34.0474 22.0711 33.6569L16.4142 28L22.0711 22.3431C22.4616 21.9526 22.4616 21.3195 22.0711 20.9289C21.6805 20.5384 21.0474 20.5384 20.6569 20.9289L14.2929 27.2929ZM42 28V27L15 27V28V29L42 29V28Z" fill="black" />
                  <path d="M27.5 0.5C42.4204 0.5 54.5 12.3731 54.5 27C54.5 41.6269 42.4204 53.5 27.5 53.5C12.5796 53.5 0.5 41.6269 0.5 27C0.5 12.3731 12.5796 0.5 27.5 0.5Z" stroke="black" />
                </svg>

              </button>
            </div>
            <div className="flex items-center ">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-semibold text-lg text-purple-900">{userName}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <img src="/logoo.png" alt="Logo" className="w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center  mb-12">
            <h1 className="text-4xl font-bold  ">Practice Assessments</h1>
            <p className="text-lg text-gray-700 mt-2">
              Enhance your skills through our specialized practice sessions
            </p>
            <button
              onClick={() => router.push('/practiceProgress')}
              className="mt-4 bg-[#D2E9FA] py-2 px-6 rounded-full text-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              View Your Progress
            </button>
          </div>

          {/* Practice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {practiceCards.map((card) => (

              <div
                key={card.id}
                className="bg-white rounded-xl shadow-lg transform transition-all hover:scale-105 cursor-pointer"
                onClick={() => router.push(card.link)}
              >


            {/* top-right corner */}
            <div className="absolute -top-2 -right-2 w-[12rem] h-[12rem] border-t-[1rem] border-r-[1rem] border-[#D2E9FA] rounded-tr-xl"></div>

            {/* bottom-left corner */}
            <div className="absolute -bottom-2 -left-2 w-[6rem] h-[6rem] border-b-[1rem] border-l-[1rem] border-[#D2E9FA] rounded-bl-xl"></div>

           
                <div className="p-6 py-12">
                  <h3 className="text-4xl font-bold text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 mt-6 text-sm mb-4">{card.description}</p>
                  <button
                    className="w-full bg-[#D2E9FA] mt-6 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Start Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Practices;
