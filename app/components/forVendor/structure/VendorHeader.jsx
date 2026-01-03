'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/app/context/AuthContext'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const VendorHeader = () => {

    const router = useRouter()
    const { user, logout } = useAuth()

    const [gymDetails, setGymDetails] = useState({
        id: "",
        centre_name: "",
        centre_description: "",
        rating_count: 0,
        rating: 0,
        header_image: "",
        owner_id: "",
        location_id: ""
    })

    useEffect(() => {
        if (user) {
            fetchGymDetails();
        }
    }, [user])

    const fetchGymDetails = async () => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/fitness-center/my`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json()
            // Map the new API response to the state structure if needed
            // The new API returns the FitnessCenter document.
            // The state expects centre_name, etc.
            // My new schema has 'name', 'description', etc.
            // I should map it.
            if (data && !data.error) {
                setGymDetails({
                    ...data,
                    centre_name: data.name,
                    centre_description: data.description,
                })
            }
        } catch (error) {
            console.error("Error fetching gym details:", error);
        }
    }

    const handleLogout = async () => {
        await logout()
    }

    return (
        <header className="text-black">
            <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center">
                    {/* <div className="text-2xl font-bold">
            Vendor Dashboard
          </div> */}
                    <div className="flex items-center space-x-4">
                        {/* <Button variant="outline" size="icon" className="mr-2">
              <Bell className="h-4 w-4" />
            </Button> */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {gymDetails?.centre_name ? gymDetails?.centre_name : 'Vendor'}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleLogout()} className='space-x-2'><LogOut /><span>Logout</span></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default VendorHeader
