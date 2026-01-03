'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, Users, DollarSign, Calendar, IndianRupee } from 'lucide-react'
import { useEffect, useState } from "react"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

const AdminOverview = () => {

    const [stats, setStats] = useState()
    const [monthlyBooking, setMonthlyBooking] = useState()
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [bookingsByMonth, setBookingsByMonth] = useState([]);
    const [categoryBookings, setCategoryBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const { user, loading } = useAuth()
    const router = useRouter()

    const fetchHomePageStats = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const data = await fetch(`/api/admin/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const fetched = await data.json()
        setStats(fetched.data)
        console.log(stats)
    }

    const fetchMonthlyBookings = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const data = await fetch(`/api/admin/bookings/monthly`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const fetched = await data.json()
        console.log(fetched)
        const count = fetched.bookings?.length;
        setMonthlyBooking(count)
        console.log(count)
    }

    const fetchAnalytics = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            const data = await response.json()
            console.log('Fetched data:', data);
            if (response.ok) {
                const formattedCategoryBookings = Object.entries(data.categoryBookings || {}).map(([key, value]) => ({
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

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        } else if (user) {
            fetchHomePageStats()
            fetchMonthlyBookings()
            fetchAnalytics()
        }
    }, [user, loading, router])

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
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">{stats?.totalBookings}</div>

                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-2xl font-bold">&#8377; {stats?.totalRevenue}</div>

                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                revenue: {
                                    label: "Revenue",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart width={500} height={300} data={revenueByMonth}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs ${value}`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={{
                                revenue: {
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
                                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-row justify-center items-center gap-6">
                <Card className="w-1/2 pb-1 pr-1">
                    <CardHeader>
                        <CardTitle>Recent User Registraions</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto h-[275px]">
                        {recentUsers.map((user, index) => (
                            <div key={index} className="flex items-center justify-between my-2">
                                <div className="flex flex-row items-center space-x-4">
                                    <div>
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium leading-none">{`${user.first_name} ${user.last_name}`}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{user.city}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="w-1/2 pb-1 pr-1">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto h-[275px]">
                        {recentBookings.map((booking, index) => (
                            <div key={index} className="flex items-center justify-between my-2">
                                <div className="flex flex-row items-center space-x-4">
                                    <div>
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{booking.Users.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium leading-none">{`${booking.Users.first_name} ${booking.Users.last_name}`}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">&#8377; {booking.total_price}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Booking per Category</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-center justify-center">{
                }
                    <div>
                        <ChartContainer
                            config={{
                                bookings: {
                                    label: "Bookings",
                                    color: "hsl(var(--chart-1))",
                                }
                            }}
                            className="h-[300px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart width={800} height={300} data={categoryBookings}>
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="bookings" fill="var(--color-bookings)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminOverview
