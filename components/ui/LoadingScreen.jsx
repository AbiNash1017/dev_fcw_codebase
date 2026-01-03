'use client';
import React, { useState, useEffect } from 'react';
// import { LOGO_URL } from '@/app/constants';
const LOGO_URL = '/images/fcw_transparent.png';

const LoadingScreen = ({ onComplete }) => {
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Trigger entry animation
        setTimeout(() => setMounted(true), 100);

        // Progress simulation
        const duration = 2000; // 2 seconds total load
        const intervalTime = 20;
        const steps = duration / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment;
                if (next >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return next;
            });
        }, intervalTime);

        // Completion sequence
        const completeTimer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(onComplete, 800); // Wait for exit animation
        }, duration + 500);

        return () => {
            clearInterval(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${isComplete ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
                }`}
        >
            <div className="flex flex-col items-center relative">

                {/* Minimal Logo */}
                <div
                    className={`relative mb-6 transition-all duration-1000 ease-out delay-100 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                >
                    <img
                        src={LOGO_URL}
                        alt="Fit Choice World"
                        className="w-16 h-16 object-contain"
                    />
                </div>

                {/* Brand Text */}
                <div className="text-center space-y-3">
                    <h1
                        className={`text-xl font-bold tracking-tight text-black transition-all duration-1000 ease-out delay-200 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        Fit Choice World
                    </h1>

                    {/* Subtext - Improved Contrast & Visibility */}
                    <p
                        className={`text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 transition-all duration-1000 ease-out delay-300 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        Your Health Hub
                    </p>
                </div>

                {/* Ultra-minimal Progress Bar */}
                <div
                    className={`w-24 h-[2px] bg-gray-100 rounded-full mt-8 overflow-hidden transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <div
                        className="h-full bg-black transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};



export default LoadingScreen;
