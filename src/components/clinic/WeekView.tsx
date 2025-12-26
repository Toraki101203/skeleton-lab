import { Plus } from 'lucide-react';
import type { Reservation } from '../../types';

interface WeekViewProps {
    currentDate: Date;
    reservations: Reservation[];
    onReservationClick: (reservation: Reservation) => void;
    onNewReservationClick: (staffId: string, dateStr: string, timeStr: string) => void;
}

const WeekView = ({ currentDate, reservations, onReservationClick, onNewReservationClick }: WeekViewProps) => {
    // Generate week dates (Sunday to Saturday)
    const getWeekDates = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay()); // Go to Sunday
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
    };

    const weekDates = getWeekDates();
    const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9:00 to 21:00

    return (
        <div className="flex-1 overflow-auto bg-white relative">
            <div className="min-w-[1000px]">
                {/* Header */}
                <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
                    <div className="w-16 shrink-0 border-r border-gray-100 bg-gray-50/80 backdrop-blur"></div>
                    {weekDates.map(date => (
                        <div key={date.toISOString()} className={`flex-1 p-3 border-r border-gray-100 text-center ${date.toDateString() === new Date().toDateString() ? 'bg-blue-50/50' : 'bg-white'}`}>
                            <div className="text-xs text-gray-500">{date.toLocaleDateString('ja-JP', { weekday: 'short' })}</div>
                            <div className={`text-lg font-bold ${date.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-gray-800'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time Grid */}
                {hours.map(hour => {
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                        <div key={hour} className="flex min-h-[100px] border-b border-gray-100/50">
                            <div className="w-16 shrink-0 flex items-start justify-center pt-2 text-xs font-bold text-gray-400 border-r border-gray-100 bg-gray-50/10 sticky left-0 z-10">
                                {timeStr}
                            </div>
                            {weekDates.map(date => {
                                const dateStr = date.toISOString().split('T')[0];
                                const dayReservations = reservations.filter(r => {
                                    const rDate = r.date; // already YYYY-MM-DD
                                    // Check overlap with this hour
                                    const rStartH = parseInt(r.startTime.split(':')[0]);
                                    return rDate === dateStr && rStartH === hour;
                                });

                                // Simply show count or list small items if needed
                                // For Week View, maybe better to show compressed blocks
                                return (
                                    <div key={date.toISOString()} className="flex-1 border-r border-gray-100/50 relative p-1 group">
                                        {/* "New" button area - simplistic for now */}
                                        <div className="absolute inset-0 z-0 hover:bg-gray-50/30 transition-colors" />

                                        {dayReservations.map(res => (
                                            <div
                                                key={res.id}
                                                onClick={() => onReservationClick(res)}
                                                className="relative z-10 mb-1 p-1 rounded bg-blue-100 border-l-2 border-blue-500 text-[10px] text-blue-900 cursor-pointer hover:brightness-95 truncate"
                                            >
                                                {res.startTime} {res.patientName}
                                            </div>
                                        ))}

                                        {/* Add button (only on hover) */}
                                        <button
                                            onClick={() => {
                                                // Default to first available staff? Or let modal choose.
                                                // We'll pass "free" or undefined for staffId
                                                onNewReservationClick('free', dateStr, timeStr);
                                            }}
                                            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 z-20 p-1 bg-white rounded-full shadow-sm text-primary hover:bg-blue-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekView;
