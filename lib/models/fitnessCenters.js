import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema({
    start_time_minutes: Number,
    end_time_minutes: Number,
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
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
    is_open: {
        type: Boolean,
        default: true,
    },
    time_slots: [TimeSlotSchema],
}, { _id: false });

const HolidaySchema = new mongoose.Schema({
    date: Date,
    name: String,
    is_closed: {
        type: Boolean,
        default: true,
    },
}, { _id: false });

const FitnessCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner_id: {
        type: String, // Firebase UID
        required: true,
        index: true,
    },
    subscription_plan_id: {
        type: Number,
        default: 1
    },
    description: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        },
        postal_code: {
            type: String,
        },
    },
    map_url: {
        type: String,
    },
    image_urls: {
        type: [String],
    },
    phone_number: {
        type: String,
    },
    email: {
        type: String,
    },
    available_facilities: {
        type: [String],
    },
    rating: {
        type: Number,
        default: 0,
    },
    total_reviews: {
        type: Number,
        default: 0,
    },
    business_hours: {
        schedules: [ScheduleSchema],
        holidays: [HolidaySchema],
    },
    amenities: {
        type: [String],
    },
    is_active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    autoIndex: process.env.NODE_ENV !== 'production',
});

// Index for geospatial queries
FitnessCenterSchema.index({ location: '2dsphere' });

export default mongoose.models.FitnessCenter || mongoose.model('FitnessCenter', FitnessCenterSchema, 'fitness_centers');
