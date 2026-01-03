"use client";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Search, MapPin, Navigation, Loader2, Satellite, Map } from 'lucide-react';
import { cn } from "@/lib/utils";

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
};

// Default Google Maps theme
const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
};

const defaultCenter = {
    lat: 12.9716, // Bengaluru default
    lng: 77.5946
};

const libraries = ['places'];

export default function GoogleMapPicker({ onLocationSelect, initialLocation }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || defaultCenter);
    const [searchResult, setSearchResult] = useState(null);
    const [isPinning, setIsPinning] = useState(false);
    const [mapType, setMapType] = useState('roadmap');
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (initialLocation && initialLocation.lat && initialLocation.lng) {
            setSelectedLocation(initialLocation);
        } else if (navigator.geolocation && !initialLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setSelectedLocation(pos);
                },
                () => console.log("Error fetching location")
            );
        }
    }, [initialLocation]);

    // Track pac-container elements to prevent map clicks when clicking dropdown
    useEffect(() => {
        // No need to stop events on pac-container itself
        // Just need to track when they exist
        return () => { };
    }, []);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    const handleMapClick = (e) => {
        // Check if click is from pac-container dropdown
        const clickedElement = document.elementFromPoint(e.domEvent?.clientX || 0, e.domEvent?.clientY || 0);
        if (clickedElement?.closest('.pac-container')) {
            // Ignore clicks on autocomplete dropdown
            return;
        }

        const newLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
        setIsPinning(true);
        setTimeout(() => setIsPinning(false), 300); // Animation timeout
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setSelectedLocation(pos);
                    onLocationSelect(pos);
                    map?.panTo(pos);
                    map?.setZoom(16);
                },
                (error) => {
                    let message = "Could not get your current location.";
                    if (error.code === error.PERMISSION_DENIED) message = "Location permission denied.";
                    alert(message);
                }
            );
        } else {
            alert("Geolocation not supported.");
        }
    };

    const toggleMapType = () => {
        setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
    };

    const onLoadAutocomplete = (autocomplete) => {
        setSearchResult(autocomplete);
    };

    const onPlaceChanged = () => {
        if (searchResult !== null) {
            const place = searchResult.getPlace();
            if (place.geometry && place.geometry.location) {
                const pos = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setSelectedLocation(pos);
                onLocationSelect(pos);
                map?.panTo(pos);
                map?.setZoom(16);
            }
        }
    };

    // Enhanced CSS with !important for dropdown styling
    const styles = `
    .pac-container { 
        z-index: 10000 !important; 
        border-radius: 12px !important;
        margin-top: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        border: none !important;
        font-family: inherit;
    }
    .pac-item {
        padding: 10px 16px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
        border-left: 3px solid transparent !important;
    }
    .pac-item:hover {
        background-color: #e0e7ff !important;
        border-left-color: #4f46e5 !important;
        transform: translateX(2px) !important;
    }
    .pac-item-selected {
        background-color: #e0e7ff !important;
    }
    .pac-icon {
        display: none !important;
    }
    `;

    if (!isLoaded) return (
        <div className="h-[450px] w-full bg-gray-50 flex flex-col items-center justify-center rounded-2xl border border-gray-100 animate-pulse">
            <Loader2 className="w-10 h-10 text-gray-300 animate-spin mb-3" />
            <p className="text-gray-400 font-medium text-sm">Loading Google Maps...</p>
        </div>
    );

    return (
        <div className="space-y-3 font-sans">
            <div className="relative h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 group">
                {/* CSS for Autocomplete Dropdown */}
                <style dangerouslySetInnerHTML={{ __html: styles }} />

                {/* Floating Search Bar */}
                <div
                    className="absolute top-4 left-4 right-16 z-10 max-w-md"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Autocomplete
                        onLoad={onLoadAutocomplete}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within/search:text-black transition-colors" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search places..."
                                className="block w-full pl-10 pr-3 py-3 text-sm bg-white/95 backdrop-blur-sm border-0 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]"
                            />
                        </div>
                    </Autocomplete>
                </div>

                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={selectedLocation}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{ ...mapOptions, mapTypeId: mapType }}
                >
                    {selectedLocation && (
                        <Marker
                            position={selectedLocation}
                            animation={isPinning ? google.maps.Animation.BOUNCE : null}
                            icon={{
                                url: `data:image/svg+xml;utf-8, \
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23000000" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
                                scaledSize: new window.google.maps.Size(40, 40),
                                anchor: new window.google.maps.Point(20, 40),
                            }}
                        />
                    )}
                </GoogleMap>

                {/* Satellite Toggle FAB */}
                <Button
                    type="button"
                    onClick={toggleMapType}
                    size="icon"
                    className="absolute bottom-20 right-6 h-12 w-12 rounded-full bg-black text-white shadow-xl hover:bg-gray-800 hover:scale-105 transition-all active:scale-95 z-10"
                    title={mapType === 'roadmap' ? 'Satellite View' : 'Map View'}
                >
                    {mapType === 'roadmap' ? <Satellite className="h-5 w-5" /> : <Map className="h-5 w-5" />}
                </Button>

                {/* Current Location FAB */}
                <Button
                    type="button"
                    onClick={handleCurrentLocation}
                    size="icon"
                    className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-black text-white shadow-xl hover:bg-gray-800 hover:scale-105 transition-all active:scale-95 z-10"
                    title="Use Current Location"
                >
                    <Navigation className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>Interact with the map to pin precise location</span>
            </div>
        </div>
    );
}
