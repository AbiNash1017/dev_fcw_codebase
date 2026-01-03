import Link from "next/link"
import React from "react"

const CancellationPolicy = () => {
    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Cancellation Policy
                    </h1>
                    <p className="text-sm text-gray-600 mb-2">Last updated: January 18th 2025</p><br></br>
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Cancellation Requests
                            </h2>
                            <p>
                                Users can request a cancellation within 24 hours of placing an order or subscribing to a service, provided the service has not already commenced.<br></br>
                                To initiate a cancellation, users must contact our support team via email at fcw@wrcog.co.in or through the in-app help section.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Non-Cancellable Services
                            </h2>
                            <p>
                                Services that have already been delivered or initiated are not eligible for cancellation.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                            <p>If you have any questions about this Cancellation Policy, You can contact us:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Email: fcw@wrcog.co.in</li>
                                <li>Phone Number: +91 8123784727</li>
                                <li>Address: #269, 4th Main, Bogadi Bank Colony, Mysore 570026</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CancellationPolicy
