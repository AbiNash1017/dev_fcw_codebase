import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';

// GET: Fetch existing session by Type for the current vendor
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


        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');


        const fitness_center_id = searchParams.get('fitness_center_id');

        if (!type || !fitness_center_id) {
            return NextResponse.json({ error: 'Type and Fitness Center ID required' }, { status: 400 });
        }

        const facility = await Facility.findOne({
            fitness_center_id: fitness_center_id,
            type: type
        });

        if (!facility) {
            return NextResponse.json({ message: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'OK', data: facility });

    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update existing session
export async function PUT(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;
        await dbConnect();

        // Get admin metadata using UID
        const adminMetadata = await CenterAdminMetadata.findOne({ uid });

        const body = await request.json();
        const {
            session_id,
            price,
            price_per_slot,
            per_session_price,
            min_no_of_slots,
            ...updates
        } = body;

        if (!session_id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Normalize fields
        const updatesToApply = { ...updates };

        // Sync capacity if slots change
        if (min_no_of_slots !== undefined) {
            updatesToApply.min_no_of_slots = min_no_of_slots;
            updatesToApply.capacity = min_no_of_slots;
        }

        // Map booking constraints to nested schedule object
        if (updates.max_advance_booking_days !== undefined) {
            updatesToApply['schedule.max_advance_booking_days'] = updates.max_advance_booking_days;
            delete updatesToApply.max_advance_booking_days;
        }
        if (updates.min_advance_booking_hours !== undefined) {
            updatesToApply['schedule.min_advance_booking_hours'] = updates.min_advance_booking_hours;
            delete updatesToApply.min_advance_booking_hours;
        }

        const updateSet = {
            ...updatesToApply,
            'schedule.updated_at': new Date()
        };

        if (adminMetadata) {
            updateSet['schedule.updated_by'] = adminMetadata._id;
        }

        const updatedFacility = await Facility.findByIdAndUpdate(
            session_id,
            {
                $set: updateSet
            },
            { new: true }
        );

        if (!updatedFacility) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'OK', data: updatedFacility });
    } catch (error) {
        console.error('Error updating session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        await dbConnect();

        // Get admin metadata for instructor info
        const adminMetadata = await CenterAdminMetadata.findOne({ uid });
        if (!adminMetadata) {
            return NextResponse.json({ error: 'Center Admin Metadata not found' }, { status: 404 });
        }

        const body = await request.json();

        // Destructure common fields.
        // Support both Frontend naming (per_session_price) and Schema naming (price_per_slot)
        const {
            type,
            name,
            description,
            equipment,
            instructor_name,
            requires_booking,
            duration_minutes,
            min_no_of_slots,
            max_advance_booking_days,
            min_advance_booking_hours,
            per_session_price,
            price_per_slot,
            price, // Add 'price'
            couple_session_price,
            fitness_center_id
        } = body;

        // Normalize price
        const finalPrice = price !== undefined ? price : (price_per_slot !== undefined ? price_per_slot : per_session_price);

        if (!fitness_center_id) {
            return NextResponse.json({ error: 'Fitness Center ID is required' }, { status: 400 });
        }

        // CHECK UNIQUENESS
        const existing = await Facility.findOne({ fitness_center_id, type });
        if (existing) {
            return NextResponse.json({
                error: 'Session of this type already exists. Please edit instead.',
                existing_id: existing._id
            }, { status: 409 });
        }

        // Default image logic
        const defaultImage = "https://thumbs.dreamstime.com/b/latina-dancing-zumba-latin-fitness-girl-exercising-motion-blur-78887627.jpg";

        const newFacility = new Facility({
            fitness_center_id,
            type,
            name,
            description,
            image_urls: [defaultImage],
            equipment: Array.isArray(equipment) ? equipment : [],
            // Use metadata ID if available, or just keep it null/undefined if schema strictly requires ObjectId ref to User
            // Since User model is missing/deprecated, we might need to adjust Facility schema or just store string ID if allowed.
            // However, Facility schema likely refs User. For now, we'll try to use _id if available or skip.
            instructor_id: adminMetadata._id,
            instructor_name: instructor_name || `${adminMetadata.first_name} ${adminMetadata.last_name}`,
            instructor_profile_image: adminMetadata.profile_image_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR43TnXOwFvrZ3LLj…",
            requires_booking,
            duration_minutes,
            capacity: min_no_of_slots, // Sync capacity with min_no_of_slots for now
            min_no_of_slots,
            icon_image_url: defaultImage,
            schedule: {
                max_advance_booking_days: max_advance_booking_days || 90,
                min_advance_booking_hours: min_advance_booking_hours || 24,
                updated_at: new Date(),
                updated_by: adminMetadata._id
            },
            updated_by: adminMetadata._id,
            is_active: true
        });

        await newFacility.save();

        return NextResponse.json({ message: 'OK', data: newFacility });

    } catch (error) {
        console.error('Error creating facility session:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        await adminAuth.verifyIdToken(token);
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const session_id = searchParams.get('session_id');

        if (!session_id) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const deletedFacility = await Facility.findByIdAndDelete(session_id);

        if (!deletedFacility) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Session deleted successfully' });

    } catch (error) {
        console.error('Error deleting session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
