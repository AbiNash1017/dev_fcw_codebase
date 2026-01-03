'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns'
import { CalendarIcon, Edit, Loader, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { storage } from '@/firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function CreateBannerPage() {
    const [coupons, setCoupons] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [banners, setBanners] = useState()
    const [newBanners, setNewBanners] = useState({
        coupon_id: '',
        banner_image: '',
        start_date: new Date(),
        end_date: new Date(),
        banner_title: '',
        banner_description: '',
        approved: true
    })
    const [currentBanners, setCurrentBanners] = useState(
        {
            id: 0,
            coupon_id: '',
            banner_image: '',
            start_date: new Date(),
            end_date: new Date(),
            banner_title: '',
            banner_description: '',
            approved: true
        }
    )
    const [bannerImage, setBannerImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const headerFileInputRef = useRef(null);
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const fetchCoupons = async () => {
        try {
            if (!user) return;
            setLoading(true)
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/getCoupons`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                alert('Failed to fetch coupons')
            }
            const data = await response.json()
            setCoupons(data.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching coupons:', error)
        }
    }

    const fetchBanners = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/banner`, {
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
            console.log(fetchedBanners)
            setBanners(approvedBanners)
        } catch (error) {
            console.error('Error fetching banners:', error)
        }
    }

    const addBanner = async (banner) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const { coupon_code, start_date, end_date, banner_title, banner_description } = banner;

            console.log('Sending banner:', JSON.stringify(banner));
            const response = await fetch(`/api/admin/banner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    coupon_id: coupon_code,
                    bannerImage,
                    start_date,
                    end_date,
                    banner_title,
                    banner_description
                })
            })
            const data = await response.json();
            console.log("reached")
            console.log(data.message)
            if (data.message === 'OK') {
                alert('banner added successfully!');
                fetchBanners();
            } else {
                alert('Error adding banner!');
            }
        } catch (error) {
            console.log(error)
        }
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
        if (responseMessage === "Deleted banner!") {
            alert(responseMessage)
        }
        fetchBanners()
    }

    const handleEditBanner = async (banner) => {
        console.log(banner.id)
        console.log(banner)
        if (!user) return;
        const token = await user.getIdToken();
        let banner_image = editImagePreview || banner.banner_image;
        const { coupon_code, start_date, end_date, banner_title, banner_description } = banner;
        console.log(coupon_code, start_date, end_date, banner_title, banner_description, banner_image)
        const response = await fetch(`/api/admin/banner/${banner.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                coupon_id: coupon_code,
                banner_image,
                start_date,
                end_date,
                banner_title,
                banner_description
            })
        })
        const data = await response.json()
        if (data.message === "OK") {
            alert("Edit successful!")
            fetchBanners()
        }
        else
            alert('error editing banner')
    }

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

    const validateForm = () => {
        const errors = {};
        if (!newBanners.coupon_id) errors.coupon_code = "Coupon code is required";
        if (!newBanners.banner_title) errors.banner_title = "Banner title is required";
        if (!newBanners.start_date || !newBanners.end_date || newBanners.end_date <= newBanners.start_date) {
            errors.dates = "Start date must be before end date";
        }
        if (!newBanners.banner_description) errors.banner_description = "Banner description is required";
        // if (!newBanners.banner_image) errors.banner_image = "Banner image is required";
        setErrors(errors);
        console.log(errors)
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form is validated");
            await addBanner({
                ...newBanners,
                banner_image: imagePreview || newBanners.banner_image,
            });

            setNewBanners({
                coupon_id: '',
                banner_image: '',
                start_date: new Date(),
                end_date: new Date(),
                banner_title: '',
                banner_description: '',
                approved: true
            });
            setErrors({});
        }
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (currentBanners) {
            handleEditBanner(currentBanners);
        }
    };

    const handleInputChange = (
        e
    ) => {
        if (typeof e === 'string') {
            setNewBanners((prev) => ({
                ...prev,
                coupon_code: e,
            }));
        } else {
            const { name, value } = e.target;
            setNewBanners((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleDateChange = (field) => (date) => {
        if (date) {
            setNewBanners(prev => ({ ...prev, [field]: date }))
        }
    }

    const handleEditDateChange = (field) => (date) => {
        if (date) {
            setCurrentBanners(prev => ({ ...prev, [field]: date }))
        }
    }

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedImageUrl = await uploadImageToFirebase(file, 'banners');

            if (uploadedImageUrl) {
                setImagePreview(uploadedImageUrl);
                setNewBanners((prev) => ({
                    ...prev,
                    banner_image: uploadedImageUrl,
                }));
            } else {
                console.error('Image upload failed');
            }
        }
    };

    const handleEditImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadedImageUrl = await uploadImageToFirebase(file, 'banners');
            if (uploadedImageUrl) {
                setEditImagePreview(uploadedImageUrl);
                setCurrentBanners((prev) => ({ ...prev, banner_image: uploadedImageUrl }));
            } else {
                console.error('Image upload failed');
            }
        }
    };

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
                    <CardTitle>Create New Banner</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm">Title</label>
                            <Input
                                id="title"
                                name="banner_title"
                                value={newBanners.banner_title}
                                onChange={handleInputChange}
                                className="mt-1"
                                placeholder="Enter banner title"
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm">Description</label>
                            <Textarea
                                id="description"
                                name="banner_description"
                                value={newBanners.banner_description}
                                onChange={handleInputChange}
                                className="mt-1"
                                placeholder="Enter banner description"
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                        </div>

                        <div>
                            <label htmlFor="coupon" className="block text-sm">Coupon</label>
                            <Select value={newBanners.coupon_id} onValueChange={(value) => handleInputChange(value)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select a coupon" />
                                </SelectTrigger>
                                <SelectContent>
                                    {coupons.map((coupon) => (
                                        <SelectItem key={coupon.id} value={coupon.id}>
                                            Code-{coupon.coupon_code} / Discount-{coupon.discount_value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.coupon && <p className="mt-1 text-sm text-red-600">{errors.coupon}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newBanners.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newBanners.start_date ? format(newBanners.start_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newBanners.start_date}
                                            onSelect={handleDateChange('start_date')}
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
                                                !newBanners.end_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newBanners.end_date ? format(newBanners.end_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newBanners.end_date}
                                            onSelect={handleDateChange('end_date')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.dates && <p className="text-red-600 text-sm">{errors.dates}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm">Banner Image</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-1"
                            />
                            {imagePreview && <img src={imagePreview} alt="Banner Preview" className="mt-2 w-32 h-32 object-cover" />}
                            {errors.banner_image && <p className="mt-1 text-sm text-red-600">{errors.banner_image}</p>}
                        </div>

                        <Button type="submit" disabled={isLoading} className='bg-red-600 hover:bg-red-700'>
                            Create Banner
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Existing Banners</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Coupon ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        {
                            banners ? (
                                <TableBody>
                                    {banners?.map((banner) => {
                                        const isActive = new Date(banner.end_date) >= new Date();
                                        return (
                                            <TableRow key={banner.id}>
                                                <TableCell>{banner.coupon_id}</TableCell>
                                                <TableCell>{banner.banner_title}</TableCell>
                                                <TableCell className='text-wrap'>{banner.banner_description}</TableCell>
                                                <TableCell><img height={130} width={130} alt='banner image' src={banner.banner_image}></img></TableCell>
                                                <TableCell>{format(new Date(banner.start_date), "PPP")}</TableCell>
                                                <TableCell>{format(new Date(banner.end_date), "PPP")}</TableCell>
                                                <TableCell>{isActive ? "Active" : "Inactive"}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => setCurrentBanners(banner)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Banner</DialogTitle>
                                                            </DialogHeader>

                                                            {currentBanners && (
                                                                <form onSubmit={handleSubmitEdit} className="grid gap-4 pb-4">
                                                                    <div className="grid grid-cols-4 gap-12 items-center">
                                                                        <Label htmlFor="edit-banner-title" className="text-right">Banner Title</Label>
                                                                        <Input
                                                                            id="edit-banner-title"
                                                                            value={currentBanners.banner_title || ""}
                                                                            onChange={(e) => setCurrentBanners({ ...currentBanners, banner_title: e.target.value })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div >
                                                                        <label htmlFor="edit-description" className="block text-sm">Description</label>
                                                                        <Textarea
                                                                            id="edit-description"
                                                                            value={currentBanners.banner_description || ""}
                                                                            onChange={(e) => setCurrentBanners({ ...currentBanners, banner_description: e.target.value })}
                                                                            className="mt-1"
                                                                        />
                                                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                                                    </div>
                                                                    <div>
                                                                        <label htmlFor="coupon" className="block text-sm">Coupon</label>
                                                                        <Select value={currentBanners.coupon_id} onValueChange={(value) => setCurrentBanners({ ...currentBanners, coupon_id: value })}>
                                                                            <SelectTrigger className="mt-1">
                                                                                <SelectValue placeholder="Select a coupon" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {coupons.map((coupon) => (
                                                                                    <SelectItem key={coupon.id} value={coupon.id}>
                                                                                        Code-{coupon.coupon_code} / Discount-{coupon.discount_value}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        {errors.coupon && <p className="mt-1 text-sm text-red-600">{errors.coupon}</p>}
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label>Start Date</Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "w-full justify-start text-left font-normal",
                                                                                        !currentBanners.start_date && "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {currentBanners.start_date ? format(currentBanners.start_date, "PPP") : <span>Pick a date</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={currentBanners.start_date}
                                                                                    onSelect={handleEditDateChange('start_date')}
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
                                                                                        !currentBanners.end_date && "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {currentBanners.end_date ? format(currentBanners.end_date, "PPP") : <span>Pick a date</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={currentBanners.end_date}
                                                                                    onSelect={handleEditDateChange('end_date')}
                                                                                    initialFocus
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                    <div>
                                                                        <label htmlFor="image" className="block text-sm">Banner Image (if you don't choose a new image, the old one will be retained)</label>
                                                                        <input
                                                                            ref={fileInputRef}
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={handleEditImageChange}
                                                                            className="mt-1"
                                                                        />
                                                                        {editImagePreview && <img src={editImagePreview} alt="Banner Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
                                                                        {errors.banner_image && <p className="mt-1 text-sm text-red-600">{errors.banner_image}</p>}
                                                                    </div>
                                                                    <Button className='bg-red-600 hover:bg-red-700 w-auto' type="submit">Save changes</Button>
                                                                </form>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
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
                                                                    This action cannot be undone. This will permanently delete the user account
                                                                    and remove their data from our servers.
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
