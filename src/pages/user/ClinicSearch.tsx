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
    const [filterOpenNow, setFilterOpenNow] = useState(false);
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

        // Sort by Distance if User Location is available
        if (userLocation) {
            result.sort((a, b) => {
                const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
                const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
                return distA - distB;
            });
        }

        setFilteredClinics(result);
    }, [searchTerm, selectedPrefecture, filterOpenNow, userLocation, clinics]);

    return (
        <PageLayout>
            {/* Header / Search Bar */}
            <div className="bg-white shadow-sm rounded-xl p-4 max-w-2xl mx-auto space-y-3 mb-8 text-gray-800">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="クリニック名・キーワード検索"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                        />
                    </div>
                    <select
                        value={selectedPrefecture}
                        onChange={(e) => setSelectedPrefecture(e.target.value)}
                        className="px-4 py-3 border rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">都道府県</option>
                        {PREFECTURES.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    <button
                        onClick={handleCurrentLocation}
                        className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap flex items-center ${userLocation
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        {userLocation ? '現在地周辺' : '現在地から探す'}
                    </button>

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
                        営業中のみ
                    </label>
                </div>
            </div>

            {/* Results List */}
            <div className="max-w-2xl mx-auto space-y-4 text-gray-800">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">読み込み中...</div>
                ) : filteredClinics.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        条件に一致するクリニックが見つかりませんでした。
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
                                {userLocation && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                        {calculateDistance(userLocation.lat, userLocation.lng, clinic.location.lat, clinic.location.lng).toFixed(1)} km
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{clinic.name}</h3>
                                <p className="text-sm text-gray-500 mb-3 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" /> {clinic.location.address}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md">整骨</span>
                                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-md">マッサージ</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {clinic.businessHours.mon.start} - {clinic.businessHours.mon.end}
                                    </span>
                                    <span className="text-accent font-medium text-sm">詳細を見る</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </PageLayout>
    );
};

export default ClinicSearch;
