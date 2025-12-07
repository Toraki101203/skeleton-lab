
import React, { useState, useEffect } from 'react';
import { MapPin, Instagram, Twitter, Facebook, Menu, X } from 'lucide-react';
import type { Clinic } from '../../types';
import Footer from '../Footer';

interface Props {
    clinic: Clinic;
    onBooking: () => void;
}

const DAY_MAP: Record<string, string> = {
    mon: 'MON', tue: 'TUE', wed: 'WED', thu: 'THU', fri: 'FRI', sat: 'SAT', sun: 'SUN'
};

const MENU_ITEMS = [
    { id: 'about', label: '当院について' },
    { id: 'menu', label: 'メニュー' },
    { id: 'staff', label: 'スタッフ紹介' },
    { id: 'access', label: 'アクセス' },
];

const ClinicTemplateModern: React.FC<Props> = ({ clinic, onBooking }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Navigation Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="font-black text-2xl tracking-tighter text-white">
                        {clinic.name}
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-10">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={onBooking}
                            className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all duration-300"
                        >
                            Book Now
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header >

            {/* Mobile Menu Overlay */}
            {
                mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col items-center justify-center space-y-8 md:hidden">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-2xl font-black uppercase tracking-widest text-white hover:text-blue-500 transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onBooking();
                            }}
                            className="px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest"
                        >
                            Book Now
                        </button>
                    </div>
                )
            }

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                        alt={clinic.name}
                        className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-block px-4 py-1 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-6 backdrop-blur-sm">
                        Premium Clinic
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
                        {clinic.name}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        {clinic.description ? clinic.description.split('\n')[0] : 'Experience the future of healthcare.'}
                    </p>
                    <button
                        onClick={onBooking}
                        className="group relative px-8 py-4 bg-transparent border border-white/30 text-white font-bold uppercase tracking-widest overflow-hidden transition-all hover:border-white"
                    >
                        <span className="relative z-10 group-hover:text-black transition-colors duration-300">Start Journey</span>
                        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Philosophy</h2>
                        <h3 className="text-4xl font-bold text-white mb-8 leading-tight">
                            Redefining<br />Healthcare Standards
                        </h3>
                        <p className="text-slate-400 leading-loose text-lg font-light whitespace-pre-wrap">
                            {clinic.description}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-20 blur-xl"></div>
                        <img
                            src={clinic.images && clinic.images.length > 1 ? clinic.images[1] : 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'}
                            alt="Interior"
                            className="relative w-full h-auto rounded-none border border-white/10 grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            {
                clinic.menuItems && clinic.menuItems.length > 0 && (
                    <section id="menu" className="py-32 px-6 bg-slate-900/50">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-20">
                                <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Services</h2>
                                <h3 className="text-4xl font-bold text-white">Menu & Pricing</h3>
                            </div>

                            <div className="space-y-20">
                                {(() => {
                                    // Group items by category
                                    const itemsByCategory = clinic.menuItems.reduce((acc, item) => {
                                        const cat = item.category || 'その他';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(item);
                                        return acc;
                                    }, {} as Record<string, typeof clinic.menuItems>);

                                    // Determine category order
                                    const categories = clinic.menuCategories && clinic.menuCategories.length > 0
                                        ? clinic.menuCategories
                                        : Object.keys(itemsByCategory);

                                    // Add any categories found in items but not in the list
                                    const allCategories = [...new Set([...categories, ...Object.keys(itemsByCategory)])];

                                    return allCategories.map(category => {
                                        const items = itemsByCategory[category];
                                        if (!items || items.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em] mb-8 border-b border-blue-500/30 pb-2 inline-block">
                                                    {category}
                                                </h4>
                                                <div className="space-y-1">
                                                    {items.map((item, index) => (
                                                        <div key={index} className="group flex justify-between items-center py-6 border-b border-white/5 hover:bg-white/5 px-6 -mx-6 transition-all cursor-default">
                                                            <div>
                                                                <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</div>
                                                                {item.description && <div className="text-sm text-slate-500 mt-2 font-light">{item.description}</div>}
                                                                <div className="flex gap-4 mt-2 text-xs text-slate-600 font-mono">
                                                                    {item.duration > 0 && <span>TIME: {item.duration} MIN</span>}
                                                                </div>
                                                            </div>
                                                            <div className="font-mono text-xl text-slate-300">
                                                                ¥{item.price.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Staff Section */}
            {
                clinic.staffInfo && clinic.staffInfo.length > 0 && (
                    <section id="staff" className="py-32 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-end mb-20">
                                <div>
                                    <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Specialists</h2>
                                    <h3 className="text-4xl font-bold text-white">Our Team</h3>
                                </div>
                                <div className="hidden md:block w-32 h-px bg-white/20"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {clinic.staffInfo.map((staff, i) => (
                                    <div key={i} className="group relative">
                                        <div className="aspect-[3/4] overflow-hidden bg-slate-900 mb-6">
                                            <img
                                                src={staff.imageUrl || 'https://via.placeholder.com/400x500'}
                                                alt={staff.name}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <h4 className="text-xl font-bold text-white mb-1">{staff.name}</h4>
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{staff.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Access Section */}
            <section id="access" className="py-32 px-6 bg-slate-900">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-4">Location</h2>
                            <h3 className="text-4xl font-bold text-white mb-8">Visit Us</h3>
                            <div className="flex items-start text-slate-300">
                                <MapPin className="w-6 h-6 mr-4 text-blue-500 shrink-0" />
                                <p className="text-xl font-light">{clinic.location.address}</p>
                            </div>

                            {/* SNS Links */}
                            {(clinic.socialLinks?.instagram || clinic.socialLinks?.twitter || clinic.socialLinks?.facebook) && (
                                <div className="flex space-x-6 mt-6 pl-10">
                                    {clinic.socialLinks?.instagram && <a href={clinic.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
                                    {clinic.socialLinks?.twitter && <a href={clinic.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
                                    {clinic.socialLinks?.facebook && <a href={clinic.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.3em] mb-6">Hours</h2>
                            <div className="space-y-4">
                                {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                    <div key={day} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-sm font-bold text-slate-500 w-16 uppercase tracking-wider">{DAY_MAP[day]}</span>
                                        <span className={`font-mono ${hours.isClosed ? 'text-slate-600' : 'text-white'}`}>
                                            {hours.isClosed ? 'CLOSED' : `${hours.start} - ${hours.end}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 h-full min-h-[400px] relative flex items-center justify-center border border-white/5 overflow-hidden">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '400px' }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.location.address)}&t=&z=15&ie=UTF8&output=embed`}
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div >
    );
};

export default ClinicTemplateModern;
