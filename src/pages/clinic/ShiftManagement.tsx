import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Save, X, User, Bell, Check, Share2, Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import ShiftCalendar from '../../components/clinic/ShiftCalendar';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getShiftRequests, approveShiftRequest, rejectShiftRequest, type ShiftRequest } from '../../services/db';
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

    // Shift Request State
    const [requests, setRequests] = useState<ShiftRequest[]>([]);
    const [showRequestsModal, setShowRequestsModal] = useState(false);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);

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

    // Fetch Shifts & Requests
    const fetchShiftsAndRequests = async () => {
        if (!clinicId) return;
        try {
            // Shifts
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            // Get range for current month view (including padding if needed, but strict month is fine for now)
            // Use local date strings YYYY-MM-DD
            const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
            // Calculate end of month
            const lastDay = new Date(year, month, 0).getDate();
            const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('clinic_id', clinicId)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth);

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

            // Requests
            const pendingRequests = await getShiftRequests(clinicId);
            setRequests(pendingRequests);

        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchShiftsAndRequests();
    }, [clinicId, currentDate]);

    // Request Handlers
    const handleApprove = async (req: ShiftRequest) => {
        try {
            await approveShiftRequest(req);
            // Refresh
            await fetchShiftsAndRequests();
        } catch (e: any) {
            alert('承認失敗: ' + e.message);
        }
    };

    const handleReject = async (reqId: string) => {
        if (!confirm('この申請を却下しますか？')) return;
        try {
            await rejectShiftRequest(reqId);
            await fetchShiftsAndRequests();
        } catch (e: any) {
            alert('却下失敗: ' + e.message);
        }
    };

    // Helper to generate shifts from default schedule (UI helper only, not saved yet)
    const generateDefaultShifts = (date: Date) => {
        const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
        const dayKey = dayMap[date.getDay()];

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

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

        // Use local date string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

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
        setLoading(true);

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
                // To safely handle cases without unique constraints, we'll try to find existing shift first
                const { data: existing } = await supabase
                    .from('shifts')
                    .select('id')
                    .eq('clinic_id', clinicId)
                    .eq('staff_id', shift.staffId)
                    .eq('date', shift.date)
                    .single();

                if (existing) {
                    // Update
                    await supabase
                        .from('shifts')
                        .update(shiftData)
                        .eq('id', existing.id);
                } else {
                    // Insert
                    const { error } = await supabase
                        .from('shifts')
                        .insert(shiftData);

                    if (error) throw error;
                }
            }

            await fetchShiftsAndRequests(); // Refresh all
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

    const handleCopyUrl = () => {
        if (!clinicId) return;
        const url = `${window.location.origin}/staff-submission/${clinicId}`;
        navigator.clipboard.writeText(url);
        alert('URLをコピーしました');
    };

    // Bulk Actions
    const handleBulkApprove = async () => {
        if (selectedRequestIds.length === 0) return;
        if (!confirm(`${selectedRequestIds.length}件の申請を承認しますか？`)) return;

        setLoadingRequests(true);
        try {
            // Process sequentially to allow partial success/failure handling in future if needed,
            // or use Promise.all for speed. For now Promise.all.
            const approvals = selectedRequestIds.map(id => {
                const req = requests.find(r => r.id === id);
                if (req) {
                    return approveShiftRequest(req);
                }
                return Promise.resolve();
            });

            await Promise.all(approvals);

            setSelectedRequestIds([]);
            await fetchShiftsAndRequests();
            alert('承認しました');
        } catch (e: any) {
            console.error(e);
            alert('一部の処理に失敗しました: ' + e.message);
            // Refresh to see what actually succeeded
            await fetchShiftsAndRequests();
        } finally {
            setLoadingRequests(false);
        }
    };

    // Debug/Reset
    const handleResetAll = async () => {
        if (!clinicId) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        if (!confirm(`【警告】\n${year}年${month}月のシフトと申請データをすべて削除します。\n\n本当によろしいですか？`)) return;

        setLoading(true);
        try {
            // Calculate range
            const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const { deleteMonthlyShifts } = await import('../../services/db');
            await deleteMonthlyShifts(clinicId, startOfMonth, endOfMonth);

            await fetchShiftsAndRequests(); // Refresh
            alert(`${year}年${month}月のデータを削除しました。`);
        } catch (e: any) {
            console.error(e);
            alert('削除に失敗しました: ' + e.message);
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

                    <div className="flex items-center gap-4">
                        {/* Share Button */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="bg-white border border-gray-200 shadow-sm hover:shadow-md px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold text-gray-700 hover:text-primary"
                        >
                            <Share2 className="w-5 h-5" />
                            申請ページ共有
                        </button>

                        {/* Request Notification Button */}
                        <button
                            onClick={() => setShowRequestsModal(true)}
                            className="relative bg-white border border-gray-200 shadow-sm hover:shadow-md px-4 py-2 rounded-xl flex items-center gap-2 transition-all group"
                        >
                            <div className="relative">
                                <Bell className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                                {requests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                                )}
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-primary">シフト申請</span>
                            {requests.length > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">{requests.length}</span>
                            )}
                        </button>

                        <button
                            onClick={handleResetAll}
                            className="text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-bold border border-red-100"
                        >
                            全データ削除（今月分）
                        </button>
                    </div>
                </div>

                {/* ... (Existing Calendar UI) ... */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden p-6">
                    <ShiftCalendar
                        staffList={staffList}
                        shifts={shifts}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onDateClick={handleDateClick}
                    />
                </div>

                {/* Share Modal */}
                {showShareModal && clinicId && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
                                <Share2 className="w-6 h-6 text-primary" />
                                申請ページを共有
                            </h3>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                                <QRCode value={`${window.location.origin}/staff-submission/${clinicId}`} size={200} />
                            </div>

                            <p className="text-gray-500 text-sm mb-4">
                                スタッフにこのQRコードを読み取ってもらうか、<br />URLを共有してください。
                            </p>

                            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg mb-6">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/staff-submission/${clinicId}`}
                                    className="bg-transparent w-full text-xs text-gray-600 outline-none font-mono"
                                />
                                <button onClick={handleCopyUrl} className="p-2 hover:bg-gray-200 rounded-md transition-colors">
                                    <Copy className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                )}

                {/* ... (Requests Modal & Daily Edit Modal - Keep as is) ... */}
                {/* Requests Modal */}
                {showRequestsModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                        {/* ... content ... */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in border border-white/50 flex flex-col max-h-[80vh]">
                            <div className="px-8 py-6 border-b border-gray-100 flex flex-col gap-4 bg-white/50">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-primary" />
                                        シフト申請一覧
                                    </h3>
                                    <button onClick={() => setShowRequestsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {requests.length > 0 && (
                                    <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={selectedRequestIds.length === requests.length && requests.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRequestIds(requests.map(r => r.id));
                                                    } else {
                                                        setSelectedRequestIds([]);
                                                    }
                                                }}
                                            />
                                            <span className="text-sm font-bold text-gray-700">すべて選択</span>
                                        </label>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleBulkApprove}
                                                disabled={selectedRequestIds.length === 0 || loadingRequests}
                                                className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                                            >
                                                <Check className="w-4 h-4" />
                                                {loadingRequests ? '処理中...' : `選択した ${selectedRequestIds.length} 件を承認`}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-0 overflow-y-auto flex-1 bg-gray-50/50">
                                {requests.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        申請はありません
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {requests.map(req => {
                                            const staff = staffList.find(s => s.id === req.staffId);
                                            const isSelected = selectedRequestIds.includes(req.id);

                                            return (
                                                <div key={req.id} className={`p-6 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isSelected ? 'bg-blue-50/40' : 'bg-white'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-1 sm:mt-0"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedRequestIds(prev => [...prev, req.id]);
                                                                } else {
                                                                    setSelectedRequestIds(prev => prev.filter(id => id !== req.id));
                                                                }
                                                            }}
                                                        />
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                                                            {staff?.imageUrl ? (
                                                                <img src={staff.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800 flex items-center gap-2">
                                                                {staff?.name || '不明なスタッフ'}
                                                                <span className="text-sm font-normal text-gray-500">{req.date}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                                                                {req.isHoliday ? (
                                                                    <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-bold">休み希望</span>
                                                                ) : (
                                                                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                                        {req.startTime} 〜 {req.endTime}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full sm:w-auto pl-9 sm:pl-0">
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            disabled={loadingRequests}
                                                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
                                                        >
                                                            却下
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(req)}
                                                            disabled={loadingRequests}
                                                            className="flex-1 sm:flex-none px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 shadow-md shadow-blue-200 text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                                                        >
                                                            承認
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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
