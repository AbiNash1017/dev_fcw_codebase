import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import Facility from '@/lib/models/facilities';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
import FitnessCenter from '@/lib/models/fitnessCenters';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        await dbConnect();

        // 1. Get Center Admin Metadata to find the fitness_center_id
        const adminMetadata = await CenterAdminMetadata.findOne({ uid });

        if (!adminMetadata || !adminMetadata.fitness_center_id) {
            return NextResponse.json({ error: 'Fitness Center ID not found for this admin' }, { status: 404 });
        }

        const fitnessCenterId = adminMetadata.fitness_center_id;

        // 2. Fetch Bookings for this Fitness Center
        // We need to populate User and Facility details
        const bookings = await Booking.find({ fitness_center_id: fitnessCenterId })
            .populate({
                path: 'user_id',
                model: User,
                select: 'first_name last_name phone_number profile_image_url gender user_since'
            })
            .populate({
                path: 'facility_id',
                model: Facility,
                select: 'name type duration_minutes instructor_name image_urls'
            })
            .populate({
                path: 'fitness_center_id',
                model: FitnessCenter,
                select: 'name'
            })
            .sort({ slot_start_time: -1 });

        return NextResponse.json({ bookings });

    } catch (error) {
        console.error('Error fetching center booking history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
