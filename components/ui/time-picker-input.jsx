'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import TimePickerWheel from './time-picker-wheel';

const TimePickerInput = ({ value, onChange, className }) => {
    const [open, setOpen] = useState(false);

    // Format display value. TimePickerWheel uses "hh:mm aa" or "HH:mm"
    // We want to display consistent 12h format.
    // TimePickerWheel's onChange returns formatted string.

    // If value is empty, show placeholder
    const displayValue = value || 'Set Time';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-transparent border-none shadow-none" align="start">
                <TimePickerWheel
                    value={value}
                    onChange={(newValue) => {
                        onChange(newValue);
                        // setOpen(false); // Optional: keep open for easy scroll, or close on selection? 
                        // Wheel picker is interactive, closing on every change (scroll) is bad. 
                        // User clicks outside to close.
                    }}
                />
            </PopoverContent>
        </Popover>
    );
};

export default TimePickerInput;
