'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { AlertDialog, AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { add } from 'date-fns'

const VendorMembershipManagement = () => {
    const [plans, setPlans] = useState([])
    const [newPlan, setNewPlan] = useState({ name: '', duration: 0, price: 0 })
    const [editingPlan, setEditingPlan] = useState(null)
    const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false)
    const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false)

    const [userMemberships, setUserMemberships] = useState([])
    const [newUserMembership, setNewUserMembership] = useState({ userId: 0, planId: 0 })
    const [editingUserMembership, setEditingUserMembership] = useState(null)
    const [isEditUserMembershipModalOpen, setIsEditUserMembershipModalOpen] = useState(false)
    const [isDeleteUserMembershipModalOpen, setIsDeleteUserMembershipModalOpen] = useState(false)

    const [userSearchInput, setUserSearchInput] = useState('')
    const [foundUser, setFoundUser] = useState(null)

    const { user, loading } = useAuth()
    const router = useRouter()

    const handleSubmitPlan = async (e) => {
        e.preventDefault();
        console.log(newPlan)
        if (newPlan !== undefined) {
            await addMembershipPlan(newPlan);
            setNewPlan({
                name: '',
                duration: 0,
                price: 0
            })
        }
    };

    const handleAddMembership = async (e) => {
        e.preventDefault();
        console.log("handleAddMembership called");

        if (!foundUser) {
            alert("Please search for a user first.");
            return;
        }

        if (!newUserMembership.planId) {
            alert("Please select a plan.");
            return;
        }

        try {
            await addMembership(newUserMembership, foundUser);
            setNewUserMembership({ userId: 0, planId: 0 });
            setFoundUser(null);
            setUserSearchInput('');
        } catch (error) {
            console.error("Error adding membership:", error);
            alert("Failed to add membership. Please try again.");
        }
    };

    const fetchMembershipPlans = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membershipPlan`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        if (data.message === "OK") {
            setPlans(data.data)
        }
    }

    const addMembershipPlan = async (addPlan) => {
        console.log("reached")
        if (!user) return;
        const token = await user.getIdToken();
        const { name, price, duration } = addPlan
        console.log(name, price, duration)
        const response = await fetch(`/api/dashboard/membershipPlan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                name,
                price,
                duration
            })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("successful")
            fetchMembershipPlans()
        }
        else {
            alert(data.error)
        }
    }

    const updateMembershipPlan = async (plan) => {
        console.log("planid", plan.id)
        console.log("plan", plan)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membershipPlan/${plan.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                ...plan
            })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("edit successful")
            setIsEditPlanModalOpen(false)
            fetchMembershipPlans()
        }
        else {
            alert("edit unsuccessful")
        }
    }

    const deleteMembershipPlan = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membershipPlan/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
        if (data.message === "OK") {
            alert("success")
            fetchMembershipPlans()
        }
    }

    const fetchUserDetails = async (emailOrPhone) => {
        console.log("emailorphone", emailOrPhone)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/getUserByEmailOrPhone?q=${emailOrPhone}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        if (data.message === "OK") {
            setFoundUser(data.data)
        }
    }

    const addMembership = async (userMembership, user) => {
        const { planId } = userMembership;
        const { id } = user;

        console.log("Adding membership", planId, id);

        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membership`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                plan_id: planId,
                user_id: id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API error:", data);
            alert("Error adding membership: " + data.error);
            return;
        }

        if (data.message === 'OK') {
            alert("Membership added successfully");
            fetchMemberships();
        } else {
            alert(data.error);
        }
    };

    const fetchMemberships = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membership`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        if (data.message === "OK") {
            setUserMemberships(data.data)
        }
    }

    const updateMemberships = async (membership) => {
        console.log("planid", membership.id)
        console.log("plan", membership)
        if (!user) return;
        const token = await user.getIdToken();
        let { start_date, end_date } = membership
        if (start_date) start_date = new Date(start_date).toISOString();
        if (end_date) end_date = new Date(end_date).toISOString();
        console.log(start_date, end_date)
        const response = await fetch(`/api/dashboard/membership/${membership.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                start_date,
                end_date
            })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("edit successful")
            setIsEditUserMembershipModalOpen(false)
            fetchMemberships()
        }
        else {
            alert(data.error)
        }
    }

    const deleteMemberships = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/dashboard/membership/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
        if (data.message === "OK") {
            alert("success")
            fetchMemberships()
        }
    }

    useEffect(() => {
        if (user) {
            fetchMembershipPlans()
            fetchMemberships()
        }
    }, [user])

    return (
        <div className="container mx-auto p-4 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add Membership Plan</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitPlan}>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Plan Name"
                                value={newPlan.name}
                                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                            />
                            <Input
                                type="number"
                                placeholder="Duration (days)"
                                value={newPlan.duration || ''}
                                onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })}
                            />
                            <Input
                                type="number"
                                placeholder="Price"
                                value={newPlan.price || ''}
                                onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                            />
                            <Button type='submit' className="bg-red-600 hover:bg-red-700 text-white">
                                <Plus size={16} className="mr-2" /> Add Plan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Membership Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Duration (days)</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map(plan => (
                                <TableRow key={plan.id}>
                                    <TableCell>{plan.name}</TableCell>
                                    <TableCell>{plan.duration}</TableCell>
                                    <TableCell>&#8377;{plan.price}</TableCell>
                                    <TableCell>
                                        <Dialog open={isEditPlanModalOpen} onOpenChange={setIsEditPlanModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingPlan(plan)}
                                                    className="text-black mr-2"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Membership Plan</DialogTitle>
                                                </DialogHeader>
                                                <Label htmlFor='plan-name'>Plan Name</Label>
                                                <Input
                                                    name='plan-name'
                                                    placeholder="Plan Name"
                                                    value={editingPlan?.name || ''}
                                                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                                                    className="mb-2"
                                                />
                                                <Label htmlFor='duration'>Duration</Label>
                                                <Input
                                                    name='duration'
                                                    type="number"
                                                    placeholder="Duration (months)"
                                                    value={editingPlan?.duration || ''}
                                                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, duration: parseInt(e.target.value) } : null)}
                                                    className="mb-2"
                                                />
                                                <Label htmlFor='price'>Price</Label>
                                                <Input
                                                    type="price"
                                                    placeholder="Price"
                                                    value={editingPlan?.price || ''}
                                                    onChange={(e) => setEditingPlan(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                                                    className="mb-4"
                                                />
                                                <Button onClick={() => { updateMembershipPlan(editingPlan) }} className="bg-red-600 hover:bg-red-700 text-white">
                                                    Save Changes
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog open={isDeletePlanModalOpen} onOpenChange={setIsDeletePlanModalOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingPlan(plan)}
                                                    className="text-black"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the membership plan
                                                        and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => deleteMembershipPlan(editingPlan.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Create User Membership</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddMembership} className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="User Email or Phone"
                                value={userSearchInput}
                                onChange={(e) => setUserSearchInput(e.target.value)}
                            />
                            <Button type="button" onClick={() => fetchUserDetails(userSearchInput)} className="bg-red-600 hover:bg-red-700 text-white">
                                Search User
                            </Button>
                        </div>
                        {foundUser && (
                            <div className="bg-gray-100 p-2 rounded">
                                <p>ID: {foundUser.id}</p>
                                <p>User: {foundUser.first_name} {foundUser.last_name}</p>
                                <p>Email: {foundUser.email_id}</p>
                                <p>Phone: {foundUser.mobile_no}</p>
                            </div>
                        )}
                        <Select onValueChange={(value) => setNewUserMembership({ ...newUserMembership, planId: parseInt(value) })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id.toString()}>{plan.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Create Membership</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Memberships</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Membership ID</TableHead>
                                <TableHead>User ID</TableHead>
                                <TableHead>Plan ID</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Pass</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userMemberships.map(membership => (
                                <TableRow key={membership.id}>
                                    <TableCell>{membership.id}</TableCell>
                                    <TableCell>{membership.user_id}</TableCell>
                                    <TableCell>{membership.plan_id}</TableCell>
                                    <TableCell>{new Date(membership.start_date).toLocaleDateString("en-GB")}</TableCell>
                                    <TableCell>{new Date(membership.end_date).toLocaleDateString("en-GB")}</TableCell>
                                    <TableCell>{membership.pass}</TableCell>
                                    <TableCell>
                                        <Dialog open={isEditUserMembershipModalOpen} onOpenChange={setIsEditUserMembershipModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingUserMembership(membership)}
                                                    className="text-black mr-2"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit User Membership</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    type="date"
                                                    value={editingUserMembership?.start_date || ''}
                                                    onChange={(e) => setEditingUserMembership(prev => prev ? { ...prev, start_date: e.target.value } : null)}
                                                    className="mb-2"
                                                />
                                                <Input
                                                    type="date"
                                                    value={editingUserMembership?.end_date || ''}
                                                    onChange={(e) => setEditingUserMembership(prev => prev ? { ...prev, end_date: e.target.value } : null)}
                                                    className="mb-4"
                                                />
                                                <Button onClick={() => { updateMemberships(editingUserMembership) }} className="bg-red-600 hover:bg-red-700 text-white">
                                                    Save Changes
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog open={isDeleteUserMembershipModalOpen} onOpenChange={setIsDeleteUserMembershipModalOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingUserMembership(membership)}
                                                    className="text-black"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the membership
                                                        and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => deleteMemberships(editingUserMembership.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default VendorMembershipManagement
