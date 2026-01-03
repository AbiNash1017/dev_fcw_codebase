"use client"

import { useState, useEffect } from "react"
import { Edit, Trash, Search, Loader, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"

// type Category = {
//   id: number;
//   name: string;
// }

const AdminVendorManagement = () => {
    const [vendors, setVendors] = useState([])
    const [filteredVendors, setFilteredVendors] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentVendor, setCurrentVendor] = useState(null)
    const { user, loading } = useAuth()
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    // const [categories, setCategories] = useState([])
    // const [newCategory, setNewCategory] = useState({
    //   name: ''
    // })
    // const [currentCategory, setCurrentCategory] = useState({
    //   id: 0,
    //   name: ''
    // })
    const router = useRouter()

    useEffect(() => {
        if (user) fetchVendors()
        // fetchCategories()
    }, [user])

    const fetchVendors = async () => {
        setIsLoading(true)
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/vendor/getAll`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
            })
            const data = await response.json()
            const fetchedVendors = data.data
            console.log("kfgkew" + fetchedVendors)
            //fetch when they click see pending instead of fetching everything at once
            const vendorsWithPayments = await Promise.all(
                fetchedVendors.map(async (vendor) => {
                    const paymentResponse = await fetch(
                        `/api/admin/getVendorPendingPayments?fitness_centre_id=${vendor.id}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: `Bearer ${token}`,
                            },
                        },
                    )
                    const paymentData = await paymentResponse.json()
                    return { ...vendor, pending_payment: paymentData.total_pending_payment }
                }),
            )

            setVendors(vendorsWithPayments)
            setFilteredVendors(vendorsWithPayments)
        } catch (error) {
            console.error("Error fetching vendors:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase()
        setSearchQuery(query)
        const filtered = vendors.filter((vendor) => Object.values(vendor).join(" ").toLowerCase().includes(query))
        setFilteredVendors(filtered)
    }

    const handleEditVendor = async () => {
        if (!currentVendor) return

        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/vendor/edit/${currentVendor.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    fitness_centre_id: currentVendor.id,
                    centre_name: currentVendor.centre_name,
                    centre_description: currentVendor.centre_description,
                    header_image: currentVendor.header_image,
                }),
            })
            if (response.ok) {
                setIsEditModalOpen(false)
                fetchVendors()
            } else {
                alert("Failed to edit vendor")
            }
        } catch (error) {
            alert("Error editing vendor:" + error)
        }
    }

    const handleDeleteVendor = async (fitness_centre_id) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/vendor/delete/${fitness_centre_id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                fetchVendors()
            } else {
                alert("Failed to delete vendor" + response)
            }
        } catch (error) {
            console.log("Error deleting vendor:", error)
        }
    }

    const handleUpdatePayment = async (fitness_centre_id) => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/updateVendorPayment`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    payment_status: true,
                    fitness_centre_id: fitness_centre_id,
                }),
            })

            if (response.ok) {
                fetchVendors()
            } else {
                alert("Failed to update payment status")
            }
        } catch (error) {
            console.log("Error updating payment status:", error)
        }
    }

    const handlePaymentClick = (vendor) => {
        setSelectedVendor(vendor)
        setPaymentDialogOpen(true)
    }

    // Get current vendors
    const indexOfLastVendor = currentPage * itemsPerPage
    const indexOfFirstVendor = indexOfLastVendor - itemsPerPage
    const currentVendors = filteredVendors.slice(indexOfFirstVendor, indexOfLastVendor)
    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-[500px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search vendors" className="pl-8" value={searchQuery} onChange={handleSearch} />
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                {/* <TableHead>Pending Payment</TableHead> */}
                                <TableHead>Payment Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentVendors?.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell>{vendor.id}</TableCell>
                                    <TableCell>{vendor.centre_name}</TableCell>
                                    <TableCell>{vendor.centre_description}</TableCell>
                                    {/* <TableCell>${vendor.pending_payment?.toFixed(2)}</TableCell> */}
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => handlePaymentClick(vendor)}>
                                            {vendor.payment_request === true ? "Pending" : "Paid"}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCurrentVendor(vendor)
                                                            setIsEditModalOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Vendor</DialogTitle>
                                                        <DialogDescription>Make changes to the vendor here.</DialogDescription>
                                                    </DialogHeader>
                                                    {currentVendor && (
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-centre_name" className="text-right">
                                                                    Name
                                                                </Label>
                                                                <Input
                                                                    id="edit-centre_name"
                                                                    value={currentVendor.centre_name}
                                                                    onChange={(e) => setCurrentVendor({ ...currentVendor, centre_name: e.target.value })}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="edit-centre-description" className="text-right">
                                                                    Description
                                                                </Label>
                                                                <Input
                                                                    id="edit-centre-description"
                                                                    value={currentVendor.centre_description}
                                                                    onChange={(e) =>
                                                                        setCurrentVendor({ ...currentVendor, centre_description: e.target.value })
                                                                    }
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <DialogFooter>
                                                        <Button className="bg-red-600 hover:bg-red-700" type="submit" onClick={handleEditVendor}>
                                                            Save changes
                                                        </Button>
                                                    </DialogFooter>
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
                                                            This action cannot be undone. This will permanently delete the vendor and remove their
                                                            data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => handleDeleteVendor(vendor.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            {vendor.payment_request && vendor.pending_payment >= 0 && (
                                                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Payment Details</DialogTitle>
                                                        </DialogHeader>
                                                        {selectedVendor && (
                                                            <div className="py-4">
                                                                <p>Vendor: {selectedVendor.centre_name}</p>
                                                                <p>Amount to Pay: &#8377;{selectedVendor.pending_payment?.toFixed(2)}</p>
                                                            </div>
                                                        )}
                                                        <DialogFooter>
                                                            <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                                                            <Button
                                                                onClick={() => {
                                                                    if (selectedVendor) {
                                                                        handleUpdatePayment(selectedVendor.id)
                                                                        setPaymentDialogOpen(false)
                                                                    }
                                                                }}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Confirm Payment
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {filteredVendors.length > 0 && (
                    <div className="flex justify-center space-x-2 mt-4">
                        <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default AdminVendorManagement
