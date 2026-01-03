import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import FitnessCenter from '@/lib/models/fitnessCenters';
import Facility from '@/lib/models/facilities';

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

        // 1. Identify the User (Customer) from User 
        const user = await User.findOne({ uid });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }


        // 2. Fetch Bookings for this User
        const bookings = await Booking.find({ user_id: user._id })
            .populate({
                path: 'user_id',
                model: User
            })
            .populate({
                path: 'fitness_center_id',
                select: 'name location.address'
            })
            .populate({
                path: 'facility_id',
                select: 'name type duration_minutes instructor_name image_urls'
            })
            .sort({ slot_start_time: -1 });

        return NextResponse.json({ bookings });

    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
