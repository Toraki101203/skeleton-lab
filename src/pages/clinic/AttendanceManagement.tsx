import { useState } from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import type { AttendanceRecord, Staff } from '../../types';

const defaultBusinessHours = { start: '09:00', end: '18:00', isClosed: false };
const defaultSchedule = {
    mon: defaultBusinessHours,
    tue: defaultBusinessHours,
    wed: defaultBusinessHours,
    thu: defaultBusinessHours,
    fri: defaultBusinessHours,
    sat: { ...defaultBusinessHours, isClosed: true },
    sun: { ...defaultBusinessHours, isClosed: true },
};

// Mock Data
const MOCK_STAFF: Staff[] = [
    { id: '1', name: '山田 花子', role: '院長', imageUrl: '', skillIds: [], defaultSchedule },
    { id: '2', name: '鈴木 一郎', role: '整体師', imageUrl: '', skillIds: [], defaultSchedule }
];

const MOCK_RECORDS: AttendanceRecord[] = [
    { id: '1', date: '2023-12-01', staffId: '1', clockIn: '08:55', clockOut: '18:10', breakTime: 60, status: 'completed' },
    { id: '2', date: '2023-12-01', staffId: '2', clockIn: '09:50', clockOut: '19:05', breakTime: 60, status: 'completed' },
    { id: '3', date: '2023-12-02', staffId: '1', clockIn: '08:58', clockOut: '', breakTime: 0, status: 'working' },
];

const AttendanceManagement = () => {
    const [currentDate] = useState(new Date());
    const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_RECORDS);
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

    const handleEdit = (record: AttendanceRecord) => {
        setEditingRecord({ ...record });
    };

    const handleSave = () => {
        if (!editingRecord) return;
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? editingRecord : r));
        setEditingRecord(null);
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
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                            <Calendar className="w-4 h-4" />
                            {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                        </button>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                    <div className="overflow-x-auto">
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
                                {records.map((record) => {
                                    const staff = MOCK_STAFF.find(s => s.id === record.staffId);
                                    return (
                                        <tr key={record.id} className="hover:bg-white/60 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {record.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center text-xs font-bold text-gray-500 border border-white">
                                                        {staff?.name.charAt(0)}
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-700">{staff?.name}</div>
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
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">退勤時間</label>
                                    <input
                                        type="time"
                                        value={editingRecord.clockOut}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, clockOut: e.target.value })}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">休憩時間 (分)</label>
                                    <input
                                        type="number"
                                        value={editingRecord.breakTime}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, breakTime: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 bg-white/50 text-gray-800"
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
            </div>
        </PageLayout>
    );
};

export default AttendanceManagement;
