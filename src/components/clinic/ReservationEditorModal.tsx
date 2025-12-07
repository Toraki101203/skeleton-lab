import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, Check, AlertCircle } from 'lucide-react';
import type { Reservation, Staff, MenuItem, Shift } from '../../types';

interface ReservationEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialReservation?: Partial<Reservation>;
    staffList: Staff[];
    menuItems: MenuItem[];
    shifts?: Shift[]; // Add shifts prop
    onSave: (reservation: Reservation) => void;
}

const ReservationEditorModal = ({ isOpen, onClose, initialReservation, staffList, menuItems, shifts = [], onSave }: ReservationEditorModalProps) => {
    const [formData, setFormData] = useState<Partial<Reservation>>({
        status: 'confirmed',
        ...initialReservation
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                status: 'confirmed',
                ...initialReservation
            });
            setError(null);
        }
    }, [isOpen, initialReservation]);

    // Validation Effect
    useEffect(() => {
        validateAvailability();
    }, [formData.date, formData.staffId, formData.startTime, formData.menuItemId]);

    const validateAvailability = () => {
        if (!formData.date || !formData.staffId || !formData.startTime || !formData.menuItemId) {
            setError(null);
            return;
        }

        const staff = staffList.find(s => s.id === formData.staffId);
        if (!staff) return;

        // 1. Check Shift
        const shift = shifts.find(s => s.date === formData.date && s.staffId === formData.staffId);

        let startWork = '09:00';
        let endWork = '18:00';
        if (shift) {
            if (shift.isHoliday) {
                setError('この日はスタッフの休日です');
                return;
            }
            startWork = shift.startTime;
            endWork = shift.endTime;
        } else {
            // Check default schedule
            const date = new Date(formData.date);
            const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
            const dayKey = dayMap[date.getDay()];
            const schedule = staff.defaultSchedule?.[dayKey];

            if (schedule?.isClosed) {
                setError('この日はスタッフの定休日です');
                return;
            }
            if (schedule) {
                startWork = schedule.start;
                endWork = schedule.end;
            }
        }

        // Check Time
        if (formData.startTime < startWork || formData.startTime >= endWork) {
            setError(`営業時間外です (${startWork} - ${endWork})`);
            return;
        }

        // Check if End Time exceeds Work End
        const endTime = calculateEndTime(formData.startTime, formData.menuItemId);
        if (endTime > endWork) {
            setError(`終了時間が営業時間を超えています (${endWork}まで)`);
            return;
        }

        setError(null);
    };

    if (!isOpen) return null;

    const handleSave = () => {
        // Basic validation
        if (!formData.patientName || !formData.date || !formData.startTime || !formData.staffId || !formData.menuItemId) {
            alert('必須項目を入力してください');
            return;
        }

        if (error) {
            alert('予約内容に問題があります：' + error);
            return;
        }

        // Create full reservation object
        const reservation: Reservation = {
            id: formData.id || crypto.randomUUID(),
            clinicId: 'clinic1', // Mock
            patientName: formData.patientName,
            patientEmail: formData.patientEmail,
            patientPhone: formData.patientPhone,
            staffId: formData.staffId,
            menuItemId: formData.menuItemId,
            date: formData.date!,
            startTime: formData.startTime!,
            endTime: formData.endTime || calculateEndTime(formData.startTime!, formData.menuItemId),
            status: formData.status as any,
            notes: formData.notes,
            createdAt: formData.createdAt || new Date().toISOString()
        };

        onSave(reservation);
    };

    const calculateEndTime = (start: string, menuId: string) => {
        const menu = menuItems.find(m => m.id === menuId);
        if (!menu) return start;

        const [hours, minutes] = start.split(':').map(Number);
        const date = new Date();
        const duration = menu.duration ? Number(menu.duration) : 60;
        date.setHours(hours, minutes + duration);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const handleMenuChange = (menuId: string) => {
        const endTime = formData.startTime ? calculateEndTime(formData.startTime, menuId) : undefined;
        setFormData({ ...formData, menuItemId: menuId, endTime });
    };

    const handleStartTimeChange = (time: string) => {
        const endTime = formData.menuItemId ? calculateEndTime(time, formData.menuItemId) : undefined;
        setFormData({ ...formData, startTime: time, endTime });
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="text-xl font-bold text-gray-800">
                        {formData.id ? '予約編集' : '新規予約登録'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Patient Info */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            患者様情報
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">お名前 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.patientName || ''}
                                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="山田 太郎"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">電話番号</label>
                                <input
                                    type="tel"
                                    value={formData.patientPhone || ''}
                                    onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="090-1234-5678"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
                                <input
                                    type="email"
                                    value={formData.patientEmail || ''}
                                    onChange={e => setFormData({ ...formData, patientEmail: e.target.value })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Reservation Details */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            予約内容
                        </h4>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-bold animate-fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">担当スタッフ <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {staffList.map(staff => (
                                        <div
                                            key={staff.id}
                                            onClick={() => setFormData({ ...formData, staffId: staff.id })}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formData.staffId === staff.id
                                                ? 'border-primary bg-blue-50 text-primary font-bold'
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {staff.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">メニュー <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.menuItemId || ''}
                                    onChange={e => handleMenuChange(e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                >
                                    <option value="">選択してください</option>
                                    {menuItems.map(menu => (
                                        <option key={menu.id} value={menu.id}>
                                            {menu.name} ({menu.duration}分) - ¥{menu.price.toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">日付 <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={formData.date || ''}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">開始時間 <span className="text-red-500">*</span></label>
                                    <input
                                        type="time"
                                        value={formData.startTime || ''}
                                        onChange={e => handleStartTimeChange(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {formData.endTime && (
                                <div className="text-right text-sm text-gray-500">
                                    終了予定: <span className="font-bold text-gray-800">{formData.endTime}</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Notes */}
                    <section>
                        <label className="block text-sm font-bold text-gray-700 mb-2">メモ</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                            rows={3}
                            placeholder="特記事項があれば入力してください"
                        />
                    </section>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        保存する
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ReservationEditorModal;
