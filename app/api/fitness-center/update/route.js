import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import FitnessCenter from '@/lib/models/fitnessCenters';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

export async function PATCH(request) {
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

        // Fetch metadata to find the correct fitness center ID
        const metadata = await CenterAdminMetadata.findOne({ uid });

        if (!metadata || !metadata.fitness_center_id) {
            return NextResponse.json({ error: 'Fitness center not linked to account' }, { status: 404 });
        }

        // Find the fitness center by _id from metadata
        const fitnessCenter = await FitnessCenter.findById(metadata.fitness_center_id);

        if (!fitnessCenter) {
            return NextResponse.json({ error: 'Fitness center not found' }, { status: 404 });
        }

        // Update fields
        if (body.centre_name) fitnessCenter.name = body.centre_name;
        if (body.centre_description) fitnessCenter.description = body.centre_description;
        if (body.contact_no) fitnessCenter.phone_number = body.contact_no;

        // Update location fields
        if (body.address) {
            fitnessCenter.location.address = body.address;
        }
        if (body.pincode) {
            fitnessCenter.location.postal_code = body.pincode;
        }

        // Update images with proper array handling
        if (body.header_image !== undefined) {
            // If header_image is provided, set it as the first image
            if (body.header_image) {
                if (fitnessCenter.image_urls && fitnessCenter.image_urls.length > 0) {
                    fitnessCenter.image_urls[0] = body.header_image;
                } else {
                    fitnessCenter.image_urls = [body.header_image];
                }
            }
        }

        if (body.centre_images && Array.isArray(body.centre_images)) {
            // Replace all images with the new list
            fitnessCenter.image_urls = body.centre_images;
        }

        // Update amenities
        if (body.amenities && Array.isArray(body.amenities)) {
            fitnessCenter.amenities = body.amenities;
        }

        // Update available_facilities
        if (body.available_facilities && Array.isArray(body.available_facilities)) {
            fitnessCenter.available_facilities = body.available_facilities;
        }

        // Update Google Maps link
        if (body.google_maps_link !== undefined) {
            fitnessCenter.map_url = body.google_maps_link;
        }

        // Update business_hours
        if (body.business_hours) {
            fitnessCenter.business_hours = body.business_hours;
        }

        await fitnessCenter.save();

        // Also update center_admin_metadata if needed
        await CenterAdminMetadata.findOneAndUpdate(
            { uid: uid },
            {
                fitness_center_id: fitnessCenter._id,
                updated_at: new Date()
            },
            { upsert: false }
        );

        return NextResponse.json({
            message: 'Fitness center updated successfully',
            fitnessCenter: fitnessCenter
        });
    } catch (error) {
        console.error('Error updating fitness center:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
