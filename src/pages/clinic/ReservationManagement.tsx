import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import ReservationEditorModal from '../../components/clinic/ReservationEditorModal';
import DayView from '../../components/clinic/DayView';
import WeekView from '../../components/clinic/WeekView';
import ListView from '../../components/clinic/ListView';
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
    const [clinicId, setClinicId] = useState<string | undefined>(undefined);


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
                    setClinicId(clinicData.id);
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

                    console.log('DEBUG: Bookings fetched', bookings.map(b => ({
                        id: b.id,
                        rawStart: b.startTime,
                        isoStart: b.startTime instanceof Date ? b.startTime.toISOString() : 'not-date',
                        localHours: b.startTime instanceof Date ? b.startTime.getHours() : 'err'
                    })));

                    const mappedReservations: Reservation[] = bookings.map(b => {
                        const dateStr = [
                            b.startTime.getFullYear(),
                            String(b.startTime.getMonth() + 1).padStart(2, '0'),
                            String(b.startTime.getDate()).padStart(2, '0')
                        ].join('-');

                        const startH = String(b.startTime.getHours()).padStart(2, '0');
                        const startM = String(b.startTime.getMinutes()).padStart(2, '0');
                        const endH = String(b.endTime.getHours()).padStart(2, '0');
                        const endM = String(b.endTime.getMinutes()).padStart(2, '0');

                        return {
                            id: b.id!,
                            clinicId: b.clinicId,
                            patientName: b.guestName || '会員様', // TODO: Fetch user profile name
                            patientEmail: b.guestEmail,
                            patientPhone: b.guestContact,
                            staffId: b.staffId || 'free', // Map null to 'free'
                            menuItemId: b.menuItemId,
                            date: dateStr,
                            startTime: `${startH}:${startM}`,
                            endTime: `${endH}:${endM}`,
                            status: b.status as any,
                            notes: b.notes,
                            createdAt: new Date().toISOString() // Not in type but ok
                        };
                    });

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
            <div className="max-w-7xl mx-auto px-4 py-8 h-auto lg:h-[calc(100vh-100px)] flex flex-col">
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

                <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-visible lg:overflow-hidden">
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
                        {viewMode === 'day' && (
                            <DayView
                                currentDate={currentDate}
                                staffList={staffList}
                                shifts={shifts}
                                reservations={reservations}
                                menuItems={menuItems}
                                onReservationClick={openEditReservationModal}
                                onNewReservationClick={(staffId, timeStr) => openNewReservationModal(staffId, timeStr)}
                            />
                        )}
                        {viewMode === 'week' && (
                            <WeekView
                                currentDate={currentDate}
                                reservations={reservations}
                                onReservationClick={openEditReservationModal}
                                onNewReservationClick={(staffId, dateStr, timeStr) => {
                                    // Hacky way to set date for now, we need to update state
                                    // Ideally openNewReservationModal takes date override
                                    // For now let's just use what we have or update modal later
                                    // We will enhance openNewReservationModal to accept date
                                    const d = new Date(dateStr);
                                    setCurrentDate(d);
                                    openNewReservationModal(staffId, timeStr);
                                }}
                            />
                        )}
                        {viewMode === 'list' && (
                            <ListView
                                reservations={reservations}
                                menuItems={menuItems}
                                onReservationClick={openEditReservationModal}
                            />
                        )}
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
                                    <select className="w-full p-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-800">
                                        <option>全員表示</option>
                                        {staffList.map(s => <option key={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500">ステータス</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <button className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">確定</button>
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
                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-white text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                    clinicId={clinicId}
                    onSave={handleSaveReservation}
                />
            </div>
        </PageLayout>
    );
};

export default ReservationManagement;
