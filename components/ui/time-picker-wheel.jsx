'use client';

import React, { useEffect, useState, useMemo } from 'react';
import WheelPicker from './wheel-picker';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
// Optimized minutes for booking? Maybe step of 5? 
// "allow users to easily choose available booking slots" -> 15 min intervals is common.
// specific minute might be annoying on a wheel.
// Let's use 5 minute intervals: 00, 05, ... 55.
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

const TimePickerWheel = ({ value, onChange }) => {
    // Value format: "HH:mm" 24-hour

    // Parse initial value (supports "HH:mm" 24h)
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '12', minute: '00' };

        // Fallback to 24-hour parsing
        const [h, m] = timeStr.split(':').map(Number);

        return {
            hour: (h || 0).toString().padStart(2, '0'),
            minute: (m || 0).toString().padStart(2, '0')
        };
    };

    const [selected, setSelected] = useState(parseTime(value));

    useEffect(() => {
        if (value) {
            const parsed = parseTime(value);
            // Simple check to prevent loops/unnecessary updates
            if (parsed.hour !== selected.hour || parsed.minute !== selected.minute) {
                setSelected(parsed);
            }
        }
    }, [value]);

    const handleChange = (key, val) => {
        const newSelected = { ...selected, [key]: val };
        setSelected(newSelected); // Optimistic update

        // Output format: "HH:mm"
        const hStr = newSelected.hour.toString().padStart(2, '0');
        const mStr = newSelected.minute.toString().padStart(2, '0');

        onChange(`${hStr}:${mStr}`);
    };

    const minutesList = useMemo(() => {
        const list = [...MINUTES_5];
        if (!list.includes(selected.minute)) {
            list.push(selected.minute);
            list.sort();
        }
        return list;
    }, [selected.minute]);

    return (
        <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="w-16">
                <WheelPicker
                    items={HOURS}
                    value={selected.hour}
                    onChange={(v) => handleChange('hour', v)}
                />
            </div>
            <span className="text-xl font-bold text-gray-300">:</span>
            <div className="w-16">
                <WheelPicker
                    items={minutesList}
                    value={selected.minute}
                    onChange={(v) => handleChange('minute', v)}
                />
            </div>
        </div>
    );
};

export default TimePickerWheel;
