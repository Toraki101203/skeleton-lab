import React, { useState, useEffect } from 'react';
import { format, addMinutes, parse, isWithinInterval, isBefore } from 'date-fns';
import type { BusinessHours, Booking } from '../../types';

interface Props {
    clinicId: string;
    date: Date;
    onSelectSlot: (start: Date, end: Date) => void;
}

// Mock data generator
const getMockSchedule = (date: Date) => {
    const bookings: Booking[] = [
        {
            id: 'b1',
            clinicId: 'c1',
            userId: 'u1',
            staffId: 's1',
            bookedBy: 'user',
            status: 'confirmed',
            startTime: parse('10:00', 'HH:mm', date),
            endTime: parse('11:00', 'HH:mm', date),
        },
        {
            id: 'b2',
            clinicId: 'c1',
            userId: 'u2',
            staffId: 's2',
            bookedBy: 'operator',
            status: 'confirmed',
            startTime: parse('14:00', 'HH:mm', date),
            endTime: parse('15:30', 'HH:mm', date),
        }
    ];

    const businessHours: BusinessHours = {
        start: '09:00',
        end: '23:00', // Extended to 23:00
        isClosed: false
    };

    return { bookings, businessHours };
};

const ScheduleViewer: React.FC<Props> = ({ clinicId, date, onSelectSlot }) => {
    const [data, setData] = useState<{ bookings: Booking[], businessHours: BusinessHours } | null>(null);
    const [selectedTime, setSelectedTime] = useState<Date | null>(null);

    useEffect(() => {
        // Simulate fetch
        const mock = getMockSchedule(date);
        setData(mock);

        // TODO: Real-time synchronization
        // In a real implementation, we would subscribe to the 'bookings' table here.
        // const subscription = supabase
        //     .channel('public:bookings')
        //     .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `clinic_id=eq.${clinicId}` }, (payload) => {
        //         // Refetch data or update state
        //         console.log('Real-time update:', payload);
        //     })
        //     .subscribe();
        // return () => { subscription.unsubscribe(); };

    }, [clinicId, date]);

    if (!data || data.businessHours.isClosed) {
        return <div className="p-4 text-center text-gray-500">Clinic is closed or data unavailable.</div>;
    }

    // Generate 30 min slots
    const slots: Date[] = [];
    let current = parse(data.businessHours.start, 'HH:mm', date);
    const end = parse(data.businessHours.end, 'HH:mm', date);

    while (isBefore(current, end)) {
        slots.push(current);
        current = addMinutes(current, 30);
    }

    const isSlotBooked = (slotStart: Date) => {
        const slotEnd = addMinutes(slotStart, 30);
        return data.bookings.some(b => {
            // Check overlap
            return (
                (isWithinInterval(slotStart, { start: b.startTime, end: b.endTime }) && slotStart < b.endTime) ||
                (isWithinInterval(slotEnd, { start: b.startTime, end: b.endTime }) && slotEnd > b.startTime)
            );
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 font-semibold border-b border-gray-200 text-gray-700 flex justify-between items-center">
                <span>{format(date, 'yyyy年MM月dd日')} の予約状況</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {data.businessHours.start} - {data.businessHours.end}
                </span>
            </div>
            <div className="p-4 grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {slots.map((slot, idx) => {
                    const booked = isSlotBooked(slot);
                    const isSelected = selectedTime && slot.getTime() === selectedTime.getTime();

                    return (
                        <button
                            key={idx}
                            disabled={booked}
                            onClick={() => {
                                setSelectedTime(slot);
                                onSelectSlot(slot, addMinutes(slot, 60)); // Assume 60 min default
                            }}
                            className={`
                p-3 rounded-lg text-sm font-medium transition-all duration-200
                ${booked
                                    ? 'bg-red-50 text-red-400 cursor-not-allowed border border-red-100'
                                    : isSelected
                                        ? 'bg-accent text-white shadow-md scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'}
              `}
                        >
                            {format(slot, 'HH:mm')}
                        </button>
                    );
                })}
            </div>
            <div className="p-3 text-xs text-gray-500 flex justify-end space-x-4 bg-gray-50 border-t border-gray-200">
                <span className="flex items-center"><span className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></span> 予約可能</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></span> 予約済み</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-accent rounded mr-2 shadow-sm"></span> 選択中</span>
            </div>
        </div>
    );
};

export default ScheduleViewer;
