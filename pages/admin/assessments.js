import { useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  BookOpen,
  Sparkles,
  Award,
  Brain,
  Code,
  Layers,
  CheckCircle2,
  Mic,
  FileCode,
  FileText,
  Search,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Zap,
  Target
} from "lucide-react";

export default function CurriculumAssessments() {
  const [activeTab, setActiveTab] = useState("roles"); // 'roles', 'academic', 'psychometric'
  const [searchQuery, setSearchQuery] = useState("");

  const jobRoles = [
    {
      title: "Full Stack Developer",
      category: "Software Development",
      description: "Frontend (React, Next.js), Backend (Node.js, Express), Database (MongoDB, SQL), System Design",
      difficulty: "Advanced",
      questionsCount: "120+ Questions",
      tags: ["JavaScript", "React", "Node.js", "System Design"],
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "Frontend Engineer",
      category: "UI / Web Development",
      description: "HTML5, CSS3, Modern JavaScript, React/Vue, State Management, Responsive Design, Web Performance",
      difficulty: "Intermediate",
      questionsCount: "95+ Questions",
      tags: ["React", "CSS", "TypeScript", "Performance"],
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Backend Engineer",
      category: "Core Engineering",
      description: "APIs, Microservices, Authentication, SQL/NoSQL databases, Caching, Cloud Architecture",
      difficulty: "Advanced",
      questionsCount: "110+ Questions",
      tags: ["Node.js", "Python", "PostgreSQL", "Docker"],
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Data Scientist & AI Engineer",
      category: "Data & Artificial Intelligence",
      description: "Machine Learning models, Statistics, Pandas/NumPy, Deep Learning, NLP, Data Wrangling",
      difficulty: "Expert",
      questionsCount: "85+ Questions",
      tags: ["Python", "Machine Learning", "PyTorch", "NLP"],
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Product Manager",
      category: "Product & Strategy",
      description: "Product Strategy, User Empathy, Metrics Analysis, Roadmapping, Stakeholder Management",
      difficulty: "Intermediate",
      questionsCount: "70+ Questions",
      tags: ["Product Strategy", "Agile", "User Research", "Metrics"],
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "DevOps & Cloud Engineer",
      category: "Infrastructure",
      description: "CI/CD pipelines, Docker, Kubernetes, AWS/Azure, Terraform, Monitoring & Incident Management",
      difficulty: "Advanced",
      questionsCount: "80+ Questions",
      tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
      color: "from-blue-500 to-indigo-600",
    },
  ];

  const academicStreams = [
    {
      stream: "Computer Science & Engineering (CSE)",
      badge: "Flagship Curriculum",
      subjects: [
        { name: "Data Structures & Algorithms", format: "MCQ & Coding", questions: "150+ Bank", difficulty: "High" },
        { name: "Database Management Systems (DBMS)", format: "MCQ & SQL", questions: "120+ Bank", difficulty: "Medium" },
        { name: "Computer Networks", format: "MCQ & Theory", questions: "90+ Bank", difficulty: "Medium" },
        { name: "Operating Systems", format: "MCQ & Process Modeling", questions: "100+ Bank", difficulty: "High" },
        { name: "Software Engineering & SDLC", format: "MCQ & Scenarios", questions: "80+ Bank", difficulty: "Low" },
      ],
    },
    {
      stream: "Artificial Intelligence & Data Science (AI/DS)",
      badge: "Emerging Tech",
      subjects: [
        { name: "Probability & Statistical Inference", format: "MCQ & Problems", questions: "85+ Bank", difficulty: "High" },
        { name: "Machine Learning Fundamentals", format: "MCQ & Coding", questions: "110+ Bank", difficulty: "High" },
        { name: "Neural Networks & Deep Learning", format: "MCQ & Theory", questions: "75+ Bank", difficulty: "Expert" },
        { name: "Data Warehousing & Mining", format: "MCQ & ETL", questions: "65+ Bank", difficulty: "Medium" },
      ],
    },
    {
      stream: "Information Technology (IT)",
      badge: "Industry Ready",
      subjects: [
        { name: "Web Technologies & Protocols", format: "MCQ & Practical", questions: "95+ Bank", difficulty: "Medium" },
        { name: "Cybersecurity & Information Assurance", format: "MCQ & Scenarios", questions: "80+ Bank", difficulty: "High" },
        { name: "Cloud Computing & Virtualization", format: "MCQ & Architecture", questions: "70+ Bank", difficulty: "Medium" },
      ],
    },
  ];

  const psychometricCompetencies = [
    {
      name: "Communication & Articulation",
      description: "Measures verbal clarity, professional tone, structured answering, and active listening response during dynamic AI interactions.",
      weight: "20%",
      icon: Mic,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      name: "Technical & Problem Solving",
      description: "Evaluates analytical breakdown, computational thinking, algorithmic efficiency, and code optimization reasoning under scrutiny.",
      weight: "25%",
      icon: Code,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      name: "Decision-Making Under Pressure",
      description: "Assesses situational judgement, trade-off evaluation, prioritization, and ethical workplace dilemmas in real-time scenarios.",
      weight: "20%",
      icon: Target,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      name: "Confidence & Poise",
      description: "Measures executive presence, speech cadence, resilience during challenging follow-up inquiries, and composed posture.",
      weight: "15%",
      icon: Zap,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      name: "Team Collaboration & Culture Fit",
      description: "Evaluates cross-functional adaptability, collaborative spirit, emotional intelligence, and constructive conflict resolution capability.",
      weight: "20%",
      icon: Brain,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  const filteredRoles = jobRoles.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Curriculum & Test Explorer"
      subtitle="Explore AI mock interview job tracks, academic test banks, and psychometric competency evaluation rubrics"
    >
      {/* ================= HERO BANNER ================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7060E7] via-[#5B4FE1] to-[#0AADD8] p-6 sm:p-8 text-white shadow-xl shadow-purple-500/15 mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
            <span>Campus Curriculum Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Assessment Tracks & Question Repositories
          </h2>
          <p className="text-sm text-purple-100 leading-relaxed font-medium">
            Browse our multi-tiered testing modules mapped to real placement interview patterns: Voice AI Mock Interviews, Objective Subject Tests, and Behavioral Competency Rubrics.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ================= NAVIGATION TABS & SEARCH ================= */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "roles"
                  ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Briefcase size={16} />
              <span>AI Job Tracks ({jobRoles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("academic")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "academic"
                  ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <GraduationCap size={16} />
              <span>Academic Disciplines ({academicStreams.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("psychometric")}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "psychometric"
                  ? "bg-gradient-to-r from-[#7060E7] to-[#0AADD8] text-white shadow-md shadow-purple-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <Brain size={16} />
              <span>Psychometric Rubrics ({psychometricCompetencies.length})</span>
            </button>
          </div>

          {activeTab === "roles" && (
            <div className="relative w-full lg:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracks, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= TAB 1: JOB ROLES ================= */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F24E8] bg-[#ECECFA] px-2.5 py-1 rounded-lg border border-purple-200">
                    {role.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    role.difficulty === 'Expert' 
                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                      : role.difficulty === 'Advanced'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {role.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#6F24E8] transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {role.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {role.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">{role.questionsCount}</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Active on Portal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 2: ACADEMIC DISCIPLINES ================= */}
      {activeTab === "academic" && (
        <div className="space-y-6">
          {academicStreams.map((stream, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ECECFA] border border-purple-200 flex items-center justify-center text-[#6F24E8]">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {stream.stream}
                    </h3>
                    <p className="text-xs text-slate-500">{stream.subjects.length} Core Assessment Modules</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-[#6F24E8] border border-purple-200 rounded-full">
                  {stream.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stream.subjects.map((sub, sIdx) => (
                  <div key={sIdx} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 hover:bg-slate-50 hover:border-purple-200 transition-all">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{sub.name}</h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Format: <strong className="text-slate-800 font-semibold">{sub.format}</strong></span>
                      <span className="text-[#6F24E8] font-bold bg-[#ECECFA] px-2 py-0.5 rounded-md border border-purple-100">{sub.questions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TAB 3: PSYCHOMETRIC RUBRICS ================= */}
      {activeTab === "psychometric" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {psychometricCompetencies.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 hover:shadow-md hover:border-purple-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${comp.color}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#ECECFA] text-[#6F24E8] border border-purple-200">
                    Weight: {comp.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{comp.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
