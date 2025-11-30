import { MapPin, Calendar } from 'lucide-react';
import type { Clinic } from '../../types';

interface Props {
    clinic: Clinic;
    onBooking: () => void;
}

const DAY_MAP: Record<string, string> = {
    mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日'
};

const ClinicTemplateStandard: React.FC<Props> = ({ clinic, onBooking }) => {
    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Hero Image */}
            <div className="h-64 w-full bg-gray-200 relative">
                <img
                    src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-6 max-w-2xl mx-auto -mt-6 relative bg-white rounded-t-3xl border-t border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{clinic.name}</h1>
                <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-1" /> {clinic.location.address}
                </div>

                <div className="space-y-8">
                    {/* Description */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">当院について</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{clinic.description}</p>
                    </section>

                    {/* Menu */}
                    {clinic.menuItems && clinic.menuItems.length > 0 && (
                        <section>
                            <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">メニュー・料金</h2>
                            <div className="space-y-3">
                                {clinic.menuItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-bold text-gray-800">{item.name}</div>
                                            {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
                                        </div>
                                        <div className="font-bold text-primary">¥{item.price.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Clinic Images */}
                    {clinic.images && clinic.images.length > 0 && (
                        <section>
                            <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">院内風景</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {clinic.images.map((img, i) => (
                                    <img key={i} src={img} alt="Clinic" className="w-full h-32 object-cover rounded-lg" />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Staff Marquee */}
                    {clinic.staffInfo && clinic.staffInfo.length > 0 && (
                        <section className="overflow-hidden">
                            <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">スタッフ紹介</h2>
                            <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center">
                                <div className="animate-marquee whitespace-nowrap flex gap-8 absolute">
                                    {clinic.staffInfo.map((staff, i) => (
                                        <div key={i} className="inline-flex flex-col items-center w-24 shrink-0">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm mb-2">
                                                <img src={staff.imageUrl || 'https://via.placeholder.com/150'} alt={staff.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-sm font-bold text-gray-800">{staff.name}</div>
                                            <div className="text-xs text-gray-500">{staff.role}</div>
                                        </div>
                                    ))}
                                    {/* Duplicate for seamless loop if needed, but simple marquee is fine for now */}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Business Hours */}
                    <section>
                        <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">診療時間</h2>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                            {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between">
                                    <span className="font-medium text-gray-500 w-12">{DAY_MAP[day] || day}</span>
                                    <span className="text-gray-700">
                                        {hours.isClosed ? '休診' : `${hours.start} - ${hours.end}`}
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
                        onClick={onBooking}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <Calendar className="w-5 h-5 mr-2" />
                        予約をリクエストする
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClinicTemplateStandard;
