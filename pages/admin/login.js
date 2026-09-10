import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in as admin, redirect to dashboard
    const token = localStorage.getItem("Admintoken");
    const admin = localStorage.getItem("admin");
    if (token && admin) {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST || ''}/api/collageLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const response = await res.json();

      if (!res.ok || !response.success) {
        toast.error(response.error || 'Invalid credentials. Please check your institutional email and password.', {
          position: "top-right",
          autoClose: 3500,
          theme: "light",
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('Admintoken', response.Admintoken);
      localStorage.setItem(
        'admin',
        JSON.stringify({ ...response.user, role: "admin" })
      );

      toast.success(`Welcome back! Logged in to ${response.user?.collageName || 'Campus Admin'}.`, {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });

      setTimeout(() => {
        router.push("/admin");
      }, 700);

    } catch (err) {
      console.error(err);
      toast.error('Network or server error. Please try again.', {
        position: "top-right",
        autoClose: 3500,
        theme: "light",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f8f9fd] font-sans text-slate-800 overflow-hidden">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7060E7]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0AADD8]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[430px] bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-purple-500/10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-16 h-16 mb-4 rounded-2xl bg-gradient-to-r from-[#7060E7] to-[#0AADD8] p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-2">
              <Image
                src="/MM_LOGO1.png"
                alt="MockMingle Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECECFA] text-[#6F24E8] text-xs font-bold mb-2.5 border border-purple-200">
            <ShieldCheck size={14} className="text-[#6F24E8]" />
            Institutional Portal
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator <span className="bg-gradient-to-r from-[#7060E7] to-[#0AADD8] bg-clip-text text-transparent">Sign In</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
            Access campus assessment analytics & student passes
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail size={14} className="text-[#6F24E8]" />
              College / Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@college.edu"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock size={14} className="text-[#6F24E8]" />
                Password
              </label>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#7060E7] focus:bg-white transition-all duration-200 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2
                ${
                  isLoading
                    ? 'bg-[#6F24E8]/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#7060E7] to-[#0AADD8] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] shadow-purple-500/20'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <Building2 size={13} className="text-[#6F24E8]" />
            MockMingle AI Campus Assessment Suite
          </p>
        </div>

      </div>

      <ToastContainer />
    </div>
  );
}