import { MapPin, ArrowRight } from 'lucide-react';
import type { Clinic } from '../../types';

interface Props {
    clinic: Clinic;
    onBooking: () => void;
}

const DAY_MAP: Record<string, string> = {
    mon: 'MON', tue: 'TUE', wed: 'WED', thu: 'THU', fri: 'FRI', sat: 'SAT', sun: 'SUN'
};

const ClinicTemplateModern: React.FC<Props> = ({ clinic, onBooking }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white pb-24 font-sans">
            {/* Hero Image */}
            <div className="h-[50vh] w-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10" />
                <img
                    src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                    alt={clinic.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full max-w-2xl mx-auto">
                    <div className="inline-block px-3 py-1 border border-slate-500 rounded-full text-xs tracking-widest mb-4 text-slate-300">
                        CLINIC
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 leading-tight">{clinic.name}</h1>
                    <div className="flex items-center text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 mr-2" /> {clinic.location.address}
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 space-y-12 mt-8">
                {/* Description */}
                <section>
                    <h2 className="text-xs font-bold text-slate-500 tracking-widest mb-4 uppercase">About Us</h2>
                    <p className="text-slate-300 leading-loose text-lg font-light whitespace-pre-wrap border-l-2 border-slate-700 pl-6">
                        {clinic.description}
                    </p>
                </section>

                {/* Menu */}
                {clinic.menuItems && clinic.menuItems.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-slate-500 tracking-widest mb-6 uppercase">Menu</h2>
                        <div className="space-y-1">
                            {clinic.menuItems.map((item, index) => (
                                <div key={index} className="group flex justify-between items-center py-4 border-b border-slate-800 hover:bg-slate-800/50 px-4 -mx-4 transition-colors cursor-default">
                                    <div>
                                        <div className="font-bold text-lg tracking-wide group-hover:text-blue-400 transition-colors">{item.name}</div>
                                        {item.description && <div className="text-xs text-slate-500 mt-1">{item.description}</div>}
                                    </div>
                                    <div className="font-mono text-xl text-slate-400">
                                        ¥{item.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Clinic Images */}
                {clinic.images && clinic.images.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-slate-500 tracking-widest mb-6 uppercase">Gallery</h2>
                        <div className="grid grid-cols-2 gap-1">
                            {clinic.images.map((img, i) => (
                                <img key={i} src={img} alt="Clinic" className="w-full h-32 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Staff Marquee */}
                {clinic.staffInfo && clinic.staffInfo.length > 0 && (
                    <section className="overflow-hidden">
                        <h2 className="text-xs font-bold text-slate-500 tracking-widest mb-6 uppercase">Staff</h2>
                        <div className="relative w-full h-32 bg-slate-800/50 overflow-hidden flex items-center border-y border-slate-800">
                            <div className="animate-marquee whitespace-nowrap flex gap-12 absolute">
                                {clinic.staffInfo.map((staff, i) => (
                                    <div key={i} className="inline-flex flex-col items-center w-24 shrink-0">
                                        <div className="w-16 h-16 rounded-none overflow-hidden border border-slate-600 mb-2 grayscale hover:grayscale-0 transition-all">
                                            <img src={staff.imageUrl || 'https://via.placeholder.com/150'} alt={staff.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-sm font-bold text-slate-300">{staff.name}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">{staff.role}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Business Hours */}
                <section>
                    <h2 className="text-xs font-bold text-slate-500 tracking-widest mb-6 uppercase">Opening Hours</h2>
                    <div className="grid grid-cols-1 gap-1">
                        {Object.entries(clinic.businessHours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between items-center py-3 border-b border-slate-800">
                                <span className="font-bold text-slate-500 w-12 text-xs tracking-wider">{DAY_MAP[day]}</span>
                                <span className={`font-mono ${hours.isClosed ? 'text-slate-600' : 'text-white'}`}>
                                    {hours.isClosed ? 'CLOSED' : `${hours.start} - ${hours.end}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sticky Booking Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={onBooking}
                        className="w-full py-4 bg-white text-slate-900 font-black tracking-widest rounded-none hover:bg-slate-200 transition-colors flex items-center justify-center uppercase"
                    >
                        Book Appointment
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClinicTemplateModern;
