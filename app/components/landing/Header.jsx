"use client";
import React, { useState } from 'react'
import { ArrowRight, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import Logo from '@/public/images/fcw_transparent.png'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const router = useRouter()
    const { user, loading, logout } = useAuth()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLogout = async () => {
        await logout()
        setIsMenuOpen(false)
    }

    const handleVendorDashboard = () => {
        router.push('/dashboard')
        setIsMenuOpen(false)
    }

    return (
        <>
            <div className='py-3 px-5 fixed left-0 right-0 top-0 z-50 bg-[var(--landing-bg-primary)]/75 backdrop-blur-xl border-b border-white/20 transition-all duration-300 shadow-sm'>
                <div className='container mx-auto'>
                    <div className='flex items-center justify-between'>
                        <div className='inline-flex gap-5 items-center'>
                            <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={70} width={70} className='h-[45px] w-[45px] md:h-[50px] md:w-[50px] lg:h-[70px] lg:w-[70px]' /></Link>
                            <Link className='text-[var(--landing-text-primary)] text-lg md:text-xl lg:text-2xl font-semibold' href={'/'}>Fit Choice World</Link>
                        </div>
                        <div className='md:hidden'>
                            {isMenuOpen ? (
                                <X className='h-6 w-6 text-[var(--landing-text-primary)] cursor-pointer' onClick={toggleMenu} />
                            ) : (
                                <Menu className='h-6 w-6 text-[var(--landing-text-primary)] cursor-pointer' onClick={toggleMenu} />
                            )}
                        </div>
                        <nav className='hidden md:flex md:gap-6 lg:gap-10 items-center text-[var(--landing-text-secondary)]'>
                            <Link href='/' className='hover:text-[var(--landing-text-primary)] transition-colors'>Users</Link>
                            <Link href='/fitnesscenter' className='hover:text-[var(--landing-text-primary)] transition-colors'>Fitness Centers</Link>
                            {/* <Link href='/fitnesscenter#memberships' className='hover:text-[var(--landing-text-primary)] transition-colors'>Fitness Centre Pricing</Link> */}
                            <Link href='/#contact' className='hover:text-[var(--landing-text-primary)] transition-colors'>Contact Us</Link>
                            <Link href='faq' className='hover:text-[var(--landing-text-primary)] transition-colors'>FAQ's</Link>

                            {!loading && (
                                user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-black hover:bg-gray-100 transition-all"
                                            >
                                                <User className="h-5 w-5 text-[var(--landing-text-primary)]" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 bg-white border-gray-200 text-black shadow-xl" align="end">
                                            <DropdownMenuLabel className="font-normal">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {user.first_name && user.last_name
                                                            ? `${user.first_name} ${user.last_name}`
                                                            : user.email || user.phoneNumber}
                                                    </p>
                                                    {user.email && (
                                                        <p className="text-xs leading-none text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-gray-100" />
                                            <DropdownMenuItem
                                                onClick={handleVendorDashboard}
                                                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                <span>Dashboard</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-gray-100" />
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link
                                        href={'/login'}
                                        onClick={() => router.push('/login')}
                                        className='bg-black text-white px-6 py-2.5 rounded-full font-medium inline-flex items-center justify-center tracking-tight hover:bg-gray-800 transition duration-200 ease-in-out shadow-sm'
                                    >
                                        Login
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'>
                    <div className='fixed inset-y-0 right-0 max-w-xs w-full bg-[var(--landing-bg-primary)] shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right'>
                        <div className='p-6 pt-20 space-y-6'>
                            <Link href='/' className='block text-[var(--landing-text-primary)] hover:text-black/70 transition-colors text-lg font-medium' onClick={toggleMenu}>Users</Link>
                            <Link href='/fitnesscenter' className='block text-[var(--landing-text-primary)] hover:text-black/70 transition-colors text-lg font-medium' onClick={toggleMenu}>Fitness Centers</Link>
                            <Link href='/#contact' className='block text-[var(--landing-text-primary)] hover:text-black transition-colors text-lg font-medium' onClick={toggleMenu}>Contact Us</Link>
                            <Link href='faq' className='block text-[var(--landing-text-primary)] hover:text-black/70 transition-colors text-lg font-medium' onClick={toggleMenu}>FAQ's</Link>

                            {!loading && (
                                user ? (
                                    <>
                                        <div className="pt-6 border-t border-gray-100 mt-6">
                                            <div className="mb-6 px-2">
                                                <p className="text-black font-semibold text-lg">
                                                    {user.first_name && user.last_name
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : user.email || user.phoneNumber}
                                                </p>
                                                {user.email && (
                                                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleVendorDashboard}
                                                className='w-full text-left px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-colors flex items-center mb-2'
                                            >
                                                <LayoutDashboard className="mr-3 h-5 w-5" />
                                                Vendor Dashboard
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className='w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center'
                                            >
                                                <LogOut className="mr-3 h-5 w-5" />
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={'/login'}
                                        onClick={() => { router.push('/login'); toggleMenu(); }}
                                        className='block w-full bg-black text-white px-4 py-3.5 rounded-xl font-bold text-center tracking-tight hover:bg-gray-800 transition duration-200 ease-in-out mt-8 shadow-lg'
                                    >
                                        Login
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header
