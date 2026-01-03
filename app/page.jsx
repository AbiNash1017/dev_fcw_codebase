'use client'
import React, { useState } from 'react'
import Header from './components/landing/Header'
import Hero from './components/landing/Hero'
import Testimonials from './components/landing/Testimonials'
import Features from './components/landing/Features'
import Footer from './components/landing/Footer'
import Contact from './components/landing/Contact'
import LoadingScreen from '@/components/ui/LoadingScreen'

const LandingPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className='bg-[var(--landing-bg-primary)]'>
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
            <Header />
            <Hero />
            <Features />
            <Testimonials />
            <Contact />
            <Footer />
        </div>
    )
}

export default LandingPage
