'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FitnessCentreContext = createContext(undefined);

export const FitnessCentreProvider = ({ children }) => {
    const [fitnessCentreId, setFitnessCentreId] = useState(null);
    const { user, loading } = useAuth();

    useEffect(() => {
        const fetchFitnessCentreId = async () => {
            if (!user) return;

            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/fitness-center/my', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFitnessCentreId(data._id);
                } else {
                    console.log("Fitness Centre not found");
                    setFitnessCentreId(null);
                }
            } catch (error) {
                console.error("Error fetching fitness centre id:", error);
            }
        };

        if (!loading && user) {
            fetchFitnessCentreId();
        } else if (!loading && !user) {
            setFitnessCentreId(null);
        }

    }, [user, loading]);

    return (
        <FitnessCentreContext.Provider value={{ fitnessCentreId }}>
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
