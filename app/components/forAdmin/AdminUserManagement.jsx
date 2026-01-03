"use client"

import { useEffect, useState } from "react"
import { Edit, Trash, Search, Loader, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"

const AdminUserManagement = () => {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState({
        id: 0,
        first_name: "",
        last_name: "",
        email_id: "",
        profile_image: "",
        gender: "",
        dob: "",
        role: "",
        state: "",
        city: "",
        location: "",
        mobile_no: "",
    })
    const [loading, setLoading] = useState(false)
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const handleEditUser = async (user) => {
        console.log(user.id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/user/edit/${user.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                authorization: `bearer ${token}`,
            },
            body: JSON.stringify({
                ...user,
            }),
        })
        const data = await response.json()
        if (data.message === "OK") {
            alert("Edit successful!")
            setIsEditModalOpen(false)
            fetchUsers()
        } else alert("error deleting user")
    }

    const handleDeleteUser = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/user/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: `bearer ${token}`,
            },
        })
        const data = await response.json()
        console.log(data)
        const responseMessage = data.message
        if (responseMessage === "Deleted User!") {
            alert(responseMessage)
            fetchUsers()
        }
        fetchUsers()
    }

    const fetchUsers = async () => {
        setLoading(true)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/user/getAll`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: `bearer ${token}`,
            },
        })
        const data = await response.json()
        const fetchedUsers = data.users
        //console.log(fetchedUsers)
        setUsers(fetchedUsers)
        setFilteredUsers(fetchedUsers)
        setLoading(false)
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        const lowerQuery = query.toLowerCase()
        const filtered = users.filter((user) => {
            const userValues = Object.values(user).join(" ").toLowerCase()
            return userValues.includes(lowerQuery)
        })
        setFilteredUsers(filtered)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (currentUser) {
            handleEditUser(currentUser)
        }
    }

    useEffect(() => {
        if (user) fetchUsers()
    }, [user])

    useEffect(() => {
        console.log(users)
    }, [users])

    const indexOfLastUser = currentPage * itemsPerPage
    const indexOfFirstUser = indexOfLastUser - itemsPerPage
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-[500px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users"
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            {/* <TableHead>Prof. Img</TableHead> */}
                            <TableHead>Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>DoB</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Mobile number</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    {loading ? (
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Loader className="animate-spin h-8 w-8" />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {currentUsers?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    {/* <TableCell>
                    <Image src={user.profile_image as string || StockProfile} alt="Profile Image" className='w-10' />
                  </TableCell> */}
                                    <TableCell>{user.first_name + " " + user.last_name}</TableCell>
                                    <TableCell>{user.gender}</TableCell>
                                    <TableCell>{user.email_id}</TableCell>
                                    <TableCell>{new Date(user.dob).toLocaleDateString("en-IN")}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.state}</TableCell>
                                    <TableCell>{user.city}</TableCell>
                                    <TableCell>{user.location}</TableCell>
                                    <TableCell>{user.mobile_no}</TableCell>
                                    <TableCell>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="sm" onClick={() => setCurrentUser(user)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit User</DialogTitle>
                                                    <DialogDescription>Make changes to the user here.</DialogDescription>
                                                </DialogHeader>

                                                {currentUser && (
                                                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-first-name" className="text-right">
                                                                First Name
                                                            </Label>
                                                            <Input
                                                                id="edit-first-name"
                                                                value={currentUser?.first_name || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-last-name" className="text-right">
                                                                Last Name
                                                            </Label>
                                                            <Input
                                                                id="edit-last-name"
                                                                value={currentUser?.last_name || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-gender" className="text-right">
                                                                Gender
                                                            </Label>
                                                            <Select
                                                                name="edit-gender"
                                                                onValueChange={(value) => setCurrentUser({ ...currentUser, gender: value })}
                                                            >
                                                                <SelectTrigger className="mt-1 w-100">
                                                                    <SelectValue placeholder="Gender" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="male">Male</SelectItem>
                                                                    <SelectItem value="female">Female</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-email" className="text-right">
                                                                Email
                                                            </Label>
                                                            <Input
                                                                id="edit-email"
                                                                value={currentUser?.email_id || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, email_id: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-dob" className="text-right">
                                                                DoB
                                                            </Label>
                                                            <Input
                                                                id="edit-dob"
                                                                value={currentUser?.dob || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, dob: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-role" className="text-right">
                                                                Role
                                                            </Label>
                                                            <Input
                                                                id="edit-role"
                                                                value={currentUser.role || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-state" className="text-right">
                                                                State
                                                            </Label>
                                                            <Input
                                                                id="edit-state"
                                                                value={currentUser.state || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, state: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-city" className="text-right">
                                                                City
                                                            </Label>
                                                            <Input
                                                                id="edit-city"
                                                                value={currentUser.city || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, city: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-location" className="text-right">
                                                                Location
                                                            </Label>
                                                            <Input
                                                                id="edit-location"
                                                                value={currentUser.location || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, location: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-4 items-center gap-4">
                                                            <Label htmlFor="edit-mobile-no" className="text-right">
                                                                Mobile Number
                                                            </Label>
                                                            <Input
                                                                id="edit-mobile-no"
                                                                value={currentUser.mobile_no || ""}
                                                                onChange={(e) => setCurrentUser({ ...currentUser, mobile_no: e.target.value })}
                                                                className="col-span-3"
                                                            />
                                                        </div>
                                                        <Button className="bg-red-600 hover:bg-red-700 w-auto" type="submit">
                                                            Save changes
                                                        </Button>
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
                                                        This action cannot be undone. This will permanently delete the user account and remove their
                                                        data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
                {filteredUsers.length > 0 && (
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

export default AdminUserManagement
