'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Header from '../components/landing/Header'
import Footer from '../components/landing/Footer'

const faqDataUsers = [
    {
        "question": "HOW CAN I FIND FITNESS CENTERS NEAR ME?",
        "answer": "Use our pin-code based search feature to discover fitness centers in your area. You can find fitness centers near your pin-code, or even look up fitness centers near a friend's!"
    },
    {
        "question": "HOW DO I BOOK A FITNESS SESSION?",
        "answer": "Once you select a fitness center, choose your preferred session type, date and time, then proceed to the checkout to confirm your booking."
    },
    {
        "question": "WHAT IS THE MATCH FEATURE?",
        "answer": "The Match feature lets you swipe through profiles and connect with like-minded fitness enthusiasts - great for making friends or even finding a date to take on a couples session!"
    },
    {
        "question": "WHAT IS A COUPLES SESSION?",
        "answer": "A couples session is a session booking for two, that you can book only with a match. It is a single booking for 2 people, perfect for a date or even just a gym hangout session."
    },
    {
        "question": "CAN I TRACK MY FITNESS PROGRESS?",
        "answer": "Yes! Our leaderboard and fitness feed allow you to track your progress and stay motivated by comparing it with your friends."
    },
    {
        "question": "WHAT IF I NEED TO CANCEL A BOOKING?",
        "answer": "You can cancel your booking through the 'My Bookings' section in your profile. Refund policies may vary based on the fitness center."
    }
]

const faqDataVendors = [
    {
        "question": "HOW CAN I REGISTER MY FITNESS CENTER?",
        "answer": "Click on the 'Register as Vendor' button in our app, fill out your details, upload images, and add session information to complete your registration."
    },
    {
        "question": "HOW CAN I UPDATE MY PROFILE DETAILS?",
        "answer": "Log into your vendor dashboard and navigate to the 'Profile' section to update your center's information, pricing, or pictures."
    },
    {
        "question": "HOW DO I VIEW MY BOOKINGS?",
        "answer": "Your vendor dashboard includes a calendar view showing all your bookings. You can also view details like attendee names and session timings."
    },
    {
        "question": "HOW DO I TRACK REVENUE?",
        "answer": "The vendor dashboard provides detailed revenue reports, including date-wise and session-wise breakdowns, for your fitness center."
    },
    {
        "question": "WHAT IS THE PRICING PLAN LIKE?",
        "answer": "The use of our platform is free for the first 6 months, following which we have 1, 3, 6 and 12 month membership plans. You can view more details about the pricing plan by navigating to 'Fitness Center' section of this website."
    }
]


const FAQItem = ({ item }) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className="border-b border-[var(--landing-border)]">
            <button
                className="flex justify-between items-center w-full text-left py-5 px-1 hover:bg-gray-50 transition-colors rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className="font-medium text-lg text-[var(--landing-text-primary)] tracking-wide">
                    {item.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-4 flex-shrink-0"
                >
                    <ChevronDown className="w-5 h-5 text-[var(--landing-text-secondary)]" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto", marginBottom: "1rem" },
                            collapsed: { opacity: 0, height: 0, marginBottom: "0" }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="text-md pb-3 px-1 text-[var(--landing-text-secondary)]">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const FAQPage = () => {
    return (
        <div className="min-h-screen bg-[var(--landing-bg-primary)] pt-32 px-4 sm:px-6 lg:px-8">
            <Header />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-8">
                    FAQ'S
                </h1>
                <h1 className="text-3xl font-bold text-[var(--landing-text-primary)] pt-8 pb-6 border-t border-[var(--landing-border)]">USERS</h1>
                <div className="divide-y divide-[var(--landing-border)] mb-8">
                    {faqDataUsers.map((item, index) => (
                        <FAQItem key={index} item={item} />
                    ))}
                </div>
                <h1 className="text-3xl font-bold text-[var(--landing-text-primary)] pt-10 pb-6 border-t border-[var(--landing-border)]">FITNESS CENTERS</h1>
                <div className="divide-y divide-[var(--landing-border)] pb-10">
                    {faqDataVendors.map((item, index) => (
                        <FAQItem key={index} item={item} />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default FAQPage
