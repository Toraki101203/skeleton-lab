import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Save, X, User } from 'lucide-react';
import ShiftCalendar from '../../components/clinic/ShiftCalendar';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Staff, Shift } from '../../types';

const ShiftManagement = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [editingShifts, setEditingShifts] = useState<Shift[]>([]);

    // Fetch Clinic and Staff
    useEffect(() => {
        const fetchClinicData = async () => {
            if (!user?.uid) return;
            try {
                const { data, error } = await supabase
                    .from('clinics')
                    .select('*')
                    .eq('owner_uid', user.uid)
                    .single();

                if (error) throw error;
                if (data) {
                    setClinicId(data.id);
                    // Parse staff_info from JSONB or use default if empty
                    const loadedStaff = data.staff_info || [];
                    setStaffList(loadedStaff);
                }
            } catch (err) {
                console.error('Error fetching clinic data:', err);
            }
        };
        fetchClinicData();
    }, [user]);

    // Fetch Shifts for current month (or all for now)
    useEffect(() => {
        const fetchShifts = async () => {
            if (!clinicId) return;
            try {
                const { data, error } = await supabase
                    .from('shifts')
                    .select('*')
                    .eq('clinic_id', clinicId);

                if (error) throw error;
                if (data) {
                    const formattedShifts: Shift[] = data.map((s: any) => ({
                        id: s.id,
                        clinicId: s.clinic_id,
                        staffId: s.staff_id,
                        date: s.date,
                        startTime: s.start_time,
                        endTime: s.end_time,
                        isHoliday: s.is_holiday
                    }));
                    setShifts(formattedShifts);
                }
            } catch (err) {
                console.error('Error fetching shifts:', err);
            }
        };
        fetchShifts();
    }, [clinicId, currentDate]); // Could optimize to fetch by range

    // Helper to generate shifts from default schedule (UI helper only, not saved yet)
    const generateDefaultShifts = (date: Date) => {
        const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
        const dayKey = dayMap[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];

        return staffList.map(staff => {
            const schedule = staff.defaultSchedule?.[dayKey];
            return {
                id: `temp-${Math.random().toString(36).substr(2, 9)}`,
                clinicId: clinicId!,
                date: dateStr,
                staffId: staff.id,
                startTime: schedule?.start || '09:00',
                endTime: schedule?.end || '18:00',
                isHoliday: !!schedule?.isClosed
            };
        });
    };

    const handleDateClick = (date: Date) => {
        if (!clinicId || staffList.length === 0) return;

        const dateStr = date.toISOString().split('T')[0];
        // Clone existing shifts to avoid reference issues
        const existingShifts = shifts.filter(s => s.date === dateStr).map(s => ({ ...s }));

        let shiftsForEdit = [];

        if (existingShifts.length === 0) {
            // Generate temp shifts for UI
            shiftsForEdit = generateDefaultShifts(date);
        } else {
            // Check if we have shifts for ALL staff, if not generate missing ones
            const missingStaffShifts = staffList
                .filter(staff => !existingShifts.some(s => s.staffId === staff.id))
                .map(staff => {
                    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
                    const dayKey = dayMap[date.getDay()];
                    const schedule = staff.defaultSchedule?.[dayKey];
                    return {
                        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
                        clinicId: clinicId!,
                        date: dateStr,
                        staffId: staff.id,
                        startTime: schedule?.start || '09:00',
                        endTime: schedule?.end || '18:00',
                        isHoliday: !!schedule?.isClosed
                    } as Shift;
                });

            shiftsForEdit = [...existingShifts, ...missingStaffShifts];
        }

        setEditingShifts(shiftsForEdit);
        setSelectedDate(date);
    };

    const updateShift = (staffId: string, updates: Partial<Shift>) => {
        setEditingShifts(prev => prev.map(s => {
            if (s.staffId === staffId) {
                return { ...s, ...updates };
            }
            return s;
        }));
    };

    const handleSaveShifts = async () => {
        if (!selectedDate || !clinicId) return;
        setLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];

        // Use editingShifts instead of filtering main state
        const shiftsToSave = editingShifts;

        try {
            // Upsert shifts
            for (const shift of shiftsToSave) {
                const shiftData = {
                    clinic_id: clinicId,
                    staff_id: shift.staffId,
                    date: shift.date,
                    start_time: shift.startTime,
                    end_time: shift.endTime,
                    is_holiday: shift.isHoliday
                };

                // Check if it's a real ID or temp
                if (!shift.id.startsWith('temp-')) {
                    // Update
                    await supabase
                        .from('shifts')
                        .update(shiftData)
                        .eq('id', shift.id);
                } else {
                    // Insert (and check if exists to avoid dupes if RLS allows upsert)
                    const { error } = await supabase
                        .from('shifts')
                        .upsert(shiftData, { onConflict: 'clinic_id, staff_id, date' })
                        .select();

                    if (error) throw error;
                }
            }

            // Refetch to get real IDs
            const { data } = await supabase
                .from('shifts')
                .select('*')
                .eq('clinic_id', clinicId)
                .eq('date', dateStr);

            if (data) {
                const formattedShifts: Shift[] = data.map((s: any) => ({
                    id: s.id,
                    clinicId: s.clinic_id,
                    staffId: s.staff_id,
                    date: s.date,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    isHoliday: s.is_holiday
                }));

                // Update global state with the saved data
                setShifts(prev => [
                    ...prev.filter(s => s.date !== dateStr),
                    ...formattedShifts
                ]);
            }

            setSelectedDate(null);
            setEditingShifts([]); // Clear editing state
            alert('保存しました');
        } catch (err: any) {
            console.error('Error saving shifts:', err);
            alert('保存に失敗しました: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-primary" />
                            シフト管理
                        </h1>
                        <p className="text-gray-600 mt-2 font-medium">スタッフの勤務予定を管理します</p>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden p-6">
                    <ShiftCalendar
                        staffList={staffList}
                        shifts={shifts}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onDateClick={handleDateClick}
                    />
                </div>

                {/* Daily Edit Modal */}
                {selectedDate && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in border border-white/50">
                            <div className="px-8 py-6 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })} のシフト
                                </h3>
                                <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                                {staffList.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        スタッフが登録されていません。<br />
                                        スタッフ管理画面からスタッフを追加してください。
                                    </div>
                                ) : (
                                    staffList.map(staff => {
                                        // Use editingShifts instead of shifts
                                        const shift = editingShifts.find(s => s.staffId === staff.id);

                                        // If no shift found yet (should be generated), skip
                                        if (!shift) return null;

                                        return (
                                            <div key={staff.id} className={`p-4 rounded-xl border-2 transition-all ${shift.isHoliday ? 'border-gray-100 bg-gray-50/50 opacity-70' : 'border-blue-100 bg-blue-50/30'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                                                            {staff.imageUrl ? (
                                                                <img src={staff.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-6 h-6 text-gray-400 m-auto" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800">{staff.name}</div>
                                                            <div className="text-xs text-gray-500">{staff.role}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => updateShift(staff.id, { isHoliday: !shift.isHoliday })}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${shift.isHoliday
                                                            ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                            : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-blue-200'
                                                            }`}
                                                    >
                                                        {shift.isHoliday ? '休み' : '出勤'}
                                                    </button>
                                                </div>

                                                {!shift.isHoliday && (
                                                    <div className="flex items-center gap-4 pl-14">
                                                        <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-gray-100">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="time"
                                                                value={shift.startTime}
                                                                onChange={(e) => updateShift(staff.id, { startTime: e.target.value })}
                                                                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0"
                                                            />
                                                            <span className="text-gray-400">〜</span>
                                                            <input
                                                                type="time"
                                                                value={shift.endTime}
                                                                onChange={(e) => updateShift(staff.id, { endTime: e.target.value })}
                                                                className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="px-8 py-6 border-t border-gray-100/50 bg-gray-50/30 flex justify-end gap-4">
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSaveShifts}
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? '保存中...' : '保存して閉じる'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ShiftManagement;
