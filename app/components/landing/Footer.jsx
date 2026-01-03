import Link from "next/link"
import Logo from '@/public/images/fcw_transparent.png'
import PlayStoreLogo from '@/public/images/GetItOnGooglePlay_Badge.png'
import AppStoreLogo from '@/public/images/Download_on_the_App_Store_Badge.svg'
import Image from 'next/image'
import { InstagramLogoIcon } from "@radix-ui/react-icons"

const Footer = () => {
    return (
        <footer className="bg-[var(--landing-bg-primary)] border-t border-[var(--landing-border)] py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
                        <div className='inline-flex gap-3 items-center'>
                            <Image src={Logo} alt="FCW Logo" height={50} width={50} />
                            <p className="font-bold text-2xl text-[var(--landing-text-primary)]">FCW</p>
                        </div>
                    </div>
                    <nav className="flex flex-wrap lg:ml-40 justify-center md:justify-between gap-4 sm:gap-6 w-full md:w-auto">
                        <Link href="/" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors">Users</Link>
                        <Link href="/fitnesscenter" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors">Fitness Centers</Link>
                        <Link href="/#contact" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors">Contact Us</Link>
                        <Link href="https://www.instagram.com/fitchoiceworld1/" rel="noopener noreferrer" target="_blank">
                            <InstagramLogoIcon className="h-7 w-7 text-[var(--landing-text-secondary)] hover:text-pink-500 transition-colors duration-200" />
                        </Link>
                    </nav>
                    <div className="flex items-center justify-center gap-4 w-full md:w-auto">
                        <Link href={"https://play.google.com/store/apps/details?id=com.fcw.fitchoice_world_app"}>
                            <Image src={PlayStoreLogo} alt="Play Store" width={155} height={60} />
                        </Link>
                        <Link href={"https://apps.apple.com/in/app/fit-choice-world/id6745477875"}>
                            <Image src={AppStoreLogo} alt="App Store" width={135} height={40} />
                        </Link>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--landing-border)] flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <p className="text-[var(--landing-text-secondary)] text-sm">&copy; {new Date().getFullYear()} Fit Choice World Inc. All rights reserved.</p>
                    <div className="flex gap-4 sm:gap-6">
                        <Link href="/about/privacy-policy" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors text-sm">Privacy Policy</Link>
                        <Link href="/about/terms" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors text-sm">Terms and Conditions</Link>
                        <Link href="/about/refund-policy" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors text-sm">Refund Policy</Link>
                        <Link href="/about/cancellation-policy" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors text-sm">Cancellation Policy</Link>
                        <Link href="/about/vendor-payment" className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors text-sm">Vendor Payment Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
