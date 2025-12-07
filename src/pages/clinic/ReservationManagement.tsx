import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Search, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import ReservationEditorModal from '../../components/clinic/ReservationEditorModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Reservation, Staff, MenuItem, Shift } from '../../types';
import { getClinicBookings } from '../../services/db';

// Mock Data for Fallback
const MOCK_RESERVATIONS: Reservation[] = [];

const ReservationManagement = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
    const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Partial<Reservation> | undefined>(undefined);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);


    // Fetch Database Data
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid) return;
            try {
                // 1. Fetch Clinic Info (Staff, Menu)
                const { data: clinicData, error: clinicError } = await supabase
                    .from('clinics')
                    .select('*')
                    .eq('owner_uid', user.uid)
                    .single();

                if (clinicError) throw clinicError;
                if (clinicData) {

                    if (clinicData.menu_items) setMenuItems(clinicData.menu_items);

                    // Add "Free" staff for unassigned bookings
                    const realStaff = clinicData.staff_info || [];
                    setStaffList([
                        ...realStaff,
                        {
                            id: 'free',
                            name: '指名なし',
                            role: 'フリー',
                            skillIds: [],
                            defaultSchedule: realStaff[0]?.defaultSchedule // Borrow schedule or make one up 
                        } as Staff
                    ]);

                    // 2. Fetch Shifts
                    const { data: shiftData, error: shiftError } = await supabase
                        .from('shifts')
                        .select('*')
                        .eq('clinic_id', clinicData.id);

                    if (shiftError) throw shiftError;
                    if (shiftData) setShifts(shiftData);

                    // 3. Fetch Real Reservations
                    const startOfDay = new Date(currentDate);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(currentDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    const bookings = await getClinicBookings(clinicData.id, startOfDay, endOfDay);

                    const mappedReservations: Reservation[] = bookings.map(b => ({
                        id: b.id!,
                        clinicId: b.clinicId,
                        patientName: b.guestName || '会員様', // TODO: Fetch user profile name
                        patientEmail: b.guestEmail,
                        patientPhone: b.guestContact,
                        staffId: b.staffId || 'free', // Map null to 'free'
                        menuItemId: b.menuItemId,
                        date: b.startTime.toISOString().split('T')[0],
                        startTime: b.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        endTime: b.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: b.status as any,
                        notes: b.notes,
                        createdAt: new Date().toISOString() // Not in type but ok
                    }));

                    setReservations(mappedReservations);
                }

            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [user, currentDate]);

    const handleSaveReservation = (reservation: Reservation) => {
        setReservations(prev => {
            const index = prev.findIndex(r => r.id === reservation.id);
            if (index >= 0) {
                const newReservations = [...prev];
                newReservations[index] = reservation;
                return newReservations;
            }
            return [...prev, reservation];
        });
        setIsModalOpen(false);
    };

    const openNewReservationModal = (staffId?: string, startTime?: string) => {
        setEditingReservation({
            date: currentDate.toISOString().split('T')[0],
            staffId,
            startTime
        });
        setIsModalOpen(true);
    };

    const openEditReservationModal = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsModalOpen(true);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    };

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                            予約管理
                        </h1>
                        <p className="text-sm text-gray-500">本日の予約状況と空き枠の確認</p>
                    </div>
                </div>

                <div className="flex flex-1 gap-6 overflow-hidden">
                    {/* Main Calendar Area */}
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
                        {/* Calendar Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                                    <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <div className="px-4 font-bold text-lg text-gray-800 tracking-wide">
                                        {formatDate(currentDate)}
                                    </div>
                                    <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="text-sm font-bold text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    今日
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('day')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        日
                                    </button>
                                    <button
                                        onClick={() => setViewMode('week')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        週
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        リスト
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
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
                                            // Check if staff is available at this time
                                            const dateStr = currentDate.toISOString().split('T')[0];
                                            const shift = shifts.find(s => s.staffId === staff.id && s.date === dateStr);
                                            // Simple check: if shift exists and isHoliday OR time outside range
                                            // For detailed check, we'd need minute-level logic, but hour-level is ok for grid bg
                                            let isAvailable = true;
                                            if (shift) {
                                                if (shift.isHoliday) isAvailable = false;
                                                else {
                                                    const startH = parseInt(shift.startTime.split(':')[0]);
                                                    const endH = parseInt(shift.endTime.split(':')[0]);
                                                    if (hour < startH || hour >= endH) isAvailable = false;
                                                }
                                            } else {
                                                // Check default schedule if no shift
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
                                                    {/* Add Button on Hover only if available */}
                                                    {isAvailable && (
                                                        <button
                                                            onClick={() => openNewReservationModal(staff.id, timeStr)}
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

                                // Calculate position
                                const startHour = parseInt(reservation.startTime.split(':')[0]);
                                const startMin = parseInt(reservation.startTime.split(':')[1]);
                                const duration = 60; // Assume 60 mins for now
                                const top = (startHour - 9) * 80 + (startMin / 60) * 80;
                                const height = (duration / 60) * 80;
                                const width = `calc((100% - 5rem) / ${staffList.length})`;
                                const left = `calc(5rem + (${width} * ${staffIndex}))`;

                                return (
                                    <div
                                        key={reservation.id}
                                        onClick={() => openEditReservationModal(reservation)}
                                        className={`absolute p-2 rounded-lg border-l-4 shadow-sm text-xs cursor-pointer hover:brightness-95 transition-all z-20 ${reservation.status === 'confirmed' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                                            reservation.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
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
                    </div>

                    {/* Sidebar / Summary */}
                    <div className="space-y-6">
                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary" />
                                フィルター
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500">スタッフ</label>
                                    <select className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                        <option>全員表示</option>
                                        {staffList.map(s => <option key={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500">ステータス</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">確定</button>
                                        <button className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">仮予約</button>
                                        <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">キャンセル</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-primary" />
                                予約検索
                            </h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="患者様名・ID"
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-gray-800 text-white rounded-xl py-2 text-sm font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                        <Search className="w-4 h-4" />
                                        検索
                                    </button>
                                    <button
                                        onClick={() => openNewReservationModal()}
                                        className="px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-primary/90 transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        新規予約
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl shadow-xl p-6 text-white">
                            <h3 className="font-bold mb-2">本日の予約状況</h3>
                            <div className="text-4xl font-bold mb-1">{reservations.length}<span className="text-lg font-normal opacity-80 ml-1">件</span></div>
                            <div className="text-sm opacity-80">空き枠: --</div>
                        </div>
                    </div>
                </div>

                {/* Reservation Editor Modal */}
                <ReservationEditorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialReservation={editingReservation}
                    staffList={staffList}
                    menuItems={menuItems}
                    shifts={shifts}
                    onSave={handleSaveReservation}
                />
            </div>
        </PageLayout>
    );
};

export default ReservationManagement;
