'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Users, DollarSign, Calendar, Star, IndianRupee, Loader } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

const VendorOverview = () => {

    const [monthlyRevenue, setMonthlyRevenue] = useState(0);
    const [monthlyBookings, setMonthlyBookings] = useState(0);
    const [rating, setRating] = useState({ rating: 0, rating_count: 0 });
    const [latestBookings, setLatestBookings] = useState([]);
    const [latestReviews, setLatestReviews] = useState([]);
    const [sessionCategoryBookings, setSessionCategoryBookings] = useState([]);
    const [topUsers, setTopUsers] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    // const [loading, setLoading] = useState(false) // useAuth has loading
    const { user, loading } = useAuth()
    const router = useRouter()

    const fetchOverview = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/fitness-center/overview`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json()
            console.log('Fetched data:', data);
            if (response.ok) {
                setMonthlyBookings(data.data?.monthlyBookings || 0);
                setMonthlyRevenue(data.data?.monthlyRevenue || 0);
                setRating(data.data?.rating || {});
                setLatestBookings(data.data?.latest_bookings || []);
                setLatestReviews(data.data?.latest_reviews || [])
            } else {
                console.log('Error fetching analytics:', data.error);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error.message);
        }
    };

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
            if (response.ok) {
                setTopUsers(data.data?.topUsers || []);
                setSessionCategoryBookings(data.data?.sessionCategoryBookings || []);
                setRecentBookings(data.data?.recentBookings || []);
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
            fetchOverview();
            fetchAnalytics();
        }
    }, [user, loading, router])

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Monthly Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">&#8377; {monthlyRevenue}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Monthly Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-6">
                            <div className="text-2xl font-bold">{rating.rating}</div>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-6 h-6 ${i < Math.floor(rating.rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Session analytics</CardTitle>
                        <CardDescription>Session popularity and booking details</CardDescription>
                    </CardHeader>
                    {
                        sessionCategoryBookings.length > 0 ? (
                            <CardContent>
                                <ChartContainer
                                    config={{
                                        bookings: {
                                            label: "Bookings",
                                            color: "hsl(var(--chart-1))",
                                        },
                                        revenue: {
                                            label: "Revenue",
                                            color: "hsl(var(--chart-2))",
                                        },
                                    }}
                                    className="h-[300px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart height={300} width={900} data={sessionCategoryBookings} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="category" />
                                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-bookings)" />
                                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-revenue)" />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="bookings"
                                                stroke="var(--color-bookings)"
                                                activeDot={{ r: 8 }}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="var(--color-revenue)"
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div><Loader className='h-8 w-8 animate-spin' /></div>
                            </CardContent>
                        )
                    }
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Latest Bookings</CardTitle>
                    </CardHeader>
                    {
                        latestBookings.length > 0 ? (
                            <CardContent className="overflow-y-auto h-auto">
                                <div className="space-y-4">
                                    {latestBookings.map((booking, index) => (
                                        <div key={index} className="flex items-center">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{booking.Users.first_name[0] + booking.Users.last_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{booking.Users.first_name + " " + booking.Users.last_name}</p>
                                                <p className="text-sm">
                                                    {`Rs ${booking.total_price}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div>No data available</div>
                            </CardContent>
                        )
                    }
                </Card>
            </div>

            <div className="flex flex-row space-x-3">
                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Capacity & Session Insights</CardTitle>
                    </CardHeader>
                    {
                        sessionCategoryBookings.length > 0 ? (
                            <CardContent>
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Popular Sessions</h4>
                                    <div className="space-y-2">
                                        {sessionCategoryBookings.map((session, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium">{session.category}</span>
                                                    <span className="ml-auto text-sm">{session.bookings}</span>
                                                </div>
                                                <Progress value={session.bookings} className="h-2" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div>No data available</div>
                            </CardContent>
                        )
                    }
                </Card>

                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Recent Feedback</CardTitle>
                    </CardHeader>
                    {
                        latestReviews.length > 0 ? (
                            <CardContent>
                                <div className="space-y-4">
                                    {latestReviews.map((feedback, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex items-center">
                                                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{feedback.rating}/5</span>
                                                <span className="ml-2 text-sm text-muted-foreground">{feedback.Users.first_name + " " + feedback.Users.last_name}</span>
                                            </div>
                                            <p className="text-sm">{feedback.review}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent>
                                <div>No data available</div>
                            </CardContent>
                        )
                    }
                </Card>
            </div>
        </div>
    )
}

export default VendorOverview
