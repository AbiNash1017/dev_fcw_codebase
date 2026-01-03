'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const tiers = [
    {
        name: "FREE TRIAL",
        price: "₹0",
        duration: "6 months",
        cta: "Start Free Trial",
        popular: false,
    },
    {
        name: "MONTHLY",
        price: "₹500",
        duration: "per month",
        cta: "Choose Monthly",
        popular: false,
    },
    {
        name: "QUARTERLY",
        price: "₹1,250",
        duration: "per 3 months",
        cta: "Choose Quarterly",
        popular: true,
    },
    {
        name: "HALF-YEARLY",
        price: "₹2,500",
        duration: "per 6 months",
        cta: "Choose Half-Yearly",
        popular: false,
    },
    {
        name: "YEARLY",
        price: "₹4,500",
        duration: "per 12 months",
        cta: "Choose Yearly",
        popular: false,
    }
]

const TierCard = ({ tier, className = '' }) => (
    <Card className={`bg-transparent rounded-none border-2 ${tier.popular ? 'border-red-700' : 'border-gray-700'} text-white h-full flex flex-col w-full relative overflow-hidden ${className}`}>
        {tier.popular && (
            <div className="absolute top-0 right-0 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                Popular
            </div>
        )}
        <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{tier.name}</CardTitle>
            <p className="text-sm text-gray-400">{tier.duration}</p>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center py-4">
            <div className="text-5xl font-bold mb-2">{tier.price}</div>
            <div className="w-16 h-1 bg-red-700 rounded mb-6"></div>
        </CardContent>
        {/* <CardFooter>
      <Button className={`w-full ${tier.popular ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors duration-300`}>
        {tier.cta}
      </Button>
    </CardFooter> */}
    </Card>
)

const Memberships = () => {
    const freeTier = tiers[0]
    const paidTiers = tiers.slice(1)

    return (
        <section id='memberships' className="bg-black pt-12 pb-16 px-4">
            <div className="container mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-[43px] font-bold mb-4 text-white">FITNESS CENTRE <span className='text-red-700'>MEMBERSHIP</span> PLANS</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Choose the perfect plan for your fitness center - Start with our 6-month free trial, then select the plan that best fits your needs
                    </p>
                </motion.div>

                <div className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <TierCard tier={freeTier} className="max-w-md mx-auto" />
                    </motion.div>
                </div>

                <div className='container max-w-7xl mx-auto'>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paidTiers.map((tier, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <TierCard tier={tier} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Memberships
