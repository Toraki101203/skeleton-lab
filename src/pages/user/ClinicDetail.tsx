import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Clinic } from '../../types';
import { getClinic, createBooking } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Templates
import ClinicTemplateStandard from '../../components/templates/ClinicTemplateStandard';
import ClinicTemplateWarm from '../../components/templates/ClinicTemplateWarm';
import ClinicTemplateModern from '../../components/templates/ClinicTemplateModern';

const ClinicDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchClinic = async () => {
            if (!id) return;
            try {
                const data = await getClinic(id);
                setClinic(data);

                // Increment PV
                await supabase.rpc('increment_clinic_pv', { p_clinic_id: id });
            } catch (error) {
                console.error("Failed to fetch clinic", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, [id]);

    if (loading) {
        return <div className="p-10 text-center">読み込み中...</div>;
    }

    if (!clinic) {
        return <div className="p-10 text-center">クリニックが見つかりませんでした</div>;
    }

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('予約するにはログインが必要です');
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
            await createBooking({
                userId: user.uid,
                clinicId: clinic.id,
                staffId: clinic.staffIds[0] || '', // Default to first staff
                startTime: bookingDateTime,
                endTime: new Date(bookingDateTime.getTime() + 60 * 60 * 1000), // +1 hour
                status: 'pending',
                notes: ''
            });
            alert('予約リクエストを送信しました！');
            setShowBookingModal(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to create booking", error);
            alert('予約リクエストの送信に失敗しました。もう一度お試しください。');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBookingClick = () => {
        setShowBookingModal(true);
    };

    const renderTemplate = () => {
        switch (clinic.templateId) {
            case 'warm':
                return <ClinicTemplateWarm clinic={clinic} onBooking={handleBookingClick} />;
            case 'modern':
                return <ClinicTemplateModern clinic={clinic} onBooking={handleBookingClick} />;
            case 'standard':
            default:
                return <ClinicTemplateStandard clinic={clinic} onBooking={handleBookingClick} />;
        }
    };

    return (
        <>
            {renderTemplate()}

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4">予約リクエスト</h3>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">希望時間</label>
                                <input
                                    type="time"
                                    required
                                    value={bookingTime}
                                    onChange={(e) => setBookingTime(e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-600"
                                    disabled={submitting}
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-accent text-white rounded-lg font-bold shadow disabled:opacity-50"
                                >
                                    {submitting ? '送信中...' : 'リクエスト送信'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClinicDetail;
