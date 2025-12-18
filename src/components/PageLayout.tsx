import { useState, useEffect, type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

import { getSiteSettings } from '../services/db';

interface PageLayoutProps {
    children: ReactNode;
    className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
    const [bgSettings, setBgSettings] = useState<{
        imageUrl: string;
        height: string;
        positionTop: string;
        positionLeft?: string;
        positionRight?: string;
        opacity: number;
    } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSiteSettings('background_decor_settings');
            if (data) {
                setBgSettings(data);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-primary text-white font-sans relative overflow-hidden flex flex-col">
            <Header />

            {/* Background Decorations */}
            {bgSettings && bgSettings.imageUrl && (
                <div
                    className="absolute pointer-events-none transition-all duration-300 ease-in-out z-0"
                    style={{
                        top: bgSettings.positionTop,
                        left: bgSettings.positionLeft,
                        right: bgSettings.positionRight,
                        height: bgSettings.height,
                        opacity: (bgSettings.opacity ?? 10) / 100
                    }}
                >
                    <img
                        src={bgSettings.imageUrl}
                        alt=""
                        style={{ height: '100%', width: 'auto' }}
                        className="object-contain" // rotate-12 was on the skull, maybe user wants it? usually skull images are upright.
                    />
                </div>
            )}

            <main className={`container mx-auto px-4 pt-32 pb-32 relative z-10 flex-grow ${className}`}>
                {children}
            </main>

            {/* Footer Wave */}
            <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current opacity-5">
                    <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <Footer />
        </div>
    );
};

export default PageLayout;
