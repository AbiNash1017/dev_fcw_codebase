import mongoose from 'mongoose';

const CenterAdminMetadataSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        index: true,
    },
    fitness_center_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FitnessCenter',
        required: false,
    },
    username: {
        type: String,
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
    phone_number: {
        type: String,
    },
    email: {
        type: String,
    },
    profile_image_url: {
        type: String,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    is_profile_verified: {
        type: Boolean,
        default: false,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    address: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    onboarding_completed: {
        type: Boolean,
        default: false,
    },
}, {
    collection: 'center_admin_metadata',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    strict: false
});

// Method to check if onboarding is complete
CenterAdminMetadataSchema.methods.isOnboardingComplete = function () {
    return !!(
        this.first_name &&
        this.last_name &&
        this.gender &&
        this.phone_number
    );
};

export default mongoose.models.CenterAdminMetadata || mongoose.model('CenterAdminMetadata', CenterAdminMetadataSchema);
