import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const checkCookies = async () => {
    const call1 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/setCookie`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const call2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkCookie`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const response = await call2.json();
    if (response.cookieMessage) {
        alert(response.cookieMessage);
    }
};

export function convertTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    // Handle "HH:MM AM/PM" or "HH:MM"
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period) {
        if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    return hours * 60 + minutes;
}

export function convertMinutesToTime(minutes) {
    if (minutes === undefined || minutes === null) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMins = mins.toString().padStart(2, '0');
    return `${displayHours}:${displayMins} ${period}`;
}

export function convertMinutesTo24hTime(minutes) {
    if (minutes === undefined || minutes === null) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Convert IST time (hours, minutes) to UTC minutes
// Formula: UTC_minutes = (IST_hours * 60 + IST_minutes) - 330
// If result < 0 -> add 1440
export function convertISTToUTCMinutes(totalMinutesIST) {
    let utcMinutes = totalMinutesIST - 330;
    if (utcMinutes < 0) {
        utcMinutes += 1440;
    }
    return utcMinutes;
}

// Convert UTC minutes to IST minutes
// Formula: IST_minutes = UTC_minutes + 330
// If result >= 1440 -> subtract 1440
export function convertUTCMinutesToISTMinutes(utcMinutes) {
    let istMinutes = utcMinutes + 330;
    if (istMinutes >= 1440) {
        istMinutes -= 1440;
    }
    return istMinutes;
}
