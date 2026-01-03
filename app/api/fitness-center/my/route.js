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

        if (!metadata || !metadata.fitness_center_id) {
            return NextResponse.json({ error: 'Fitness Center not found' }, { status: 404 });
        }

        const fitnessCenter = await FitnessCenter.findById(metadata.fitness_center_id);

        if (!fitnessCenter) {
            return NextResponse.json({ error: 'Fitness Center not found' }, { status: 404 });
        }

        return NextResponse.json(fitnessCenter);
    } catch (error) {
        console.error('Error fetching fitness center:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
