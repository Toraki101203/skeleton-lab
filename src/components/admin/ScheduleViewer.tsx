import React, { useState } from 'react';
import { format, addMinutes, parse, isWithinInterval, isBefore } from 'date-fns';
import type { BusinessHours } from '../../types';
import { useRealtimeBookings } from '../../hooks/useRealtimeBookings';
import { createBooking } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

interface Props {
    clinicId: string;
    date: Date;
    staffList?: { id: string, name: string }[]; // Simplified interface or import Staff type
    onSelectSlot: (start: Date, end: Date) => void;
}

const ScheduleViewer: React.FC<Props> = ({ clinicId, date, staffList = [] }) => {
    const { bookings, loading } = useRealtimeBookings(clinicId, date);
    const { user } = useAuth();

    // Proxy Booking State
    const [showProxyModal, setShowProxyModal] = useState(false);
    const [proxyTime, setProxyTime] = useState<Date | null>(null);
    const [proxyType, setProxyType] = useState<'guest' | 'user'>('guest');

    // Guest Inputs
    const [guestName, setGuestName] = useState('');
    const [guestContact, setGuestContact] = useState('');

    // User Inputs
    const [targetUserId, setTargetUserId] = useState('');

    // Common Inputs
    const [selectedStaffId, setSelectedStaffId] = useState<string>('free'); // 'free' or staffId
    const [proxyNotes, setProxyNotes] = useState('');
    const [internalMemo, setInternalMemo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Business Hours  (Should be props or fetched)
    const businessHours: BusinessHours = {
        start: '09:00',
        end: '23:00',
        isClosed: false
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">読み込み中...</div>;
    }

    // Generate 30 min slots
    const slots: Date[] = [];
    let current = parse(businessHours.start, 'HH:mm', date);
    const end = parse(businessHours.end, 'HH:mm', date);

    while (isBefore(current, end)) {
        slots.push(current);
        current = addMinutes(current, 30);
    }

    const isSlotBooked = (slotStart: Date) => {
        const slotEnd = addMinutes(slotStart, 30);
        return bookings.some(b => {
            // Simple overlap check
            return (
                (isWithinInterval(slotStart, { start: b.startTime, end: b.endTime }) && slotStart < b.endTime) ||
                (isWithinInterval(slotEnd, { start: b.startTime, end: b.endTime }) && slotEnd > b.startTime)
            );
        });
    };

    const getBookingForSlot = (slotStart: Date) => {

        return bookings.find(b => {
            return (
                (isWithinInterval(slotStart, { start: b.startTime, end: b.endTime }) && slotStart < b.endTime)
            );
        });
    }

    const handleSlotClick = (slot: Date) => {
        const existing = getBookingForSlot(slot);
        if (existing) {
            const guestInfo = existing.guestName ? `\nゲスト名: ${existing.guestName} (${existing.guestContact})` : '';
            alert(`予約詳細:\nステータス: ${existing.status}\n担当: ${existing.staffId || '指名なし'}${guestInfo}\nメモ: ${existing.notes}`);
            return;
        }

        // Open Proxy Booking Modal
        setProxyTime(slot);
        setProxyType('guest'); // Default to guest for phone
        setGuestName('');
        setGuestContact('');
        setTargetUserId('');
        setSelectedStaffId('free');
        setProxyNotes('');
        setInternalMemo('');
        setShowProxyModal(true);
    };

    const handleProxySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proxyTime || !user) return;

        setIsSubmitting(true);
        try {
            await createBooking({
                clinicId: clinicId,
                userId: proxyType === 'user' ? targetUserId : undefined, // Undefined for guest
                staffId: selectedStaffId === 'free' ? null : selectedStaffId,
                bookedBy: 'operator',
                status: 'confirmed',
                startTime: proxyTime,
                endTime: addMinutes(proxyTime, 60),
                notes: proxyNotes,
                internalMemo: internalMemo,
                guestName: proxyType === 'guest' ? guestName : undefined,
                guestContact: proxyType === 'guest' ? guestContact : undefined
            });
            setShowProxyModal(false);
        } catch (error) {
            console.error(error);
            alert('予約作成に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-3 font-semibold border-b border-gray-200 text-gray-700 flex justify-between items-center">
                <span>{format(date, 'yyyy年MM月dd日')} の予約状況</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {businessHours.start} - {businessHours.end}
                </span>
            </div>

            <div className="p-4 grid grid-cols-4 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {slots.map((slot, idx) => {
                    const booked = isSlotBooked(slot);
                    const booking = getBookingForSlot(slot);
                    const isOperator = booking?.bookedBy === 'operator';
                    const isGuest = !!booking?.guestName;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSlotClick(slot)}
                            className={`
                                p-3 rounded-lg text-sm font-medium transition-all duration-200 relative
                                ${booked
                                    ? isOperator
                                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                                        : 'bg-red-50 text-red-400 border border-red-100'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            {format(slot, 'HH:mm')}
                            {booked && (
                                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isOperator ? 'bg-purple-400' : 'bg-red-400'}`}></span>
                            )}
                            {isGuest && <span className="absolute bottom-1 right-1 text-[10px] text-purple-500 font-bold">G</span>}
                        </button>
                    );
                })}
            </div >
            <div className="p-3 text-xs text-gray-500 flex justify-end space-x-4 bg-gray-50 border-t border-gray-200">
                <span className="flex items-center"><span className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></span> 予約可能</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></span> WEB予約</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-purple-50 border border-purple-200 rounded mr-2"></span> 代理・電話</span>
            </div>

            {/* Proxy Booking Modal */}
            {
                showProxyModal && proxyTime && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">代理予約の作成</h3>
                                <button onClick={() => setShowProxyModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm font-medium">
                                日時: {format(proxyTime, 'MM/dd HH:mm')}
                            </p>

                            <div className="flex border-b mb-4">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium ${proxyType === 'guest' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                                    onClick={() => setProxyType('guest')}
                                >
                                    ゲスト(電話/新規)
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium ${proxyType === 'user' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                                    onClick={() => setProxyType('user')}
                                >
                                    既存会員ID
                                </button>
                            </div>

                            <form onSubmit={handleProxySubmit} className="space-y-4">
                                {/* Guest Form */}
                                {proxyType === 'guest' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">お名前 (必須)</label>
                                            <input
                                                required
                                                className="w-full border rounded p-2 text-sm text-gray-800"
                                                placeholder="例: 山田 花子"
                                                value={guestName}
                                                onChange={e => setGuestName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">連絡先 (必須)</label>
                                            <input
                                                required
                                                className="w-full border rounded p-2 text-sm text-gray-800"
                                                placeholder="例: 090-1234-5678"
                                                value={guestContact}
                                                onChange={e => setGuestContact(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* User Form */}
                                {proxyType === 'user' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">ユーザーID (必須)</label>
                                        <input
                                            required
                                            className="w-full border rounded p-2 text-sm text-gray-800"
                                            placeholder="User UUID"
                                            value={targetUserId}
                                            onChange={e => setTargetUserId(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">※将来的に名前検索に対応</p>
                                    </div>
                                )}

                                {/* Staff Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">担当スタッフ</label>
                                    <select
                                        className="w-full border rounded p-2 text-sm text-gray-800"
                                        value={selectedStaffId}
                                        onChange={e => setSelectedStaffId(e.target.value)}
                                    >
                                        <option value="free">指名なし (フリー)</option>
                                        <option disabled>──────────</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">事務局メモ (内部用)</label>
                                    <textarea
                                        className="w-full border rounded p-2 text-sm text-gray-800 bg-yellow-50"
                                        placeholder="院内への申し送り事項 (患者には見えません)"
                                        rows={2}
                                        value={internalMemo}
                                        onChange={e => setInternalMemo(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">一般メモ (患者情報など)</label>
                                    <textarea
                                        className="w-full border rounded p-2 text-sm text-gray-800"
                                        placeholder="相談内容や特記事項..."
                                        rows={2}
                                        value={proxyNotes}
                                        onChange={e => setProxyNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowProxyModal(false)}
                                        className="flex-1 py-2 border rounded-lg text-gray-600 text-sm"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm shadow hover:bg-purple-700 transition"
                                    >
                                        {isSubmitting ? '保存中...' : '予約を確定する'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ScheduleViewer;
