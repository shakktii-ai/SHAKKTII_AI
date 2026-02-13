import Link from "next/link";
import { useRouter } from "next/router";

export default function Enterprise() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">

      {/* ================= HERO ================= */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            MockMingle — Recruitment Filtering Engine
          </h1>

          <p className="mt-5 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A structured AI-driven hiring workflow — from company onboarding
            and job creation to intelligent candidate evaluation and automated
            report generation.
          </p>

          <div className="mt-8">
            <Link
              href={'https://arihant-dashboard.vercel.app/admin'}
              className="px-7 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-black transition"
            >
              Login as Enterprise
            </Link>
          </div>

        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <h2 className="text-xl font-semibold">
              How It Works
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              A streamlined four-step recruitment lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">

            {[
              {
                step: "01",
                title: "Company Onboarding",
                desc: "Register and configure hiring preferences.",
              },
              {
                step: "02",
                title: "Create Job Role",
                desc: "Define skills, experience and evaluation criteria.",
              },
              {
                step: "03",
                title: "Share Assessment Link",
                desc: "Generate and distribute a unique assessment link.",
              },
              {
                step: "04",
                title: "AI Evaluation & Report",
                desc: "AI analyzes results and generates structured insights.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition"
              >
                <div className="text-xs font-semibold text-gray-400 tracking-wider">
                  {item.step}
                </div>

                <h3 className="mt-3 text-base font-medium text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>


      {/* ================= FOOTER ================= */}
      <footer className="mt-auto border-t border-gray-100 py-8 bg-white text-center">
        <img
          src="/MM_LOGO.png"
          alt="MockMingle Logo"
          className="h-7 mx-auto mb-3 opacity-90"
        />
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MockMingle.in
        </p>
      </footer>

    </div>
  );
}
