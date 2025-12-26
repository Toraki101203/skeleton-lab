import { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, Share2, Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import PageLayout from '../../components/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getAttendanceRecords, updateAttendanceRecord, getShifts } from '../../services/db';
import type { AttendanceRecord, Staff, Shift } from '../../types';

const AttendanceManagement = () => {
    const { user } = useAuth();
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [shifts, setShifts] = useState<Shift[]>([]);

    const calculateMonthlySummary = () => {
        const summary = staffList.map(staff => {
            const staffRecords = records.filter(r => r.staffId === staff.id);
            const staffShifts = shifts.filter(s => s.staffId === staff.id);

            // 1. Work Days (Actual Attendance)
            const workDays = staffRecords.length;

            // 2. Scheduled Work Days (Shifts that are NOT holidays)
            const scheduledWorkDays = staffShifts.filter(s => !s.isHoliday).length;

            // 3. Absences
            // Simple logic: Scheduled but no attendance record for that date
            let absences = 0;
            staffShifts.forEach(shift => {
                if (!shift.isHoliday) {
                    const specificDate = shift.date; // YYYY-MM-DD
                    const worked = staffRecords.some(r => {
                        const rDate = new Date(r.date);
                        const y = rDate.getFullYear();
                        const m = String(rDate.getMonth() + 1).padStart(2, '0');
                        const d = String(rDate.getDate()).padStart(2, '0');
                        return `${y}-${m}-${d}` === specificDate;
                    });

                    if (!worked) {
                        // Only count if date < today (in the past)
                        const shiftDateObj = new Date(shift.date);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (shiftDateObj < today) {
                            absences++;
                        }
                    }
                }
            });

            // 4. Holidays = DaysInMonth - ScheduledWorkDays
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const daysInMonth = new Date(year, month, 0).getDate();
            const holidays = daysInMonth - scheduledWorkDays;

            let totalWorkMinutes = 0;
            let totalBreakMinutes = 0;

            staffRecords.forEach(record => {
                if (record.clockIn && record.clockOut) {
                    const [inHours, inMinutes] = record.clockIn.split(':').map(Number);
                    const [outHours, outMinutes] = record.clockOut.split(':').map(Number);

                    const start = inHours * 60 + inMinutes;
                    const end = outHours * 60 + outMinutes;

                    let duration = end - start;
                    if (duration < 0) duration += 24 * 60;

                    const breakTime = record.breakTime || 0;
                    totalWorkMinutes += (duration - breakTime);
                    totalBreakMinutes += breakTime;
                }
            });

            return {
                staffId: staff.id,
                name: staff.name,
                workDays,
                absences,
                holidays,
                totalWorkMinutes,
                totalBreakMinutes
            };
        });
        return summary;
    };

    // Fetch Clinic ID from User
    useEffect(() => {
        const fetchClinic = async () => {
            if (!user?.uid) return;
            const { data } = await supabase
                .from('clinics')
                .select('id, staff_info')
                .eq('owner_uid', user.uid)
                .single();

            if (data) {
                setClinicId(data.id);
                if (data.staff_info) {
                    setStaffList(data.staff_info);
                }
            }
        };
        fetchClinic();
    }, [user]);

    const fetchData = async () => {
        if (!clinicId) return;
        setLoading(true);
        try {
            // Get Month Range
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const [recordData, shiftData] = await Promise.all([
                getAttendanceRecords(clinicId, currentDate),
                getShifts(clinicId, startDate, endDate)
            ]);

            setRecords(recordData);
            setShifts(shiftData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clinicId, currentDate]);

    const handleEdit = (record: AttendanceRecord) => {
        setEditingRecord({ ...record });
    };

    const handleSave = async () => {
        if (!editingRecord) return;
        try {
            await updateAttendanceRecord(editingRecord.id, {
                clockIn: editingRecord.clockIn,
                clockOut: editingRecord.clockOut,
                breakTime: editingRecord.breakTime
            });
            await fetchData();
            setEditingRecord(null);
            alert('保存しました');
        } catch (e: any) {
            alert('保存に失敗しました: ' + e.message);
        }
    };

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const handleCopyUrl = () => {
        if (!clinicId) return;
        const url = `${window.location.origin}/staff-timecard/${clinicId}`;
        navigator.clipboard.writeText(url);
        alert('URLをコピーしました');
    };

    return (
        <PageLayout>
            <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Clock className="w-8 h-8 text-primary" />
                            勤怠管理
                        </h1>
                        <p className="text-gray-600 mt-2 font-medium">スタッフの出勤・退勤状況を確認します</p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto items-center">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="bg-white border border-gray-200 shadow-sm hover:shadow-md px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-bold text-gray-700 hover:text-primary mr-4"
                        >
                            <Share2 className="w-5 h-5" />
                            打刻ページ
                        </button>

                        <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg">←</button>
                        <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-bold text-gray-600 shadow-sm min-w-[140px] text-center">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                        </div>
                        <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-lg">→</button>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    {/* View Toggle */}
                    <div className="flex border-b border-gray-100/50">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${viewMode === 'daily'
                                ? 'bg-white text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:bg-white/50'
                                }`}
                        >
                            日次レコード
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${viewMode === 'monthly'
                                ? 'bg-white text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:bg-white/50'
                                }`}
                        >
                            月間集計レポート
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {viewMode === 'daily' ? (
                            <table className="w-full">
                                <thead className="bg-white/50 border-b border-gray-100/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">日付</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">スタッフ</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">出勤</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">退勤</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">休憩</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">状態</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {loading && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">読み込み中...</td>
                                        </tr>
                                    )}
                                    {!loading && records.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">データがありません</td>
                                        </tr>
                                    )}
                                    {records.map((record) => {
                                        const staff = staffList.find(s => s.id === record.staffId);
                                        // Make date readable
                                        const dateObj = new Date(record.date);
                                        const dateStr = `${dateObj.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()]})`;

                                        return (
                                            <tr key={record.id} className="hover:bg-white/60 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {dateStr}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center text-xs font-bold text-gray-500 border border-white">
                                                            {staff?.name.charAt(0) || '?'}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-700">{staff?.name || '不明'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                    {record.clockIn}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                                                    {record.clockOut || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {record.breakTime}分
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.status === 'working' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100/80 text-green-700 backdrop-blur-sm">
                                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            勤務中
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100/80 text-gray-500 backdrop-blur-sm">
                                                            <CheckCircle className="w-3 h-3" />
                                                            完了
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(record)}
                                                        className="text-primary hover:text-blue-700 font-bold"
                                                    >
                                                        編集
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-white/50 border-b border-gray-100/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">スタッフ</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">出勤日数</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-red-500">欠勤</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">休日</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">総勤務時間</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">総休憩時間</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {staffList.map(staff => {
                                        const summary = calculateMonthlySummary().find(s => s.staffId === staff.id);
                                        if (!summary) return null;

                                        return (
                                            <tr key={staff.id} className="hover:bg-white/60 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center text-xs font-bold text-gray-500 border border-white">
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                        <div className="text-sm font-bold text-gray-700">{staff.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">
                                                    {summary.workDays}日
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-bold">
                                                    {summary.absences > 0 ? `${summary.absences}日` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {summary.holidays}日
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono font-bold">
                                                    {Math.floor(summary.totalWorkMinutes / 60)}時間 {summary.totalWorkMinutes % 60}分
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {summary.totalBreakMinutes}分
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {staffList.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">スタッフデータがありません</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Edit Modal */}
                {editingRecord && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border border-white/50">
                            <div className="px-6 py-4 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                                <h3 className="text-lg font-bold text-gray-800">勤怠修正</h3>
                                <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-gray-600">
                                    <AlertCircle className="w-6 h-6 rotate-45" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">出勤時間</label>
                                    <input
                                        type="time"
                                        value={editingRecord.clockIn}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, clockIn: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800 px-4 py-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">退勤時間</label>
                                    <input
                                        type="time"
                                        value={editingRecord.clockOut}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, clockOut: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800 px-4 py-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">休憩時間 (分)</label>
                                    <input
                                        type="number"
                                        value={editingRecord.breakTime}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, breakTime: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800 px-4 py-3 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingRecord(null)}
                                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && clinicId && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
                                <Share2 className="w-6 h-6 text-primary" />
                                打刻ページを共有
                            </h3>

                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                                <QRCode value={`${window.location.origin}/staff-timecard/${clinicId}`} size={200} />
                            </div>

                            <p className="text-gray-500 text-sm mb-4">
                                スタッフにこのQRコードを読み取ってもらうか、<br />URLを共有してください。
                            </p>

                            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg mb-6">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/staff-timecard/${clinicId}`}
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
            </div>
        </PageLayout>
    );
};

export default AttendanceManagement;
