// app/api/auth/status/route.js
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';

import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
import FitnessCenter from '@/lib/models/fitnessCenters';

export async function GET(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                authenticated: false,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/login'
            }, { status: 200 });
        }

        const token = authHeader.split('Bearer ')[1];
        let uid;

        // Verify Firebase token
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            uid = decodedToken.uid;
        } catch (error) {
            console.error('Token verification error:', error);
            return NextResponse.json({
                authenticated: false,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/login'
            }, { status: 200 });
        }

        // Connect to MongoDB
        await dbConnect();

        // Find user in CenterAdminMetadata
        const userMetadata = await CenterAdminMetadata.findOne({ uid });

        if (!userMetadata) {
            // User exists in Firebase but not in CenterAdminMetadata - needs to complete onboarding
            return NextResponse.json({
                authenticated: true,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/onboard'
            }, { status: 200 });
        }

        // Check if onboarding is actually completed (metadata fields are filled)
        // We check for minimal required fields
        const isMetadataComplete = !!(
            userMetadata.first_name &&
            userMetadata.last_name &&
            userMetadata.gender
        );

        if (!isMetadataComplete) {
            return NextResponse.json({
                authenticated: true,
                onboardingCompleted: false,
                hasFitnessCenter: false,
                nextStep: '/onboard'
            }, { status: 200 });
        }

        // The onboarding flow has two stages based on CenterAdminMetadata:
        // 1. Has metadata but no fitness center → needs to create center → redirect to /createCentre  
        // 2. Has metadata AND fitness center → onboarding complete → redirect to /vendor/dashboard

        // Check if user has a fitness center
        let hasFitnessCenter = false;
        if (userMetadata.fitness_center_id) {
            const center = await FitnessCenter.findById(userMetadata.fitness_center_id);
            hasFitnessCenter = !!center;
        }

        return NextResponse.json({
            authenticated: true,
            onboardingCompleted: true, // Personal info (metadata) is confirmed complete above
            hasFitnessCenter,
            nextStep: hasFitnessCenter ? '/dashboard' : '/createCentre'
        }, { status: 200 });

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json({
            authenticated: false,
            onboardingCompleted: false,
            hasFitnessCenter: false,
            nextStep: '/login',
            error: 'Internal Server Error'
        }, { status: 500 });
    }
}
