import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';
import { useToast } from '../context/ToastContext';

export const useRealtimeBookings = (clinicId: string, date: Date) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('clinic_id', clinicId)
                    .gte('start_time', startOfDay.toISOString())
                    .lte('start_time', endOfDay.toISOString());

                if (error) throw error;

                if (isMounted) {
                    setBookings((data || []).map((b: any) => ({
                        id: b.id,
                        clinicId: b.clinic_id,
                        userId: b.user_id,
                        staffId: b.staff_id,
                        bookedBy: b.booked_by,
                        status: b.status,
                        startTime: new Date(b.start_time),
                        endTime: new Date(b.end_time),
                        notes: b.notes,
                        guestName: b.guest_name,
                        guestContact: b.guest_contact,
                        guestEmail: b.guest_email,
                        internalMemo: b.internal_memo
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel(`bookings:clinic_id=${clinicId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `clinic_id=eq.${clinicId}`
                },
                (payload) => {
                    console.log('Real-time update received:', payload);
                    if (!isMounted) return;

                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT') {
                        const newB = newRecord as any;
                        const bookingTime = new Date(newB.start_time);

                        // Only add if it belongs to current day view
                        if (bookingTime >= startOfDay && bookingTime <= endOfDay) {
                            const newBooking: Booking = {
                                id: newB.id,
                                clinicId: newB.clinic_id,
                                userId: newB.user_id,
                                staffId: newB.staff_id,
                                bookedBy: newB.booked_by,
                                status: newB.status,
                                startTime: new Date(newB.start_time),
                                endTime: new Date(newB.end_time),
                                notes: newB.notes,
                                guestName: newB.guest_name,
                                guestContact: newB.guest_contact,
                                guestEmail: newB.guest_email,
                                internalMemo: newB.internal_memo
                            };
                            setBookings(prev => [...prev, newBooking]);

                            // Notify
                            showToast(`予約が入りました: ${bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'info');
                        }
                    } else if (eventType === 'UPDATE') {
                        const newB = newRecord as any;
                        setBookings(prev => prev.map(b => {
                            if (b.id === newB.id) {
                                return {
                                    ...b,
                                    bookedBy: newB.booked_by,
                                    status: newB.status,
                                    startTime: new Date(newB.start_time),
                                    endTime: new Date(newB.end_time),
                                    notes: newB.notes,
                                    staffId: newB.staff_id,
                                    guestName: newB.guest_name,
                                    guestContact: newB.guest_contact,
                                    guestEmail: newB.guest_email,
                                    internalMemo: newB.internal_memo
                                };
                            }
                            return b;
                        }));
                    } else if (eventType === 'DELETE') {
                        setBookings(prev => prev.filter(b => b.id !== (oldRecord as any).id));
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [clinicId, date, showToast]);

    return { bookings, loading };
};
