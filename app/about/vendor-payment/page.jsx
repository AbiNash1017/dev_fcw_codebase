import Link from "next/link"
import React from "react"

const VendorPaymentPolicy = () => {
    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Vendor Payment Policy
                    </h1>
                    <div className="space-y-6">
                        <section>
                            <p>At Fit Choice World, we value our partnerships with vendors and ensure a smooth and transparent payment process. Below are the terms related to vendor payments:
                            </p><br></br>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>
                                    <p className="font-bold">Service Delivery Confirmation:</p>
                                    <p>Vendors must ensure the complete delivery of services as per the agreed-upon terms before initiating a payment request.</p>
                                </li>
                                <li>
                                    <p className="font-bold">Payment Request Submission:
                                    </p>
                                    <p>Once the service is delivered, the vendor can submit a payment request through the designated process (vendor portal, email, or Phone Call).</p>
                                </li>
                                <li>
                                    <p className="font-bold">Payment Processing Timeline:
                                    </p>
                                    <p>Upon receipt of the payment request and verification of service delivery, Fit Choice World will process the payment within three (3) working days.</p>
                                </li>
                                <li>
                                    <p className="font-bold">Dispute Resolution:
                                    </p>
                                    <p>In case of discrepancies or disputes regarding the service delivered, the payment processing may be temporarily paused until the issue is resolved. Vendors will be promptly notified of any such delays.
                                    </p>
                                </li>
                                <li>
                                    <p className="font-bold">Communication and Support:
                                    </p>
                                    <p>For inquiries related to payments, vendors may contact our support team at: </p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Email: fcw@wrcog.co.in</li>
                                        <li>Phone Number: +91 8123784727</li>
                                        <li>Address: #269, 4th Main, Bogadi Bank Colony, Mysore 570026</li>
                                    </ul>
                                </li>
                            </ol>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorPaymentPolicy
