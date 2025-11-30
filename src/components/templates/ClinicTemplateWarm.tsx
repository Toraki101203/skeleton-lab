import { MapPin, Calendar, Heart } from 'lucide-react';
import type { Clinic } from '../../types';

interface Props {
    clinic: Clinic;
    onBooking: () => void;
}

const DAY_MAP: Record<string, string> = {
    mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日'
};

const ClinicTemplateWarm: React.FC<Props> = ({ clinic, onBooking }) => {
    return (
        <div className="min-h-screen bg-[#FFFBF5] pb-24 font-sans">
            {/* Hero Image */}
            <div className="h-72 w-full relative">
                <img
                    src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                    alt={clinic.name}
                    className="w-full h-full object-cover rounded-b-[3rem] shadow-md"
                />
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border border-orange-100">
                        <h1 className="text-xl font-bold text-gray-800">{clinic.name}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 pt-12">
                <div className="flex justify-center items-center text-gray-500 text-sm mb-8">
                    <MapPin className="w-4 h-4 mr-1 text-orange-400" /> {clinic.location.address}
                </div>

                <div className="space-y-8">
                    {/* Description */}
                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                        <div className="flex items-center mb-4">
                            <Heart className="w-5 h-5 text-orange-400 mr-2" />
                            <h2 className="font-bold text-gray-800">当院の想い</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{clinic.description}</p>
                    </section>

                    {/* Menu */}
                    {clinic.menuItems && clinic.menuItems.length > 0 && (
                        <section>
                            <h2 className="font-bold text-gray-800 mb-4 text-center text-orange-800">メニュー</h2>
                            <div className="grid gap-4">
                                {clinic.menuItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-orange-50 hover:border-orange-200 transition-colors">
                                        <div>
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
                                        </div>
                                        <div className="font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                                            ¥{item.price.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Clinic Images */}
                    {clinic.images && clinic.images.length > 0 && (
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                            <h2 className="font-bold text-gray-800 mb-4 text-center text-orange-800">院内風景</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {clinic.images.map((img, i) => (
                                    <img key={i} src={img} alt="Clinic" className="w-full h-32 object-cover rounded-2xl" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Staff Marquee */}
                    {clinic.staffInfo && clinic.staffInfo.length > 0 && (
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 overflow-hidden">
                            <h2 className="font-bold text-gray-800 mb-4 text-center text-orange-800">スタッフ紹介</h2>
                            <div className="relative w-full h-32 overflow-hidden flex items-center">
                                <div className="animate-marquee whitespace-nowrap flex gap-8 absolute">
                                    {clinic.staffInfo.map((staff, i) => (
                                        <div key={i} className="inline-flex flex-col items-center w-24 shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm mb-2">
                                                <img src={staff.imageUrl || 'https://via.placeholder.com/150'} alt={staff.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-sm font-bold text-gray-800">{staff.name}</div>
                                            <div className="text-xs text-orange-400">{staff.role}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Business Hours */}
                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                        <h2 className="font-bold text-gray-800 mb-4 text-center">診療時間</h2>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between items-center py-2 border-b border-orange-50 last:border-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${day === 'sun' ? 'bg-red-100 text-red-500' :
                                        day === 'sat' ? 'bg-blue-100 text-blue-500' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                        {DAY_MAP[day]}
                                    </div>
                                    <span className="text-gray-700 font-medium tracking-widest">
                                        {hours.isClosed ? 'CLOSE' : `${hours.start} - ${hours.end}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Sticky Booking Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-orange-100">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={onBooking}
                        className="w-full py-4 bg-orange-400 text-white font-bold rounded-full shadow-lg shadow-orange-200 hover:bg-orange-500 transition-all transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        <Calendar className="w-5 h-5 mr-2" />
                        予約する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClinicTemplateWarm;
