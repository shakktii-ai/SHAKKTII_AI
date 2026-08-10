
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lock, Unlock } from "lucide-react";
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import Link from 'next/link';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
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
        toast.dismiss(); // Dismiss any previous toasts
        setLoading(true);
        const data = { email, password };

        try {


            const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const response = await res.json();

            // Check if the response is a 401 error (Unauthorized)
            if (res.status === 401) {
                // Show the error from the response in a toast
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
                setLoading(false);
                return; // Stop further execution
            }

            // Reset the form fields if login is successful
            setEmail('');
            setPassword('');

            if (response.success) {
                // Store token and user data in localStorage
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

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

                setTimeout(() => {
                    router.push({
                        pathname: '/dashboard',
                        query: { user: response.user },
                    });
                }, 1000);
            } else {
                // Show general error in toast if not a 401 but some other error
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
                setLoading(false);
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
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen   relative overflow-hidden bg-[#E8E8FB]">
            {/* <img src="/bg.gif" className="absolute top-0 left-0 w-full h-full object-cover z-[-1]" alt="background" /> */}
            <div className="absolute top-4 left-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-black "
                >
                    <IoArrowBackCircleOutline size={24} />

                </button>
            </div>
            <div className="flex justify-center items-center mb-4">
                <img src="MM_LOGO.png" width={24} height={24} />
                <h2 className="text-xl ml-2 font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
                    MockMingle
                </h2>
            </div>
            <h2 className='text-black text-3xl font-semibold mb-4'>Welcome Back!</h2>
            <div className='bg-white shadow-md  rounded-lg'>
                <div className="flex rounded-full bg-[#E8E8F8] p-1 m-4">
                    <Link
                        href="/login"
                        className="flex-1 rounded-full bg-[#6C2CF0] py-3 text-center text-white shadow-md"
                    >
                        Login
                    </Link>

                    <Link
                        href="/signup"
                        className="flex-1 rounded-full py-3 text-center text-gray-600"
                    >
                        Register
                    </Link>
                </div>
                <div className="bg-transparent text-center p-4 w-[25rem] ">
                    {/* <h1 className="flex justify-center text-3xl font-semibold mb-6 text-[#6F24E8]">Login</h1> */}

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full p-3 rounded-full bg-[#E8E8FB] bg-opacity-40 text-black text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent border border-[#D3D0D0]"
                        />

                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full p-3 rounded-full bg-[#E8E8FB] bg-opacity-40 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent border border-[#D3D0D0]"
                            />
                            <span
                                className="absolute top-1/2 transform -translate-y-1/2 right-4 cursor-pointer text-black text-xl"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <Unlock size={24} className="text-gray-500 " /> : <Lock size={24} className="text-gray-500" />}
                            </span>
                        </div>
                        <a href="/forgot-password" className="text-[#6F24E8] text-sm mt-4 block text-right">Forgot Password?</a>
                        <div className="flex items-center text-black text-sm mb-4">
                            <input type="checkbox" id="remember" className="mr-2" />
                            <label htmlFor="remember">Remember for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full bg-[#6F24E8] text-white text-base transition-all"
                        >
                            {loading ? (
                                <>
                                    <div className="flex justify-center items-center h-4">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    </div>
                                    Logging In...
                                </>
                            ) : "Log In"}
                        </button>
                    </form>



                    <div className="text-black text-sm mt-4">
                        Don't have an account?
                        <a href="/signup" className="font-semibold text-[#6F24E8] ml-2">Register</a>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
