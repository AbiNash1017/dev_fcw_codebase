'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Download, Users, DollarSign, CalendarIcon, IndianRupee, Loader } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Months } from 'react-day-picker'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

const VendorAnalytics = () => {
    const { fitnessCentreId } = useFitnessCentre()
    const [allBookings, setAllBookings] = useState([])
    const [sessionCategoryBookings, setSessionCategoryBookings] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [revenueByDate, setRevenueByDate] = useState([]);
    const [bookings, setBookings] = useState([])
    const [centreData, setCentreData] = useState(null);
    const { user, loading } = useAuth()
    const router = useRouter()
    // const [date, setDate] = React.useState({
    //   from: new Date(),
    //   to: addDays(new Date(), 7),
    // })

    const fetchAnalytics = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/dashboard/analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            const data = await response.json()
            console.log('Fetched data:', data);
            if (data.message.toLowerCase() === 'ok') {
                setTopUsers(data.data.topUsers || []);
                setSessionCategoryBookings(data.data.sessionCategoryBookings || []);
                setRecentBookings(data.data.recentBookings || []);
                setRevenueByDate(data.data.revenueByDate || []);
            } else {
                console.log('Error fetching analytics:', data.error);
            }
        } catch (error) {
            console.log('Error fetching analytics:', error);
        }
    }

    const fetchBookingHistory = async () => {
        const id = fitnessCentreId;

        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/fitness-center/bookingHistory/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch booking history');
            }

            const data = await response.json();
            setCentreData(data);
        } catch (err) {
            console.log(err)
        }
    };

    const transformDataForExcel = (data) => {
        return {
            centre_name: data?.centre_name,
            Sessions: data?.Sessions.map(session => ({
                category: session.category,
                Slot: session.Slot.map(slot => ({
                    Booking: {
                        created_at: slot.Booking.created_at,
                        total_price: slot.Booking.total_price,
                        payment_id: slot.Booking.payment_id,
                        user: {
                            first_name: slot.Booking.Users.first_name,
                            last_name: slot.Booking.Users.last_name,
                            email_id: slot.Booking.Users.email_id,
                            profile_image: slot.Booking.Users.profile_image,
                            city: slot.Booking.Users.city,
                            state: slot.Booking.Users.state,
                        },
                        Slot: slot.Booking.Slot.map(slotDetail => ({
                            time: slotDetail.time,
                            qty: slotDetail.qty,
                        })),
                    },
                })),
            })),
        };
    };

    const downloadBookingHistoryAsExcel = (data) => {
        const transformedData = transformDataForExcel(data);

        const rows = [];
        transformedData.Sessions?.forEach(session => {
            session.Slot.forEach(slot => {
                rows.push({
                    Centre: transformedData.centre_name,
                    Category: session.category,
                    Booking_Date: new Date(slot.Booking.created_at).toLocaleString(),
                    Total_Price: slot.Booking.total_price,
                    Payment_ID: slot.Booking.payment_id,
                    User_Name: `${slot.Booking.user.first_name} ${slot.Booking.user.last_name}`,
                    Email: slot.Booking.user.email_id,
                    City: slot.Booking.user.city,
                    State: slot.Booking.user.state,
                    Slot_Times: slot.Booking.Slot.map(slotDetail =>
                        new Date(slotDetail.time).toLocaleString()
                    ).join(', '),
                    Quantity: slot.Booking.Slot.map(slotDetail => slotDetail.qty).join(', '),
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Booking History');
        XLSX.writeFile(workbook, 'Booking_History.xlsx');
    };

    const exportToExcel = (data, fileName) => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
        XLSX.writeFile(wb, `${fileName}.xlsx`)
    }

    const handleDownload = (dataType) => {
        //Excel download logic here
        console.log(`Downloading ${dataType} data...`)
    }

    useEffect(() => {
        if (user) {
            fetchAnalytics()
            fetchBookingHistory()
        }
    }, [user])

    return (
        <div className="space-y-6">

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sessionCategoryBookings.reduce((sum, item) => sum + item.bookings, 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topUsers.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">&#8377; {revenueByDate.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* <div className='flex flex-row gap-4' >
        <Card className='w-full'>
          <CardHeader className='mb-0'>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>
              Download booking history for your gym between 2 selected dates - this includes user and session information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row justify-evenly">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button className="bg-red-600 hover:bg-red-700" onClick={downloadBookings}>
                <Download className="mr-2 h-4 w-4" /> Download Booking History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div> */}

            <div className='flex flex-row gap-4' >
                <Card className='w-full'>
                    <CardHeader className='mb-0'>
                        <CardTitle>Booking History</CardTitle>
                        <CardDescription>
                            Download booking history for your gym
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-row justify-evenly">
                            <Button className="bg-red-600 hover:bg-red-700" onClick={() => { downloadBookingHistoryAsExcel(centreData) }}>
                                <Download className="mr-2 h-4 w-4" /> Download Booking History
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 justify-center items-center w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Analytics</CardTitle>
                        <CardDescription>Booking rate of different categories</CardDescription>
                    </CardHeader>
                    {
                        sessionCategoryBookings.length > 0 ? (<CardContent>
                            <ChartContainer
                                config={{
                                    bookings: {
                                        label: "Bookings",
                                        color: "hsl(var(--chart-1))",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%" >
                                    <BarChart width={700} height={300} data={sessionCategoryBookings}>
                                        <XAxis dataKey="category" />
                                        <YAxis dataKey="bookings" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="bookings" fill="var(--color-bookings)" color='#e82020' />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...sessionCategoryBookings], 'session_category_bookings_report')}>
                                <Download className="mr-2 h-4 w-4" /> Download Category Bookings Report
                            </Button>
                        </CardContent>) : (
                            <CardContent>
                                <div><Loader className='h-8 w-8 animate-spin' /></div>
                            </CardContent>
                        )
                    }

                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue by Category</CardTitle>
                        <CardDescription>Revenue breakdown by session category</CardDescription>
                    </CardHeader>
                    {
                        sessionCategoryBookings.length > 0 ? (<CardContent>
                            <ChartContainer
                                config={{
                                    revenue: {
                                        label: "Revenue",
                                        color: "hsl(var(--chart-1))",
                                    },
                                }}
                                className="h-[300px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart width={700} height={300} data={sessionCategoryBookings}>
                                        <XAxis dataKey="category" />
                                        <YAxis dataKey="revenue" />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="revenue" fill="var(--color-revenue)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...sessionCategoryBookings], 'session_category_revenue_report')}>
                                <Download className="mr-2 h-4 w-4" /> Download Category Revenue Report
                            </Button>
                        </CardContent>) : (
                            <CardContent>
                                <div><Loader className='h-8 w-8 animate-spin' /></div>
                            </CardContent>
                        )
                    }
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                        <CardDescription>Total revenue generated date-wise</CardDescription>
                    </CardHeader>
                    {
                        revenueByDate.length > 0 ? (
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        revenue: {
                                            label: "Revenue",
                                            color: "hsl(var(--chart-1))",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart width={700} height={300} data={revenueByDate}>
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                                <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => exportToExcel([...revenueByDate], 'datewise_revenue_report')}>
                                    <Download className="mr-2 h-4 w-4" /> Download Date-wise Revenue
                                </Button>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div><Loader className='h-8 w-8 animate-spin' /></div>
                            </CardContent>
                        )
                    }
                </Card>
            </div>
        </div>
    )
}

export default VendorAnalytics
