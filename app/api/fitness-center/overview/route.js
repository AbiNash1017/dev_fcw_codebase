import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import FitnessCenter from '@/lib/models/fitnessCenters';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

export async function GET(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        await dbConnect();

        // Fetch metadata to find the correct fitness center ID
        const metadata = await CenterAdminMetadata.findOne({ uid });

        let fitnessCenter = null;
        if (metadata && metadata.fitness_center_id) {
            fitnessCenter = await FitnessCenter.findById(metadata.fitness_center_id);
        }

        if (!fitnessCenter) {
            return NextResponse.json({
                data: {
                    monthlyBookings: 0,
                    monthlyRevenue: 0,
                    rating: { rating: 0, rating_count: 0 },
                    latest_bookings: [],
                    latest_reviews: []
                }
            });
        }

        // In a real implementation, we would aggregate bookings and reviews here.
        // For now, we return 0/empty arrays + real rating from the fitness center document.

        return NextResponse.json({
            data: {
                monthlyBookings: 0,
                monthlyRevenue: 0,
                rating: {
                    rating: fitnessCenter.rating || 0,
                    rating_count: fitnessCenter.total_reviews || 0
                },
                latest_bookings: [],
                latest_reviews: []
            }
        });

    } catch (error) {
        console.error('Error fetching fitness center overview:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
