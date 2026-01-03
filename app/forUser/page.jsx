import Image from "next/image"
import Link from "next/link"
import { CheckCircle } from 'lucide-react'
import Logo from '@/public/images/fcw_transparent.png'

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-4 md:p-8">
            {/* Logo */}
            <div className="mb-6 relative w-[60px] h-[60px]">
                <Link href={'/'}><Image src={Logo} alt="FCW Logo" height={70} width={70} className='h-[45px] w-[45px] md:h-[50px] md:w-[50px] lg:h-[70px] lg:w-[70px]' /></Link>
            </div>

            {/* Main Content */}
            <div className="max-w-3xl w-full text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    Welcome <span className="text-red-700">FCW</span> User!
                </h1>
                <p className="text-gray-400 text-md md:text-lg mb-6 md:mb-6">
                    Take your fitness journey to the next level with our platform
                </p>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {[
                        "Discover fitness centers near you",
                        "Book fitness sessions and track your history",
                        "Swipe, match and book a couples session",
                        "Track your progress on our leaderboard",
                        "Track your calories intake and get guided by our diet assistant",
                        "Be a part of non toxic and fitness focused social media"
                    ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 bg-[#2A2A2A] p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-red-700 shrink-0" />
                            <span className="text-gray-300 text-base md:text-lg text-left">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* Download Instructions */}
                <p className="text-white text-xl md:text-2xl mb-6">
                    Download our app to book fitness centers:
                </p>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Link
                        href="https://play.google.com/store/apps/details?id=com.fcw.fitchoice_world_app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                    >
                        <div className="relative w-full h-[40px] sm:h-[60px]">
                            <Image
                                src="/images/playstore.png"
                                alt="Play Store"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    <Link
                        href="https://apps.apple.com/in/app/fit-choice-world/id6745477875"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                    >
                        <div className="relative w-full h-[40px] sm:h-[60px]">
                            <Image
                                src="/images/appstore.png"
                                alt="App Store"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
