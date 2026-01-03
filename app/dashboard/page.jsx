'use client'

import { useEffect, useState } from 'react'
import { Bell, Calendar, Home, MessageSquare, PieChart, Settings, Tag, Users, LucidePhoneCall, Users2, Dumbbell } from 'lucide-react'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import VendorSidebar from '@/app/components/forVendor/structure/VendorSidebar'
import VendorHeader from '@/app/components/forVendor/structure/VendorHeader'
import VendorAnalytics from '@/app/components/forVendor/VendorAnalytics'
import VendorOverview from '@/app/components/forVendor/VendorOverview'
import VendorBookingManagement from '@/app/components/forVendor/VendorBookingManagement'
import VendorProfileManagement from '@/app/components/forVendor/VendorProfileManagement'
import VendorSessionManagement from '@/app/components/forVendor/VendorSessionMangement'
// import VendorUserCommunication from '@/app/components/forVendor/VendorUserCommunication'
import VendorContactUs from '@/app/components/forVendor/VendorContactUs'
import VendorCouponsAndBanners from '@/app/components/forVendor/VendorCouponBanner'
import VendorMembershipManagement from '@/app/components/forVendor/VendorMemberships'
import BusinessHoursPopup from '@/app/components/forVendor/BusinessHoursPopup'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'

const VendorDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [availableFacilities, setAvailableFacilities] = useState([])
    const [showBusinessHoursPopup, setShowBusinessHoursPopup] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Home },
        // { id: 'facilities', label: 'Add Facilities', icon: Dumbbell }, // Removed as moved to sidebar action
        // { id: 'facility_sessions', label: 'Facility Session Management', icon: Calendar }, // Replaced by dynamic tabs
        { id: 'bookings', label: 'Booking Management', icon: Users },
        { id: 'profile', label: 'Profile', icon: Settings },
        { id: 'contact_us', label: 'Contact Admin', icon: LucidePhoneCall },
    ]

    const fetchFacilities = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/dashboard/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.fitnessCenter && data.fitnessCenter.available_facilities) {
                    setAvailableFacilities(data.fitnessCenter.available_facilities);
                }

                // Check for business hours
                if (data.fitnessCenter) {
                    const hasBusinessHours = data.fitnessCenter.business_hours &&
                        data.fitnessCenter.business_hours.schedules &&
                        data.fitnessCenter.business_hours.schedules.length > 0;

                    if (!hasBusinessHours) {
                        setShowBusinessHoursPopup(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching facilities:", error);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }

        // Check if user has completed onboarding and created a fitness center
        if (user && !loading) {
            const checkStatus = async () => {
                try {
                    const token = await user.getIdToken();
                    const response = await fetch('/api/auth/status', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const status = await response.json();

                        // If onboarding is not complete, redirect to onboard
                        if (!status.onboardingCompleted) {
                            router.push('/onboard');
                        }
                        // If user doesn't have a fitness center, redirect to createCentre
                        else if (!status.hasFitnessCenter) {
                            router.push('/createCentre');
                        }
                        // Otherwise, user is allowed to access dashboard
                        else {
                            fetchFacilities();
                        }
                    }
                } catch (error) {
                    console.error("Error checking status:", error);
                }
            };
            checkStatus();
        }
    }, [user, loading, router])

    const handleAddFacility = async (facility) => {
        try {
            const token = await user.getIdToken();
            const newFacilities = [...availableFacilities, facility];

            const response = await fetch('/api/fitness-center/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ available_facilities: newFacilities })
            });

            if (response.ok) {
                setAvailableFacilities(newFacilities);
                setActiveTab(`facility_${facility}`); // Switch to new tab
            } else {
                alert("Failed to add facility");
            }
        } catch (error) {
            console.error("Error adding facility:", error);
            alert("Error adding facility");
        }
    }

    const handleDeleteFacility = async (facilityToDelete) => {
        if (!confirm(`Are you sure you want to remove ${facilityToDelete}?`)) return;

        try {
            const token = await user.getIdToken();
            const newFacilities = availableFacilities.filter(f => f !== facilityToDelete);

            const response = await fetch('/api/fitness-center/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ available_facilities: newFacilities })
            });

            if (response.ok) {
                setAvailableFacilities(newFacilities);
                if (activeTab === `facility_${facilityToDelete}`) {
                    setActiveTab('overview');
                }
            } else {
                alert("Failed to remove facility");
            }
        } catch (error) {
            console.error("Error removing facility:", error);
            alert("Error removing facility");
        }
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <VendorSidebar
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                availableFacilities={availableFacilities}
                onAddFacility={handleAddFacility}
                onDeleteFacility={handleDeleteFacility}
            />
            <main className="flex-1 overflow-y-auto">
                <VendorHeader />
                <BusinessHoursPopup
                    isOpen={showBusinessHoursPopup}
                    onRedirect={() => {
                        setActiveTab('profile');
                        setShowBusinessHoursPopup(false);
                    }}
                />
                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div>
                            <TabsContent value="overview"><VendorOverview /></TabsContent>
                            <TabsContent value="bookings"><VendorBookingManagement /></TabsContent>

                            {/* Dynamic Facility Tabs */}
                            {availableFacilities.map(facility => (
                                <TabsContent key={facility} value={`facility_${facility}`}>
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-bold capitalize">{facility.toLowerCase()} Management</h2>
                                        {/* Reuse Session Management Component, passing the type/facility */}
                                        {/* Ideally VendorSessionManagement should accept a prop for filter or setup */}
                                        <VendorSessionManagement facilityType={facility} />
                                    </div>
                                </TabsContent>
                            ))}

                            <TabsContent value="coupon_banner"><VendorCouponsAndBanners /></TabsContent>
                            <TabsContent value="analytics"><VendorAnalytics /></TabsContent>
                            <TabsContent value='memberships'><VendorMembershipManagement /></TabsContent>
                            <TabsContent value="profile"><VendorProfileManagement /></TabsContent>
                            <TabsContent value="contact_us"><VendorContactUs /></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}

export default VendorDashboard
