import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

const AdminCommunication = () => {

    const router = useRouter()

    const { user, loading } = useAuth()
    const [platformFee, setPlatformFee] = useState()
    const [newPlatformFee, setNewPlatformFee] = useState()
    const [videoLinks, setVideoLinks] = useState([])
    const [newLink, setNewLink] = useState('')
    const [editingLink, setEditingLink] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [categories, setCategories] = useState([])
    const [newCategory, setNewCategory] = useState({
        name: ''
    })
    const [currentCategory, setCurrentCategory] = useState({
        id: 0,
        name: ''
    })
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+$/;

    useEffect(() => {
        if (user) {
            fetchPlatformFee()
            handleFetchVideo()
            fetchCategories()
        }
    }, [user])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(newPlatformFee)
        if (newPlatformFee !== undefined) {
            await updatePlatformFee(newPlatformFee);
            setNewPlatformFee(undefined)
        }
    };

    const handleSubmitVideo = async (e) => {
        e.preventDefault();
        console.log(newLink)
        if (newLink !== undefined) {
            await handleAddVideo(newLink);
            setNewLink('')
        }
    };

    const handleSubmitCategory = async (e) => {
        e.preventDefault();
        console.log(newCategory)
        if (!newCategory.name) {
            alert('Please enter a category name')
            return
        }
        if (newCategory !== undefined) {
            await handleAddCategory(newCategory);
            setNewCategory({
                name: ''
            })
        }
    };

    const updatePlatformFee = async (platformFee) => {
        console.log(platformFee)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/updatePlatformFee`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                fee: newPlatformFee
            })
        })
        const data = await response.json()
        console.log(data)
        if (data.message === "OK") {
            alert("update successful!")
            fetchPlatformFee()
        }
        else
            alert('error updating')
    }

    const fetchPlatformFee = async () => {
        console.log("fetch pf")
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/platformFee`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
        if (data.message === 'OK')
            setPlatformFee(data.data.fee)
    }

    const handleFetchVideo = async () => {
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/youtubeLink`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        if (data.message === "OK") {
            setVideoLinks(data.data)
        }
    }

    const handleAddVideo = async (newLink) => {

        if (!youtubeRegex.test(newLink.trim())) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/youtubeLink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({ youtube_link: newLink })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("successful")
            handleFetchVideo()
        }
        else {
            alert('unsuccessful')
        }
    }

    const handleEditVideo = async (video) => {
        console.log(video.id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/youtubeLink/${video.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                ...video
            })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("edit successful")
            setIsEditModalOpen(false)
            handleFetchVideo()
        }
        else {
            alert("edit unsuccessful")
        }
    }

    const handleDeleteVideo = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/youtubeLink/${id}`, {
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
            handleFetchVideo()
        }
    }

    const fetchCategories = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/category`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();
            setCategories(data.data);
            console.log(categories)

        } catch (error) {
            console.log("Error fetching categories:", error);
        }
    }

    const handleAddCategory = async (name) => {
        console.log(name)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/category`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify(name)
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("successful")
            fetchCategories()
        }
        else {
            alert('unsuccessful')
        }
    }

    const handleEditCategory = async (category) => {
        console.log(category.id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/category/${category.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            },
            body: JSON.stringify({
                ...category
            })
        })
        const data = await response.json()
        if (data.message === 'OK') {
            alert("edit successful")
            setIsEditModalOpen(false)
            fetchCategories()
        }
        else {
            alert("edit unsuccessful")
        }
    }

    const handleDeleteCategory = async (id) => {
        console.log(id)
        if (!user) return;
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': `bearer ${token}`
            }
        })
        const data = await response.json()
        console.log(data)
        if (data.message === "OK") {
            fetchCategories()
            alert("success")
        }
    }

    return (
        <div className="space-y-6">
            {/* <Card>
        <CardHeader>
          <CardTitle>Notifications and Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="notification-type">Notification Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="vendors">Vendors Only</SelectItem>
                  <SelectItem value="users">Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="message">Message</label>
              <Textarea id="message" placeholder="Enter your message" rows={4}/>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white">Send Notification</Button>
          </form>
        </CardContent>
      </Card> */}
            <Card>
                <CardHeader>
                    <CardTitle>Platform Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-5">
                            <div className='text-sm'>
                                Current Platform Fee: {platformFee}
                            </div>
                            <div>
                                <div className='flex flex-row gap-5'>
                                    <Label htmlFor="platformFee">New Platform Fee <span className='text-red-600 text-lg'>*</span></Label>
                                    <Input className='w-auto' id="platformFee" type="number" min="0" step="1" value={newPlatformFee ?? ''} required onChange={(e) => setNewPlatformFee(Number(e.target.value))} />
                                    <Button type='submit' className="bg-red-600 hover:bg-red-700 text-white">Update</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>YouTube Video Links</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <form onSubmit={handleSubmitVideo}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <Input
                                        type="text"
                                        placeholder="Enter YouTube video URL"
                                        value={newLink}
                                        onChange={(e) => setNewLink(e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Button type='submit'
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <Plus size={16} className="mr-2" /> Add
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <ul className="space-y-2">
                            {videoLinks?.map(link => (
                                <li key={link.id} className="flex items-center justify-between p-2 rounded bg-gray-100/50">
                                    <span className="truncate text-sm flex-grow mr-2">{link.youtube_link}</span>
                                    <div>
                                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingLink(link)}
                                                    className="text-black mr-2"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit YouTube Link</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    type="text"
                                                    value={editingLink?.youtube_link || ''}
                                                    onChange={(e) => setEditingLink(prev => prev ? { ...prev, youtube_link: e.target.value } : null)}
                                                    className="mb-4"
                                                />
                                                <Button onClick={() => handleEditVideo(editingLink)} className="bg-red-600 hover:bg-red-700 text-white">
                                                    Save Changes
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingLink(link)}
                                                    className="text-black"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the YouTube link
                                                        and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteVideo(link.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Session Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <form onSubmit={handleSubmitCategory}>
                                <div className='flex flex-row gap-5 items-center'>
                                    <Input
                                        type="text"
                                        placeholder="Enter Category name"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ name: e.target.value })}
                                        className="flex-grow"
                                    />
                                    <Button type='submit'
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        <Plus size={16} className="mr-2" /> Add
                                    </Button>
                                </div>
                            </form>
                        </div>
                        <ul className="space-y-2">
                            {categories?.map(category => (
                                <li key={category.id} className="flex items-center justify-between p-2 rounded bg-gray-100/50">
                                    <span className="truncate text-sm flex-grow mr-2">{category.name}</span>
                                    <div>
                                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentCategory(category)}
                                                    className="text-black mr-2"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Category</DialogTitle>
                                                </DialogHeader>
                                                <Input
                                                    name='category-name'
                                                    type="text"
                                                    value={currentCategory?.name || ''}
                                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                                    className="mb-4"
                                                />
                                                <Button onClick={() => handleEditCategory(currentCategory)} className="bg-red-600 hover:bg-red-700 text-white">
                                                    Save Changes
                                                </Button>
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentCategory(category)}
                                                    className="text-black"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the category
                                                        and remove their data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className='bg-red-600 hover:bg-red-700' onClick={() => handleDeleteCategory(currentCategory.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminCommunication
