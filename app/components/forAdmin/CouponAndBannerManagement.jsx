'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'
import { CircleCheckBig, CircleX, Edit, Loader, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Image from 'next/image'

export default function CouponBannerRequestsPage() {
    const [coupons, setCoupons] = useState([])
    const [banners, setBanners] = useState()
    const [editImagePreview, setEditImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const [loadingCoupon, setLoadingCoupon] = useState(false)
    const [loadingBanner, setLoadingBanner] = useState(false)
    const { user, loading } = useAuth()
    const router = useRouter()

    const fetchCoupons = async () => {
        try {
            if (!user) return;
            setLoadingCoupon(true)
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/getCouponRequests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json()
            if (data.message === "OK") {
                // alert('fetch coupons')
                setCoupons(data.data)
                setLoadingCoupon(false)
            }
        } catch (error) {
            console.error('Error fetching coupons:', error)
        }
    }

    const handleDeleteCoupon = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/coupon/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        const data = await response.json()
        console.log(data)
        let responseMessage = data.message
        if (responseMessage === "Deleted coupon request and data!") {
            alert(responseMessage)
        }
        fetchCoupons()
    }

    const handleDeleteBanner = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/banner/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
        let responseMessage = data.message
        if (responseMessage === "Deleted banner request and data!") {
            alert(responseMessage)
        }
        fetchBanners()
    }

    const fetchBanners = async () => {
        try {
            if (!user) return;
            setLoadingBanner(true)
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/getBannerRequests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            // if (!response.ok) {
            //   alert('Failed to fetch banners')
            // }
            const data = await response.json()
            const fetchedBanners = data.data
            console.log(fetchedBanners)
            if (data.message === "OK") {
                console.log(fetchedBanners)
                setBanners(fetchedBanners)
                setLoadingBanner(false)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
        }
    }

    const approveCoupon = async (id) => {
        try {
            console.log(id)
            if (!user) return;
            const token = await user.getIdToken();
            const approved = true
            const request = await fetch(`/api/admin/coupon/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({

                    approved
                })
            })
            const res_data = await request.json();
            console.log(res_data)
            if (res_data.message === "OK") {
                console.log("yay")
                fetchCoupons()
            }
            if (res_data.message !== "OK") {
                console.log("Here 1")
                alert(res_data.error)
            }
        } catch (error) {
            console.log("Here 2")
            alert(error)
        }
    }

    const approveBanner = async (id) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const status = true
            const request = await fetch(`/api/admin/banner/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approved: status
                })
            })
            const res_data = await request.json();
            if (res_data.message !== "OK") {
                alert(res_data.error)
            }
            fetchBanners()
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        if (user) {
            fetchCoupons()
            fetchBanners()
        }
    }, [user])

    return (
        <div className="container mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Requested Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fitness Centre ID</TableHead>
                                <TableHead>Coupon Code</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Discount Value</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Max Discount</TableHead>
                                <TableHead>Min Purchase</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approve</TableHead>
                                <TableHead>Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            loadingCoupon ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Loader className='h-8 w-8 animate-spin' />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                coupons?.length === 0 ? (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <div>No coupon requests</div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                ) : (
                                    <TableBody>
                                        {coupons?.map((coupon) => {
                                            // const isActive = new Date(coupon.end_date.toString) >= new Date();
                                            // function handleDeleteCoupon(id: number): void {
                                            //     throw new Error('Function not implemented.')
                                            // }
                                            return (
                                                <TableRow key={coupon.id}>
                                                    <TableCell>{coupon.fitness_centre_id}</TableCell>
                                                    <TableCell>{coupon.coupon_code}</TableCell>
                                                    <TableCell>{format(new Date(coupon.start_date), "PPP")}</TableCell>
                                                    <TableCell>{format(new Date(coupon.end_date), "PPP")}</TableCell>
                                                    <TableCell>{coupon.discount_value}</TableCell>
                                                    <TableCell>{coupon.type}</TableCell>
                                                    <TableCell>{coupon.max_discount}</TableCell>
                                                    <TableCell>{coupon.min_purchase}</TableCell>
                                                    <TableCell>{coupon.approved ? "Approved" : "Pending"}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => approveCoupon(coupon.id)}>
                                                            <CircleCheckBig className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the coupon request and data and remove their data from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteCoupon(coupon.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                )
                            )
                        }
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Requested Banners</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coupon Id</TableHead>
                                <TableHead>Banner Title</TableHead>
                                <TableHead className='w-20'>Description</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approve</TableHead>
                                <TableHead>Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            loadingBanner ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Loader className='h-8 w-8 animate-spin' />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                banners?.length === 0 ? (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <div>No banner requests</div>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                ) : (
                                    <TableBody>
                                        {banners?.map((banner) => {
                                            const isActive = new Date(banner.end_date) >= new Date();
                                            return (
                                                <TableRow key={banner.id}>
                                                    <TableCell>{banner.coupon_id}</TableCell>
                                                    <TableCell>{banner.banner_title}</TableCell>
                                                    <TableCell className='text-wrap w-20'>{banner.banner_description}</TableCell>
                                                    <TableCell><img width={200} height={200} src={banner.banner_image} alt='banner image'></img></TableCell>
                                                    <TableCell>{format(new Date(banner.start_date), "PPP")}</TableCell>
                                                    <TableCell>{format(new Date(banner.end_date), "PPP")}</TableCell>
                                                    <TableCell>{banner.approved ? "Approved" : "Pending"}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => approveBanner(banner.id)}>
                                                            <CircleCheckBig className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the banner request and data and remove their data from our servers.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteBanner(banner.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                )
                            )
                        }
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
