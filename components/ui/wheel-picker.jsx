'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const ITEM_HEIGHT = 40;

const WheelPicker = ({ items, value, onChange, className, loop = true }) => {
    const containerRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Local state for immediate visual feedback during scroll
    const [localValue, setLocalValue] = useState(value);

    // Sync local value when prop changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const displayItems = loop ? [...items, ...items, ...items] : items;

    // Initial scroll position
    useEffect(() => {
        if (containerRef.current) {
            const selectedIndex = items.indexOf(value);
            if (selectedIndex !== -1) {
                // If looping, we aim for the middle set
                const targetIndex = loop ? selectedIndex + items.length : selectedIndex;
                containerRef.current.scrollTop = targetIndex * ITEM_HEIGHT;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle external value changes (scroll to position)
    useEffect(() => {
        if (!isScrolling && containerRef.current) {
            const currentScroll = containerRef.current.scrollTop;
            const currentIndex = Math.round(currentScroll / ITEM_HEIGHT) % items.length;
            const valueIndex = items.indexOf(value);

            // Only scroll if we are not already visibly centered on the correct item
            // (Comparing indices handles duplicate values correctly for positioning)
            if (currentIndex !== valueIndex && valueIndex !== -1) {
                const targetIndex = loop ? valueIndex + items.length : valueIndex;
                containerRef.current.scrollTo({ top: targetIndex * ITEM_HEIGHT, behavior: 'smooth' });
            }
        }
    }, [value, isScrolling, items, loop]);


    const [tymio, setTymio] = useState(null);

    const onScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const totalHeight = items.length * ITEM_HEIGHT;
        const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);

        // Loop Jump Logic
        if (loop) {
            // If scrollTop is in the first set (top ~1/3), jump to second set
            if (scrollTop < totalHeight * 0.5) {
                e.target.scrollTop += totalHeight;
            }
            // If scrollTop is in the third set (bottom ~1/3), jump to second set
            else if (scrollTop > totalHeight * 2.5) {
                e.target.scrollTop -= totalHeight;
            }
        }

        if (!isScrolling) setIsScrolling(true);

        // Immediate visual update of local state
        const index = rawIndex % items.length;
        const currentItem = items[index];
        if (currentItem !== localValue) {
            setLocalValue(currentItem);
        }

        if (tymio) clearTimeout(tymio);

        setTymio(setTimeout(() => {
            setIsScrolling(false);

            const finalIndex = rawIndex % items.length;
            // Clamp for non-loop
            let validIndex = finalIndex;
            if (!loop) {
                validIndex = Math.max(0, Math.min(finalIndex, items.length - 1));
            }

            const selectedItem = items[validIndex];
            if (selectedItem && selectedItem !== value) {
                onChange(selectedItem);
            }
        }, 100)); // 100ms debounce for final selection
    }

    return (
        <div className={cn("relative h-[200px] w-full overflow-hidden bg-white text-black select-none group touch-pan-y", className)}>
            {/* Selection Highlight / Lens */}
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-[40px] border-y border-gray-200 bg-gray-50/50 pointer-events-none z-10" />

            <div
                ref={containerRef}
                className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
                onScroll={onScroll}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {/* Top Pad */}
                <div style={{ height: (200 - ITEM_HEIGHT) / 2 }} />

                {displayItems.map((item, i) => {
                    const isSelected = item === localValue;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "h-[40px] flex items-center justify-center snap-center text-sm transition-all duration-200 cursor-pointer",
                                isSelected ? "font-bold text-black scale-110" : "text-gray-400 scale-90 opacity-60"
                            )}
                            onClick={() => {
                                if (containerRef.current) {
                                    containerRef.current.scrollTo({
                                        top: i * ITEM_HEIGHT,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                        >
                            {item}
                        </div>
                    );
                })}

                {/* Bottom Pad */}
                <div style={{ height: (200 - ITEM_HEIGHT) / 2 }} />
            </div>

            <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
        `}</style>
        </div>
    );
};

export default WheelPicker;
