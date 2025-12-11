import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Navigation } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import { useClinicSearch } from '../../hooks/useClinicSearch';

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
    const {
        searchTerm, setSearchTerm,
        selectedPrefecture, setSelectedPrefecture,
        selectedCity, setSelectedCity,
        cities,
        filterOpenNow, setFilterOpenNow,
        searchRadius, setSearchRadius,
        userLocation,
        handleCurrentLocation,
        filteredClinics,
        loading,
        calculateDistance
    } = useClinicSearch();

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

                            {selectedPrefecture && (
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled={cities.length === 0}
                                    className="px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-primary bg-white text-gray-800 font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">{cities.length > 0 ? "市区町村" : "読み込み中..."}</option>
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


                            return (
                                <Link to={`/clinic/${clinic.id}`} key={clinic.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                                    {/* Image Section */}
                                    <div className="relative aspect-video overflow-hidden">
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
