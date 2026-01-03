'use client'
import Link from "next/link"
import Image from "next/image"
import HeroImage from "@/public/images/fc_landing_hero.jpg"
import Logo from '@/public/images/fcw_logo.png'
import { Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const VendorHero = () => {
    const router = useRouter()

    return (
        <div className="relative min-h-screen w-full">
            <div className="relative h-screen w-full">
                <Image
                    src={HeroImage}
                    alt="FCW img"
                    layout="fill"
                    objectFit="cover"
                    className="brightness-50"
                    priority
                />

                <div className="absolute inset-0 flex flex-col items-center justify-between pt-36 pb-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center max-w-3xl">
                            {/* <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                   <span className="text-red-700">Grow</span> Your Fitness Business with <span className="text-red-700">Ease</span>.
              </h1>   */}
                            <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                                <span className="text-red-700">GROW</span> YOUR FITNESS BUSINESS WITH <span className="text-red-700">EASE</span>
                            </h1>
                            {/* <h2 className="mb-6 text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight text-white">MANAGE BOOKINGS, TRACK REVENUE AND CONNECT WITH NEW CUSTOMERS - ALL IN ONE PLACE</h2> */}
                            <h2 className="mb-6 text-lg sm:text-xl md:text-xl lg:text-xxl leading-tight text-white">Manage bookings, track revenue and connect with new customers — all in one place</h2>
                            {/* <h2 className="mb-6 text-lg sm:text-xl md:text-2xl lg:text-3xl leading-tight text-white">Manage <span className="text-red-700">bookings</span>, track <span className="text-red-700">revenue</span> and connect with new <span className="text-red-700">customers</span> — all in one place.</h2> */}
                            <Link
                                className="inline-block text-xl sm:text-2xl text-white px-5 py-3 font-semibold tracking-wide rounded-md bg-black/60 border-2 border-red-800 hover:bg-red-800/70 transition-colors duration-300"
                                href="/login"
                            >
                                Register Now
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-white text-md sm:text-lg mb-4">
                            Keep scrolling to find out what we have in store for you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendorHero
