import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import FitnessCenter from '@/lib/models/fitnessCenters';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const body = await request.json();

        await dbConnect();

        // Validate required fields
        if (!body.centre_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const latitude = body.latitude ? parseFloat(body.latitude) : 0;
        const longitude = body.longitude ? parseFloat(body.longitude) : 0;

        const newFitnessCenter = new FitnessCenter({
            name: body.centre_name,
            owner_id: uid,
            description: body.centre_description,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude]
                address: body.address,
                city: body.city,
                state: body.state,
                postal_code: body.pincode,
                country: 'India', // Defaulting to India as per context
            },
            map_url: body.map_url,
            phone_number: body.contact_no,
            subscription_plan_id: body.plan_id,
            is_active: true,
        });

        await newFitnessCenter.save();

        // Update CenterAdminMetadata with fitness_center_id and mark onboarding as complete
        await CenterAdminMetadata.findOneAndUpdate(
            { uid: uid },
            {
                fitness_center_id: newFitnessCenter._id,
                onboarding_completed: true,
                latitude: latitude,
                longitude: longitude,
                updated_at: new Date()
            },
            { new: true }
        );

        return NextResponse.json({
            message: 'OK',
            fitnessCenter: newFitnessCenter,
            nextStep: '/dashboard'
        });
    } catch (error) {
        console.error('Error creating fitness center:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
