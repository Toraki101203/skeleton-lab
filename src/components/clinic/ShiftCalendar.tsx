// React import removed as useState is unused
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { Staff, Shift } from '../../types';

interface ShiftCalendarProps {
    staffList: Staff[];
    shifts: Shift[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onDateClick: (date: Date) => void;
}

const ShiftCalendar = ({ staffList, shifts, currentDate, onDateChange, onDateClick }: ShiftCalendarProps) => {
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    const getShiftsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return shifts.filter(s => s.date === dateStr && !s.isHoliday);
    };

    const handlePrevMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="bg-transparent">
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                    {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-b border-gray-100/50">
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className={`py-3 text-center text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-fr bg-white/30">
                {/* Empty cells for start of month */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-gray-100/50" />
                ))}

                {/* Days */}
                {days.map(date => {
                    const dayShifts = getShiftsForDate(date);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={date.toISOString()}
                            onClick={() => onDateClick(date)}
                            className={`min-h-[100px] p-2 border-b border-r border-gray-100/50 cursor-pointer hover:bg-white/60 transition-colors group relative ${isToday ? 'bg-blue-50/50' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white shadow-md shadow-blue-200' : 'text-gray-700'
                                    }`}>
                                    {date.getDate()}
                                </span>
                                {dayShifts.length > 0 && (
                                    <span className="text-xs font-bold text-primary bg-blue-100/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        {dayShifts.length}名
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayShifts.slice(0, 3).map(shift => {
                                    const staff = staffList.find(s => s.id === shift.staffId);
                                    if (!staff) return null;
                                    return (
                                        <div key={shift.id} className="flex items-center gap-1 text-xs text-gray-700 bg-white/80 border border-white/50 rounded px-1.5 py-1 shadow-sm backdrop-blur-sm">
                                            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-white">
                                                {staff.imageUrl ? (
                                                    <img src={staff.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-3 h-3 text-gray-400 m-auto" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="truncate font-bold">{staff.name}</div>
                                                <div className="text-[10px] text-gray-500 leading-none">
                                                    {shift.startTime}-{shift.endTime}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {dayShifts.length > 3 && (
                                    <div className="text-xs text-gray-500 text-center font-medium">
                                        他 {dayShifts.length - 3} 名
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShiftCalendar;
