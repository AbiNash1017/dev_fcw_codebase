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


import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import GoogleMapPicker from "@/components/GoogleMapPicker";

const states = [
    'Andra Pradesh',
    'Karnataka',
    'Uttar Pradesh',
    'Madya Pradesh',
    'Telangana',
    'Tamilnadu',
    'Kerala',
    'Goa',
    'Punjab',
    'Jharkhand',
    'Maharashtra',
];

const statesCities = {
    'Andra Pradesh': [
        'Visakhapatnam',
        'Vijayawada',
        'Guntur',
        'Nellore',
        'Kurnool',
        'Rajahmundry',
        'Tirupati',
        'Kadapa',
        'Anantapur',
        'Eluru',
        'Chittoor',
        'Ongole',
        'Srikakulam',
        'Vizianagaram',
        'Machilipatnam',
        'Tenali',
        'Proddatur',
        'Adoni',
        'Hindupur',
        'Bhimavaram'
    ],
    'Karnataka': [
        'Bagalkot',
        'Ballari',
        'Belagavi',
        'Bengaluru',
        'Bidar',
        'Chickamagaluru',
        'Chitradurga',
        'Davanagere',
        'Dharwad',
        'Hassan',
        'Hubballi',
        'Kalaburagi',
        'Karwar',
        'Kolar',
        'Mangaluru',
        'Mysuru',
        'Raichur',
        'Shivamogga',
        'Tumakuru',
        'Udupi',
        'Vijayapura'
    ],
    'Uttar Pradesh': [
        'Lucknow',
        'Kanpur',
        'Varanasi',
        'Agra',
        'Prayagraj',
        'Ghaziabad',
        'Noida',
        'Meerut',
        'Bareilly',
        'Aligarh',
        'Moradabad',
        'Jhansi',
        'Gorakhpur',
        'Saharanpur',
        'Faizabad',
        'Mathura',
        'Firozabad',
        'Ayodhya',
        'Rampur',
        'Sultanpur'
    ],
    'Madya Pradesh': [
        'Bhopal',
        'Indore',
        'Jabalpur',
        'Gwalior',
        'Ujjain',
        'Sagar',
        'Satna',
        'Ratlam',
        'Rewa',
        'Dewas',
        'Chhindwara',
        'Katni',
        'Morena',
        'Khandwa',
        'Vidisha',
        'Itarsi',
        'Bhind',
        'Shivpuri',
        'Betul',
        'Sehore'
    ],
    'Telangana': [
        'Hyderabad',
        'Warangal',
        'Nizamabad',
        'Khammam',
        'Karimnagar',
        'Ramagundam',
        'Mahbubnagar',
        'Nalgonda',
        'Adilabad',
        'Siddipet',
        'Miryalaguda',
        'Jagtial',
        'Suryapet',
        'Mancherial',
        'Bodhan',
        'Kamareddy',
        'Zaheerabad',
        'Vikarabad',
        'Wanaparthy',
        'Kothagudem'
    ],
    'Tamilnadu': [
        'Chennai',
        'Coimbatore',
        'Madurai',
        'Tiruchirappalli',
        'Salem',
        'Erode',
        'Tirunelveli',
        'Vellore',
        'Thoothukudi',
        'Dindigul',
        'Thanjavur',
        'Karur',
        'Sivakasi',
        'Nagercoil'
    ],
    'Kerala': [
        'Thiruvananthapuram',
        'Kochi',
        'Kozhikode',
        'Thrissur',
        'Kollam',
        'Alappuzha',
        'Kannur',
        'Palakkad',
        'Kottayam',
        'Malappuram',
        'Pathanamthitta',
        'Idukki',
        'Kasaragod',
        'Varkala',
        'Chengannur',
        'Kayamkulam',
        'Nedumangad',
        'Ponnani',
        'Thalassery',
        'Chalakudy'
    ],
    'Goa': [
        'Panaji',
        'Margao',
        'Vasco da Gama',
        'Mapusa',
        'Ponda',
        'Bicholim',
        'Sanquelim',
        'Curchorem',
        'Quepem',
        'Valpoi',
        'Canacona',
        'Sanguem'
    ],
    'Punjab': [
        'Ludhiana',
        'Amritsar',
        'Jalandhar',
        'Patiala',
        'Bathinda',
        'Mohali',
        'Hoshiarpur',
        'Pathankot',
        'Moga',
        'Abohar',
        'Batala',
        'Barnala',
        'Firozpur',
        'Kapurthala',
        'Phagwara',
        'Malerkotla',
        'Faridkot',
        'Khanna',
        'Rajpura',
        'Zirakpur'
    ],
    'Jharkhand': [
        'Ranchi',
        'Jamshedpur',
        'Dhanbad',
        'Bokaro Steel City',
        'Deoghar',
        'Hazaribagh',
        'Giridih',
        'Ramgarh',
        'Chirkunda',
        'Phusro',
        'Medininagar (Daltonganj)',
        'Chaibasa',
        'Jhumri Telaiya',
        'Simdega',
        'Gumla',
        'Latehar',
        'Godda',
        'Pakur',
        'Sahibganj',
        'Lohardaga'
    ],
    'Maharashtra': [
        'Mumbai',
        'Pune',
        'Nagpur',
        'Nashik',
        'Thane',
        'Aurangabad',
        'Solapur',
        'Amravati',
        'Kolhapur',
        'Nanded',
        'Sangli',
        'Jalgaon',
        'Akola',
        'Latur',
        'Ahmednagar',
        'Dhule',
        'Chandrap'
    ],
};

