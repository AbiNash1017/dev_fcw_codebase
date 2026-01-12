'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Trash2, Clock, Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import TimePickerWheel from "@/components/ui/time-picker-wheel"
import { cn, convertTimeToMinutes, convertMinutesToTime, convertISTToUTCMinutes, convertUTCMinutesToISTMinutes } from "@/lib/utils"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useFitnessCentre } from '@/app/context/FitnessCentreContext'
import { useAuth } from '@/app/context/AuthContext'
import { format } from 'date-fns'

const DAYS_ENUM = [
    'DAY_OF_WEEK_SUNDAY', 'DAY_OF_WEEK_MONDAY', 'DAY_OF_WEEK_TUESDAY',
    'DAY_OF_WEEK_WEDNESDAY', 'DAY_OF_WEEK_THURSDAY', 'DAY_OF_WEEK_FRIDAY',
    'DAY_OF_WEEK_SATURDAY'
];

const VendorSessionManagement = ({ facilityType }) => {
    const { fitnessCentreId, fitnessCentreLoading, businessHours } = useFitnessCentre()
    const { user, loading } = useAuth()

    const facilityTypes = [
        { label: "GYM", value: "FACILITY_TYPE_GYM" },
        { label: "YOGA", value: "FACILITY_TYPE_YOGA" },
        { label: "ZUMBA", value: "FACILITY_TYPE_ZUMBA" },
        { label: "PERSONAL TRAINING", value: "FACILITY_TYPE_PERSONAL_TRAINING" },
        { label: "SWIMMING", value: "FACILITY_TYPE_SWIMMING" }
    ];

    const EQUIPMENT_OPTIONS = {
        "FACILITY_TYPE_GYM": [
            "Treadmills", "Dumbbells", "Barbells", "Bench Press", "Squat Rack", "Ellipticals", "Rowing Machines", "Kettlebells", "Resistance Bands"
        ],
        "FACILITY_TYPE_YOGA": [
            "Yoga Mats", "Yoga Blocks", "Yoga Straps", "Bolsters", "Blankets", "Meditation Cushions"
        ],
        "FACILITY_TYPE_ZUMBA": [
            "Sound System", "Mirrors", "Dance Floor", "Weights"
        ],
        "FACILITY_TYPE_PERSONAL_TRAINING": [
            "Weights", "Resistance Bands", "TRX", "Medicine Balls", "Kettlebells"
        ],
        "FACILITY_TYPE_SWIMMING": [
            "Kickboards", "Pull Buoys", "Swim Fins", "Hand Paddles", "Snorkels", "Noodles"
        ]
    };

    // Determine initial type from prop
    const initialTypeValue = facilityType
        ? (facilityType.toUpperCase().startsWith('FACILITY_TYPE_')
            ? facilityType  // Already in correct format (return original value to preserve casing from DB/URL if needed, though usually we want to standardize)
            : facilityTypes.find(t => t.label === facilityType.toUpperCase())?.value)
        : '';

    // Session State
    const [isSaving, setIsSaving] = useState(false);
    const [isScheduleDirty, setIsScheduleDirty] = useState(false);
    const [newSession, setNewSession] = useState({
        type: initialTypeValue || '',
        name: '',
        description: '',
        duration_minutes: '',
        max_advance_booking_days: 30,
        min_advance_booking_hours: 2,
        instructor_name: '',
        requires_booking: true,
        equipment: [],
    });

    // Update if prop changes (e.g. switching tabs)
    useEffect(() => {
        if (facilityType) {
            const mappedValue = facilityType.toUpperCase().startsWith('FACILITY_TYPE_')
                ? facilityType  // Already in correct format
                : facilityTypes.find(t => t.label === facilityType.toUpperCase())?.value;
            if (mappedValue) {
                setNewSession(prev => ({ ...prev, type: mappedValue }));
            }
        }
    }, [facilityType]);

    // Schedule State
    // Format: { '0': [{ start_time: 'HH:mm', end_time: 'HH:mm' }], ... } // 0 = Sunday, 1 = Monday
    const [schedules, setSchedules] = useState({});
    const [clearedDays, setClearedDays] = useState(new Set()); // Track days that are completely emptied
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentSlot, setCurrentSlot] = useState({
        start_time: '',
        end_time: '',
        capacity: '',
        price: '',
        couples_price: '' // Added couples price
    });

    // Equipment input
    const [equipmentInput, setEquipmentInput] = useState('');



    const handleEquipmentSelect = (value) => {
        if (value && !newSession.equipment.includes(value)) {
            setNewSession(prev => ({
                ...prev,
                equipment: [...prev.equipment, value]
            }));
        }
    };

    const handleAddCustomEquipment = () => {
        if (equipmentInput.trim()) {
            if (!newSession.equipment.includes(equipmentInput.trim())) {
                setNewSession(prev => ({
                    ...prev,
                    equipment: [...prev.equipment, equipmentInput.trim()]
                }));
            }
            setEquipmentInput('');
        }
    };

    const handleRemoveEquipment = (index) => {
        setNewSession(prev => ({
            ...prev,
            equipment: prev.equipment.filter((_, i) => i !== index)
        }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewSession({
            ...newSession,
            [name]: type === 'checkbox' ? (name === 'requires_booking' ? checked : value) : value,
        });
    };

    // --- Helper for Time Calculation ---
    // --- Helper for Time Calculation ---
    const calculateEndTime = (startTimeStr, durationMinutes) => {
        if (!startTimeStr || !durationMinutes) return '';
        const startMinutes = convertTimeToMinutes(startTimeStr);
        const totalMinutes = startMinutes + parseInt(durationMinutes);
        return convertMinutesToTime(totalMinutes);
    };

    // Schedule Handlers
    const handleStartTimeChange = (newStartTime) => {
        const updatedEndTime = calculateEndTime(newStartTime, newSession.duration_minutes);
        setCurrentSlot(prev => ({
            ...prev,
            start_time: newStartTime,
            end_time: updatedEndTime || prev.end_time // Auto-set end time if calculation possible
        }));
    };

    const handleAddSlot = () => {
        if (!currentSlot.start_time || !currentSlot.end_time || !selectedDate) {
            toast.error("Please select a start and end time.");
            return;
        }

        if (!currentSlot.capacity || parseInt(currentSlot.capacity) <= 0 || !currentSlot.price) {
            toast.error("Please enter a valid Capacity (Minimum 1) and Price for the slot.");
            return;
        }

        const dayIndex = selectedDate.getDay(); // 0-6

        // Business Hours Validation
        if (businessHours) {
            const dayEnum = DAYS_ENUM[dayIndex];
            const schedule = businessHours.schedules?.find(s => s.day === dayEnum);

            if (schedule) {
                if (!schedule.is_open) {
                    toast.error(`The facility is closed on ${format(selectedDate, 'EEEE')}. Cannot add sessions.`);
                    return;
                }

                const sessionStart = convertTimeToMinutes(currentSlot.start_time);
                const sessionEnd = convertTimeToMinutes(currentSlot.end_time);

                // Check if session falls within ANY of the open slots
                const validSlot = schedule.time_slots?.some(slot => {
                    // Skip null/undefined slots
                    if (!slot) return false;

                    // Support new schema (utc minutes) - use helper to convert UTC to IST
                    // Also support old schema (non-utc minutes or string)
                    let slotStart, slotEnd;

                    if (slot.start_time_minutes_utc !== undefined && slot.start_time_minutes_utc !== null) {
                        // Convert UTC to IST
                        slotStart = convertUTCMinutesToISTMinutes(slot.start_time_minutes_utc);
                    } else if (slot.start_time_minutes !== undefined && slot.start_time_minutes !== null) {
                        slotStart = slot.start_time_minutes;
                    } else {
                        slotStart = convertTimeToMinutes(slot.start_time_utc || slot.start_time);
                    }

                    if (slot.end_time_minutes_utc !== undefined && slot.end_time_minutes_utc !== null) {
                        // Convert UTC to IST
                        slotEnd = convertUTCMinutesToISTMinutes(slot.end_time_minutes_utc);
                    } else if (slot.end_time_minutes !== undefined && slot.end_time_minutes !== null) {
                        slotEnd = slot.end_time_minutes;
                    } else {
                        slotEnd = convertTimeToMinutes(slot.end_time_utc || slot.end_time);
                    }

                    if (slotStart === undefined || slotEnd === undefined || slotStart === null || slotEnd === null) return false;

                    return sessionStart >= slotStart && sessionEnd <= slotEnd;
                });

                if (!validSlot) {
                    const openTimes = schedule.time_slots
                        .filter(s => s != null) // Filter out null slots
                        .map(s => {
                            let start, end;

                            if (s.start_time_minutes_utc !== undefined && s.start_time_minutes_utc !== null) {
                                start = convertMinutesToTime(convertUTCMinutesToISTMinutes(s.start_time_minutes_utc));
                            } else if (s.start_time_minutes !== undefined && s.start_time_minutes !== null) {
                                start = convertMinutesToTime(s.start_time_minutes);
                            } else {
                                start = s.start_time_utc || s.start_time || 'N/A';
                            }

                            if (s.end_time_minutes_utc !== undefined && s.end_time_minutes_utc !== null) {
                                end = convertMinutesToTime(convertUTCMinutesToISTMinutes(s.end_time_minutes_utc));
                            } else if (s.end_time_minutes !== undefined && s.end_time_minutes !== null) {
                                end = convertMinutesToTime(s.end_time_minutes);
                            } else {
                                end = s.end_time_utc || s.end_time || 'N/A';
                            }

                            return `${start} - ${end}`;
                        }).join(', ');

                    toast.error(`Session time (${currentSlot.start_time} - ${currentSlot.end_time}) is outside business hours. Open hours: ${openTimes}`);
                    return;
                }
            }
        }

        const existingSlots = schedules[dayIndex] || [];

        // Use slot specific values
        const slotToAdd = {
            ...currentSlot,
            capacity: currentSlot.capacity,
            price: currentSlot.price,
            couples_price: currentSlot.couples_price
        };

        setSchedules({
            ...schedules,
            [dayIndex]: [...existingSlots, slotToAdd]
        });

        // Reset current slot inputs (keep empty to show placeholders)
        // Resetting start_time to empty might trigger validation or UI issues if TimePicker doesn't handle empty.
        // But original code did this.
        setCurrentSlot({ start_time: '', end_time: '', capacity: '', price: '', couples_price: '' });
        setIsScheduleDirty(true);
    };

    const handleRemoveSlot = async (dayIndex, index) => {
        if (!schedules[dayIndex]) return;

        const updatedSlots = schedules[dayIndex].filter((_, i) => i !== index);

        // Optimistically update UI
        let newSchedules = { ...schedules };
        let newClearedDays = new Set(clearedDays);

        if (updatedSlots.length === 0) {
            delete newSchedules[dayIndex];
            newClearedDays.add(dayIndex);
            setClearedDays(newClearedDays);
        } else {
            newSchedules[dayIndex] = updatedSlots;
        }
        setSchedules(newSchedules);

        // Immediate API Call
        if (sessionId && user) {
            try {
                const token = await user.getIdToken();
                const dayEnum = DAYS_ENUM[dayIndex];

                // Get the representative date for the payload (same logic as save)
                const getRepresentativeDate = (dIdx) => {
                    const idx = parseInt(dIdx);
                    const today = new Date();
                    const currentDay = today.getDay();
                    let daysUntil = (idx - currentDay + 7) % 7;
                    const nextDate = new Date(today);
                    nextDate.setDate(today.getDate() + daysUntil);
                    return format(nextDate, 'yyyy-MM-dd');
                };

                const representativeDate = getRepresentativeDate(dayIndex);

                const availabilityPayload = {
                    availability: updatedSlots.length > 0 ? updatedSlots.map(slot => ({
                        day: representativeDate,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        capacity: slot.capacity,
                        price: slot.price,
                        couple_session_price: slot.couples_price || 0,
                        session_id: sessionId
                    })) : [],
                    removed_days: updatedSlots.length === 0 ? [dayEnum] : [],
                    session_id: sessionId
                };

                // If updatedSlots is empty, we must ensure the API knows to clear this day.
                // The API logic handles removed_days array for this.

                const res = await fetch(`/api/dashboard/availability`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(availabilityPayload),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to delete slot');
                }
                toast.success("Slot removed.");
            } catch (error) {
                console.error("Error removing slot:", error);
                toast.error("Failed to remove slot from server. Please refresh.");
                // Could revert state here if needed
            }
        }
    };

    const [sessionId, setSessionId] = useState(null); // Track if editing existing session

    const fetchSessionByType = async (type) => {
        // Wait for fitness center ID to be loaded before making the request
        if (!type || fitnessCentreLoading || !fitnessCentreId || !user) return;

        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/dashboard/session?type=${type}&fitness_center_id=${fitnessCentreId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const session = data.data;
                console.log("Fetched existing session:", session);

                setSessionId(session._id);

                // Populate Form
                setNewSession({
                    type: session.type, // Should match
                    name: session.name,
                    description: session.description || '',
                    duration_minutes: session.duration_minutes || '',
                    max_advance_booking_days: (session.schedule?.max_advance_booking_days) || session.max_advance_booking_days || 30,
                    min_advance_booking_hours: (session.schedule?.min_advance_booking_hours) || session.min_advance_booking_hours || 2,
                    instructor_name: session.instructor_name || '',
                    requires_booking: session.requires_booking,
                    equipment: session.equipment || [],
                });

                // Populate Schedule
                // Backend returns: schedule: { schedules: [{ day: 'DAY_OF_WEEK_...', time_slots: [...] }] }
                if (session.schedule && session.schedule.schedules) {
                    const daysEnum = [
                        'DAY_OF_WEEK_SUNDAY', 'DAY_OF_WEEK_MONDAY', 'DAY_OF_WEEK_TUESDAY',
                        'DAY_OF_WEEK_WEDNESDAY', 'DAY_OF_WEEK_THURSDAY', 'DAY_OF_WEEK_FRIDAY',
                        'DAY_OF_WEEK_SATURDAY'
                    ];

                    const loadedSchedules = {};
                    session.schedule.schedules.forEach(daySch => {
                        const dayIndex = daysEnum.indexOf(daySch.day);
                        if (dayIndex !== -1 && daySch.time_slots && Array.isArray(daySch.time_slots)) {
                            loadedSchedules[dayIndex] = daySch.time_slots
                                .filter(slot => slot != null) // Filter out null/undefined slots
                                .map(slot => {
                                    // Handle start_time - prefer UTC minutes format
                                    let startTime = '';
                                    if (slot.start_time_minutes_utc !== undefined && slot.start_time_minutes_utc !== null) {
                                        // Convert UTC to IST
                                        startTime = convertMinutesToTime(convertUTCMinutesToISTMinutes(slot.start_time_minutes_utc));
                                    } else if (slot.start_time_minutes !== undefined && slot.start_time_minutes !== null) {
                                        startTime = convertMinutesToTime(slot.start_time_minutes);
                                    } else if (slot.start_time_utc || slot.start_time) {
                                        startTime = convertMinutesToTime(convertTimeToMinutes(slot.start_time_utc || slot.start_time));
                                    }

                                    // Handle end_time - prefer UTC minutes format
                                    let endTime = '';
                                    if (slot.end_time_minutes_utc !== undefined && slot.end_time_minutes_utc !== null) {
                                        // Convert UTC to IST
                                        endTime = convertMinutesToTime(convertUTCMinutesToISTMinutes(slot.end_time_minutes_utc));
                                    } else if (slot.end_time_minutes !== undefined && slot.end_time_minutes !== null) {
                                        endTime = convertMinutesToTime(slot.end_time_minutes);
                                    } else if (slot.end_time_utc || slot.end_time) {
                                        endTime = convertMinutesToTime(convertTimeToMinutes(slot.end_time_utc || slot.end_time));
                                    }

                                    return {
                                        start_time: startTime,
                                        end_time: endTime,
                                        capacity: slot.capacity,
                                        price: slot.price,
                                        couples_price: slot.couple_session_price
                                    };
                                });
                        }
                    });
                    setSchedules(loadedSchedules);
                    setClearedDays(new Set()); // Reset on load
                } else {
                    setSchedules({});
                    setClearedDays(new Set()); // Reset on load
                }
            } else {
                // Not found or error -> Reset to "New" mode
                setSessionId(null);
                // We keep the Type, but maybe reset other fields?
                // For better UX, if switching types, clear fields.
                // But careful not to clear if user just typed 'ZUMBA' and form was filling.
                // We typically reset when type changes to something NEW.
                // Let's reset the dynamic fields but keep generic defaults if needed.
                // Or just leave it? User might want to carry over values?
                // "fetch info... then i can edit in it".
                // If I change to "GYM" and it doesn't exist, I expect a fresh form.
                if (res.status === 404) {
                    setNewSession(prev => ({
                        ...prev,
                        name: '', description: '', duration_minutes: '',
                        equipment: []
                    }));
                    setSchedules({});
                }
            }
        } catch (error) {
            console.error("Error fetching session:", error);
        }
    };

    // Trigger fetch when Type changes OR when fitnessCentreId becomes available
    useEffect(() => {
        if (newSession.type && fitnessCentreId && !fitnessCentreLoading) {
            fetchSessionByType(newSession.type);
        }
    }, [newSession.type, fitnessCentreId, fitnessCentreLoading]);

    const addSession = async (e, mode = 'all') => {
        if (e && e.preventDefault) e.preventDefault();

        const {
            type, name, description, duration_minutes,
            max_advance_booking_days, min_advance_booking_hours,
            instructor_name, equipment
        } = newSession;

        // Validation
        if (!type || !name || !description || !duration_minutes || !instructor_name) {
            toast.error('Please fill all the required session fields!');
            return;
        }

        if (mode !== 'details_only' && Object.keys(schedules).length === 0 && !sessionId) {
            toast.error('Please add at least one schedule slot!');
            return;
        }

        if (!user) return;

        if (fitnessCentreLoading) {
            toast.info('Please wait while the fitness center information is loading...');
            return;
        }

        if (!fitnessCentreId) {
            toast.error('Fitness Center ID not found. Please refresh the page and try again.');
            setIsSaving(false);
            return;
        }

        setIsSaving(true);
        const token = await user.getIdToken();

        // Derive session level defaults from the first created slot
        const allSlots = Object.values(schedules).flat();
        const representativeSlot = allSlots[0] || {};

        // 1. Create/Update Session Payload
        const sessionPayload = {
            session_id: sessionId, // Include ID if updating
            type,
            name,
            description,
            equipment,
            instructor_name,
            requires_booking: newSession.requires_booking,
            duration_minutes: parseInt(duration_minutes),
            min_no_of_slots: parseInt(representativeSlot.capacity || 0), // Use first slot capacity
            max_advance_booking_days: parseInt(max_advance_booking_days || 30),
            min_advance_booking_hours: parseInt(min_advance_booking_hours || 2),
            price: parseFloat(representativeSlot.price || 0), // Use first slot price
            couple_session_price: parseFloat(representativeSlot.couples_price || 0), // Use first slot couples price
            fitness_center_id: fitnessCentreId
        };

        try {
            // Step 1: Create or Update Session
            const method = sessionId ? 'PUT' : 'POST';
            const endpoint = `/api/dashboard/session`; // Same endpoint

            const sessionResponse = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(sessionPayload),
            });

            const sessionData = await sessionResponse.json();

            if (!sessionResponse.ok) {
                // Check for conflict 
                if (sessionResponse.status === 409 && sessionData.existing_id) {
                    // Should have been handled by fetch-on-type, but just in case:
                    toast.error("A session of this type already exists. Please refresh or select the type again to edit it.");
                    setIsSaving(false);
                    return;
                }
                throw new Error(sessionData.message || sessionData.error || 'Failed to save session');
            }

            const activeSessionId = sessionId || sessionData._id || sessionData.data?._id;

            if (!activeSessionId) {
                throw new Error('Session saved but no ID returned.');
            }

            if (!sessionId) setSessionId(activeSessionId); // Switch to edit mode after first save

            if (mode === 'details_only') {
                toast.success(sessionId ? 'Session details updated!' : 'Session created successfully!');
                setIsSaving(false);
                return;
            }

            // Step 2: Update Schedule
            const getRepresentativeDate = (dayIndexStr) => {
                const dayIndex = parseInt(dayIndexStr);
                const today = new Date();
                const currentDay = today.getDay(); // 0-6
                let daysUntil = (dayIndex - currentDay + 7) % 7;
                const nextDate = new Date(today);
                nextDate.setDate(today.getDate() + daysUntil);
                return format(nextDate, 'yyyy-MM-dd');
            }

            const availabilityList = Object.entries(schedules).flatMap(([dayIndex, slots]) => {
                const representativeDate = getRepresentativeDate(dayIndex);
                return slots.map(slot => ({
                    day: representativeDate,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    capacity: slot.capacity,
                    price: slot.price,
                    couple_session_price: slot.couples_price || 0,
                    session_id: activeSessionId
                }));
            });


            const availabilityPayload = {
                availability: availabilityList,
                removed_days: Array.from(clearedDays)
                    .filter(dayIdx => !schedules[dayIdx]) // Only send if STILL empty (user didn't re-add)
                    .map(dayIdx => {
                        const days = [
                            'DAY_OF_WEEK_SUNDAY', 'DAY_OF_WEEK_MONDAY', 'DAY_OF_WEEK_TUESDAY',
                            'DAY_OF_WEEK_WEDNESDAY', 'DAY_OF_WEEK_THURSDAY', 'DAY_OF_WEEK_FRIDAY',
                            'DAY_OF_WEEK_SATURDAY'
                        ];
                        return days[dayIdx];
                    }),
                session_id: activeSessionId
            };


            console.log('Sending availability payload:', JSON.stringify(availabilityPayload, null, 2));
            console.log('Current schedules state:', schedules);
            console.log('Cleared days:', Array.from(clearedDays));

            const availabilityResponse = await fetch(`/api/dashboard/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(availabilityPayload),
            });

            const availabilityResData = await availabilityResponse.json();
            console.log('Availability API response:', availabilityResData);

            if (availabilityResponse.ok) {
                toast.success('Schedule updated successfully!');
                setIsScheduleDirty(false);
            } else {
                console.error('Availability API error:', availabilityResData);
                toast.warning(`Session saved, but failed to update schedule: ${availabilityResData.message || availabilityResData.error}`);
            }

        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSession = async () => {
        if (!sessionId || !user) return;

        try {
            setIsSaving(true);
            const token = await user.getIdToken();
            const res = await fetch(`/api/dashboard/session?session_id=${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success("Session deleted successfully.");
                // Reset form completely
                setNewSession({
                    type: '', // Clear type to prevent re-fetch
                    name: '',
                    description: '',
                    duration_minutes: '',
                    max_advance_booking_days: 30,
                    min_advance_booking_hours: 2,
                    instructor_name: '',
                    requires_booking: true,
                    equipment: [],
                });
                setSchedules({});
                setSessionId(null);
                setClearedDays(new Set());
            } else {
                const data = await res.json();
                toast.error(`Failed to delete: ${data.error || data.message}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedDayIndex = selectedDate ? selectedDate.getDay() : null;
    const selectedDateSlots = selectedDayIndex !== null ? (schedules[selectedDayIndex] || []) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>{sessionId ? 'Edit Facility Session' : 'Add New Facility Session'}</span>
                        {sessionId && (
                            <Button
                                onClick={(e) => addSession(e, 'details_only')}
                                disabled={isSaving}
                                className="bg-black text-white hover:bg-gray-800"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Details"}
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={addSession} className="space-y-6">

                        {/* --- Basic Session Info --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Facility Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Facility Type <span className='text-black'>*</span></Label>
                                <Select
                                    name="type"
                                    value={newSession.type}
                                    onValueChange={(value) => setNewSession({ ...newSession, type: value })}
                                    disabled={!!facilityType}
                                >
                                    <SelectTrigger className={facilityType ? "bg-gray-100" : ""}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facilityTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Session Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Session Name <span className='text-black'>*</span></Label>
                                <Input id="name" name="name" placeholder="e.g. Morning Zumba" required value={newSession.name} onChange={handleInputChange} />
                            </div>

                            {/* Instructor Name */}
                            <div className="space-y-2">
                                <Label htmlFor="instructor_name">Instructor Name <span className='text-black'>*</span></Label>
                                <Input id="instructor_name" name="instructor_name" required value={newSession.instructor_name} onChange={handleInputChange} />
                            </div>





                            {/* Requires Booking Checkbox */}
                            <div className="flex items-center space-x-2 pt-8">
                                <Input
                                    id="requires_booking"
                                    name="requires_booking"
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={newSession.requires_booking}
                                    onChange={handleInputChange}
                                />
                                <Label htmlFor="requires_booking">Requires Booking</Label>
                            </div>
                        </div>

                        {/* Booking Rules */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border">
                            <h3 className="col-span-full font-semibold text-gray-700">Booking Rules</h3>
                            <div className="space-y-2">
                                <Label htmlFor="max_advance_booking_days" className="text-sm text-gray-600">Max Advance Booking (Days)</Label>
                                <Input id="max_advance_booking_days" name="max_advance_booking_days" type="number" min="1" value={newSession.max_advance_booking_days} onChange={handleInputChange} className="bg-white" onWheel={(e) => e.target.blur()} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_advance_booking_hours" className="text-sm text-gray-600">Min Advance Booking (Hours)</Label>
                                <Input id="min_advance_booking_hours" name="min_advance_booking_hours" type="number" min="0" value={newSession.min_advance_booking_hours} onChange={handleInputChange} className="bg-white" onWheel={(e) => e.target.blur()} />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span className='text-black'>*</span></Label>
                            <Textarea id="description" name="description" required value={newSession.description} onChange={handleInputChange} />
                        </div>

                        {/* Equipment */}
                        <div className="space-y-2">
                            <Label>Equipment Provided</Label>
                            <div className="flex flex-col gap-3">
                                {/* Predefined Options */}
                                {newSession.type && EQUIPMENT_OPTIONS[newSession.type] && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {EQUIPMENT_OPTIONS[newSession.type].map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => handleEquipmentSelect(item)}
                                                disabled={newSession.equipment.includes(item)}
                                                className={cn(
                                                    "px-3 py-1 text-sm rounded-full border transition-all",
                                                    newSession.equipment.includes(item)
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white text-gray-700 border-gray-300 hover:border-black hover:text-black"
                                                )}
                                            >
                                                + {item}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={equipmentInput}
                                        onChange={(e) => setEquipmentInput(e.target.value)}
                                        placeholder="Add custom equipment..."
                                        className="max-w-md"
                                    />
                                    <Button type="button" onClick={handleAddCustomEquipment} variant="outline" className="bg-black px-4 text-white hover:bg-gray-800">
                                        <Plus className="h-4 w-4" />
                                        <span>Add</span>
                                    </Button>
                                </div>
                                {newSession.equipment.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {newSession.equipment.map((item, index) => (
                                            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                                <span>{item}</span>
                                                <button type="button" onClick={() => handleRemoveEquipment(index)} className="text-gray-500 hover:text-red-600">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- Advanced Schedule Builder Section --- */}
                        <div className="space-y-4 pt-6 border-t font-sans">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">Session Schedule</h3>
                                    <p className="text-sm text-muted-foreground">Select a day and configure booking hours.</p>
                                </div>
                                <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                                    {Object.keys(schedules).length} days configured
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left Column: Scheduler Controls (Replaces Calendar) */}
                                <div className="w-full lg:w-auto p-6 border rounded-2xl bg-white shadow-sm flex flex-col gap-6 items-center">

                                    {/* Duration Input (Moved Here) */}
                                    <div className="w-full space-y-2">
                                        <Label htmlFor="duration_minutes" className="text-sm font-semibold text-gray-700">
                                            Duration (minutes) <span className='text-black'>*</span>
                                        </Label>
                                        <Input
                                            id="duration_minutes"
                                            name="duration_minutes"
                                            type="number"
                                            min="15"
                                            placeholder="Enter duration first"
                                            required
                                            value={newSession.duration_minutes || ''}
                                            onChange={handleInputChange}
                                            onWheel={(e) => e.target.blur()}
                                            className={cn(
                                                "bg-white border-gray-200 focus:border-black transition-all",
                                                !newSession.duration_minutes && "ring-2 ring-red-100 border-red-200"
                                            )}
                                        />
                                    </div>

                                    {/* Day Selector */}
                                    <div className={cn(
                                        "w-full transition-all duration-200",
                                        !newSession.duration_minutes && "opacity-50 pointer-events-none grayscale"
                                    )}>
                                        <Label className="text-sm font-semibold text-gray-700 mb-3 block text-center">Select Day</Label>
                                        <div className="flex justify-between gap-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
                                                const isSelected = selectedDate && selectedDate.getDay() === idx;
                                                const hasSchedule = schedules[idx] && schedules[idx].length > 0;

                                                let isOpen = true;
                                                if (businessHours) {
                                                    const schedule = businessHours.schedules?.find(s => s.day === DAYS_ENUM[idx]);
                                                    isOpen = schedule ? schedule.is_open : true;
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!isOpen) {
                                                                toast.error("Facility is closed on this day.");
                                                                return;
                                                            }
                                                            const today = new Date();
                                                            const currentDay = today.getDay();
                                                            const daysUntil = (idx - currentDay + 7) % 7;
                                                            const nextDate = new Date(today);
                                                            nextDate.setDate(today.getDate() + daysUntil);
                                                            setSelectedDate(nextDate);
                                                        }}
                                                        className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                                            isSelected
                                                                ? "bg-black text-white scale-110 shadow-md"
                                                                : (isOpen
                                                                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                                    : "bg-gray-50 text-gray-300 cursor-not-allowed decoration-red-300 decoration-2"), // Visual cue for closed
                                                            hasSchedule && !isSelected && "ring-2 ring-black ring-offset-1 text-black bg-gray-100",
                                                            !isOpen && !isSelected && "bg-red-50 text-red-300" // Explicit closed style
                                                        )}
                                                        title={!isOpen ? "Closed" : ""}
                                                    >
                                                        {day}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "w-full flex justify-center gap-6 transition-all duration-200",
                                        !newSession.duration_minutes && "opacity-50 pointer-events-none grayscale"
                                    )}>
                                        {/* Start Time */}
                                        <div className="flex flex-col items-center gap-2">
                                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Time</Label>
                                            <TimePickerWheel
                                                value={currentSlot.start_time}
                                                onChange={handleStartTimeChange}
                                            />
                                        </div>

                                        {/* End Time (Display Only) */}
                                        <div className="flex flex-col items-center gap-2 pointer-events-none opacity-70">
                                            <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">End Time</Label>
                                            <div className="h-[120px] w-full flex items-center justify-center text-xl font-bold bg-gray-50 rounded-lg px-4 border">
                                                {currentSlot.end_time || '--:--'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slot Specific Details */}
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-gray-500">Capacity</Label>
                                            <Input
                                                type="number"
                                                placeholder="Capacity"
                                                value={currentSlot.capacity || ''}
                                                onChange={(e) => setCurrentSlot({ ...currentSlot, capacity: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-gray-500">Price</Label>
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                value={currentSlot.price || ''}
                                                onChange={(e) => setCurrentSlot({ ...currentSlot, price: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-gray-500">Couples Price</Label>
                                            <Input
                                                type="number"
                                                placeholder="Optional"
                                                value={currentSlot.couples_price || ''}
                                                onChange={(e) => setCurrentSlot({ ...currentSlot, couples_price: e.target.value })}
                                                className="h-9 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAddSlot}
                                        disabled={!newSession.duration_minutes}
                                        className={cn(
                                            "w-full bg-black hover:bg-gray-800 text-white h-12 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-md font-medium",
                                            !newSession.duration_minutes && "opacity-50 cursor-not-allowed bg-gray-400"
                                        )}
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span>Add Time Slot</span>
                                    </Button>

                                </div>

                                {/* Right Column: Existing Slots List */}
                                <div className="flex-1 w-full space-y-4">
                                    {selectedDate ? (
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-all duration-300 min-h-[400px]">
                                            <h4 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
                                                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                                                    <Clock className="w-5 h-5 text-black" />
                                                </div>
                                                {format(selectedDate, 'EEEE')} Schedule
                                            </h4>

                                            {/* Existing Slots for this day */}
                                            {selectedDateSlots.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedDateSlots.map((slot, idx) => (
                                                        <div key={idx} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                            <div className='flex items-center gap-3'>
                                                                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-gray-700 text-lg tracking-tight">
                                                                        {slot.start_time}
                                                                        <span className='text-gray-300 mx-2 font-normal'>—</span>
                                                                        {slot.end_time}
                                                                    </span>
                                                                    <span className="text-xs text-gray-500 font-medium">
                                                                        Cap: {slot.capacity} • ₹{slot.price}
                                                                        {slot.couples_price && <span className="text-purple-600 ml-1">• Couple: ₹{slot.couples_price}</span>}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete this time slot?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will immediately remove the slot <strong>{slot.start_time} - {slot.end_time}</strong>. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleRemoveSlot(selectedDayIndex, idx)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                    <Clock className="w-12 h-12 mb-2 opacity-20" />
                                                    <p className="text-sm font-medium">No slots added yet</p>
                                                    <p className="text-xs opacity-60">Use the wheels to add booking hours</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 border-2 border-dashed rounded-lg p-8">
                                            Select a day to configure
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-col md:flex-row gap-4 pt-6 mt-8 border-t border-gray-100 justify-end">
                            {/* Update Schedule Button - Only visible when dirty */}
                            {isScheduleDirty && (
                                <Button
                                    type="button"
                                    onClick={(e) => addSession(e, 'schedule_only')}
                                    disabled={isSaving}
                                    className="bg-black hover:bg-gray-800 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:shadow-none min-w-[200px]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <span>Update Schedule</span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}

export default VendorSessionManagement