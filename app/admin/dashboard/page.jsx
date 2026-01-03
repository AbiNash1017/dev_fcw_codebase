'use client'

import React, { useEffect, useState } from 'react'
import { Users, ShoppingBag, BarChart, Settings, Home, Book, Tag, FlagTriangleLeft, FlagTriangleRight, Weight, Dumbbell, DumbbellIcon, WeightIcon } from 'lucide-react'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import AdminSidebar from '@/app/components/forAdmin/structure/AdminSidebar'
import AdminHeader from '@/app/components/forAdmin/structure/AdminHeader'
import AdminVendorManagement from '@/app/components/forAdmin/AdminVendorManagement'
import AdminUserManagement from '@/app/components/forAdmin/AdminUserManagement'
import AdminAnalytics from '@/app/components/forAdmin/AdminAnalytics'
import AdminOverview from '@/app/components/forAdmin/AdminOverview'
import AdminCommunication from '@/app/components/forAdmin/AdminCommunications'
import AdminBookingManagement from '@/app/components/forAdmin/AdminBookingManagement'
import AdminCoupons from '@/app/components/forAdmin/AdminCoupons'
import BannerManagement from '@/app/components/forAdmin/BannerManagement'
import CouponAndBannerManagement from '@/app/components/forAdmin/CouponAndBannerManagement'
import AdminMarketPlace from '@/app/components/forAdmin/AdminMarketPlace'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const { user, loading } = useAuth();
    const router = useRouter();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'vendors', label: 'Vendor Management', icon: Dumbbell },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'bookings', label: 'Booking Management', icon: Book },
        { id: 'analytics', label: 'Analytics', icon: BarChart },
        { id: 'coupons', label: 'Coupons', icon: Tag },
        { id: 'banner', label: 'Banners', icon: FlagTriangleRight },
        { id: 'coupon-banner', label: 'Coupon/Banner Req.', icon: Tag },
        { id: 'market-place', label: 'Marketplace', icon: ShoppingBag },
        { id: 'configurations', label: 'Platform Configurations', icon: Settings },
    ]

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 overflow-y-auto">
                <AdminHeader />
                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsContent value="overview"><AdminOverview /></TabsContent>
                        <TabsContent value="vendors"><AdminVendorManagement /></TabsContent>
                        <TabsContent value="users"><AdminUserManagement /></TabsContent>
                        <TabsContent value="bookings"><AdminBookingManagement /></TabsContent>
                        <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
                        <TabsContent value="coupons"><AdminCoupons /></TabsContent>
                        <TabsContent value="banner"><BannerManagement /></TabsContent>
                        <TabsContent value="coupon-banner"><CouponAndBannerManagement /></TabsContent>
                        <TabsContent value="market-place"><AdminMarketPlace /></TabsContent>
                        <TabsContent value="configurations"><AdminCommunication /></TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard
