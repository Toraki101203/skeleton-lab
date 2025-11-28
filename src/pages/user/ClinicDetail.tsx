import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import type { Clinic } from '../../types';
import { getClinic, createBooking } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';

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
            } catch (error) {
                console.error("Failed to fetch clinic", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinic();
    }, [id]);

    if (loading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    if (!clinic) {
        return <div className="p-10 text-center">Clinic not found</div>;
    }

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to make a booking');
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
            alert('Booking request sent successfully!');
            setShowBookingModal(false);
            navigate('/');
        } catch (error) {
            console.error("Failed to create booking", error);
            alert('Failed to send booking request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Hero Image */}
            <div className="h-64 w-full bg-gray-200 relative">
                <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                >
                    ← Back
                </button>
            </div>

            <div className="p-6 max-w-2xl mx-auto -mt-6 relative bg-white rounded-t-3xl border-t border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{clinic.name}</h1>
                <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-1" /> {clinic.location.address}
                </div>

                <div className="space-y-6">
                    <section>
                        <h2 className="font-bold text-gray-800 mb-2">About</h2>
                        <p className="text-gray-600 leading-relaxed">{clinic.description}</p>
                    </section>

                    <section>
                        <h2 className="font-bold text-gray-800 mb-2">Business Hours</h2>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                            {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                    <span className="uppercase font-medium text-gray-500 w-12">{day}</span>
                                    <span className="text-gray-700">
                                        {hours.isClosed ? 'Closed' : `${hours.start} - ${hours.end}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Sticky Booking Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => setShowBookingModal(true)}
                        className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-lg hover:bg-opacity-90 flex items-center justify-center"
                    >
                        <Calendar className="w-5 h-5 mr-2" />
                        Request Booking
                    </button>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up">
                        <h3 className="text-xl font-bold mb-4">Request Appointment</h3>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    className="w-full border rounded-lg p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
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
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-accent text-white rounded-lg font-bold shadow disabled:opacity-50"
                                >
                                    {submitting ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicDetail;
