import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, CheckCircle, PlayCircle, StopCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getTodayAttendance, clockIn, clockOut } from '../../services/db';
import type { AttendanceRecord, Staff } from '../../types';

const StaffTimeCard = () => {
    const { clinicId } = useParams<{ clinicId: string }>();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
    const [record, setRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!clinicId) return;
        const fetchStaff = async () => {
            const { data } = await supabase
                .from('clinics')
                .select('staff_info')
                .eq('id', clinicId)
                .single();
            if (data?.staff_info) {
                setStaffList(data.staff_info);
            }
        };
        fetchStaff();
    }, [clinicId]);

    useEffect(() => {
        if (!clinicId || !selectedStaffId) {
            setRecord(null);
            return;
        }

        const fetchRecord = async () => {
            setLoading(true);
            try {
                const now = new Date();
                const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                const data = await getTodayAttendance(clinicId, selectedStaffId, dateKey);
                setRecord(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [clinicId, selectedStaffId]);

    const handleClockIn = async () => {
        if (!clinicId || !selectedStaffId) return;
        setLoading(true);
        try {
            await clockIn(clinicId, selectedStaffId);
            // Refresh
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const data = await getTodayAttendance(clinicId, selectedStaffId, dateKey);
            setRecord(data);
        } catch (e: any) {
            alert('打刻に失敗しました: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!record) return;
        if (!confirm('退勤しますか？(休憩時間は60分として記録されます)')) return;

        setLoading(true);
        try {
            await clockOut(record.id);
            // Refresh
            const now = new Date();
            const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const data = await getTodayAttendance(clinicId!, selectedStaffId!, dateKey);
            setRecord(data);
        } catch (e: any) {
            alert('打刻に失敗しました: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-primary p-6 text-white text-center">
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Clock className="w-6 h-6" />
                        スタッフ打刻
                    </h1>
                    <div className="mt-4 text-4xl font-mono font-bold tracking-wider">
                        {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                        {currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Staff Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">スタッフ名を選択</label>
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

                    {/* Status & Actions */}
                    {selectedStaffId && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center">
                                <div className="text-sm font-bold text-gray-500 mb-1">現在の状態</div>
                                {loading ? (
                                    <div className="flex justify-center py-2"><Loader className="w-6 h-6 animate-spin text-primary" /></div>
                                ) : !record ? (
                                    <div className="text-gray-400 font-bold text-xl">未出勤</div>
                                ) : record.status === 'working' ? (
                                    <div className="text-green-500 font-bold text-xl flex items-center justify-center gap-2">
                                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                        勤務中 (出勤: {record.clockIn})
                                    </div>
                                ) : (
                                    <div className="text-blue-500 font-bold text-xl flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        退勤済み (退勤: {record.clockOut})
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleClockIn}
                                    disabled={!!record || loading}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${!record && !loading
                                            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer shadow-lg shadow-blue-100'
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <PlayCircle className="w-8 h-8 mb-2" />
                                    <span className="font-bold">出勤</span>
                                </button>

                                <button
                                    onClick={handleClockOut}
                                    disabled={!record || record.status !== 'working' || loading}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${record?.status === 'working' && !loading
                                            ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer shadow-lg shadow-red-100'
                                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <StopCircle className="w-8 h-8 mb-2" />
                                    <span className="font-bold">退勤</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffTimeCard;
