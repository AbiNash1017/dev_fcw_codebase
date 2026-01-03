'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Edit, Loader, Trash } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState()
    const [newCoupon, setNewCoupon] = useState({
        coupon_code: '',
        fitness_centre_id: 0,
        start_date: new Date(),
        end_date: new Date(),
        discount_value: 0,
        type: 'flat',
        max_discount: 0,
        min_purchase: 0,
        approved: true
    })
    const [currentCoupon, setCurrentCoupon] = useState({
        id: 0,
        coupon_code: '',
        fitness_centre_id: 0,
        start_date: new Date(),
        end_date: new Date(),
        discount_value: 0,
        type: 'flat',
        max_discount: 0,
        min_purchase: 0,
        approved: true
    })
    const [loading, setLoading] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
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
                    'authorization': `bearer ${token}`
                }
            });
            if (!response.ok) {
                alert(response)
            }
            const data = await response.json();
            const fetchedCoupons = data.data
            const approvedCoupons = fetchedCoupons.filter((coupon) => coupon.approved === true)
            setCoupons(approvedCoupons);
            console.log(fetchedCoupons)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    const addCoupon = async (coupon) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const { coupon_code, discount_value, type, end_date, max_discount, min_purchase, start_date } = coupon;
            console.log('Sending coupon:', JSON.stringify(coupon));
            const response = await fetch(`/api/admin/coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${token}`,
                },
                body: JSON.stringify({
                    coupon_code,
                    discount_value: parseInt(discount_value),
                    type,
                    end_date,
                    max_discount: parseInt(max_discount),
                    min_purchase: parseInt(min_purchase),
                    start_date
                })
            })
            const data = await response.json();
            console.log("reached")
            console.log(data.message)
            if (data.message === 'OK') {
                alert('coupon added successfully!');
                fetchCoupons();
            } else {
                alert('Error adding coupon!');
            }
        } catch (error) {
            console.log(error)
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
                'authorization': `bearer ${token}`,
            }
        })
        const data = await response.json()
        console.log(data)
        let responseMessage = data.message
        if (responseMessage === "Deleted coupon!") {
            alert(responseMessage)
        }
        fetchCoupons()
    }

    const handleEditCoupon = async (coupon) => {
        console.log(coupon.id)
        console.log(coupon)
        if (!user) return;
        const token = await user.getIdToken();
        const { coupon_code, discount_value, type, end_date, max_discount, min_purchase, start_date } = coupon;
        const response = await fetch(`/api/admin/coupon/${coupon.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                coupon_code,
                discount_value: parseInt(discount_value),
                type,
                end_date,
                max_discount: parseInt(max_discount),
                min_purchase: parseInt(min_purchase),
                start_date
            })
        })
        const data = await response.json()
        if (data.message === "OK") {
            alert("Edit successful!")
            setIsEditModalOpen(false);
            fetchCoupons()
        }
        else
            alert('error editing coupon')
    }

    useEffect(() => {
        if (user)
            fetchCoupons();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setNewCoupon(prev => ({ ...prev, [name]: value }))
    }

    const handleRadioChange = (value) => {
        setNewCoupon(prev => ({ ...prev, type: value }))
    }

    const handleDateChange = (field) => (date) => {
        if (date) {
            setNewCoupon(prev => ({ ...prev, [field]: date }))
        }
    }

    const handleEditRadioChange = (value) => {
        setCurrentCoupon(prev => ({ ...prev, type: value }))
    }

    const handleEditDateChange = (field) => (date) => {
        if (date) {
            setCurrentCoupon(prev => ({ ...prev, [field]: date }))
        }
    }

    const validateForm = () => {
        const errors = {};
        if (!newCoupon.coupon_code) errors.coupon_code = "Coupon code is required";
        if (newCoupon.discount_value <= 0) errors.discount_value = "Discount value must be greater than 0";
        if (!newCoupon.start_date || !newCoupon.end_date || newCoupon.end_date <= newCoupon.start_date) {
            errors.dates = "Start date must be before end date";
        }
        if (newCoupon.max_discount <= 0) errors.max_discount = "Max discount must be greater than 0";
        if (newCoupon.min_purchase <= 0) errors.min_purchase = "Minimum purchase amount must be greater than 0";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await addCoupon(newCoupon);
            setNewCoupon({
                coupon_code: '',
                fitness_centre_id: 0,
                start_date: new Date(),
                end_date: new Date(),
                discount_value: 0,
                type: 'flat',
                max_discount: 0,
                min_purchase: 0,
                approved: true
            });
            setFormErrors({});
        }
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (currentCoupon) {
            handleEditCoupon(currentCoupon);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Coupon</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="coupon_code">Coupon Code</Label>
                                <Input
                                    id="coupon_code"
                                    name="coupon_code"
                                    value={newCoupon.coupon_code}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.coupon_code && <p className="text-red-600 text-sm">{formErrors.coupon_code}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fitnessCenter">Fitness Center</Label>
                                <Input
                                    id="fitness_centre_id"
                                    name="fitness_centre_id"
                                    type="number"
                                    value={newCoupon.fitness_centre_id}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount_value">Discount Value</Label>
                                <Input
                                    id="discount_value"
                                    name="discount_value"
                                    type="number"
                                    value={newCoupon.discount_value}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.discount_value && <p className="text-red-600 text-sm">{formErrors.discount_value}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newCoupon.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newCoupon.start_date ? format(newCoupon.start_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newCoupon.start_date}
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
                                                !newCoupon.end_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newCoupon.end_date ? format(newCoupon.end_date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newCoupon.end_date}
                                            onSelect={handleDateChange('end_date')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {formErrors.dates && <p className="text-red-600 text-sm">{formErrors.dates}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_discount">Max Discount</Label>
                                <Input
                                    id="max_discount"
                                    name="max_discount"
                                    type="number"
                                    value={newCoupon.max_discount}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.max_discount && <p className="text-red-600 text-sm">{formErrors.max_discount}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_purchase">Minimum Purchase Amount</Label>
                                <Input
                                    id="min_purchase"
                                    name="min_purchase"
                                    type="number"
                                    value={newCoupon.min_purchase}
                                    onChange={handleInputChange}
                                    required
                                />
                                {formErrors.min_purchase && <p className="text-red-600 text-sm">{formErrors.min_purchase}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <RadioGroup defaultValue="flat" onValueChange={handleRadioChange}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="flat" id="flat" />
                                        <Label htmlFor="flat">Flat</Label>
                                        <RadioGroupItem value="percent" id="percent" />
                                        <Label htmlFor="percent">Percent</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <Button type="submit" className="bg-red-600 hover:bg-red-700">Create Coupon</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fitness Centre</TableHead>
                                <TableHead>Coupon Code</TableHead>
                                <TableHead>Discount Value</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Max Discount</TableHead>
                                <TableHead>Min Purchase</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
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
                                                <TableCell>{coupon.fitness_centre_id}</TableCell>
                                                <TableCell>{coupon.coupon_code}</TableCell>
                                                <TableCell>{coupon.discount_value}</TableCell>
                                                <TableCell>{coupon.type}</TableCell>
                                                <TableCell>{coupon.max_discount}</TableCell>
                                                <TableCell>{coupon.min_purchase}</TableCell>
                                                <TableCell>{format(new Date(coupon.start_date), "PPP")}</TableCell>
                                                <TableCell>{format(new Date(coupon.end_date), "PPP")}</TableCell>
                                                <TableCell>{isActive ? "Active" : "Inactive"}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => setCurrentCoupon(coupon)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit User</DialogTitle>
                                                                <DialogDescription>Make changes to the user here.</DialogDescription>
                                                            </DialogHeader>

                                                            {currentCoupon && (
                                                                <form onSubmit={handleSubmitEdit} className="grid gap-4 py-4">
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label htmlFor="edit-coupon-code" className="text-right">Coupon Code</Label>
                                                                        <Input
                                                                            id="edit-coupon-code"
                                                                            value={currentCoupon?.coupon_code || ""}
                                                                            onChange={(e) => setCurrentCoupon({ ...currentCoupon, coupon_code: e.target.value })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label htmlFor="edit-fitness-centre" className="text-right">Fitness Centre</Label>
                                                                        <Input
                                                                            id="edit-fitness-centre"
                                                                            type='number'
                                                                            value={currentCoupon?.fitness_centre_id || ""}
                                                                            onChange={(e) => setCurrentCoupon({ ...currentCoupon, fitness_centre_id: parseInt(e.target.value) })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label htmlFor="edit-discount_value" className="text-right">Discount Value</Label>
                                                                        <Input
                                                                            id="edit-discount_value"
                                                                            type='number'
                                                                            value={currentCoupon?.discount_value || ""}
                                                                            onChange={(e) => setCurrentCoupon({ ...currentCoupon, discount_value: parseInt(e.target.value) })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Start Date</Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "w-full justify-start text-left font-normal",
                                                                                        !currentCoupon.start_date && "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {currentCoupon.start_date ? format(currentCoupon.start_date, "PPP") : <span>Pick a date</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={currentCoupon.start_date}
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
                                                                                        !currentCoupon.end_date && "text-muted-foreground"
                                                                                    )}
                                                                                >
                                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                                    {currentCoupon.end_date ? format(currentCoupon.end_date, "PPP") : <span>Pick a date</span>}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-auto p-0">
                                                                                <Calendar
                                                                                    mode="single"
                                                                                    selected={currentCoupon.end_date}
                                                                                    onSelect={handleEditDateChange('end_date')}
                                                                                    initialFocus
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>

                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label htmlFor="edit-max_discount" className="text-right">Max Discount</Label>
                                                                        <Input
                                                                            id="edit-max_discount"
                                                                            type='number'
                                                                            value={currentCoupon.max_discount || ""}
                                                                            onChange={(e) => setCurrentCoupon({ ...currentCoupon, max_discount: parseInt(e.target.value) })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                                        <Label htmlFor="edit-min_purchase" className="text-right">Min Purcahse</Label>
                                                                        <Input
                                                                            id="edit-min_purchase"
                                                                            type='number'
                                                                            value={currentCoupon.min_purchase || ""}
                                                                            onChange={(e) => setCurrentCoupon({ ...currentCoupon, min_purchase: parseInt(e.target.value) })}
                                                                            className="col-span-3"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-row items-center space-x-7">
                                                                        <Label>Discount Type</Label>
                                                                        <RadioGroup defaultValue={currentCoupon.type} onValueChange={handleEditRadioChange}>
                                                                            <div className="flex items-center space-x-2">
                                                                                <RadioGroupItem value="flat" id="flat" />
                                                                                <Label htmlFor="flat">Flat</Label>
                                                                                <RadioGroupItem value="percent" id="percent" />
                                                                                <Label htmlFor="percent">Percent</Label>
                                                                            </div>
                                                                        </RadioGroup>
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
                        }
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminCoupons
