'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { storage } from '@/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const VendorCouponsAndBanners = () => {
    const { fitnessCentreId } = useFitnessCentre()
    const [couponData, setCouponData] = useState({
        coupon_code: '',
        start_date: new Date(),
        end_date: new Date(),
        discount_value: 0,
        type: '',
        max_discount: 0,
        min_purchase: 0,
        approved: false
    })
    const [isCouponSubmitting, setIsCouponSubmitting] = useState(false)
    const [couponErrors, setCouponErrors] = useState({})

    const [bannerData, setBannerData] = useState({
        banner_image: '',
        banner_title: '',
        banner_description: '',
        start_date: new Date(),
        end_date: new Date(),
        coupon_id: '',
        approved: false
    })
    const [isBannerSubmitting, setIsBannerSubmitting] = useState(false)
    const [bannerErrors, setBannerErrors] = useState({})
    const [bannerImage, setBannerImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const headerFileInputRef = useRef(null);
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [coupons, setCoupons] = useState()
    const [banners, setBanners] = useState();
    const router = useRouter();

    const fetchCoupons = async () => {
        try {
            if (!user) return;
            setLoading(true)
            const token = await user.getIdToken();
            const response = await fetch(`/api/dashboard/coupons`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                // alert(response)
            }
            const data = await response.json();
            const fetchedCoupons = data.data || []
            const approvedCoupons = fetchedCoupons.filter((coupon) => coupon.approved === true)
            setCoupons(approvedCoupons);
            console.log(approvedCoupons)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setLoading(false)
        }
    };

    const fetchBanners = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/dashboard/banners`, {
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
            const approvedBanners = fetchedBanners.filter((banner) => banner.approved === true)
            console.log(approvedBanners)
            setBanners(approvedBanners)
        } catch (error) {
            console.error('Error fetching banners:', error)
        }
    }

    const handleInputChange = (
        e
    ) => {
        if (typeof e === 'string') {
            setBannerData((prev) => ({
                ...prev,
                coupon_id: e,
            }));
        }
    };

    useEffect(() => {
        if (user) {
            fetchCoupons();
            fetchBanners();
        }
    }, [user]);

    const validateCouponForm = () => {
        const errors = {}

        if (!couponData.coupon_code) errors.coupon_code = 'Coupon code is required'
        if (!couponData.discount_value) errors.discount_value = 'Discount value is required'
        if (!couponData.max_discount) errors.max_discount = 'Maximum discount is required'
        if (!couponData.min_purchase) errors.min_purchase = 'Minimum purchase amount is required'
        if (couponData.end_date <= couponData.start_date) {
            errors.end_date = 'End date must be after start date'
        }

        setCouponErrors(errors)
        return Object.keys(errors).length === 0
    }

    const validateBannerForm = () => {
        const errors = {}

        if (!bannerData.banner_title) errors.banner_title = 'Banner title is required'
        if (!bannerData.banner_description) errors.banner_description = 'Banner description is required'
        if (!bannerData.banner_image) errors.banner_image = 'Banner image is required'

        setBannerErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleCouponSubmit = async (e) => {
        e.preventDefault()
        if (!validateCouponForm()) return

        setIsCouponSubmitting(true)
        try {
            if (!user) return;
            const token = await user.getIdToken();
            console.log(fitnessCentreId)
            const response = await fetch(`/api/dashboard/requestCoupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...couponData,
                    fitness_centre_id: fitnessCentreId
                })
            })
            const res_data = await response.json()
            if (res_data.message === "OK") {
                alert('Coupon requested!')
                setCouponData({
                    coupon_code: '',
                    start_date: new Date(),
                    end_date: new Date(),
                    discount_value: 0,
                    type: 'percentage',
                    max_discount: 0,
                    min_purchase: 0,
                    approved: false
                })
            }
            else {
                alert('Error requesting coupon' + res_data.error)
            }
        } catch (error) {
            alert('Failed to request coupon')
        } finally {
            setIsCouponSubmitting(false)
        }
    }

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        if (validateBannerForm()) {
            console.log("Form is validated");
            await addBanner({
                ...bannerData,
                banner_image: imagePreview || bannerData.banner_image,
            });

            setBannerData({
                coupon_id: '',
                approved: false,
                banner_image: '',
                start_date: new Date(),
                end_date: new Date(),
                banner_title: '',
                banner_description: ''
            });
            setBannerErrors({});
        }
    };

    const addBanner = async (banner) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            console.log(fitnessCentreId)
            const { start_date, end_date, banner_title, banner_description } = banner;

            console.log('Sending banner:', JSON.stringify(banner));
            const response = await fetch(`/api/dashboard/requestBanner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...banner,
                    fitnessCentreId
                })
            })
            const data = await response.json();
            console.log("reached")
            console.log(data.message)
            if (data.message === 'OK') {
                alert('banner requested successfully!');
                setImagePreview(null)
                setBannerImage(null)
            } else {
                alert('Error requesting banner!' + data.error);
                setImagePreview(null)
                setBannerImage(null)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedImageUrl = await uploadImageToFirebase(file, 'banners');

            if (uploadedImageUrl) {
                setImagePreview(uploadedImageUrl);
                setBannerData((prev) => ({
                    ...prev,
                    banner_image: uploadedImageUrl,
                }));
            } else {
                console.error('Image upload failed');
            }
        }
    };

    const uploadImageToFirebase = async (file, pathPrefix) => {
        try {
            const storageRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(snapshot.ref);
            return publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            return null;
        }
    };

    return (
        <div className="container mx-auto space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>New Coupon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCouponSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="coupon_code">Coupon Code</Label>
                                <Input
                                    id="coupon_code"
                                    value={couponData.coupon_code}
                                    onChange={(e) => setCouponData({ ...couponData, coupon_code: e.target.value })}
                                    placeholder="Enter coupon code"
                                />
                                {couponErrors.coupon_code && (
                                    <p className="text-sm text-destructive">{couponErrors.coupon_code}</p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !couponData.start_date && "text-muted-foreground"
                                                )}
                                            >
                                                {couponData.start_date ? (
                                                    format(couponData.start_date, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={couponData.start_date}
                                                onSelect={(date) => date && setCouponData({ ...couponData, start_date: date })}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !couponData.end_date && "text-muted-foreground"
                                                )}
                                            >
                                                {couponData.end_date ? (
                                                    format(couponData.end_date, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={couponData.end_date}
                                                onSelect={(date) => date && setCouponData({ ...couponData, end_date: date })}
                                                disabled={(date) =>
                                                    date <= couponData.start_date
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {couponErrors.end_date && (
                                        <p className="text-sm text-destructive">{couponErrors.end_date}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <RadioGroup
                                    value={couponData.type}
                                    onValueChange={(value) =>
                                        setCouponData({ ...couponData, type: value })
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="percentage" id="percentage" />
                                        <Label htmlFor="percentage">Percentage</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="flat" id="flat" />
                                        <Label htmlFor="flat">Flat Amount</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="discount_value">Discount Value</Label>
                                    <Input
                                        id="discount_value"
                                        type="number"
                                        value={couponData.discount_value}
                                        onChange={(e) => setCouponData({ ...couponData, discount_value: Number(e.target.value) })}
                                        placeholder={couponData.type === 'percentage' ? "Enter %" : "Enter amount"}
                                    />
                                    {couponErrors.discount_value && (
                                        <p className="text-sm text-destructive">{couponErrors.discount_value}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_discount">Maximum Discount</Label>
                                    <Input
                                        id="max_discount"
                                        type="number"
                                        value={couponData.max_discount}
                                        onChange={(e) => setCouponData({ ...couponData, max_discount: Number(e.target.value) })}
                                        placeholder="Enter amount"
                                    />
                                    {couponErrors.max_discount && (
                                        <p className="text-sm text-destructive">{couponErrors.max_discount}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="min_purchase">Minimum Purchase</Label>
                                    <Input
                                        id="min_purchase"
                                        type="number"
                                        value={couponData.min_purchase}
                                        onChange={(e) => setCouponData({ ...couponData, min_purchase: Number(e.target.value) })}
                                        placeholder="Enter amount"
                                    />
                                    {couponErrors.min_purchase && (
                                        <p className="text-sm text-destructive">{couponErrors.min_purchase}</p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" >
                                Request Coupon
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>New Banner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBannerSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="coupon" className="block text-sm">Coupon</label>
                                <Select value={bannerData.coupon_id} onValueChange={(value) => handleInputChange(value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select a coupon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {coupons?.map((coupon) => (
                                            <SelectItem key={coupon.id} value={coupon.id.toString()}>
                                                Code-{coupon.coupon_code} / Discount-{coupon.discount_value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {bannerErrors.coupon_id && <p className="mt-1 text-sm text-red-600">{bannerErrors.coupon_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="banner_title">Banner Title</Label>
                                <Input
                                    id="banner_title"
                                    value={bannerData.banner_title}
                                    onChange={(e) => setBannerData({ ...bannerData, banner_title: e.target.value })}
                                    placeholder="Enter banner title"
                                />
                                {bannerErrors.banner_title && (
                                    <p className="text-sm text-destructive">{bannerErrors.banner_title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="banner_description">Banner Description</Label>
                                <Textarea
                                    id="banner_description"
                                    value={bannerData.banner_description}
                                    onChange={(e) => setBannerData({ ...bannerData, banner_description: e.target.value })}
                                    placeholder="Enter banner description"
                                />
                                {bannerErrors.banner_description && (
                                    <p className="text-sm text-destructive">{bannerErrors.banner_description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !bannerData.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            {bannerData.start_date ? (
                                                format(bannerData.start_date, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={bannerData.start_date}
                                            onSelect={(date) => date && setBannerData({ ...bannerData, start_date: date })}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !bannerData.end_date && "text-muted-foreground"
                                            )}
                                        >
                                            {bannerData.end_date ? (
                                                format(bannerData.end_date, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={bannerData.end_date}
                                            onSelect={(date) => date && setBannerData({ ...bannerData, end_date: date })}
                                            disabled={(date) =>
                                                date <= bannerData.start_date
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {couponErrors.end_date && (
                                    <p className="text-sm text-destructive">{couponErrors.end_date}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="banner_image" className='block text-sm'>Banner Image</label>
                                <input
                                    id="banner_image"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-1"
                                />
                                {imagePreview && <img src={imagePreview} alt="Banner Preview" className="mt-2 w-32 h-32 object-cover" />}
                                {bannerErrors.banner_image && (
                                    <p className="text-sm text-destructive">{bannerErrors.banner_image}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                                Request Banner
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Approved Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coupon ID</TableHead>
                                <TableHead>Coupon Code</TableHead>
                                <TableHead>Discount Value</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Max Discount</TableHead>
                                <TableHead>Min Purchase</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            loading ? (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Loader className='animate-spin h-8 w-8' />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            ) : (
                                <TableBody>
                                    {coupons?.map((coupon) => {
                                        const isActive = new Date(coupon.end_date) >= new Date();
                                        return (
                                            <TableRow key={coupon.id}>
                                                <TableCell>{coupon.id}</TableCell>
                                                <TableCell>{coupon.coupon_code}</TableCell>
                                                <TableCell>{coupon.discount_value}</TableCell>
                                                <TableCell>{coupon.type}</TableCell>
                                                <TableCell>{coupon.max_discount}</TableCell>
                                                <TableCell>{coupon.min_purchase}</TableCell>
                                                <TableCell>{format(new Date(coupon.start_date), "PPP")}</TableCell>
                                                <TableCell>{format(new Date(coupon.end_date), "PPP")}</TableCell>
                                                <TableCell>{isActive ? "Active" : "Inactive"}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            )
                        }
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Approved Banners</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Banner ID</TableHead>
                                <TableHead>Coupon ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            banners ? (
                                <TableBody>
                                    {banners?.map((banner) => {
                                        const isActive = new Date(banner.end_date) >= new Date();
                                        return (
                                            <TableRow key={banner.id}>
                                                <TableCell>{banner.id}</TableCell>
                                                <TableCell>{banner.coupon_id}</TableCell>
                                                <TableCell>{banner.banner_title}</TableCell>
                                                <TableCell className='text-wrap'>{banner.banner_description}</TableCell>
                                                <TableCell><img height={130} width={130} alt='banner image' src={banner.banner_image}></img></TableCell>
                                                <TableCell>{format(new Date(banner.start_date), "PPP")}</TableCell>
                                                <TableCell>{format(new Date(banner.end_date), "PPP")}</TableCell>
                                                <TableCell>{isActive ? "Active" : "Inactive"}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            ) : (
                                <TableBody>
                                    <TableRow>
                                        <TableCell>
                                            <Loader className='h-8 w-8 animate-spin'></Loader>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )
                        }
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorCouponsAndBanners
