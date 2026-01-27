import { useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image'; // 1. Import next/image for Lazy Loading

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Added loading state
    const router = useRouter();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            setEmail(e.target.value);
        } else if (e.target.name === 'password') {
            setPassword(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        toast.dismiss();
        setIsLoading(true); // Start loading

        const data = { email, password };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/collageLogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const response = await res.json();

            if (res.status === 401) {
                toast.error(response.error || 'Invalid credentials. Please check your email and password.', {
                    position: "top-left",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                setIsLoading(false); // Stop loading
                return;
            }

            if (response.success) {
                localStorage.setItem('Admintoken', response.Admintoken);
                localStorage.setItem(
                    'admin',
                    JSON.stringify({ ...response.user, role: "admin" })
                );

                toast.success('You are successfully logged in!', {
                    position: "top-left",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });

                // Reset form
                setEmail('');
                setPassword('');

                setTimeout(() => {
                    router.push("/admin");
                }, 1000);
            } else {
                toast.error(response.error || 'An unexpected error occurred. Please try again.', {
                    position: "top-left",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred, please try again.', {
                position: "top-left",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-50">
            
            {/* Lazy Loaded Background Image */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/bg.gif" // Ensure this path is correct
                    alt="Background"
                    fill
                    className="object-cover opacity-20"
                    priority={false} // Lazy load (default behavior)
                    quality={75}
                />
                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/50 backdrop-blur-[2px]" />
            </div>

            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-[420px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 sm:p-10 transform transition-all duration-300 hover:border-white/30">
                
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-20 h-20 mb-4 drop-shadow-lg">
                        <Image 
                            src="/Logoo.png" 
                            alt="Logo" 
                            fill
                            className="object-contain"
                            priority // Load logo immediately as LCP
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">Back!</span>
                    </h1>
                    <p className="text-slate-300 text-sm mt-2 font-medium">Sign in to access your admin dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Email Input */}
                    <div className="group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                            className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all duration-200"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            className="w-full px-5 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all duration-200 pr-12"
                        />
                        <button
                            type="button"
                            className="absolute top-1/2 transform -translate-y-1/2 right-4 text-slate-300 hover:text-white transition-colors focus:outline-none"
                            onClick={togglePasswordVisibility}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform 
                            ${isLoading 
                                ? 'bg-indigo-500/50 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-[1.02] hover:shadow-purple-500/25'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </div>
                        ) : (
                            'LOG IN'
                        )}
                    </button>
                </form>
                
                {/* Optional Footer links kept commented as requested */}
                {/* <div className="mt-6 text-center space-y-2">
                    <a href="#" className="text-purple-300 text-sm hover:text-white transition-colors">Forgot Password?</a>
                </div> */}
            </div>

            <ToastContainer />
        </div>
    );
}