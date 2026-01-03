import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
import FitnessCenter from '@/lib/models/fitnessCenters';

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

        // Check CenterAdminMetadata
        const user = await CenterAdminMetadata.findOne({ uid });

        if (!user) {
            // If checking "me", might be 404 or maybe just not onboarded?
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check fitness center ownership via CenterAdminMetadata
        const fitnessCenterId = user.fitness_center_id;

        // Convert user to object and add additional fields
        const userObject = user.toObject();
        // Use the method if document instance, or manual check if toObject
        // Since toObject returns POJO, methods are lost.
        // We can re-implement the check here effectively:
        const isMetadataComplete = !!(
            user.first_name &&
            user.last_name &&
            user.gender &&
            user.city &&
            user.state
        );
        userObject.onboarding_completed = isMetadataComplete;
        userObject.hasFitnessCenter = !!fitnessCenterId;

        return NextResponse.json(userObject);
    } catch (error) {
        console.error('Error verifying token or fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
