'use client'

import { useFitnessCentre } from "@/app/context/FitnessCentreContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/app/context/AuthContext"
import { DollarSign, Mail, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const VendorContactUs = () => {
    const { fitnessCentreId } = useFitnessCentre()
    const { user, loading } = useAuth()
    const router = useRouter();

    function isSaturday() {
        return new Date().getDay() === 6;
    }

    const requestPayment = async () => {
        try {
            if (!user) return;
            const token = await user.getIdToken();
            const response = await fetch(`/api/dashboard/requestPayment`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${token}`
                },
            })
            const data = await response.json()
            alert("successfully requested")
        } catch (error) {
            alert("request unsuccessful")
        }
    }

    return (
        <div className="container mx-auto">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Phone Number</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mt-1">
                            <a href="tel:+1234567890" className="hover:text-primary">
                                +91 9036815005
                            </a>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            Available Monday to Friday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Email Address</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mt-1">
                            <a href="mailto:contact@example.com" className="hover:text-primary">
                                support@fitchoiceworld.com
                            </a>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            We typically respond within 24 hours
                        </p>
                    </CardContent>
                </Card>

                {/* <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Saturday</span>
                    <span>10:00 AM - 2:00 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Request Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm mt-1 mb-3">
                            Payment requests can only be made on Saturdays
                        </p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button className="bg-red-600 hover:bg-red-700"
                                            disabled={!isSaturday()}
                                            onClick={() => requestPayment()}
                                        >
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Request Payment
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isSaturday()
                                        ? "Click to request a payment"
                                        : "Payment requests are only available on Saturdays"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default VendorContactUs;
