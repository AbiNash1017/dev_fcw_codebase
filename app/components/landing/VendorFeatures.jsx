'use client'

import { motion } from 'framer-motion'
import { Calendar, DollarSign, ImageIcon, Users, FileSpreadsheet, MapPin } from 'lucide-react'

const features = [
    {
        icon: Calendar,
        title: "BOOKING MANAGEMENT",
        description: "Manage bookings through a calendar view. Update attendance status with a single click. Access attendee details, preferences, and booking history."
    },
    {
        icon: DollarSign,
        title: "REVENUE TRACKING",
        description: "View revenue reports with date-wise and session-wise breakdowns. Track individual session earnings and total revenue. Export booking and revenue data to Excel for offline analysis."
    },
    {
        icon: ImageIcon,
        title: "CUSTOMIZABLE PROFILES",
        description: "Showcase your fitness center with photos, descriptions, and categories. Highlight unique offerings and competitive pricing."
    },
    {
        icon: MapPin,
        title: "MARKETING EXPOSURE",
        description: "Get listed in our fitness center directory to reach more customers. Utilize user reviews and ratings to enhance credibility."
    }
]

const VendorFeatues = () => {

    return (
        <section className="bg-black pt-20 pb-10 px-4">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <div className="text-3xl md:text-[43px] font-bold mb-4">
                        <span className="text-white">OUR </span>
                        <span className="text-red-700">FEATURES</span>
                    </div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Discover the powerful features that help you manage and grow your fitness center
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="border border-red-700 p-6 relative hover:scale-105 transform transition-all duration-300"
                        >
                            <div className="mb-4">
                                <feature.icon className='text-white' />
                            </div>
                            <h3 className="text-[23px] font-bold text-red-700 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default VendorFeatues
