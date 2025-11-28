import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import type { Clinic } from '../../types';

// Mock Data for Recommendations
const MOCK_RECOMMENDATIONS: Clinic[] = [
    {
        id: 'c1',
        ownerUid: 'owner1',
        name: 'Skeleton Clinic Tokyo',
        description: 'Specialized in e-sports injuries and posture correction.',
        images: ['https://placehold.co/600x400/869ABE/white?text=Clinic+Tokyo'],
        businessHours: {
            mon: { start: '09:00', end: '20:00', isClosed: false },
            tue: { start: '09:00', end: '20:00', isClosed: false },
            wed: { start: '09:00', end: '20:00', isClosed: false },
            thu: { start: '09:00', end: '20:00', isClosed: false },
            fri: { start: '09:00', end: '20:00', isClosed: false },
            sat: { start: '10:00', end: '18:00', isClosed: false },
            sun: { start: '00:00', end: '00:00', isClosed: true },
        },
        location: { lat: 35.6895, lng: 139.6917, address: 'Shinjuku, Tokyo' },
        staffIds: ['s1']
    }
];

const DiagnosisResult = () => {
    const location = useLocation();
    const [diagnosisData, setDiagnosisData] = useState<any>(null);

    useEffect(() => {
        // In a real app, we might fetch the result ID from the URL
        // For now, we'll try to read from location state or local storage (if persisted before clear)
        // But since Wizard clears it, we rely on location state passed via navigate
        if (location.state) {
            setDiagnosisData(location.state);
        }
    }, [location]);

    if (!diagnosisData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">No diagnosis result found.</p>
                <Link to="/diagnosis" className="text-primary hover:underline">Start Diagnosis</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-primary text-white p-8 rounded-b-3xl shadow-lg">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Diagnosis Complete</h1>
                    <p className="text-blue-100">Based on your symptoms, here is our recommendation.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-4">Your Symptoms</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 block">Body Part</span>
                            <span className="font-bold text-gray-800">{diagnosisData.bodyPart}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 block">Duration</span>
                            <span className="font-bold text-gray-800">{diagnosisData.duration}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-400 block">Symptoms</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {diagnosisData.symptoms.map((s: string) => (
                                    <span key={s} className="px-2 py-1 bg-white border rounded text-sm text-gray-600">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Recommended Clinics</h2>
                <div className="space-y-4">
                    {MOCK_RECOMMENDATIONS.map(clinic => (
                        <Link to={`/clinic/${clinic.id}`} key={clinic.id} className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex">
                                <div className="w-1/3 bg-gray-200">
                                    <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-2/3 p-4">
                                    <h3 className="font-bold text-gray-800 mb-1">{clinic.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> {clinic.location.address}
                                    </p>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{clinic.description}</p>
                                    <div className="flex items-center text-accent font-bold text-sm">
                                        Book Now <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link to="/search" className="text-gray-500 hover:text-primary text-sm">
                        View all clinics
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisResult;
