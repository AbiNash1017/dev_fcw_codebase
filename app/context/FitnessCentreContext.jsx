'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { convertMinutesToTime } from "@/lib/utils";

const FitnessCentreContext = createContext(undefined);

export const FitnessCentreProvider = ({ children }) => {
    const [fitnessCentreId, setFitnessCentreId] = useState(null);
    const [businessHours, setBusinessHours] = useState(null);
    const [fitnessCentreLoading, setFitnessCentreLoading] = useState(true);
    const { user, loading } = useAuth();

    const fetchFitnessCentreId = async () => {
        if (!user) {
            setFitnessCentreLoading(false);
            return;
        }

        setFitnessCentreLoading(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/fitness-center/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Map business hours minutes -> 24h string if needed (for frontend state)
                if (data.business_hours && data.business_hours.schedules) {
                    data.business_hours.schedules.forEach(schedule => {
                        if (schedule.time_slots) {
                            schedule.time_slots.forEach(slot => {
                                if (!slot) return;
                                // If minutes exist, convert to utc string for frontend compatibility (Input type="time")
                                if (slot.start_time_minutes !== undefined) {
                                    slot.start_time_utc = convertMinutesToTime(slot.start_time_minutes);
                                }
                                if (slot.end_time_minutes !== undefined) {
                                    slot.end_time_utc = convertMinutesToTime(slot.end_time_minutes);
                                }
                            });
                        }
                    });
                }

                setFitnessCentreId(data._id);
                setBusinessHours(data.business_hours);
            } else {
                console.log("Fitness Centre not found");
                setFitnessCentreId(null);
                setBusinessHours(null);
            }
        } catch (error) {
            console.error("Error fetching fitness centre id:", error);
            setFitnessCentreId(null);
            setBusinessHours(null);
        } finally {
            setFitnessCentreLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchFitnessCentreId();
        } else if (!loading && !user) {
            setFitnessCentreId(null);
            setBusinessHours(null);
            setFitnessCentreLoading(false);
        }
    }, [user, loading]);

    const refreshFitnessCentre = () => {
        return fetchFitnessCentreId();
    };

    return (
        <FitnessCentreContext.Provider value={{ fitnessCentreId, businessHours, fitnessCentreLoading, refreshFitnessCentre }}>
            {children}
        </FitnessCentreContext.Provider>
    );
};

export const useFitnessCentre = () => {
    const context = useContext(FitnessCentreContext);
    if (!context) {
        throw new Error('useFitnessCentre must be used within a FitnessCentreProvider');
    }
    return context;
};
