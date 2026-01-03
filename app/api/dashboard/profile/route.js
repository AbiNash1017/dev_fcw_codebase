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

        // Fetch user profile from CenterAdminMetadata
        const userProfile = await CenterAdminMetadata.findOne({ uid });

        // Fetch fitness center
        // Fetch fitness center using ID from metadata if available
        let fitnessCenter = null;
        if (userProfile.fitness_center_id) {
            fitnessCenter = await FitnessCenter.findById(userProfile.fitness_center_id);
        } else {
            // Fallback or legacy check if needed, but per strict requirement assume metadata is source
            // checking by owner_id only if id not in metadata might defeat the purpose of "single source", 
            // but safe to leave blank if not in metadata.
        }

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // Prepare response data
        const responseData = {
            userProfile: userProfile.toObject(),
            fitnessCenter: fitnessCenter ? fitnessCenter.toObject() : null
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching vendor profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
