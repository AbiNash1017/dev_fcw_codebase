"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/firebaseConfig";
// import { cookies } from "next/headers";

export default function Login() {
    // const [email_id, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+91");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let interval;
        if (showOtpInput && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [showOtpInput, timer]);

    useEffect(() => {
        // Initialize RecaptchaVerifier on mount
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': (response) => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber.
                    },
                    'expired-callback': () => {
                        // Response expired. Ask user to solve reCAPTCHA again.
                        console.log("Recaptcha expired");
                    }
                });
            } catch (err) {
                console.error("Recaptcha init error:", err);
                // If it fails (e.g. already rendered), try to clear and re-init or just ignore if valid
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
            }
        }

        return () => {
            // Cleanup on unmount
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.error("Error clearing recaptcha", e);
                }
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const onSignInSubmit = async (e) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true);
        setError(null);

        // setupRecaptcha is now handled in useEffect
        const appVerifier = window.recaptchaVerifier;

        if (!appVerifier) {
            setError("Recaptcha not initialized. Please refresh the page.");
            setProcessing(false);
            return;
        }

        // Format phone number
        let phoneNumberToUse = phoneNumber.trim().replace(/\s+/g, '');

        // If it doesn't start with +, assume it's a 10-digit number and prepend +91
        if (!phoneNumberToUse.startsWith('+')) {
            if (phoneNumberToUse.length === 10) {
                phoneNumberToUse = '+91' + phoneNumberToUse;
            } else if (phoneNumberToUse.startsWith('91') && phoneNumberToUse.length === 12) {
                // If user typed 91XXXXXXXXXX without +
                phoneNumberToUse = '+' + phoneNumberToUse;
            }
        }

        signInWithPhoneNumber(auth, phoneNumberToUse, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setConfirmationResult(confirmationResult);
                setShowOtpInput(true);
                setProcessing(false);
                setTimer(60);
                setCanResend(false);
            }).catch((error) => {
                console.error(error);
                setError(error.message);
                setProcessing(false);
                // Reset recaptcha
                if (window.recaptchaVerifier) {
                    // Don't clear the verifier instance, just reset it if possible, or let the user try again
                    // appVerifier.render().then(widgetId => grecaptcha.reset(widgetId));
                    // Simple approach: clear and re-init might be needed if it's in a bad state, 
                    // but usually just re-rendering or resetting is enough.
                    // For invisible recaptcha, often just retrying works.
                }
            });
    };

    const onOtpVerify = async (e) => {
        e.preventDefault();
        if (processing) return;
        setProcessing(true);
        setError(null);

        confirmationResult.confirm(otp).then(async (result) => {
            // User signed in successfully.
            const user = result.user;
            console.log("User signed in:", user);

            // Sync user to MongoDB
            try {
                await fetch('/api/auth/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        phoneNumber: user.phoneNumber,
                    }),
                });
            } catch (error) {
                console.error("Failed to sync user:", error);
                // Continue anyway as auth was successful
            }

            // Check user status and redirect appropriately
            try {
                const token = await user.getIdToken();
                const statusResponse = await fetch('/api/auth/status', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (statusResponse.ok) {
                    const status = await statusResponse.json();
                    window.location.href = status.nextStep;
                } else {
                    // Fallback to onboard if status check fails
                    window.location.href = '/onboard';
                }
            } catch (error) {
                console.error("Failed to check user status:", error);
                // Fallback to onboard if status check fails
                window.location.href = '/onboard';
            }

        }).catch((error) => {
            console.error(error);
            setError("Invalid OTP");
            setProcessing(false);
        });
    };

    return (
        <div className="min-h-screen flex bg-white">
            <div className="absolute top-4 left-4 lg:hidden">
                <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={50} width={50} className='h-[45px] w-[45px]' /></Link>
            </div>
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-10 flex-col justify-center items-start border-r border-gray-100">
                <div>
                    <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={70} width={70} className='mb-12' /></Link>
                    <h1 className="text-4xl font-bold text-black mb-1 tracking-tight">
                        Become a <span className="text-gray-500">FCW</span> User
                    </h1>
                    <p className="text-lg text-gray-500 mb-8 font-medium">
                        Take your fitness journey to the next level with our platform
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Discover fitness centers near you",
                            "Book fitness sessions and track your history",
                            "Swipe, match and book a couples session",
                            "Track your progress on our leaderboard",
                        ].map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-600 font-medium">
                                <span className="w-5 h-5 mr-3 rounded-full bg-black flex items-center justify-center text-white text-xs">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-16">
                    <h1 className="text-4xl font-bold text-black mt-8 mb-1 tracking-tight">
                        Become a <span className="text-gray-500">FCW</span> Partner
                    </h1>
                    <p className="text-lg text-gray-500 mb-8 font-medium">
                        Streamline your fitness center management with our powerful platform
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Effortless booking management",
                            "Detailed user insights",
                            "Real-time revenue tracking",
                            "Comprehensive analytics"
                        ].map((feature, index) => (
                            <li key={index} className="flex items-center text-gray-600 font-medium">
                                <span className="w-5 h-5 mr-3 rounded-full bg-black flex items-center justify-center text-white text-xs">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">Log In / Sign Up</h2>
                        <p className="text-gray-500 font-medium">
                            Enter your phone number to continue
                            {/* Don&apos;t have an account?{" "}
                            <Link href="/register" replace={true} className="text-black underline hover:text-gray-700 transition-colors">
                                Sign up
                            </Link> */}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {!showOtpInput ? (
                            <form onSubmit={onSignInSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="tel"
                                        placeholder="Phone Number (e.g., +1234567890)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                                    />
                                </div>
                                <div id="recaptcha-container"></div>
                                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                                <div className="flex flex-col justify-between items-end">
                                    <Button type="submit" disabled={processing} className="w-full bg-black hover:bg-gray-800 mt-2 text-white py-6 rounded-xl text-lg font-bold tracking-wide shadow-lg shadow-gray-200 transition-all">
                                        {processing ? "Sending..." : "Send OTP"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={onOtpVerify} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl text-center text-2xl tracking-widest"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                                <div className="flex flex-col justify-between items-end w-full">
                                    <Button type="submit" disabled={processing} className="w-full bg-black hover:bg-gray-800 mt-2 text-white py-6 rounded-xl text-lg font-bold tracking-wide shadow-lg shadow-gray-200 transition-all">
                                        {processing ? "Verifying..." : "Verify OTP"}
                                    </Button>
                                    <div className="mt-4 text-center w-full">
                                        {timer > 0 ? (
                                            <span className="text-gray-400 text-sm font-medium">Resend OTP in {timer}s</span>
                                        ) : (
                                            <button type="button" onClick={onSignInSubmit} className="text-black font-semibold hover:underline text-sm">
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

}
