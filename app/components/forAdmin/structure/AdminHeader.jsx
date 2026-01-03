'use client'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/app/context/AuthContext'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

//bg-[#5d1212]

const AdminHeader = () => {

    const router = useRouter()
    const { logout } = useAuth()

    const handleLogout = async () => {
        await logout()
    }
    // try {
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    //     method: 'POST',
    //     credentials: 'include',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   })
    //   const result = await response.json()
    //   if (result.message !== "Successfully logged out") {
    //     alert("Error: " + result.error)
    //   }
    //   else {
    //     console.log("Successfully logged out!")
    //     router.push('/login')
    //   }
    // } catch (error) {
    //   alert("Some error occured: " + error)
    // }
    // }

    return (
        <header className="text-black">
            <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center">
                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Admin
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleLogout()}><LogOut /><span>Logout</span></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default AdminHeader
