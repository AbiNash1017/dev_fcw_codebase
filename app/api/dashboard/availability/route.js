import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import dbConnect from '@/lib/db';
import Facility from '@/lib/models/facilities';
import CenterAdminMetadata from '@/lib/models/CenterAdminMetadata';
import { convertTimeToMinutes } from '@/lib/utils';

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
        const uid = decodedToken.uid;
        await dbConnect();

        // Get admin metadata
        const adminMetadata = await CenterAdminMetadata.findOne({ uid });

        const body = await request.json();
        console.log("Received Availability Payload:", JSON.stringify(body, null, 2));


        const { availability, removed_days, session_id } = body;

        console.log('Availability Request - availability:', availability);
        console.log('Availability Request - removed_days:', removed_days);

        // Extract session ID from body (preferred) or availability
        let sessionId = session_id;
        if (!sessionId && availability && availability.length > 0) {
            sessionId = availability[0].session_id;
        }

        // 1. Handle Removed Days (Explicit Deletion)
        if (removed_days && Array.isArray(removed_days) && removed_days.length > 0) {
            if (!sessionId) {
                console.error('Cannot remove days without session_id');
                return NextResponse.json({ error: 'Session ID required for removal' }, { status: 400 });
            }
            console.log("Removing days:", removed_days, "from session:", sessionId);

            const pullResult = await Facility.findByIdAndUpdate(sessionId, {
                $pull: { 'schedule.schedules': { day: { $in: removed_days } } }
            });

            // Even for removal, we should update updated_at/by
            const updateSet = {
                'schedule.updated_at': new Date()
            };
            if (adminMetadata) {
                updateSet['schedule.updated_by'] = adminMetadata._id;
            }
            await Facility.findByIdAndUpdate(sessionId, { $set: updateSet });

            console.log('Pull result:', pullResult ? 'Success' : 'Failed');
        }

        if (!availability || !Array.isArray(availability) || availability.length === 0) {
            // If only removing days and no new availability (unlikely in this flow but possible), return success
            if (removed_days && Array.isArray(removed_days) && removed_days.length > 0) {
                return NextResponse.json({ message: 'Schedule updated successfully (removed days)' });
            }
            return NextResponse.json({ message: 'No availability data provided' }, { status: 400 });
        }

        // sessionId already extracted above
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

            // Convert time strings to minutes
            const timeStr = slot.start_time_utc || slot.start_time;
            const endTimeStr = slot.end_time_utc || slot.end_time;

            console.log(`Converting times - start: "${timeStr}", end: "${endTimeStr}"`);

            const startMinutes = convertTimeToMinutes(timeStr);
            const endMinutes = convertTimeToMinutes(endTimeStr);

            console.log(`Converted to minutes - start: ${startMinutes}, end: ${endMinutes}`);

            // Use integer price logic from previous steps
            scheduleMap[dayEnum].push({
                start_time_minutes: startMinutes,
                end_time_minutes: endMinutes,
                capacity: slot.capacity || facility.capacity,
                price: slot.price ? Math.round(slot.price * 1.3) : 0,
                couple_session_price: slot.couple_session_price ? Math.round(slot.couple_session_price * 1.3) : 0,
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

        await Facility.findByIdAndUpdate(sessionId, {
            $pull: { 'schedule.schedules': { day: { $in: Object.keys(scheduleMap) } } }
        });

        const updateOperation = {
            $push: { 'schedule.schedules': { $each: newSchedules } },
            $set: { 'schedule.updated_at': new Date() }
        };

        if (adminMetadata) {
            updateOperation.$set['schedule.updated_by'] = adminMetadata._id;
        }

        await Facility.findByIdAndUpdate(sessionId, updateOperation);

        return NextResponse.json({ message: 'Schedule updated successfully' });

    } catch (error) {
        console.error('Error adding availability:', error);
        if (error.name === 'ValidationError') {
            console.error("Validation Error Details:", JSON.stringify(error.errors, null, 2));
        }
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
