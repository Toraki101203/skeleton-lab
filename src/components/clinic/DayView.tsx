import { Plus, User, Clock } from 'lucide-react';
import type { Reservation, Staff, Shift, MenuItem } from '../../types';

interface DayViewProps {
    currentDate: Date;
    staffList: Staff[];
    shifts: Shift[];
    reservations: Reservation[];
    menuItems: MenuItem[];
    onReservationClick: (reservation: Reservation) => void;
    onNewReservationClick: (staffId: string, timeStr: string) => void;
}

const DayView = ({ currentDate, staffList, shifts, reservations, menuItems, onReservationClick, onNewReservationClick }: DayViewProps) => {
    return (
        <div className="flex-1 overflow-auto bg-white relative">
            {/* Staff Header */}
            <div className="flex border-b border-gray-100 sticky top-0 bg-white z-20 shadow-sm">
                <div className="w-20 shrink-0 border-r border-gray-100 bg-gray-50/80 backdrop-blur"></div>
                {staffList.map(staff => (
                    <div key={staff.id} className="flex-1 p-3 border-r border-gray-100 flex items-center gap-3 min-w-[150px] bg-white/90 backdrop-blur">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-slate-100 shrink-0">
                            {staff.imageUrl ? (
                                <img src={staff.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6 text-gray-400 m-auto translate-y-2" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <div className="font-bold text-gray-800 text-sm truncate">{staff.name}</div>
                            <div className="text-xs text-gray-500 truncate">{staff.role}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            {Array.from({ length: 13 }).map((_, i) => {
                const hour = i + 9; // Start from 9:00
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                return (
                    <div key={hour} className="flex h-20 border-b border-gray-100/50">
                        <div className="w-20 shrink-0 flex items-start justify-center pt-2 text-xs font-bold text-gray-400 border-r border-gray-100 bg-gray-50/10">
                            {timeStr}
                        </div>
                        {staffList.map(staff => {
                            // Check availability
                            const dateStr = currentDate.toISOString().split('T')[0];
                            const shift = shifts.find(s => s.staffId === staff.id && s.date === dateStr);

                            let isAvailable = true;
                            if (shift) {
                                if (shift.isHoliday) isAvailable = false;
                                else {
                                    const startH = parseInt(shift.startTime.split(':')[0]);
                                    const endH = parseInt(shift.endTime.split(':')[0]);
                                    if (hour < startH || hour >= endH) isAvailable = false;
                                }
                            } else {
                                // Default schedule
                                const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
                                const dayKey = dayMap[currentDate.getDay()];
                                const schedule = staff.defaultSchedule?.[dayKey];
                                if (!schedule || schedule.isClosed) isAvailable = false;
                                else {
                                    const startH = parseInt(schedule.start.split(':')[0]);
                                    const endH = parseInt(schedule.end.split(':')[0]);
                                    if (hour < startH || hour >= endH) isAvailable = false;
                                }
                            }

                            return (
                                <div key={staff.id} className={`flex-1 border-r border-gray-100/50 last:border-r-0 relative group transition-colors ${isAvailable ? 'hover:bg-gray-50/30' : 'bg-gray-100/50'}`}>
                                    {isAvailable && (
                                        <button
                                            onClick={() => onNewReservationClick(staff.id, timeStr)}
                                            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center z-10"
                                        >
                                            <Plus className="w-6 h-6 text-primary bg-blue-50 rounded-full p-1" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {/* Reservations Overlay */}
            {reservations.map(reservation => {
                const staffIndex = staffList.findIndex(s => s.id === reservation.staffId);
                if (staffIndex === -1) return null;

                const startHour = parseInt(reservation.startTime.split(':')[0]);
                const startMin = parseInt(reservation.startTime.split(':')[1]);
                const duration = 60; // Mock duration
                const top = (startHour - 9) * 80 + (startMin / 60) * 80;
                const height = (duration / 60) * 80;
                const width = `calc((100% - 5rem) / ${staffList.length})`;
                const left = `calc(5rem + (${width} * ${staffIndex}))`;

                return (
                    <div
                        key={reservation.id}
                        onClick={() => onReservationClick(reservation)}
                        className={`absolute p-2 rounded-lg border-l-4 shadow-sm text-xs cursor-pointer hover:brightness-95 transition-all z-20 ${reservation.status === 'confirmed' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                            'bg-gray-100 border-gray-500 text-gray-800'
                            }`}
                        style={{ top: `${top}px`, height: `${height - 4}px`, left, width: `calc(${width} - 8px)`, marginLeft: '4px' }}
                    >
                        <div className="font-bold truncate">{reservation.patientName} 様</div>
                        <div className="truncate opacity-80">
                            {(menuItems.length > 0 ? menuItems : []).find(m => m.id === reservation.menuItemId)?.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1 opacity-70">
                            <Clock className="w-3 h-3" />
                            {reservation.startTime} - {reservation.endTime}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DayView;
