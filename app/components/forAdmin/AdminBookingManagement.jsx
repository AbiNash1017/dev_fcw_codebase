'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

const AdminBookingManagement = () => {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [filteredBookings, setFilteredBookings] = useState([])
    const [fullBookingHistory, setFullBookingHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const fetchBookingHistory = async () => {
        setLoading(true);
        setError(null);

        try {

            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/bookingHistory`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${token}`
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch booking history');
            }
            const data = await response.json();
            // Save the entire booking history, not just the filtered one
            setFullBookingHistory(data.bookingHistory);
            console.log("fbh", fullBookingHistory)
            filterBookingsByDate(selectedDate, data.bookingHistory); // Filter the data for the selected date
        } catch (err) {
            setError(err.message);
            setFilteredBookings([]); // Clear filtered bookings if there is an error
        } finally {
            setLoading(false);
        }
    };

    const filterBookingsByDate = (date, bookingHistory) => {
        if (!date) {
            setFilteredBookings([]);
            return;
        }

        const formattedDate = format(date, 'yyyy-MM-dd');
        const filtered = [];

        bookingHistory.forEach((centre) => {
            centre.Sessions.forEach((session) => {
                session.Slot.forEach((slotData) => {
                    const booking = slotData.Booking;
                    booking.Slot.forEach((slot) => {
                        if (format(parseISO(slot.time), 'yyyy-MM-dd') === formattedDate) {
                            filtered.push({
                                userName: `${booking.Users.first_name} ${booking.Users.last_name}`,
                                centreName: centre.centre_name,
                                category: session.category,
                                slotTime: format(parseISO(slot.time), 'PPPpp'),
                            });
                        }
                    });
                });
            });
        });

        setFilteredBookings(filtered);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        if (date) {
            filterBookingsByDate(date, fullBookingHistory);
        }
    };

    useEffect(() => {
        if (user)
            fetchBookingHistory();
    }, [user]);


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Daily Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                        <div className="w-full lg:w-1/4 space-y-6">
                            <Calendar
                                className="flex justify-center items-center rounded-md border"
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Bookings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-gray-600 mb-3">
                                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                                    </div>
                                    <div className="text-4xl font-bold text-red-600">
                                        {filteredBookings.length}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="w-full lg:w-3/4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Bookings for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <Loader className='h-8 w-8 animate-spin'></Loader>
                                    ) : error ? (
                                        <p className="text-red-600">Error: {error}</p>
                                    ) : filteredBookings.length > 0 ? (
                                        <div className="h-[387px] overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-1/4">User</TableHead>
                                                        <TableHead className="w-1/4">Centre Name</TableHead>
                                                        <TableHead className="w-1/4">Category</TableHead>
                                                        <TableHead className="w-1/4">Slot Time</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredBookings.map((booking, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="w-1/4">{booking.userName}</TableCell>
                                                            <TableCell className="w-1/4">{booking.centreName}</TableCell>
                                                            <TableCell className="w-1/4">{booking.category}</TableCell>
                                                            <TableCell className="w-1/4">{booking.slotTime}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p>No bookings for this date.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminBookingManagement
