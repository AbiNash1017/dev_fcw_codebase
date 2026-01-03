'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
// import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Download, Users, DollarSign, Calendar as CalendarIcon, IndianRupee, ArrowUpRight, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Months } from 'react-day-picker'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })
    const [stats, setStats] = useState()
    const [monthlyBooking, setMonthlyBooking] = useState()
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [bookingsByMonth, setBookingsByMonth] = useState([]);
    const [categoryBookings, setCategoryBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [users, setUsers] = useState([])
    const [fullBookingHistory, setFullBookingHistory] = useState([])

    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const fetchBookingHistory = async () => {
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
            setFullBookingHistory(data.bookingHistory);
            console.log(data.bookingHistory)
            console.log("fbh", fullBookingHistory)
        } catch (err) {
            console.log(err)
        }
    };

    const fetchHomePageStats = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const data = await fetch(`/api/admin/homePageStats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const fetched = await data.json()
        setStats(fetched.data)
        console.log(stats)
    }

    const fetchMonthlyBookings = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const data = await fetch(`/api/admin/monthlyBookings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const fetched = await data.json()
        console.log(fetched)
        const count = fetched.bookings.length;
        setMonthlyBooking(count)
        console.log(count)
    }

    const fetchAnalytics = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/getAnalytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${token}`
                },
            })
            const data = await response.json()
            console.log('Fetched data:', data);
            if (data.message.toLowerCase() === 'ok') {
                const formattedCategoryBookings = Object.entries(data.categoryBookings).map(([key, value]) => ({
                    category: key,
                    bookings: Number(value),
                }));
                setCategoryBookings(formattedCategoryBookings || [])
                setRevenueByMonth(data.revenueByMonth || []);
                setBookingsByMonth(data.bookingsByMonth || []);
                setRecentUsers(data.recentUsers || []);
                setRecentBookings(data.recentBookings || []);
            } else {
                console.log('Error fetching analytics:', data.error);
            }
        } catch (error) {
            console.log('Error fetching analytics:', error);
        }
    }

    const fetchUsers = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/user/getAll`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        let fetchedUsers = data.users
        //console.log(fetchedUsers)    
        setUsers(fetchedUsers)
    }

    useEffect(() => {
        if (user) {
            fetchHomePageStats()
            fetchMonthlyBookings()
            fetchAnalytics()
            fetchUsers()
            fetchBookingHistory()
        }
    }, [user])

    const exportToExcel = (data, fileName) => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        XLSX.writeFile(wb, `${fileName}.xlsx`)
    }

    const handleDownload = (dataType) => {
        console.log(`Downloading ${dataType} data...`)
    }

    const transformResponseDataForExcel = (data) => {
        const rows = [];
        data.bookingHistory?.forEach((centre) => {
            const centreName = centre.centre_name;

            centre.Sessions?.forEach((session) => {
                const category = session.category;

                session.Slot?.forEach((slot) => {
                    const booking = slot.Booking;
                    const user = booking?.Users;

                    rows.push({
                        Centre: centreName,
                        Category: category,
                        Booking_Date: new Date(booking?.created_at).toLocaleString(),
                        Total_Price: booking?.total_price,
                        Payment_ID: booking?.payment_id,
                        User_Name: `${user?.first_name} ${user?.last_name}`,
                        Email: user?.email_id,
                        City: user?.city,
                        State: user?.state,
                        Slot_Times: booking?.Slot.map((slotDetail) =>
                            new Date(slotDetail.time).toLocaleString()
                        ).join(', '),
                        Quantity: booking?.Slot.map((slotDetail) => slotDetail.qty).join(', '),
                    });
                });
            });
        });

        return rows;
    };

    const downloadAllBookingHistoryAsExcel = (data) => {
        const formattedData = transformResponseDataForExcel(data);

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'All Booking History');

        XLSX.writeFile(workbook, 'All_Booking_History.xlsx');
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">{stats?.userCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Active: {stats?.activeUsersCount}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registered Vendors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">{stats?.vendorCount}</div>
                        {/* <p className="text-xs text-muted-foreground">
              Registered Today: 987
            </p> */}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Daily Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">{stats?.todaysBookings}</div>
                        <p className="text-xs text-muted-foreground">
                            Month: {monthlyBooking}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue Summary</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">&#8377; {stats?.monthlyBookingAmount._sum.total_price}</div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                            {(stats?.prevMonthlyBookingAmount._sum.total_price || 0 - stats?.monthlyBookingAmount?._sum.total_price || 0) / stats?.prevMonthlyBookingAmount._sum.total_price || 0}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className='flex flex-row gap-4' >
                <Card className='w-full'>
                    <CardHeader className='mb-0 pb-0'>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>Name, Gender, Email, DoB, Role, State, City, Location, Mobile number</CardDescription>
                    </CardHeader>
                    <CardContent className='mt-0 pt-0'>
                        <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...users], 'User_details')}>
                            <Download className="mr-2 h-4 w-4" /> Download Excel
                        </Button>
                    </CardContent>
                </Card>

                {/* change later once admin/bookingHistory fixed */}
                {/* <Card className='w-1/2'>
            <CardHeader className='mb-0 pb-0'>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>User, fitness center, date, session</CardDescription>
            </CardHeader>
            <CardContent>
            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => downloadAllBookingHistoryAsExcel(fullBookingHistory)}>
                <Download className="mr-2 h-4 w-4" /> Download Excel
              </Button>
            </CardContent>
          </Card> */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Reports</CardTitle>
                        <CardDescription>Monthly revenue from vendor payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{
                            revenue: {
                                label: "Revenue",
                                color: "hsl(var(--chart-1))",
                            },
                        }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart width={500} height={300} data={revenueByMonth}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...revenueByMonth], 'revenue_report')}>
                            <Download className="mr-2 h-4 w-4" /> Download Excel
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Bookings</CardTitle>
                        <CardDescription>Monthly booking trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                bookings: {
                                    label: "Bookings",
                                    color: "hsl(var(--chart-2))",
                                },
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart width={500} height={300} data={bookingsByMonth}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="bookings" stroke="var(--color-bookings)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...bookingsByMonth, Months], 'bookings_report')}>
                            <Download className="mr-2 h-4 w-4" /> Download Excel
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* <Card>
        <CardHeader>
          <CardTitle>Vendor Payments</CardTitle>
        </CardHeader>
        <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2023-06-01</TableCell>
                    <TableCell>Fitness First</TableCell>
                    <TableCell className="text-right">$1,200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-06-01</TableCell>
                    <TableCell>Yoga Haven</TableCell>
                    <TableCell className="text-right">$800</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2023-06-02</TableCell>
                    <TableCell>CrossFit Elite</TableCell>
                    <TableCell className="text-right">$1,500</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...revenueData, Months], 'revenue_report')}>
            <Download className="mr-2 h-4 w-4" /> Download Excel
          </Button>
        </CardContent>
      </Card> */}
        </div>
    )
}

export default AdminAnalytics
