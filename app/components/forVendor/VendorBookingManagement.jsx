'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader, Calendar as CalendarIcon, Clock, Users, CreditCard, MapPin, Smartphone, X, Dumbbell, Activity, ClipboardList } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const VendorBookingManagement = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [verificationPin, setVerificationPin] = useState('')
    const [date, setDate] = useState()
    const [filterType, setFilterType] = useState('created_at')

    const filteredBookings = bookings.filter(booking => {
        if (!date) return true;
        const dateToCheck = filterType === 'created_at' ? booking.created_at : booking.slot_start_time;
        if (!dateToCheck) return false;
        const bookingDate = new Date(dateToCheck);
        return bookingDate.toDateString() === date.toDateString();
    });

    const handleVerifyPin = () => {
        if (!verificationPin) return;
        if (verificationPin === selectedBooking?.pin) {
            alert("✅ PIN Verified Successfully! User is authorized.");
        } else {
            alert("❌ Invalid PIN. Please try again.");
        }
    };

    // Sub-component for resilient image loading
    const UserProfileImage = ({ url, alt }) => {
        const [error, setError] = useState(false);

        if (error || !url) {
            return <Users className="w-6 h-6 text-gray-400" />;
        }

        return (
            <img
                src={url}
                alt={alt}
                className="w-12 h-12 object-cover"
                onError={() => setError(true)}
            />
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Bookings
                const bookingsRes = await fetch('/api/fitness-center/bookingHistory', { headers });

                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setBookings(data.bookings || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleCardClick = (booking) => {
        setSelectedBooking(booking);
    };

    const handleCloseDetails = (e) => {
        e.stopPropagation();
        setSelectedBooking(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatEnum = (text) => {
        if (!text) return '';
        return text.replace(/_/g, ' ')
            .replace('FACILITY TYPE', '')
            .replace('PAYMENT STATUS', '')
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className='h-8 w-8 animate-spin' /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden relative gap-6">
            {/* Left Panel - Booking List */}
            <div
                className={`transition-all duration-500 ease-in-out h-full flex flex-col ${selectedBooking ? 'w-2/3 pr-6' : 'w-full'
                    }`}
            >
                <div className="flex items-center justify-between mb-4 px-2 py-1">
                    <h3 className="text-xl font-semibold text-gray-800">Bookings</h3>
                    <div className="flex items-center gap-3">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[160px] bg-white border-gray-200">
                                <SelectValue placeholder="Date Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created_at">Booking Date</SelectItem>
                                <SelectItem value="slot_start_time">Start Date</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative inline-block">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal border-gray-200 shadow-sm hover:bg-gray-50",
                                            !date && "text-muted-foreground",
                                            date && "pr-10"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Filter by date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {date && (
                                <span
                                    role="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-full p-1 cursor-pointer z-50 text-gray-500 hover:text-gray-900 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDate(undefined);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col gap-6 p-2 overflow-y-auto flex-1 min-h-0 pb-10`}>
                    {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                        <Card
                            key={booking._id}
                            className={`cursor-pointer group relative overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 bg-white rounded-3xl shrink-0 ${selectedBooking?._id === booking._id ? 'ring-2 ring-black ring-offset-2' : ''}`}
                            onClick={() => handleCardClick(booking)}
                        >
                            <CardContent className="p-0">
                                <div className="p-8">
                                    <div className="flex items-start gap-6">
                                        {/* Facility Image */}
                                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                            {booking.facility_id?.image_urls?.[0] ? (
                                                <Image
                                                    src={booking.facility_id.image_urls[0]}
                                                    alt={booking.facility_id.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Booking Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-2xl text-gray-900 leading-tight">
                                                        {booking.facility_id?.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                                        Booking ID: <span className="text-gray-700 font-mono">#{booking._id}</span>
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={`${getStatusColor(booking.payment_status)} px-4 py-1.5 text-xs font-bold tracking-wide border-0 rounded-full shadow-sm`}
                                                >
                                                    {formatEnum(booking.payment_status) || 'UNKNOWN'}
                                                </Badge>
                                            </div>

                                            {/* Metadata Grid */}
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Start Time</p>
                                                        <p className="text-lg font-bold text-gray-700">
                                                            {format(new Date(booking.slot_start_time), 'MMM d, yyyy p')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                        <ClipboardList className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Booking Status</p>
                                                        <p className="text-lg font-bold text-gray-700">
                                                            {formatEnum(booking.status)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                        <Dumbbell className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Facility Type</p>
                                                        <p className="text-lg font-bold text-gray-700">
                                                            {formatEnum(booking.facility_id?.type)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                        <Clock className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Duration</p>
                                                        <p className="text-lg font-bold text-gray-700">
                                                            {booking.facility_id?.duration_minutes} min
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Strip - Neutral Color */}
                                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center transition-colors">
                                    <span className="text-sm font-medium text-gray-500">
                                        Tap to view details
                                    </span>
                                    <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                                        View More Details <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all">→</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No bookings found</p>
                            <p className="text-sm text-gray-400">New bookings will appear here instantly.</p>
                        </div>
                    )}
                </div>
            </div >

            {/* Right Panel - Details Slide-in */}
            < div
                className={`
                    absolute right-0 top-0 h-full bg-white shadow-2xl border-l z-20
                    transition-all duration-500 ease-in-out transform
                    ${selectedBooking ? 'translate-x-0 w-1/3 opacity-100' : 'translate-x-full w-1/3 opacity-0'}
                `}
            >
                {selectedBooking && (
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Booking Details</h3>
                            <Button variant="ghost" size="icon" onClick={handleCloseDetails} className="h-8 w-8 rounded-full hover:bg-gray-200">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-6">

                            {/* User Info Section (Moved from Card) */}
                            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <div className="relative mb-4">
                                    <div className="h-24 w-24 rounded-full p-1 bg-white shadow-sm ring-1 ring-gray-200">
                                        <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-gray-400">
                                            <UserProfileImage
                                                url={selectedBooking.user_id?.profile_image_url}
                                                alt="User"
                                            />
                                        </div>
                                    </div>
                                    <div className={`absolute bottom-1 right-1 h-5 w-5 border-2 border-white rounded-full ${selectedBooking.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {selectedBooking.user_id?.first_name} {selectedBooking.user_id?.last_name || ''}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                                    <Smartphone className="w-4 h-4" />
                                    {selectedBooking.user_id?.phone_number || 'No Phone'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mt-6">
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Gender</p>
                                        <p className="font-semibold text-gray-700 text-sm">{formatEnum(selectedBooking.user_id?.gender) || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-gray-100 text-center shadow-sm">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Member Since</p>
                                        <p className="font-semibold text-gray-700 text-sm">
                                            {selectedBooking.user_id?.user_since ? format(new Date(selectedBooking.user_id.user_since), 'MMM yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* PIN Verification Section */}
                            <div className="bg-gray-900 rounded-xl p-5 shadow-lg">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Verify User Entry</label>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="PIN"
                                        value={verificationPin}
                                        onChange={(e) => setVerificationPin(e.target.value)}
                                        className="bg-white/10 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 h-14 text-2xl font-mono tracking-widest text-center"
                                    />
                                    <Button
                                        onClick={handleVerifyPin}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-14 px-8"
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>

                            {/* Additional Booking Details */}
                            <div>
                                <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 mr-1 text-gray-500" />
                                    Booking Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Booking ID</span>
                                        <span className="text-sm font-mono font-bold text-gray-800">#{selectedBooking._id}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Start Time</span>
                                        <span className="text-sm font-bold text-gray-800">{format(new Date(selectedBooking.slot_start_time), 'PPP p')}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Instructor Name</span>
                                        <span className="text-sm font-bold text-gray-800">{selectedBooking.facility_id?.instructor_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Number of People</span>
                                        <span className="text-sm font-bold text-gray-800">{selectedBooking.number_of_people}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Equipments</span>
                                        <span className="text-sm font-bold text-gray-800 break-words text-right max-w-[60%]">
                                            {selectedBooking.facility_id?.equipment?.length > 0 ? selectedBooking.facility_id.equipment.join(', ') : 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Facility Type Badge */}
                            {/* <div className="flex justify-start">
                                <Badge className="bg-black hover:bg-black text-white border-none text-md px-6 py-1.5 shadow-sm">
                                    Facility Type:  {formatEnum(selectedBooking.facility_id?.type)}
                                </Badge>
                            </div> */}

                            {/* Facility Image */}
                            {/* <div className="relative h-48 w-full rounded-xl overflow-hidden shadow-md group">
                                {selectedBooking.facility_id?.image_urls?.[0] ? (
                                    <Image
                                        src={selectedBooking.facility_id.image_urls[0]}
                                        alt={selectedBooking.facility_id.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <Users className="w-12 h-12" />
                                    </div>
                                )}
                            </div> */}

                            {/* Main Info */}
                            <div>
                                <p className="text-xl text-gray-400 uppercase font-bold tracking-wider mb-1">Facility Name</p>
                                <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                                    {selectedBooking.facility_id?.name}
                                </h2>
                                {/* <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                    {selectedBooking.fitness_center_id?.name}
                                </h3> */}

                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 text-gray-900 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Duration</p>
                                    <p className="font-semibold">{selectedBooking.facility_id?.duration_minutes || 60} min</p>
                                </div>
                                <div className="p-3 bg-gray-50 text-gray-900 rounded-lg">
                                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Booking Status</p>
                                    <p className="font-semibold truncate">{formatEnum(selectedBooking.status) || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Next Steps Card */}
                            <div className="bg-slate-900 rounded-xl p-5 text-gray-200 mt-4 shadow-lg border border-gray-800">
                                <h4 className="flex items-center gap-2 font-bold text-lg mb-4 text-white">
                                    <ClipboardList className="w-5 h-5 text-orange-400" />
                                    Next Steps:
                                </h4>
                                <ul className="space-y-3 text-sm font-medium">
                                    <li className="flex items-start gap-2 opacity-90">
                                        Payment already {['PAID', 'COMPLETED', 'STATUS_COMPLETED', 'PAYMENT_STATUS_COMPLETED'].includes(selectedBooking.payment_status?.toUpperCase()) ? 'completed' : (selectedBooking.payment_status?.toLowerCase().replace(/^(payment_status_|status_)/, '').replace(/_/g, ' ') || 'pending')} via {selectedBooking.payment_method || 'wallet'}
                                    </li>
                                    <li className="flex items-start gap-2 opacity-90">
                                        Verify PIN during customer check-in
                                    </li>
                                    <li className="flex items-start gap-2 opacity-90">
                                        Ensure facility is ready for {format(new Date(selectedBooking.slot_start_time), 'hh:mm a')}
                                    </li>
                                    <li className="flex items-start gap-2 opacity-90 leading-relaxed">
                                        Prepare equipment: {selectedBooking.facility_id?.equipment?.length > 0 ? selectedBooking.facility_id.equipment.join(', ') : 'None'}
                                    </li>
                                </ul>
                            </div>



                            {/* Payment Info */}
                            <div className="border rounded-xl p-4 bg-gray-50/50 space-y-3">
                                <h4 className="font-semibold text-gray-900 text-sm flex items-center mb-2">
                                    <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> Payment Details
                                </h4>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant="outline" className={selectedBooking.payment_status === 'PAID' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'}>
                                        {formatEnum(selectedBooking.payment_status) || 'Pending'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Method</span>
                                    <span className="font-medium">{selectedBooking.payment_method || 'Online'}</span>
                                </div>
                                <div className="border-t border-dashed my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900">Total Amount</span>
                                    <span className="font-bold text-lg text-gray-900">₹{Math.round(selectedBooking.amount_total * 0.7)}</span>
                                </div>
                            </div>

                            <div className="text-center text-xs text-gray-400 pt-4">
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    )
}

export default VendorBookingManagement
