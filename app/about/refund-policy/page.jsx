import Link from "next/link"
import React from "react"

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy
                    </h1>
                    <p className="text-sm text-gray-600 mb-2">Last updated: January 18th 2025</p><br></br>
                    <div className="space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Eligibility for Refunds
                            </h2>
                            <p>
                                Refunds are applicable if the cancellation request is approved within the stipulated time frame (24 hours). <br></br>
                                Refunds are also applicable for services that fail to meet the promised standards, subject to review by our quality assurance team.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Refund Process
                            </h2>
                            <p>
                                Once the refund is approved, the amount will be credited back to the original payment method. <br></br>
                                Users will be notified via email upon successful processing of the refund.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Refund Timeline
                            </h2>
                            <p>
                                Refunds will be processed within 3 working days from the date of approval.<br></br>
                                Depending on the payment provider, it may take an additional 2-3 days for the refund to reflect in your account.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Exceptions to Refunds
                            </h2>
                            <p>
                                No refunds will be issued for Change of mind after the service has been initiated or delivered. <br></br>
                                No refunds will be issued for Incomplete or incorrect information provided by the user. <br></br>
                                No refunds will be issued for Breach of the terms and conditions by the user.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact Us</h2>
                            <p>If you have any questions about this Refund Policy, You can contact us:</p>
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

export default RefundPolicy
