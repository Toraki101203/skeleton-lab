import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, Instagram, Twitter, Facebook, Menu, X } from 'lucide-react';
import type { Clinic } from '../../types';
import Footer from '../Footer';

interface Props {
    clinic: Clinic;
    onBooking: () => void;
}

const DAY_MAP: Record<string, string> = {
    mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日'
};

const MENU_ITEMS = [
    { id: 'about', label: '当院について' },
    { id: 'news', label: 'お知らせ' },
    { id: 'menu', label: 'メニュー' },
    { id: 'staff', label: 'スタッフ紹介' },
    { id: 'access', label: 'アクセス' },
];

const ClinicTemplateStandard: React.FC<Props> = ({ clinic, onBooking }) => {
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
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Navigation Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                    <div className={`font-bold text-xl tracking-tight transition-colors ${isScrolled ? 'text-gray-800' : 'text-white drop-shadow-md'}`}>
                        {clinic.name}
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`text-sm font-medium tracking-wide transition-colors hover:text-blue-500 ${isScrolled ? 'text-gray-600' : 'text-white/90 hover:text-white'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={onBooking}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg ${isScrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                        >
                            予約する
                        </button>
                    </nav>
                    <button
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                        ) : (
                            <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-800' : 'text-white'}`} />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {
                mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden animate-fade-in">
                        <div className="flex flex-col space-y-6 text-center">
                            {MENU_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="text-xl font-medium text-gray-800 tracking-wider"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    onBooking();
                                }}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                            >
                                予約する
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Hero Section */}
            <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000'}
                        alt={clinic.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-white/10" />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                        {clinic.name}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                        {clinic.description ? clinic.description.split('\n')[0] : 'あなたの健康と美しさをサポートします'}
                    </p>
                    <button
                        onClick={onBooking}
                        className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-xl hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                    >
                        Web予約はこちら
                    </button>
                </div>
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/80">
                    <div className="flex flex-col items-center">
                        <span className="text-xs mb-2 uppercase tracking-widest">Scroll</span>
                        <div className="w-px h-12 bg-white/50"></div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">About Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">当院について</h2>
                        <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <p className="text-gray-600 leading-loose text-lg whitespace-pre-wrap">
                                {clinic.description}
                            </p>
                            <div className="flex items-center text-gray-500 font-medium">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                {clinic.location.address}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={clinic.images && clinic.images.length > 1 ? clinic.images[1] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'}
                                    alt="About Clinic"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-blue-50 p-6 rounded-xl -z-10 w-full h-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            {clinic.newsItems && clinic.newsItems.length > 0 && (
                <section id="news" className="py-24 px-4 sm:px-6 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">News</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">お知らせ</h2>
                            <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
                        </div>
                        <div className="space-y-4">
                            {clinic.newsItems.map((news, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="text-gray-500 font-mono text-sm whitespace-nowrap">{news.date.split('T')[0]}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 mb-1">{news.title}</h3>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{news.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Menu Section */}
            {
                clinic.menuItems && clinic.menuItems.length > 0 && (
                    <section id="menu" className="py-24 px-4 sm:px-6 bg-white">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Menu</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">メニュー・料金</h2>
                                <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
                            </div>

                            <div className="space-y-12">
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

                                    // Add any categories found in items but not in the list (e.g. 'その他')
                                    const allCategories = [...new Set([...categories, ...Object.keys(itemsByCategory)])];

                                    return allCategories.map(category => {
                                        const items = itemsByCategory[category];
                                        if (!items || items.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h3 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4 flex items-center">
                                                    {category}
                                                </h3>
                                                <div className="grid gap-4">
                                                    {items.map((item, index) => (
                                                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex justify-between items-center group">
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                                                {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                                                                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                                                    {item.duration > 0 && <span>施術: {item.duration}分</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-xl font-bold text-blue-600 whitespace-nowrap ml-4">
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
                    <section id="staff" className="py-24 px-4 sm:px-6 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Staff</span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">スタッフ紹介</h2>
                                <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                {clinic.staffInfo.map((staff, i) => (
                                    <div key={i} className="group text-center">
                                        <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-gray-50 group-hover:border-blue-50 transition-colors">
                                            <img
                                                src={staff.imageUrl || 'https://via.placeholder.com/150'}
                                                alt={staff.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{staff.name}</h3>
                                        <p className="text-blue-600 text-sm font-medium uppercase tracking-wide mt-1">{staff.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Access & Info Section */}
            <section id="access" className="py-24 px-4 sm:px-6 bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
                    <div>
                        <div className="mb-10">
                            <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Access</span>
                            <h2 className="text-3xl md:text-4xl font-bold mt-2">アクセス・診療時間</h2>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-300 mb-2 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-blue-400" /> 住所
                                </h3>
                                <p className="text-xl font-medium">{clinic.location.address}</p>

                                {/* SNS Links */}
                                {(clinic.socialLinks?.instagram || clinic.socialLinks?.twitter || clinic.socialLinks?.facebook) && (
                                    <div className="flex space-x-4 mt-4">
                                        {clinic.socialLinks?.instagram && <a href={clinic.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>}
                                        {clinic.socialLinks?.twitter && <a href={clinic.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>}
                                        {clinic.socialLinks?.facebook && <a href={clinic.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-blue-400" /> 診療時間
                                </h3>
                                <div className="bg-gray-800 p-6 rounded-xl">
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between items-center text-sm border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                                                <span className="font-bold text-gray-400 w-12">{DAY_MAP[day]}</span>
                                                <span className={hours.isClosed ? 'text-gray-500' : 'text-white'}>
                                                    {hours.isClosed ? '休診' : `${hours.start} - ${hours.end}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-full min-h-[300px] bg-gray-800 rounded-2xl overflow-hidden relative">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '300px' }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.location.address)}&t=&z=15&ie=UTF8&output=embed`}
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="bg-gray-900">
                <Footer />
            </div>

            {/* Sticky Booking Button (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <button
                    onClick={onBooking}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                >
                    <Calendar className="w-5 h-5 mr-2" />
                    予約する
                </button>
            </div>
        </div>
    );
};

export default ClinicTemplateStandard;
