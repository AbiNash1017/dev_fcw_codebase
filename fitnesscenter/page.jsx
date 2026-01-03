import React from 'react'
import Header from '../components/landing/Header'
import Footer from '../components/landing/Footer'
import VendorHero from '../components/landing/VendorHero'
import VendorFeatures from '../components/landing/VendorFeatures'
import Memberships from '../components/landing/Memberships'

const FitnessCenter = () => {
    return (
        <div className='bg-black'>
            <Header />
            <VendorHero />
            <VendorFeatures />
            <Memberships />
            <Footer />
        </div>
    )
}

export default FitnessCenter
