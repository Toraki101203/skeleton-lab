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
        end: '18:00',
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
        <div className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold border-b">
                Schedule for {format(date, 'yyyy-MM-dd')}
            </div>
            <div className="p-4 grid grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
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
                p-2 rounded text-sm font-medium transition-colors
                ${booked
                                    ? 'bg-red-100 text-red-400 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-accent text-white shadow'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'}
              `}
                        >
                            {format(slot, 'HH:mm')}
                        </button>
                    );
                })}
            </div>
            <div className="p-2 text-xs text-gray-500 flex justify-end space-x-3 bg-gray-50">
                <span className="flex items-center"><span className="w-3 h-3 bg-green-50 border border-green-200 rounded mr-1"></span> Available</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-100 rounded mr-1"></span> Booked</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-accent rounded mr-1"></span> Selected</span>
            </div>
        </div>
    );
};

export default ScheduleViewer;
