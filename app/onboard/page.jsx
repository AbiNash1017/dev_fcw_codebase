"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from '@/public/images/fcw_transparent.png'
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/app/context/AuthContext";

export default function Onboard() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gender, setGender] = useState("");
    // const [dob, setDob] = useState("");
    const [mobileNumber, setMobileNumuber] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [location, setLocation] = useState();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.phoneNumber) {
            setMobileNumuber(user.phoneNumber);
        }

        // Check if user has already completed onboarding
        if (user && !loading) {
            const checkStatus = async () => {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/auth/status', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const status = await response.json();
                        // If onboarding is complete, redirect to next step
                        if (status.onboardingCompleted) {
                            if (status.hasFitnessCenter) {
                                router.push('/dashboard');
                            } else {
                                router.push('/createCentre');
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking status:", error);
                }
            };
            checkStatus();
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                });
            },
            (error) => {
                setLocation((prev) => ({
                    ...prev,
                    error: error.message,
                }));
            }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (processing) return;
        setProcessing(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/auth/onboardOwner`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    gender,
                    // dob,
                    state,
                    city,
                    mobile_no: mobileNumber,
                    latitude: location?.latitude?.toString(),
                    longitude: location?.longitude?.toString(),
                    address: ""
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to update profile");
                setProcessing(false);
                return;
            }

            // Redirect to the next step from API response
            router.push(data.nextStep || "/createCentre");
        } catch (err) {
            setError("Failed to connect to the server!");
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-medium">Loading...</div>;

    return (
        <div className="min-h-screen flex bg-white">
            <div className="absolute top-4 left-4 lg:hidden">
                <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={50} width={50} className='h-[45px] w-[45px]' /></Link>
            </div>
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-10 flex-col justify-center items-start border-r border-gray-100">
                <div>
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
                        <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">OnBoard</h2>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <Select name="edit-gender" value={gender} onValueChange={(value) => setGender(value)} >
                                <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl">
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 text-black">
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* <Input
                                type="date"
                                placeholder="DoB"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            /> */}
                            <Input
                                type="tel"
                                placeholder="Mobile Number"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumuber(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <Input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <Input
                                type="text"
                                placeholder="State"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                            <div>
                                <Button type="submit" disabled={!user || processing} className={`w-full mt-4 bg-black hover:bg-gray-800 text-white py-6 rounded-xl text-lg font-bold tracking-wide shadow-lg shadow-gray-200 transition-all ${!user && 'bg-gray-300 cursor-not-allowed hover:bg-gray-300'}`}>
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
