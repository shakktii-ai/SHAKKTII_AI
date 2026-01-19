import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { IoIosArrowBack } from 'react-icons/io';
import Script from 'next/script';

export default function PurchaseInterviews() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [interviewCount, setInterviewCount] = useState(1);
  const [user, setUser] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userFromStorage = localStorage.getItem('user');
    if (!userFromStorage) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userFromStorage));
  }, [router]);

  const handleCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    if (count > 0 && count <= 10) {
      setInterviewCount(count);
    }
  };

  const incrementCount = () => {
    if (interviewCount < 10) {
      setInterviewCount(interviewCount + 1);
    }
  };

  const decrementCount = () => {
    if (interviewCount > 1) {
      setInterviewCount(interviewCount - 1);
    }
  };

  const handlePayment = async () => {
    if (!user || !user.email) {
      setError('User information is missing. Please log in again.');
      return;
    }

    if (interviewCount <= 0) {
      setError('Please select at least 1 interview to purchase.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create Razorpay order
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          interviewCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount * 100, // Display amount in paise
        currency: data.currency,
        name: 'SHAKKTII AI',
        description: `Purchase ${interviewCount} Interview${interviewCount > 1 ? 's' : ''}`,
        order_id: data.orderId,
        prefill: {
          name: data.name,
          email: data.email,
        },
        notes: data.notes,
        theme: {
          color: '#e600ff',
        },
        handler: async function (response) {
          setProcessingPayment(true);
          
          try {
            const verificationResponse = await fetch('/api/verifyPayment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...response,
                notes: data.notes,
              }),
            });

            const verificationData = await verificationResponse.json();

            if (!verificationResponse.ok) {
              throw new Error(verificationData.error || 'Payment verification failed');
            }

            // Update user data in localStorage
            if (verificationData.user) {
              const updatedUser = {
                ...user,
                no_of_interviews: verificationData.user.no_of_interviews,
                no_of_interviews_completed: verificationData.user.no_of_interviews_completed,
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            setSuccess(`Successfully purchased ${interviewCount} interview${interviewCount > 1 ? 's' : ''}!`);
            setTimeout(() => {
              router.push('/profile');
            }, 2000);
          } catch (error) {
            console.error('Payment verification error:', error);
            setError(error.message || 'Failed to verify payment');
          } finally {
            setProcessingPayment(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Purchase Interviews - SHAKKTII AI</title>
      </Head>

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#1c0032] to-black">
        <img
          src="/bg.gif"
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-40 z-[-1]"
        />

        {/* Header with Back button */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#1a013a] bg-opacity-80 shadow-md">
          <Link href="/profile">
            <div className="text-white text-2xl cursor-pointer hover:text-[#e600ff] transition-colors">
              <IoIosArrowBack />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-white">Purchase Interviews</h1>
          <div className="w-5"></div> {/* Empty div for spacing */}
        </div>

        <div className="max-w-md mx-auto py-12 px-4">
          <div className="bg-[#29064b] bg-opacity-90 rounded-xl shadow-lg overflow-hidden mb-8 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Purchase Additional Interviews
            </h2>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[#e600ff] text-sm font-semibold mb-2">
                Number of Interviews
              </label>
              <div className="flex items-center border border-[#e600ff] rounded-lg overflow-hidden">
                <button
                  onClick={decrementCount}
                  disabled={interviewCount <= 1 || loading}
                  className="bg-[#3a0a5c] text-white px-4 py-2 focus:outline-none disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={interviewCount}
                  onChange={handleCountChange}
                  className="flex-grow bg-[#1a0035] text-white text-center py-2 focus:outline-none"
                  disabled={loading}
                />
                <button
                  onClick={incrementCount}
                  disabled={interviewCount >= 10 || loading}
                  className="bg-[#3a0a5c] text-white px-4 py-2 focus:outline-none disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Maximum 10 interviews per transaction
              </p>
            </div>

            <div className="mb-6 p-4 bg-[#1a0035] rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Price per Interview:</span>
                <span className="text-white font-medium">₹1.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Quantity:</span>
                <span className="text-white font-medium">{interviewCount}</span>
              </div>
              <div className="border-t border-[#3a0a5c] my-2 pt-2"></div>
              <div className="flex justify-between">
                <span className="text-[#e600ff] font-semibold">Total:</span>
                <span className="text-white font-bold">₹{interviewCount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || processingPayment}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                loading || processingPayment
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#e600ff] to-[#8000ff] hover:shadow-lg hover:shadow-purple-500/30'
              }`}
            >
              {loading ? (
                <span className="flex justify-center items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : processingPayment ? (
                'Verifying Payment...'
              ) : (
                `Pay ₹${interviewCount.toFixed(2)} Now`
              )}
            </button>
          </div>

          <div className="bg-[#29064b] bg-opacity-90 rounded-xl p-4 text-gray-300 text-sm">
            <h3 className="text-[#e600ff] font-semibold mb-2">Note:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Each interview costs ₹1.00</li>
              <li>Interview credits never expire</li>
              <li>Payment processed securely via Razorpay</li>
              <li>Test credentials: Use any future date for expiry and any CVV</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
