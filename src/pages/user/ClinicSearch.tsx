import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import type { Clinic } from '../../types';
import { isWithinInterval, parse, getDay } from 'date-fns';
import { getAllClinics } from '../../services/firestore';

const ClinicSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const data = await getAllClinics();
                setClinics(data);
                setFilteredClinics(data);
            } catch (error) {
                console.error("Failed to fetch clinics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClinics();
    }, []);

    useEffect(() => {
        let result = clinics;

        // Filter by Search Term (Name or Address)
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.location.address.toLowerCase().includes(lower)
            );
        }

        // Filter by Open Now
        if (filterOpenNow) {
            const now = new Date();
            const dayIndex = getDay(now); // 0 = Sun, 1 = Mon...
            const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const currentDayKey = daysMap[dayIndex] as keyof Clinic['businessHours'];

            result = result.filter(c => {
                const todayHours = c.businessHours[currentDayKey];
                if (todayHours.isClosed) return false;

                const start = parse(todayHours.start, 'HH:mm', now);
                const end = parse(todayHours.end, 'HH:mm', now);

                return isWithinInterval(now, { start, end });
            });
        }

        setFilteredClinics(result);
    }, [searchTerm, filterOpenNow, clinics]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Search Bar */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="p-4 max-w-2xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search clinics by name or area..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                        />
                    </div>

                    <div className="mt-3 flex items-center space-x-4 overflow-x-auto pb-2">
                        <label className={`flex items-center px-4 py-2 rounded-full border cursor-pointer transition-colors whitespace-nowrap ${filterOpenNow
                            ? 'bg-green-50 border-accent text-accent font-medium'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}>
                            <input
                                type="checkbox"
                                checked={filterOpenNow}
                                onChange={(e) => setFilterOpenNow(e.target.checked)}
                                className="hidden"
                            />
                            <Clock className="w-4 h-4 mr-2" />
                            Open Now
                        </label>

                        {/* Placeholder for other filters */}
                        <button className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 whitespace-nowrap">
                            <MapPin className="w-4 h-4 mr-2 inline" />
                            Near Me
                        </button>
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="p-4 max-w-2xl mx-auto space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading clinics...</div>
                ) : filteredClinics.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No clinics found matching your criteria.
                    </div>
                ) : (
                    filteredClinics.map(clinic => (
                        <Link to={`/clinic/${clinic.id}`} key={clinic.id} className="block bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-40">
                                <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold shadow flex items-center">
                                    <Star className="w-3 h-3 text-yellow-400 mr-1 fill-current" />
                                    4.8
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{clinic.name}</h3>
                                <p className="text-sm text-gray-500 mb-3 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" /> {clinic.location.address}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">Osteopathy</span>
                                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-md">Massage</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {clinic.businessHours.mon.start} - {clinic.businessHours.mon.end}
                                    </span>
                                    <span className="text-accent font-medium text-sm">View Details</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClinicSearch;
