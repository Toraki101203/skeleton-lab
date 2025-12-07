
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Instagram, Twitter, Facebook, Menu, X } from 'lucide-react';
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
    { id: 'menu', label: 'メニュー' },
    { id: 'staff', label: 'スタッフ紹介' },
    { id: 'access', label: 'アクセス' },
];

const ClinicTemplateWarm: React.FC<Props> = ({ clinic, onBooking }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

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
        <div className="min-h-screen bg-[#FFFBF5] font-sans text-gray-700">
            {/* Navigation Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#FFFBF5]/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="font-bold text-2xl text-orange-800 flex items-center">
                        {clinic.name}
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors tracking-wider"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={onBooking}
                            className="px-6 py-2 bg-orange-400 text-white rounded-full font-bold shadow-md hover:bg-orange-500 transition-all transform hover:scale-105"
                        >
                            予約する
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-orange-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-[#FFFBF5] pt-24 px-6 md:hidden">
                    <div className="flex flex-col space-y-6 text-center">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-xl font-bold text-gray-700 tracking-wider hover:text-orange-500"
                            >
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                onBooking();
                            }}
                            className="w-full py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-lg"
                        >
                            予約する
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src={clinic.images && clinic.images.length > 0 ? clinic.images[0] : 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                        alt={clinic.name}
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFFBF5]/90 via-[#FFFBF5]/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-block px-4 py-2 bg-white rounded-full text-orange-500 font-bold text-sm shadow-sm border border-orange-100">
                            心安らぐ空間で、最高のケアを
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
                            {clinic.name}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                            {clinic.description ? clinic.description.split('\n')[0] : '患者様一人ひとりに寄り添い、丁寧な診療を心がけています。'}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={onBooking}
                                className="px-8 py-4 bg-orange-400 text-white rounded-full font-bold text-lg shadow-lg hover:bg-orange-500 transition-all transform hover:-translate-y-1"
                            >
                                予約する
                            </button>
                            <button
                                onClick={() => scrollToSection('about')}
                                className="px-8 py-4 bg-white text-gray-600 rounded-full font-bold text-lg shadow-md border border-orange-100 hover:bg-orange-50 transition-all"
                            >
                                詳しく見る
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            {clinic.newsItems && clinic.newsItems.length > 0 && (
                <section className="py-12 px-6 bg-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">お知らせ</h2>
                            <button
                                onClick={() => setIsNewsModalOpen(true)}
                                className="text-sm text-orange-500 hover:underline"
                            >
                                一覧を見る
                            </button>
                        </div>
                        <div className="space-y-4">
                            {clinic.newsItems.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                                    <span className="text-sm text-gray-500 font-mono">{item.date}</span>
                                    <span className="font-medium text-gray-800 hover:text-orange-500 cursor-pointer transition-colors">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* About Section */}
            <section id="about" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800">当院について</h2>
                        <p className="text-gray-500 mt-4">Concept</p>
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-orange-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

                        <div className="relative z-10">
                            <p className="text-gray-600 leading-loose text-lg whitespace-pre-wrap text-left max-w-3xl mx-auto">
                                {clinic.description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Director Section */}
            {
                clinic.directorInfo && clinic.directorInfo.name && (
                    <section className="py-24 px-6 bg-orange-50/50">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-800">院長挨拶</h2>
                                <p className="text-gray-500 mt-4">Greeting</p>
                            </div>
                            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-orange-50 flex flex-col md:flex-row gap-12 items-center">
                                <div className="w-64 h-64 shrink-0 rounded-3xl overflow-hidden border-8 border-orange-50 shadow-inner">
                                    <img src={clinic.directorInfo.imageUrl || 'https://via.placeholder.com/300'} alt={clinic.directorInfo.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-orange-400 font-bold mb-2">{clinic.directorInfo.title}</h3>
                                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{clinic.directorInfo.name}</h2>
                                    <p className="text-gray-600 leading-loose whitespace-pre-wrap">
                                        {clinic.directorInfo.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Menu Section */}
            {
                clinic.menuItems && clinic.menuItems.length > 0 && (
                    <section id="menu" className="py-24 px-6 bg-white rounded-[4rem] my-12 mx-4 shadow-sm border border-orange-50">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-800">メニュー</h2>
                                <p className="text-gray-500 mt-4">Menu</p>
                            </div>

                            <div className="space-y-16">
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
                                                <div className="flex items-center justify-center mb-8">
                                                    <div className="h-px w-8 bg-orange-200"></div>
                                                    <h3 className="text-xl font-bold text-orange-800 mx-4">
                                                        {category}
                                                    </h3>
                                                    <div className="h-px w-8 bg-orange-200"></div>
                                                </div>
                                                <div className="grid gap-6">
                                                    {items.map((item, index) => (
                                                        <div key={index} className="flex flex-col md:flex-row justify-between items-center p-6 bg-[#FFFBF5] rounded-3xl border border-orange-100 hover:border-orange-200 transition-all">
                                                            <div className="text-center md:text-left mb-4 md:mb-0 w-full md:w-auto">
                                                                <div className="font-bold text-xl text-gray-800">{item.name}</div>
                                                                {item.description && <div className="text-sm text-gray-500 mt-2">{item.description}</div>}
                                                                <div className="flex gap-3 mt-2 text-xs text-orange-400 justify-center md:justify-start">
                                                                    {item.duration > 0 && <span>施術: {item.duration}分</span>}
                                                                </div>
                                                            </div>
                                                            <div className="font-bold text-orange-500 bg-white px-6 py-2 rounded-full shadow-sm border border-orange-50 text-lg whitespace-nowrap">
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
                    <section id="staff" className="py-24 px-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-800">スタッフ紹介</h2>
                                <p className="text-gray-500 mt-4">Staff</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {clinic.staffInfo.map((staff, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-lg border border-orange-50 text-center hover:shadow-xl transition-shadow">
                                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-orange-100 mb-6">
                                            <img src={staff.imageUrl || 'https://via.placeholder.com/150'} alt={staff.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{staff.name}</h3>
                                        <p className="text-orange-400 font-medium text-sm">{staff.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* FAQ Section */}
            {
                clinic.faqItems && clinic.faqItems.length > 0 && (
                    <section className="py-24 px-6 bg-white">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-800">よくある質問</h2>
                                <p className="text-gray-500 mt-4">Q&A</p>
                            </div>
                            <div className="space-y-6">
                                {clinic.faqItems.map((item, index) => (
                                    <div key={index} className="bg-[#FFFBF5] rounded-2xl p-6 border border-orange-100">
                                        <div className="flex gap-4 mb-3">
                                            <span className="text-orange-500 font-bold text-xl">Q.</span>
                                            <h3 className="font-bold text-gray-800 pt-1">{item.question}</h3>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-400 font-bold text-xl">A.</span>
                                            <p className="text-gray-600 pt-1 leading-relaxed">{item.answer}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            {/* Access Section */}
            <section id="access" className="py-24 px-6 bg-orange-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800">アクセス・診療時間</h2>
                        <p className="text-gray-500 mt-4">Access & Hours</p>
                    </div>

                    <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-orange-100">
                        <div className="grid md:grid-cols-2">
                            <div className="p-10 md:p-12 space-y-8">
                                <div>
                                    <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                        <MapPin className="w-5 h-5 mr-2 text-orange-400" /> 住所
                                    </h3>
                                    <p className="text-gray-600 pl-7">{clinic.location.address}</p>
                                    {clinic.accessDetails && (
                                        <p className="text-sm text-gray-500 pl-7 mt-2 whitespace-pre-wrap">{clinic.accessDetails}</p>
                                    )}

                                    {/* SNS Links */}
                                    {(clinic.socialLinks?.instagram || clinic.socialLinks?.twitter || clinic.socialLinks?.facebook) && (
                                        <div className="flex space-x-4 pl-7 mt-4">
                                            {clinic.socialLinks?.instagram && <a href={clinic.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors"><Instagram className="w-5 h-5" /></a>}
                                            {clinic.socialLinks?.twitter && <a href={clinic.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors"><Twitter className="w-5 h-5" /></a>}
                                            {clinic.socialLinks?.facebook && <a href={clinic.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors"><Facebook className="w-5 h-5" /></a>}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="flex items-center text-lg font-bold text-gray-800 mb-4">
                                        <Clock className="w-5 h-5 mr-2 text-orange-400" /> 診療時間
                                    </h3>
                                    <div className="space-y-2 pl-7">
                                        {Object.entries(clinic.businessHours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0">
                                                <span className={`font-bold w-12 ${day === 'sun' ? 'text-red-400' : day === 'sat' ? 'text-blue-400' : 'text-gray-500'}`}>
                                                    {DAY_MAP[day]}
                                                </span>
                                                <span className={hours.isClosed ? 'text-gray-400' : 'text-gray-700'}>
                                                    {hours.isClosed ? '休診' : `${hours.start} - ${hours.end}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-100 min-h-[300px] flex items-center justify-center text-gray-400 overflow-hidden">
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
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />

            {/* News Modal */}
            {
                isNewsModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsNewsModalOpen(false)}></div>
                        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden relative z-10 shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
                                <h3 className="text-xl font-bold text-gray-800">お知らせ一覧</h3>
                                <button
                                    onClick={() => setIsNewsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-6">
                                    {clinic.newsItems && clinic.newsItems.length > 0 ? (
                                        clinic.newsItems.map((item, index) => (
                                            <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                <div className="text-sm text-gray-500 font-mono mb-2">{item.date}</div>
                                                <h4 className="font-bold text-gray-800 text-lg mb-3">{item.title}</h4>
                                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">お知らせはありません</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ClinicTemplateWarm;