export default function CreateCentre() {
    const [centreName, setCentreName] = useState("");
    const [contact_no, setContact_no] = useState("");
    const [email, setEmail] = useState("");
    const [centreDescription, setCentreDescription] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("Bengaluru");
    const [state, setState] = useState("Karnataka");
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        error: null,
    });
    const [pincode, setPincode] = useState("");
    const [error, setError] = useState(null);
    const [planId, setPlanId] = useState(1);
    const { user, loading } = useAuth();
    const router = useRouter()
    const [processing, setProcessing] = useState(false);
    const MAX_CHARS = 256

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (user && user.email) {
            setEmail(user.email);
        }

        // Check if user has completed onboarding and already has a fitness center
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

                        // If user is not authenticated at all or doesn't have metadata, redirect to onboard
                        // The status route returns authenticated:false or redirects to /onboard when no metadata exists
                        // So here we only need to check if they already have a center
                        if (status.hasFitnessCenter) {
                            router.push('/dashboard');
                        }
                        // If status.nextStep explicitly says /onboard, respect it (means no metadata)
                        else if (status.nextStep === '/onboard') {
                            router.push('/onboard');
                        }
                    }
                } catch (error) {
                    console.error("Error checking status:", error);
                }
            };
            checkStatus();
        }
    }, [user, loading, router])

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation((prev) => ({
                ...prev,
                error: 'Geolocation is not supported by your browser',
            }));
            console.log("error in location", location)
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
        console.log("location", location)
    }, [])


    const [showMapDialog, setShowMapDialog] = useState(false);
    const [finalLocation, setFinalLocation] = useState(null);

    // ... existing useEffects ...

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowMapDialog(true);
    };

    const handleLocationConfirm = async () => {
        if (!finalLocation) {
            setError("Please pin your location on the map.");
            return;
        }
        setShowMapDialog(false);
        await submitForm(finalLocation);
    };

    const submitForm = async (loc) => {
        if (processing) return;
        setProcessing(true)
        setError(null);

        try {
            const token = await user.getIdToken();
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;

            const payload = {
                centre_name: centreName,
                centre_description: centreDescription,
                state,
                city,
                latitude: loc.lat,
                longitude: loc.lng,
                address,
                plan_id: planId,
                pincode,
                pincode,
                contact_no: `+91${contact_no}`,
                email,
                map_url: mapUrl
            };

            const response = await fetch(`/api/fitness-center/create`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.message !== "OK") {
                setError(data.error);
                setProcessing(false)
                return;
            }

            router.push(data.nextStep || '/dashboard')
        } catch (err) {
            console.log(err)
            setProcessing(false)
            setError("Failed to connect to the server!");
        }
    };

    const handleChange = (e) => {
        const input = e.target.value
        if (input.length <= MAX_CHARS) {
            setCentreDescription(input)
        }
    }


    return (
        <div className="min-h-screen flex bg-white">
            {/* ... Left Side Content ... */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-10 flex-col justify-center items-start border-r border-gray-100">
                {/* ... same content ... */}
                <div>
                    <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={70} width={70} className='mb-12' /></Link>
                    <h1 className="text-4xl font-bold text-black mb-1 tracking-tight">
                        Become a <span className="text-gray-500">FCW</span> User
                    </h1>
                    {/* ... */}
                </div>
                {/* ... */}
            </div>

            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
                <div className="max-w-md w-full">
                    {/* ... Header ... */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-black mb-3 tracking-tight">Create Your Fitness Centre</h2>
                    </div>

                    <div className="space-y-4">
                        <form onSubmit={handleInitialSubmit} className="space-y-5">
                            {/* ... Inputs ... */}
                            <Input
                                type="text"
                                placeholder="Fitness Centre Name"
                                value={centreName}
                                onChange={(e) => setCentreName(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Textarea
                                    id="description"
                                    placeholder="Fitness Centre Description"
                                    value={centreDescription}
                                    onChange={handleChange}
                                    className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors rounded-xl resize-none min-h-[100px]"
                                />
                                <p className="text-sm text-gray-500 font-medium">
                                    {MAX_CHARS - centreDescription.length} characters remaining
                                </p>
                            </div>
                            <Input
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />
                            <Select name="edit-state" value={state} onValueChange={(value) => {
                                setState(value);
                                setCity(""); // Reset city when state changes
                            }}>
                                <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl">
                                    <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 text-black">
                                    {states.map((stateName) => (
                                        <SelectItem key={stateName} value={stateName}>
                                            {stateName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select name="edit-city" value={city} onValueChange={(value) => setCity(value)} disabled={!state}>
                                <SelectTrigger className="mt-1 bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl">
                                    <SelectValue placeholder={state ? "Select City" : "Please select a state first"} />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 text-black">
                                    {state && statesCities[state]?.map((cityName) => (
                                        <SelectItem key={cityName} value={cityName}>
                                            {cityName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="text"
                                placeholder="Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl"
                            />

                            <div className="flex gap-2">
                                <div className="flex items-center justify-center bg-gray-50 border border-gray-200 text-black px-4 rounded-xl font-medium min-w-[60px]">
                                    +91
                                </div>
                                <Input
                                    type="tel" // Changed to tel for consistency
                                    placeholder="Contact Number"
                                    value={contact_no}
                                    onChange={(e) => setContact_no(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus:border-black transition-colors py-6 rounded-xl flex-1"
                                />
                            </div>

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

            <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
                <DialogContent className="sm:max-w-[600px] bg-white text-black">
                    <DialogHeader>
                        <DialogTitle>Pin Your Fitness Centre Location</DialogTitle>
                        <DialogDescription>
                            Please pin the exact location of your fitness center on the map. This will help users find you easily.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <GoogleMapPicker
                            onLocationSelect={(loc) => setFinalLocation(loc)}
                            initialLocation={location.latitude ? { lat: location.latitude, lng: location.longitude } : null}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMapDialog(false)}>Cancel</Button>
                        <Button onClick={handleLocationConfirm} disabled={!finalLocation || processing}>
                            {processing ? 'Creating...' : 'Confirm Location & Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
