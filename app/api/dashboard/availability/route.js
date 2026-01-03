import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';

const DAY_MAPPING = [
    'DAY_OF_WEEK_SUNDAY',
    'DAY_OF_WEEK_MONDAY',
    'DAY_OF_WEEK_TUESDAY',
    'DAY_OF_WEEK_WEDNESDAY',
    'DAY_OF_WEEK_THURSDAY',
    'DAY_OF_WEEK_FRIDAY',
    'DAY_OF_WEEK_SATURDAY'
];

export async function POST(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        await dbConnect();

        const body = await request.json();
        console.log("Received Availability Payload:", JSON.stringify(body, null, 2));

        const { availability, removed_days } = body;

        // 1. Handle Removed Days (Explicit Deletion)
        if (removed_days && Array.isArray(removed_days) && removed_days.length > 0 && availability && availability.length > 0) {
            const sessionId = availability[0].session_id;
            console.log("Removing days:", removed_days);
            await Facility.findByIdAndUpdate(sessionId, {
                $pull: { 'schedule.schedules': { day: { $in: removed_days } } }
            });
        }

        if (!availability || !Array.isArray(availability) || availability.length === 0) {
            // If only removing days and no new availability (unlikely in this flow but possible), return success
            if (removed_days && Array.isArray(removed_days) && removed_days.length > 0) {
                return NextResponse.json({ message: 'Schedule updated successfully (removed days)' });
            }
            return NextResponse.json({ message: 'No availability data provided' }, { status: 400 });
        }

        const sessionId = availability[0].session_id;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID missing in availability data' }, { status: 400 });
        }

        const facility = await Facility.findById(sessionId);
        if (!facility) {
            return NextResponse.json({ error: 'Facility Session not found' }, { status: 404 });
        }

        // Group slots by Day of Week
        const scheduleMap = {};

        availability.forEach(slot => {
            console.log("Processing Slot:", slot);
            const date = new Date(slot.day);
            const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday...
            const dayEnum = DAY_MAPPING[dayIndex];

            if (!scheduleMap[dayEnum]) {
                scheduleMap[dayEnum] = [];
            }

            scheduleMap[dayEnum].push({
                start_time_utc: slot.start_time_utc,
                end_time_utc: slot.end_time_utc,
                capacity: slot.capacity || facility.capacity,
                price: slot.price ? (slot.price * 1.3) : facility.price_per_slot,
                couple_session_price: slot.couple_session_price ? (slot.couple_session_price * 1.3) : facility.couple_session_price,
                instructor_id: facility.instructor_id,
                instructor_name: facility.instructor_name
            });
        });

        console.log("Constructed Schedule Map:", JSON.stringify(scheduleMap, null, 2));

        const newSchedules = Object.keys(scheduleMap).map(dayEnum => ({
            day: dayEnum,
            is_available: true,
            time_slots: scheduleMap[dayEnum]
        }));

        // We want to merge with existing schedules or replace?
        // Since this is likely a fresh creation flow, push is okay.
        // Ideally we should check if 'DAY_OF_WEEK_MONDAY' exists and merge slots, 
        // but to keep it simple and functional for "Create", we will push.

        // Actually, to avoid duplicates if they click save multiple times for same day:
        // We will pull existing for these days and then push new.

        await Facility.findByIdAndUpdate(sessionId, {
            $pull: { 'schedule.schedules': { day: { $in: Object.keys(scheduleMap) } } }
        });

        await Facility.findByIdAndUpdate(sessionId, {
            $push: { 'schedule.schedules': { $each: newSchedules } }
        });

        return NextResponse.json({ message: 'Schedule updated successfully' });

    } catch (error) {
        console.error('Error adding availability:', error);
        if (error.name === 'ValidationError') {
            console.error("Validation Error Details:", JSON.stringify(error.errors, null, 2));
        }
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
