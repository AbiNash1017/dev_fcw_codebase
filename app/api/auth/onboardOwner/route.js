// app/api/auth/onboardOwner/route.js

import { adminAuth } from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata'

export async function POST(request) {
    try {
        const body = await request.json()
        const { first_name, last_name, gender, dob, state, city, mobile_no, latitude, longitude, address } = body

        // Validate required fields
        if (!first_name || !last_name) {
            return NextResponse.json({
                error: 'Missing required fields: first_name and last_name are required'
            }, { status: 400 })
        }

        // Get the authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        let uid;

        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            uid = decodedToken.uid;
        } catch (error) {
            console.error('Auth error:', error)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Connect to MongoDB
        await dbConnect()

        // Update CenterAdminMetadata directly
        // We no longer update the User schema here as per new requirement
        // to separate vendor data.

        // Generate username: fcw_ + last 10 digits of uid
        const usernameId = uid.length >= 10 ? uid.slice(-10) : uid;
        const username = `fcw_${usernameId}`;

        const updatedMetadata = await CenterAdminMetadata.findOneAndUpdate(
            { uid: uid },
            {
                uid: uid,
                username: username,
                first_name: first_name,
                last_name: last_name,
                gender: gender,
                // state: state,
                // city: city,
                // address: address,
                // latitude: latitude,
                // longitude: longitude,
                phone_number: mobile_no,
                // admin_email: updatedUser.email || null, // We might need to fetch email from auth or existing user record if needed
                // onboarding_completed: true, // Defer setting this until fitness center is created
                updated_at: new Date(),
            },
            { new: true, upsert: true, runValidators: true }
        )

        return NextResponse.json({
            message: 'User onboarded successfully',
            message: 'User onboarded successfully',
            user: updatedMetadata,
            nextStep: '/createCentre'
        }, { status: 200 })

    } catch (error) {
        console.error('Onboard owner error:', error)

        // Handle duplicate key error specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({
                error: `Duplicate value for field: ${field}`,
                details: error.keyValue
            }, { status: 409 })
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 })
        }

        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 })
    }
}