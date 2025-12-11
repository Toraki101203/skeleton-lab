import { useState, useEffect } from 'react';
import type { Clinic } from '../types';
import { isWithinInterval, parse, getDay } from 'date-fns';
import { getAllClinics } from '../services/db';

export const useClinicSearch = (initialState?: { location?: { lat: number; lng: number } }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrefecture, setSelectedPrefecture] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [addressData, setAddressData] = useState<Record<string, string[]> | null>(null);
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    const [searchRadius, setSearchRadius] = useState(15); // Default 15km
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(initialState?.location || null);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const data = await getAllClinics();
                setClinics(data);
                setFilteredClinics(data);
            } catch (error) {
                console.error("Failed to fetch clinics", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAddresses = async () => {
            try {
                const response = await fetch('https://geolonia.github.io/japanese-addresses/api/ja.json');
                const data = await response.json();
                setAddressData(data);
            } catch (error) {
                console.error("Failed to fetch address data", error);
            }
        };

        fetchClinics();
        fetchAddresses();
    }, []);

    // Update cities when prefecture changes or address data is loaded
    useEffect(() => {
        if (!selectedPrefecture || !addressData) {
            setCities([]);
            setSelectedCity('');
            return;
        }
        const prefectureCities = addressData[selectedPrefecture] || [];
        setCities(prefectureCities);
        setSelectedCity('');
    }, [selectedPrefecture, addressData]);

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("お使いのブラウザは位置情報をサポートしていません");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            () => {
                alert("位置情報を取得できませんでした");
            }
        );
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLng = deg2rad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    useEffect(() => {
        let result = [...clinics];

        // Filter by Search Term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.location.address.toLowerCase().includes(lower)
            );
        }

        // Filter by Prefecture
        if (selectedPrefecture) {
            result = result.filter(c => c.location.address.includes(selectedPrefecture));
        }

        // Filter by City
        if (selectedCity) {
            result = result.filter(c => c.location.address.includes(selectedCity));
        }

        // Filter by Open Now
        if (filterOpenNow) {
            const now = new Date();
            const dayIndex = getDay(now);
            const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const currentDayKey = daysMap[dayIndex] as keyof Clinic['businessHours'];

            result = result.filter(c => {
                const todayHours = c.businessHours[currentDayKey];
                if (todayHours.isClosed) return false;
                const start = parse(todayHours.start, 'HH:mm', now);
                const end = parse(todayHours.end, 'HH:mm', now);
                return isWithinInterval(now, { start, end });
            });
        }

        // Sort by Distance and Filter by Radius if User Location is available
        if (userLocation) {
            // First calculate distance for all
            const clinicsWithDist = result.map(c => ({
                ...c,
                distance: calculateDistance(userLocation.lat, userLocation.lng, c.location.lat, c.location.lng)
            }));

            // Filter by Radius
            const withinRadius = clinicsWithDist.filter(c => c.distance <= searchRadius);

            // Sort by Distance
            withinRadius.sort((a, b) => a.distance - b.distance);

            // Map back to Clinic type (keep distance if needed by UI, but original code mapped it out mostly, 
            // though UI logic used a separate calculateDistance. 
            // Better to return the distance-aware clinics or keep the calculation in UI for display?
            // The Original UI re-calculates distance for display. A bit inefficient but safer to keep strictly to original behavior first.
            // Wait, if I strip distance here, the UI still needs to calculate it for the badge.
            // I will expose calculateDistance or return it attached. 
            // The original code re-calc'd it in the render loop.
            // I will return calculateDistance helper from hook so UI can use it.

            result = withinRadius.map(c => {
                const { distance, ...rest } = c;
                return rest;
            });
        }

        setFilteredClinics(result);
    }, [searchTerm, selectedPrefecture, selectedCity, filterOpenNow, userLocation, clinics, searchRadius]);

    return {
        searchTerm, setSearchTerm,
        selectedPrefecture, setSelectedPrefecture,
        selectedCity, setSelectedCity,
        cities,
        filterOpenNow, setFilterOpenNow,
        searchRadius, setSearchRadius,
        userLocation,
        handleCurrentLocation,
        filteredClinics,
        loading,
        calculateDistance // Expose this for the UI to use in render
    };
};
