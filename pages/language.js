import Link from "next/link";

export default function Language() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 px-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-10">Select Language</h1>

      <div className="flex flex-col gap-5 w-full max-w-md">
        {/* English Button */}
        <Link href="/dashboard">
          <button className="w-full py-4 px-6 rounded-2xl shadow-md bg-white text-gray-900 font-semibold text-lg transition-all duration-300 hover:bg-pink-600 hover:text-white hover:shadow-lg">
            English
          </button>
        </Link>

        {/* Marathi Button */}
        <Link href="https://mockmingle-marathi.vercel.app/">
          <button className="w-full py-4 px-6 rounded-2xl shadow-md bg-white text-black font-semibold text-lg transition-all duration-300 hover:bg-pink-600 hover:shadow-lg">
            Marathi
          </button>
        </Link>
      </div>
    </div>
  );
}
