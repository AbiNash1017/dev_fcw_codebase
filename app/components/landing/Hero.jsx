'use client'
import Link from "next/link"
import Image from "next/image"
import HeroImage from "@/public/images/landing_hero.jpg"
import Logo from '@/public/images/fcw_logo.png'
import { Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const Hero = () => {
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
                            <h1 className="mb-6 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">
                                BOOK WORKOUTS.
                                <br />
                                <span className="text-gray-300">FIND MATCHES.</span>
                                <br />
                                SWEAT TOGETHER.
                            </h1>
                            <Link
                                className="inline-block text-xl sm:text-2xl text-black px-8 py-4 font-bold tracking-wide rounded-full bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                                href="/login"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-white text-md sm:text-lg mb-4 font-medium">
                            Are you a fitness center? Click <Link href={"/fitnesscenter"} className="text-white underline hover:text-gray-300 transition-colors">here</Link> to explore more
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
