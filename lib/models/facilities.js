import mongoose from 'mongoose';

/* =======================
   Time Slot Schema
   ======================= */
const TimeSlotSchema = new mongoose.Schema({
    // Unified time storage
    start_time_utc: {
        type: String, // "14:30" (24-hour format)
        required: true,
    },
    end_time_utc: {
        type: String, // "15:30" (24-hour format)
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    couple_session_price: {
        type: Number,
        min: 0,
    },
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CenterAdminMetadata',
    },
    instructor_name: {
        type: String, // kept for mobile compatibility
        required: true,
    },
}, { _id: false });

/* =======================
   Weekly Day Schedule
   ======================= */
const DayScheduleSchema = new mongoose.Schema({
    day: {
        type: String,
        enum: [
            'DAY_OF_WEEK_MONDAY',
            'DAY_OF_WEEK_TUESDAY',
            'DAY_OF_WEEK_WEDNESDAY',
            'DAY_OF_WEEK_THURSDAY',
            'DAY_OF_WEEK_FRIDAY',
            'DAY_OF_WEEK_SATURDAY',
            'DAY_OF_WEEK_SUNDAY',
        ],
        required: true,
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    time_slots: {
        type: [TimeSlotSchema],
        default: [],
    },
}, { _id: false });

/* =======================
   Special Date Schedule
   ======================= */
const SpecialDateSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    time_slots: {
        type: [TimeSlotSchema],
        default: [],
    },
}, { _id: false });

/* =======================
   Facility Schema
   ======================= */
const FacilitySchema = new mongoose.Schema({
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessCenter',
        required: true,
        index: true,
    },

    type: {
        type: String, // FACILITY_TYPE_SWIMMING
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
    },

    image_urls: {
        type: [String],
        default: [],
    },

    duration_minutes: {
        type: Number,
        required: true,
    },

    equipment: {
        type: [String],
        default: [],
    },

    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CenterAdminMetadata',
    },

    instructor_name: {
        type: String,
    },

    instructor_profile_image: {
        type: String,
    },

    requires_booking: {
        type: Boolean,
        default: true,
    },

    schedule: {
        schedules: {
            type: [DayScheduleSchema],
            default: [],
        },
        special_dates: {
            type: [SpecialDateSchema],
            default: [],
        },
    },

    max_advance_booking_days: {
        type: Number,
        default: 90,
    },

    min_advance_booking_hours: {
        type: Number,
        default: 24,
    },

    min_no_of_slots: {
        type: Number,
    },

    icon_image_url: {
        type: String,
    },

    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CenterAdminMetadata',
    },

    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    autoIndex: process.env.NODE_ENV !== 'production',
});

export default mongoose.models.Facility ||
    mongoose.model('Facility', FacilitySchema, 'facilities');
