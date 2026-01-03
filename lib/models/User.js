import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
    },
    gender: {
        type: String,
    },
    dob: {
        type: Date,
    },
    phone_number: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    address: {
        type: String,
    },
    profile_image_url: {
        type: String,
    },
    onboarding_completed: {
        type: Boolean,
        default: false,
    },
    ai_credits: {
        type: Number,
        default: 0,
    },
    karma_points: {
        type: Number,
        default: 0,
    },
    user_since: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
}, {
    collection: 'users',
    timestamps: true, // This will handle createdAt and updatedAt automatically if not overridden
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
