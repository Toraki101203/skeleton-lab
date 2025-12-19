import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSiteSettings } from '../services/db';

const Footer = () => {
    const [logoSettings, setLogoSettings] = useState<{
        imageUrl: string;
        height: string;
        opacity: number;
    } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSiteSettings('footer_logo_settings');
            if (data && data.imageUrl) {
                setLogoSettings(data);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="bg-white/10 backdrop-blur-md text-white py-12 relative z-20 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        {logoSettings ? (
                            <div className="flex flex-col items-center md:items-start gap-3">
                                <Link to="/" className="hover:opacity-80 transition-opacity">
                                    <img
                                        src={logoSettings.imageUrl}
                                        alt="Skeleton Lab."
                                        style={{
                                            height: logoSettings.height,
                                            opacity: (logoSettings.opacity ?? 100) / 100
                                        }}
                                    />
                                </Link>
                                <p className="text-white/60 text-xs font-light">
                                    &copy; 2025 Skeleton Lab. All rights reserved.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center md:items-start">
                                <Link to="/" className="hover:opacity-80 transition-opacity">
                                    <h2 className="text-2xl font-bold mb-2">Skeleton Lab.</h2>
                                </Link>
                                <p className="text-white/60 text-sm">
                                    カラダかろやか、ココロまろやか
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-8 text-lg font-bold text-white/80">
                        <Link to="/concept" className="hover:text-white transition-colors">コンセプト</Link>
                        <Link to="/features" className="hover:text-white transition-colors">特徴</Link>
                        <Link to="/faq" className="hover:text-white transition-colors">よくある質問</Link>
                    </div>
                </div>

                {/* Fallback copyright if no logo is set, to keep layout consistent until configured */}
                {!logoSettings && (
                    <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/40">
                        &copy; {new Date().getFullYear()} Skeleton Lab. All rights reserved.
                    </div>
                )}
            </div>
        </footer>
    );
};

export default Footer;
