
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Lock, Unlock } from "lucide-react";
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
        <div className="flex justify-center items-center min-h-screen   relative overflow-hidden bg-black">
            {/* <img src="/bg.gif" className="absolute top-0 left-0 w-full h-full object-cover z-[-1]" alt="background" /> */}
            <div className="absolute top-4 left-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <svg width="55" height="54" viewBox="0 0 55 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.2929 27.2929C13.9024 27.6834 13.9024 28.3166 14.2929 28.7071L20.6569 35.0711C21.0474 35.4616 21.6805 35.4616 22.0711 35.0711C22.4616 34.6805 22.4616 34.0474 22.0711 33.6569L16.4142 28L22.0711 22.3431C22.4616 21.9526 22.4616 21.3195 22.0711 20.9289C21.6805 20.5384 21.0474 20.5384 20.6569 20.9289L14.2929 27.2929ZM42 28V27L15 27V28V29L42 29V28Z" fill="white" />
                        <path d="M27.5 0.5C42.4204 0.5 54.5 12.3731 54.5 27C54.5 41.6269 42.4204 53.5 27.5 53.5C12.5796 53.5 0.5 41.6269 0.5 27C0.5 12.3731 12.5796 0.5 27.5 0.5Z" stroke="white" />
                    </svg>

                </button>
            </div>
            {/* <img src="/Logoo.png" className="absolute top-4 right-8 w-20 mb-4" alt="Logo" /> */}
            
            <div className='bg-[#D3E7F6] rounded-lg'>
                
                <div className="bg-transparent text-center p-4 w-[25rem] ">
                    <h1 className="flex justify-center text-3xl font-semibold mb-6 ">Login</h1>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            className="w-full p-3 rounded-md bg-[#ffffff] bg-opacity-40 text-black text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                        />

                        <div className="relative mb-4">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full p-3 rounded-md bg-white bg-opacity-40 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                            />
                            <span
                                className="absolute top-1/2 transform -translate-y-1/2 right-4 cursor-pointer text-black text-xl"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <Unlock size={24} className="text-gray-500 " /> : <Lock size={24} className="text-gray-500" />}
                            </span>
                        </div>

                        <div className="flex items-center text-black text-sm mb-4">
                            <input type="checkbox" id="remember" className="mr-2" />
                            <label htmlFor="remember">Remember for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-md bg-gradient-to-r from-black to-gray-500 text-white text-base transition-all hover:bg-pink-600"
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

                    <a href="/forgot-password" className="text-black text-sm mt-4 block">Forgot Password?</a>

                    <div className="text-black text-sm mt-4">
                        Don't have an account?
                        <a href="/signup" className="font-bold text-black">Sign up</a>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
