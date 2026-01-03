// lib/authUtils.js
/**
 * Authentication utility functions for user status checks and routing
 */

/**
 * Fetch user status from the API
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} User status object
 */
export async function getUserStatus(token) {
    try {
        const response = await fetch('/api/auth/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user status:', error);
        throw error;
    }
}

/**
 * Determine the redirect path based on user status
 * @param {Object} userStatus - User status object from API
 * @returns {string} Path to redirect to
 */
export function getRedirectPath(userStatus) {
    if (!userStatus.authenticated) {
        return '/login';
    }

    if (!userStatus.onboardingCompleted) {
        return '/onboard';
    }

    if (!userStatus.hasFitnessCenter) {
        return '/createCentre';
    }

    return '/vendor/dashboard';
}

/**
 * Client-side check if user has completed onboarding
 * @param {Object} user - User object
 * @returns {boolean} True if onboarding is complete
 */
export function checkOnboardingComplete(user) {
    if (!user) return false;

    return !!(
        user.first_name &&
        user.last_name &&
        user.gender &&
        user.dob &&
        user.phone_number &&
        user.city &&
        user.state
    );
}

/**
 * Check if user owns a fitness center
 * @param {string} uid - User ID
 * @param {string} token - Firebase ID token
 * @returns {Promise<boolean>} True if user has a fitness center
 */
export async function checkHasFitnessCenter(uid, token) {
    try {
        const response = await fetch('/api/fitness-center/my', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.fitnessCenters && data.fitnessCenters.length > 0;
    } catch (error) {
        console.error('Error checking fitness center:', error);
        return false;
    }
}
