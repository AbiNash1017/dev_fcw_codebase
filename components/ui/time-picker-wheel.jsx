'use client';

import React, { useEffect, useState, useMemo } from 'react';
import WheelPicker from './wheel-picker';

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 01-12
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

const TimePickerWheel = ({ value, onChange }) => {
    // Value format: "hh:mm aa" (e.g., "09:00 AM") OR "HH:mm" (fallback support)

    // Parse initial value
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '09', minute: '00', period: 'AM' };

        // Check for 12h format
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
        if (match) {
            let h = match[1];
            if (h.length === 1) h = '0' + h;
            return {
                hour: h,
                minute: match[2],
                period: match[3].toUpperCase()
            };
        }

        // Fallback to 24-hour parsing (e.g. from DB or old state)
        // 14:30 -> 02:30 PM
        const [hStr, mStr] = timeStr.split(':');
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);

        const period = h >= 12 ? 'PM' : 'AM';
        let hour12 = h % 12;
        if (hour12 === 0) hour12 = 12;

        return {
            hour: hour12.toString().padStart(2, '0'),
            minute: (mStr || '00').toString().padStart(2, '0'),
            period
        };
    };

    const [selected, setSelected] = useState(parseTime(value));

    // Update internal state if prop changes remotely
    useEffect(() => {
        if (value) {
            const parsed = parseTime(value);
            if (parsed.hour !== selected.hour || parsed.minute !== selected.minute || parsed.period !== selected.period) {
                setSelected(parsed);
            }
        }
    }, [value]);

    const handleChange = (key, val) => {
        const newSelected = { ...selected, [key]: val };
        setSelected(newSelected);

        // Output format: "hh:mm aa"
        onChange(`${newSelected.hour}:${newSelected.minute} ${newSelected.period}`);
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
            <div className="w-16 ml-2">
                <WheelPicker
                    items={PERIODS}
                    value={selected.period}
                    onChange={(v) => handleChange('period', v)}
                    loop={false}
                />
            </div>
        </div>
    );
};

export default TimePickerWheel;
