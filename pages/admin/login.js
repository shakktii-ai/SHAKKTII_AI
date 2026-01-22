
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                return; // Stop further execution
            }

            // Reset the form fields if login is successful
            setEmail('');
            setPassword('');

            if (response.success) {
                // Store token and user data in localStorage
                localStorage.setItem('Admintoken', response.Admintoken);

                // Add role and save properly
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

                // Redirect to admin dashboard
                setTimeout(() => {
                    router.push("/admin");
                }, 1000);
            }
            else {
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
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-300 w-full relative overflow-hidden">
            <img src="/
            " className="absolute  w-full h-full object-cover z-[-1]" alt="background" />
            <img src="/Logoo.png" className="absolute top-4 right-8 w-20 mb-4" alt="Logo" />

            <div className="bg-transparent text-center p-6 w-full max-w-md rounded-lg">
                <h1 className="text-4xl text-purple-500 font-bold mb-6">Welcome <span className="text-black">Back!</span></h1>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full p-3  bg-[#6c57ec] bg-opacity-20 rounded-full  text-base mb-4 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    />

                    <div className="relative mb-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full p-3 bg-[#6c57ec] bg-opacity-20 rounded-full  text-base focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        />
                        <span
                            className="absolute top-1/2 transform -translate-y-1/2 right-4 cursor-pointer text-white text-xl"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>



                    <button
                        type="submit"
                        className="w-full py-3 rounded-full bg-[#6c57ec] text-white text-base transition-all hover:bg-[#5037f4]"
                    >
                        LOG IN
                    </button>
                </form>
                {/*                 
                <a href="#" className="text-pink-400 text-sm mt-4 block">Forgot Password?</a>
                
                <div className=" text-sm mt-4">
                    Don't have an account? 
                    <a href="/signup" className="font-bold text-pink-400">Sign up</a>
                </div> */}
            </div>

            <ToastContainer />
        </div>
    );
}
