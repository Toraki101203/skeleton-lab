import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star, Navigation } from 'lucide-react';
import type { Clinic } from '../../types';
import { isWithinInterval, parse, getDay } from 'date-fns';
import { getAllClinics } from '../../services/db';
import PageLayout from '../../components/PageLayout';

const PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const ClinicSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPrefecture, setSelectedPrefecture] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [filterOpenNow, setFilterOpenNow] = useState(false);
    const [searchRadius, setSearchRadius] = useState(15); // Default 15km
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

    // Fetch cities when prefecture changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedPrefecture) {
                setCities([]);
                setSelectedCity('');
                return;
            }
            try {
                const response = await fetch(`https://geolonia.github.io/japanese-addresses/api/ja/${selectedPrefecture}.json`);
                const data = await response.json();
                setCities(data);
                setSelectedCity(''); // Reset city when prefecture changes
            } catch (error) {
                console.error("Failed to fetch cities", error);
                setCities([]);
            }
        };
        fetchCities();
    }, [selectedPrefecture]);

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("お使いのブラウザは位置情報をサポートしていません");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                // Auto-sort by distance will happen in useEffect
            },
            () => {
                alert("位置情報を取得できませんでした");
            }
        );
    };

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLng = deg2rad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    useEffect(() => {
        let result = [...clinics];

        // Filter by Search Term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.location.address.toLowerCase().includes(lower)
            );
        }

        // Filter by Prefecture
        if (selectedPrefecture) {
            result = result.filter(c => c.location.address.includes(selectedPrefecture));
        }

        // Filter by City
        if (selectedCity) {
            result = result.filter(c => c.location.address.includes(selectedCity));
        }

        // Filter by Open Now
        if (filterOpenNow) {
            const now = new Date();
            const dayIndex = getDay(now);
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

        // Sort by Distance and Filter by Radius if User Location is available
        if (userLocation) {
            // First calculate distance for all
            const clinicsWithDist = result.map(c => ({
                ...c,
                distance: calculateDistance(userLocation.lat, userLocation.lng, c.location.lat, c.location.lng)
            }));

            // Filter by Radius
            const withinRadius = clinicsWithDist.filter(c => c.distance <= searchRadius);

            // Sort by Distance
            withinRadius.sort((a, b) => a.distance - b.distance);

            // Map back to Clinic type (discarding temporary distance property if needed, but we used local var)
            result = withinRadius.map(c => {
                const { distance, ...rest } = c;
                return rest;
            });
        }

        setFilteredClinics(result);
    }, [searchTerm, selectedPrefecture, selectedCity, filterOpenNow, userLocation, clinics, searchRadius]); // Added selectedCity dependency

    return (
        <PageLayout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header / Search Bar */}
                <div className="bg-white/80 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/20 relative z-30">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input - Expands to fill available space */}
                        <div className="relative flex-1 group min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="クリニック名・キーワードで検索"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/50 hover:bg-white focus:bg-white text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        {/* Controls Group - Keeps buttons together */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <select
                                value={selectedPrefecture}
                                onChange={(e) => setSelectedPrefecture(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-primary bg-white text-gray-800 font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <option value="">都道府県</option>
                                {PREFECTURES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>

                            {selectedPrefecture && cities.length > 0 && (
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-primary bg-white text-gray-800 font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-left-2 duration-300"
                                >
                                    <option value="">市区町村</option>
                                    {cities.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            )}

                            <button
                                onClick={handleCurrentLocation}
                                className={`px-4 py-3 rounded-xl border-2 font-bold transition-all flex items-center shadow-sm active:scale-95 whitespace-nowrap ${userLocation
                                    ? 'bg-blue-50 border-primary text-primary'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <Navigation className={`w-4 h-4 mr-2 ${userLocation ? 'animate-pulse' : ''}`} />
                                {userLocation ? '周辺表示中' : '現在地'}
                            </button>

                            {userLocation && (
                                <div className="flex bg-white rounded-xl border-2 border-primary overflow-hidden shadow-sm h-[50px] items-center">
                                    {[5, 10, 15].map(radius => (
                                        <button
                                            key={radius}
                                            onClick={() => setSearchRadius(radius)}
                                            className={`px-3 py-3 text-sm font-bold transition-colors h-full flex items-center ${searchRadius === radius
                                                ? 'bg-primary text-white'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {radius}km
                                        </button>
                                    ))}
                                </div>
                            )}

                            <label className={`flex items-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all font-bold select-none whitespace-nowrap ${filterOpenNow
                                ? 'bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}>
                                <input
                                    type="checkbox"
                                    checked={filterOpenNow}
                                    onChange={(e) => setFilterOpenNow(e.target.checked)}
                                    className="hidden"
                                />
                                <Clock className="w-4 h-4 mr-2" />
                                営業中
                            </label>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl h-96 animate-pulse bg-gray-100"></div>
                        ))}
                    </div>
                ) : filteredClinics.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <div className="text-gray-400 mb-4">
                            <Search className="w-16 h-16 mx-auto opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">条件に一致するクリニックが見つかりませんでした</h3>
                        <p className="text-gray-500">検索条件を変更して再度お試しください</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredClinics.map(clinic => {
                            const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, clinic.location.lat, clinic.location.lng) : null;
                            const rating = 4.8; // Mock rating
                            const reviewCount = 120; // Mock reviews

                            return (
                                <Link to={`/clinic/${clinic.id}`} key={clinic.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                                    {/* Image Section */}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opactiy-60" />
                                        <img
                                            src={clinic.images[0] || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'}
                                            alt={clinic.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Floating Badges */}
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            {distance && (
                                                <div className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                                                    <Navigation className="w-3 h-3 text-blue-500" />
                                                    {distance.toFixed(1)} km
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span>{rating}</span>
                                                <span className="text-gray-400 font-normal">({reviewCount})</span>
                                            </div>
                                        </div>

                                        {/* Open Stauts Badge */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                営業中
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {clinic.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 flex items-start gap-1 line-clamp-1">
                                            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                            {clinic.location.address}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {clinic.menuCategories?.slice(0, 3).map((cat, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">
                                                    {cat}
                                                </span>
                                            ))}
                                            {(!clinic.menuCategories || clinic.menuCategories.length === 0) && (
                                                <span className="text-xs text-gray-400">タグなし</span>
                                            )}
                                            {clinic.menuCategories && clinic.menuCategories.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md">+{clinic.menuCategories.length - 3}</span>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <div className="text-xs text-gray-500">
                                                <span className="block font-bold text-gray-800 mb-0.5">診療時間</span>
                                                {clinic.businessHours.mon.start} - {clinic.businessHours.mon.end}
                                            </div>
                                            <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Navigation className="w-4 h-4 rotate-45" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ClinicSearch;
