import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Assuming there's a User model, or just keeping it as ObjectId if strict ref not needed yet
    },
    facility_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Facility',
    },
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'FitnessCenter',
    },
    slot_start_time: {
        type: Date,
        required: true,
    },
    number_of_people: {
        type: Number,
        required: true,
        min: 1,
    },
    status: {
        type: String,
        enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED', 'NO_SHOW'], // Added common statuses based on "CONFIRMED"
        default: 'CONFIRMED',
    },
    slot_key: {
        type: String,
    },
    payment_method: {
        type: String,
    },
    payment_status: {
        type: String,
    },
    amount_total: {
        type: Number,
        required: true,
    },
    amount_held: {
        type: Number,
    },
    amount_paid: {
        type: Number,
        default: 0,
    },
    attendance_status: {
        type: String,
    },
    check_in_method: {
        type: String,
    },
    qr_code_token: {
        type: String,
    },
    pin: {
        type: String,
    },
    expires_at: {
        type: Date,
    },
    idempotency_key: {
        type: String,
    },
    hold_tx_id: {
        type: String,
    },
    payment_completed_at: {
        type: Date,
    },
    payment_transaction_id: {
        type: String,
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    autoIndex: process.env.NODE_ENV !== 'production',
});

// Create compound index for efficient querying if needed (e.g., by user, by facility)
BookingSchema.index({ user_id: 1, created_at: -1 });
BookingSchema.index({ fitness_center_id: 1, slot_start_time: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema, 'bookings');
