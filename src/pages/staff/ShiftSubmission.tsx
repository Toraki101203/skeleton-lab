import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Check, AlertCircle, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createShiftRequest } from '../../services/db';
import type { Staff } from '../../types';

const StaffShiftSubmission = () => {
    const { clinicId } = useParams<{ clinicId: string }>();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [month, setMonth] = useState(new Date());
    const [shiftData, setShiftData] = useState<Record<string, { start: string; end: string; isHoliday: boolean }>>({});
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [clinicHours, setClinicHours] = useState<any>(null);

    useEffect(() => {
        if (!clinicId) return;
        const fetchClinicData = async () => {
            const { data } = await supabase
                .from('clinics')
                .select('staff_info, business_hours')
                .eq('id', clinicId)
                .single();
            if (data) {
                if (data.staff_info) setStaffList(data.staff_info);
                if (data.business_hours) setClinicHours(data.business_hours);
            }
        };
        fetchClinicData();
    }, [clinicId]);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const m = date.getMonth();
        return new Date(year, m + 1, 0).getDate();
    };

    const getClinicDayConfig = (date: Date) => {
        if (!clinicHours) return { start: '09:00', end: '18:00', isClosed: false };
        const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
        const key = dayMap[date.getDay()];
        const schedule = clinicHours[key];
        return {
            start: schedule?.start || '09:00',
            end: schedule?.end || '18:00',
            isClosed: schedule?.isClosed ?? false
        };
    };

    const handleDateChange = (day: number, field: 'start' | 'end' | 'isHoliday', value: any) => {
        const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        const { start, end, isClosed } = getClinicDayConfig(date);

        setShiftData(prev => {
            // If default, use clinic hours
            const existing = prev[dateKey] || { start, end, isHoliday: isClosed };
            return {
                ...prev,
                [dateKey]: {
                    ...existing,
                    [field]: value
                }
            };
        });
    };

    const handleSubmit = async () => {
        if (!clinicId || !selectedStaffId) return;
        setError(null);

        try {
            // Iterate over all days in the selected month
            const year = month.getFullYear();
            const m = month.getMonth();
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            const requests = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const date = new Date(year, m, day);
                const { start, end, isClosed } = getClinicDayConfig(date);

                // Use existing data or visual default (clinic-aware)
                // IMPORTANT: If clinic is closed on this day, FORCE holiday regardless of state if we want to be strict,
                // OR just use the default which isHoliday=true.
                // We'll trust state if it exists, but default to closed if not.
                // Actually, if user *tried* to set it to work on a closed day, we might want to block it or respect it if it was an override?
                // Request says "cannot select shift". So we should arguably enforce it here or in UI.
                // For now, let's use the robust default.
                const data = shiftData[dateKey] || { start, end, isHoliday: isClosed };

                // Final safety check: if clinic is closed, ensure it's holiday
                // (Unless we allow overrides - user asked to "disable selecting shift", so enforcing is good)
                const finalIsHoliday = isClosed ? true : data.isHoliday;

                requests.push({
                    clinicId,
                    staffId: selectedStaffId,
                    date: dateKey,
                    startTime: data.start,
                    endTime: data.end,
                    isHoliday: finalIsHoliday
                });
            }

            if (requests.length === 0) {
                setError('シフトが入力されていません');
                return;
            }

            await Promise.all(requests.map(req => createShiftRequest(req)));
            setSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError('提出に失敗しました: ' + err.message);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">提出完了</h2>
                    <p className="text-gray-500 mb-6">シフト希望を提出しました。<br />管理者の承認をお待ちください。</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
                        戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary p-6 text-white text-center">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <CalendarIcon className="w-6 h-6" />
                            シフト希望提出
                        </h1>
                        <p className="text-white/80 mt-2 text-sm">スタッフ専用ページ</p>
                        <p className="text-white/60 text-xs mt-1">※内容を修正したい場合は、再度提出してください（管理者承認時に上書きされます）</p>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        {/* 1. Select Staff */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">スタッフ名を選択してください</label>
                            <select
                                className="w-full p-4 rounded-xl border-2 border-gray-200 text-lg bg-gray-50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                value={selectedStaffId || ''}
                                onChange={e => setSelectedStaffId(e.target.value)}
                            >
                                <option value="">選択してください</option>
                                {staffList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedStaffId && (
                            <div className="animate-fade-in space-y-8">
                                {/* 2. Month Selector */}
                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 hover:bg-gray-200 rounded-lg">← 前月</button>
                                    <div className="font-bold text-xl">{month.getFullYear()}年 {month.getMonth() + 1}月</div>
                                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 hover:bg-gray-200 rounded-lg">次月 →</button>
                                </div>

                                {/* 3. Calendar Input */}
                                <div className="space-y-4">
                                    {Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1).map(day => {
                                        const date = new Date(month.getFullYear(), month.getMonth(), day);
                                        const dateKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                        const { start: defaultStart, end: defaultEnd, isClosed: clinicClosed } = getClinicDayConfig(date);
                                        const dayData = shiftData[dateKey] || { start: defaultStart, end: defaultEnd, isHoliday: clinicClosed };

                                        // Enforce holiday visual if clinic is closed (even if state somehow says otherwise, though handleDateChange should catch it)
                                        const isHoliday = clinicClosed ? true : dayData.isHoliday;

                                        return (
                                            <div key={day} className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border ${isHoliday ? 'bg-gray-100 border-gray-200 opacity-70' : 'bg-white border-blue-100 shadow-sm'}`}>
                                                <div className={`w-full sm:w-32 font-bold flex items-center gap-2 ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                                                    <span className="text-xl">{day}</span>
                                                    <span className="text-sm">({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})</span>
                                                    {clinicClosed && <span className="text-xs text-red-500 font-bold ml-1">定休日</span>}
                                                </div>

                                                <div className="flex-1 flex flex-col sm:flex-row w-full items-start sm:items-center gap-4">
                                                    {/* Selection: Work vs Holiday */}
                                                    <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                                                        <button
                                                            onClick={() => !clinicClosed && handleDateChange(day, 'isHoliday', false)}
                                                            disabled={clinicClosed}
                                                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!isHoliday ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${clinicClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            出勤
                                                        </button>
                                                        <button
                                                            onClick={() => handleDateChange(day, 'isHoliday', true)}
                                                            disabled={clinicClosed} // Already holiday, no need to toggle
                                                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${isHoliday ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            休み
                                                        </button>
                                                    </div>

                                                    {!isHoliday && (
                                                        <div className="flex items-center gap-2 flex-1 animate-fade-in w-full sm:w-auto">
                                                            <div className="relative">
                                                                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                                <input
                                                                    type="time"
                                                                    value={dayData.start}
                                                                    onChange={e => handleDateChange(day, 'start', e.target.value)}
                                                                    className="pl-9 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-bold w-full sm:w-32 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                            <span className="text-gray-400">〜</span>
                                                            <div className="relative">
                                                                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                                <input
                                                                    type="time"
                                                                    value={dayData.end}
                                                                    onChange={e => handleDateChange(day, 'end', e.target.value)}
                                                                    className="pl-9 pr-2 py-2 rounded-lg border border-gray-200 text-sm font-bold w-full sm:w-32 focus:border-primary outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold animate-shake">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-8 border-t border-gray-100">
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-6 h-6" />
                                        シフト希望を提出する
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffShiftSubmission;
