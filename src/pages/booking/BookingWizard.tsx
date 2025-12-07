import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Clock, User } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, isBefore, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Clinic, Booking } from '../../types';
import { getClinic, createBooking, getClinicBookings } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const BookingWizard = () => {
    const [searchParams] = useSearchParams();
    const clinicId = searchParams.get('clinicId');
    const { user } = useAuth();

    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        menuId: '',
        staffId: '',
        date: '',
        time: '',
        patientName: user?.name || '',
        patientEmail: user?.email || '',
        patientPhone: user?.phone || '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!clinicId) return;
            try {
                setLoading(true);
                const data = await getClinic(clinicId);
                setClinic(data);
            } catch (error) {
                console.error("Failed to fetch clinic", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clinicId]);

    // Fetch bookings when month or clinic changes AND subscribe to real-time updates
    useEffect(() => {
        if (!clinicId) return;

        let isMounted = true;
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        let subscription: any = null;

        const fetchAndSubscribe = async () => {
            // 1. Initial Fetch
            try {
                const data = await getClinicBookings(clinicId, start, end);
                if (isMounted) {
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }

            // 2. Real-time Subscription
            subscription = supabase
                .channel(`booking-wizard-${clinicId}-${currentMonth.toISOString()}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bookings',
                        filter: `clinic_id=eq.${clinicId}`
                    },
                    (payload) => {
                        if (!isMounted) return;
                        const { eventType, new: newRecord, old: oldRecord } = payload;

                        if (eventType === 'INSERT') {
                            const newB = newRecord as any;
                            const bTime = new Date(newB.start_time);
                            // Add only if in current view (with some buffer ideally, but strictly within month is fine for now)
                            // Actually, since we use start/end of month for initial fetch, we should keep it consistent.
                            if (bTime >= start && bTime <= end) {
                                const newBooking: Booking = {
                                    id: newB.id,
                                    clinicId: newB.clinic_id,
                                    userId: newB.user_id,
                                    staffId: newB.staff_id,
                                    bookedBy: newB.booked_by,
                                    status: newB.status,
                                    startTime: new Date(newB.start_time),
                                    endTime: new Date(newB.end_time),
                                    notes: newB.notes,
                                    guestName: newB.guest_name,
                                    guestContact: newB.guest_contact,
                                    guestEmail: newB.guest_email,
                                    internalMemo: newB.internal_memo
                                };
                                setBookings(prev => [...prev, newBooking]);
                            }
                        } else if (eventType === 'UPDATE') {
                            const newB = newRecord as any;
                            setBookings(prev => prev.map(b => {
                                if (b.id === newB.id) {
                                    return {
                                        ...b,
                                        bookedBy: newB.booked_by,
                                        status: newB.status,
                                        startTime: new Date(newB.start_time),
                                        endTime: new Date(newB.end_time),
                                        notes: newB.notes,
                                        staffId: newB.staff_id,
                                        guestName: newB.guest_name,
                                        guestContact: newB.guest_contact,
                                        guestEmail: newB.guest_email,
                                        internalMemo: newB.internal_memo
                                    };
                                }
                                return b;
                            }));
                        } else if (eventType === 'DELETE') {
                            setBookings(prev => prev.filter(b => b.id !== (oldRecord as any).id));
                        }
                    }
                )
                .subscribe();
        };

        fetchAndSubscribe();

        return () => {
            isMounted = false;
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [clinicId, currentMonth]);

    // Pre-fill user data if logged in
    useEffect(() => {
        if (user) {
            setBookingData(prev => ({
                ...prev,
                patientName: user.name || prev.patientName,
                patientEmail: user.email || prev.patientEmail,
                patientPhone: user.phone || prev.patientPhone
            }));
        }
    }, [user]);

    const totalSteps = 4;

    const handleNext = () => {
        setStep(prev => Math.min(prev + 1, totalSteps + 1));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const updateData = (key: string, value: any) => {
        setBookingData(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
    if (!clinic) return <div className="min-h-screen flex items-center justify-center">クリニックが見つかりませんでした</div>;

    const renderStep1_Menu = () => (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">メニューを選択してください</h2>
            <div className="grid grid-cols-1 gap-4">
                {clinic.menuItems?.map(menu => (
                    <div
                        key={menu.id}
                        onClick={() => {
                            updateData('menuId', menu.id);
                            handleNext();
                        }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg group ${bookingData.menuId === menu.id
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-blue-200'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-lg font-bold ${bookingData.menuId === menu.id ? 'text-primary' : 'text-gray-800'}`}>
                                {menu.name}
                            </h3>
                            <span className="font-bold text-lg">¥{menu.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {menu.duration}分
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm">{menu.description}</p>
                    </div>
                ))}
                {(!clinic.menuItems || clinic.menuItems.length === 0) && (
                    <p>メニューが登録されていません。</p>
                )}
            </div>
        </div>
    );

    const renderStep2_Staff = () => {
        const availableStaff = clinic.staffInfo ? clinic.staffInfo.filter(s => {
            if (!s.skillIds || s.skillIds.length === 0) return true;
            return s.skillIds.includes(bookingData.menuId);
        }) : [];

        return (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-4">担当スタッフを選択してください</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        onClick={() => {
                            updateData('staffId', null);
                            handleNext();
                        }}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg flex items-center gap-4 ${bookingData.staffId === null
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-100 bg-white hover:border-blue-200'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            指名なし
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">指名なし</h3>
                            <p className="text-xs text-gray-500">最短でご案内できるスタッフが担当します</p>
                        </div>
                    </div>

                    {availableStaff.map(staff => (
                        <div
                            key={staff.id}
                            onClick={() => {
                                updateData('staffId', staff.id);
                                handleNext();
                            }}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg flex items-center gap-4 ${bookingData.staffId === staff.id
                                ? 'border-primary bg-blue-50'
                                : 'border-gray-100 bg-white hover:border-blue-200'
                                }`}
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                {staff.imageUrl ? (
                                    <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{staff.name}</h3>
                                <p className="text-xs text-gray-500">{staff.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Helper for Availability ---
    const checkAvailability = (dateStr: string, timeStr: string) => {
        const startDateTime = new Date(`${dateStr}T${timeStr}`);
        const menu = clinic?.menuItems?.find(m => m.id === bookingData.menuId);
        const duration = menu ? menu.duration : 60;
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        // Filter bookings that overlap
        const overlaps = bookings.filter(b => {
            if (b.status === 'cancelled') return false;

            // Time overlap logic
            const bStart = new Date(b.startTime);
            const bEnd = new Date(b.endTime);
            return startDateTime < bEnd && endDateTime > bStart;
        });

        // 1. Specific Staff Nomination
        if (bookingData.staffId) {
            const isStaffBooked = overlaps.some(b => b.staffId === bookingData.staffId);
            return isStaffBooked ? 'X' : 'O';
        }

        // 2. Free Nomination (Any Staff)
        const capableStaff = clinic?.staffInfo?.filter(s =>
            !s.skillIds || s.skillIds.length === 0 || s.skillIds.includes(bookingData.menuId)
        ) || [];
        const totalCapacity = capableStaff.length;

        const bookedCount = overlaps.filter(b => {
            if (b.staffId) return capableStaff.some(s => s.id === b.staffId);
            return true; // Free booking consumes generic capacity
        }).length;

        const remaining = totalCapacity - bookedCount;

        if (remaining <= 0) return 'X';
        if (remaining <= 1) return '△'; // Few left
        return 'O';
    };

    const renderStep3_DateTime = () => {
        const days = eachDayOfInterval({
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth),
        });

        // Generate Time Slots (10:00 - 20:00)
        const timeSlots = [];
        for (let i = 10; i <= 20; i++) {
            timeSlots.push(`${i}:00`);
        }

        const handleMonthChange = (direction: 'prev' | 'next') => {
            setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
        };

        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        const today = startOfDay(new Date());

        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 mb-4">日時を選択してください</h2>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft />
                    </button>
                    <span className="text-lg font-bold">
                        {format(currentMonth, 'yyyy年 M月', { locale: ja })}
                    </span>
                    <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-7 mb-2 text-center text-sm font-bold text-gray-500">
                        {weekDays.map((d, i) => (
                            <div key={i} className={i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for start of month */}
                        {Array.from({ length: getDay(startOfMonth(currentMonth)) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Days */}
                        {days.map(date => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const isSelected = bookingData.date === dateStr;
                            const isPast = isBefore(date, today);

                            return (
                                <button
                                    key={dateStr}
                                    disabled={isPast}
                                    onClick={() => updateData('date', dateStr)}
                                    className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all relative
                                        ${isSelected ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100'}
                                        ${isPast ? 'opacity-30 cursor-not-allowed text-gray-300' : 'text-gray-700'}
                                    `}
                                >
                                    <span className={`text-sm ${isToday(date) && !isSelected ? 'font-bold text-primary' : ''}`}>
                                        {format(date, 'd')}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Slots Area */}
                {bookingData.date && (
                    <div className="animate-slide-up">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-gray-800">
                                {format(new Date(bookingData.date), 'M月d日 (E)', { locale: ja })} の空き状況
                            </h3>
                            <div className="flex gap-2 text-xs text-gray-500 ml-auto">
                                <span className="flex items-center gap-1"><span className="text-green-500 font-bold">◎</span> 予約可</span>
                                <span className="flex items-center gap-1"><span className="text-orange-500 font-bold">▲</span> 残りわずか</span>
                                <span className="flex items-center gap-1"><span className="text-gray-300 font-bold">×</span> 満席</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {timeSlots.map(time => {
                                const avail = checkAvailability(bookingData.date, time);
                                const isSelected = bookingData.time === time;
                                const isAvailable = avail === 'O' || avail === '△';

                                return (
                                    <button
                                        key={time}
                                        disabled={!isAvailable}
                                        onClick={() => {
                                            updateData('time', time);
                                            handleNext();
                                        }}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                                            ${isSelected
                                                ? 'border-primary bg-blue-50'
                                                : isAvailable
                                                    ? 'border-gray-100 bg-white hover:border-blue-200'
                                                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-primary' : 'text-gray-700'}`}>{time}</span>
                                        <span className={`text-lg font-bold leading-none
                                            ${avail === 'O' ? 'text-green-500' : ''}
                                            ${avail === '△' ? 'text-orange-500' : ''}
                                            ${avail === 'X' ? 'text-gray-300' : ''}
                                        `}>
                                            {avail === 'O' ? '◎' : avail === '△' ? '▲' : '×'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const submitBooking = async () => {
        if (!clinic) return;
        setSubmitting(true);
        try {
            const startDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
            // Calculate end time based on menu duration
            const menu = clinic.menuItems?.find(m => m.id === bookingData.menuId);
            const duration = menu?.duration ? Number(menu.duration) : 60;
            const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

            await createBooking({
                clinicId: clinic.id,
                userId: user?.uid,
                staffId: bookingData.staffId,
                status: 'pending',
                startTime: startDateTime,
                endTime: endDateTime,
                notes: bookingData.notes,
                bookedBy: user ? 'user' : 'guest',
                guestName: bookingData.patientName,
                guestEmail: bookingData.patientEmail,
                guestContact: bookingData.patientPhone,
                menuItemId: bookingData.menuId
            });
            handleNext(); // Move to confirmation
        } catch (error) {
            console.error("Booking failed", error);
            alert("予約の送信に失敗しました。時間をおいて再試行してください。");
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep4_PatientInfo = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">お客様情報を入力してください</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">お名前 <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        value={bookingData.patientName}
                        onChange={e => updateData('patientName', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder="山田 太郎"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">電話番号 <span className="text-red-500">*</span></label>
                    <input
                        type="tel"
                        required
                        value={bookingData.patientPhone}
                        onChange={e => updateData('patientPhone', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder="090-1234-5678"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
                    <input
                        type="email"
                        value={bookingData.patientEmail}
                        onChange={e => updateData('patientEmail', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        placeholder="example@email.com (任意)"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ご要望・メモ</label>
                    <textarea
                        value={bookingData.notes}
                        onChange={e => updateData('notes', e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="痛みの症状や、ご希望などがあればご記入ください"
                    />
                </div>
            </div>
            <button
                onClick={submitBooking}
                disabled={submitting || !bookingData.patientName || !bookingData.patientPhone}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-8 flex items-center justify-center"
            >
                {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : '予約を確定する'}
            </button>
        </div>
    );

    const renderStep5_Confirmation = () => (
        <div className="text-center py-12 animate-fade-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <Check className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">予約が完了しました</h2>
            <p className="text-gray-600 mb-8">
                ご予約ありがとうございます。<br />
                当日はお気をつけてお越しください。
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto mb-8 text-left">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">日時</span>
                        <span className="font-bold text-gray-800">{bookingData.date} {bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">メニュー</span>
                        <span className="font-bold text-gray-800">{clinic?.menuItems?.find(m => m.id === bookingData.menuId)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">担当</span>
                        <span className="font-bold text-gray-800">
                            {bookingData.staffId === null ? '指名なし' : clinic?.staffInfo?.find(s => s.id === bookingData.staffId)?.name}
                        </span>
                    </div>
                </div>
            </div>

            <Link to={`/clinic/${clinicId}`} className="inline-block px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all">
                クリニックページへ戻る
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {step > 1 && step <= totalSteps && (
                            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                        )}
                        <h1 className="font-bold text-gray-800">Web予約</h1>
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                        Step {Math.min(step, totalSteps)} / {totalSteps}
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
                    />
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-8">
                {step === 1 && renderStep1_Menu()}
                {step === 2 && renderStep2_Staff()}
                {step === 3 && renderStep3_DateTime()}
                {step === 4 && renderStep4_PatientInfo()}
                {step === 5 && renderStep5_Confirmation()}
            </main>
        </div>
    );
};

export default BookingWizard;
