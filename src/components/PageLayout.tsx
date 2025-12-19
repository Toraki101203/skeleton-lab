import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

    const [logoSettings, setLogoSettings] = useState<{
        imageUrl: string;
        height: string;
        positionTop: string;
        positionLeft: string;
        opacity: number;
        hasFrame?: boolean;
        framePaddingRight?: string;
        framePaddingLeft?: string;
        framePaddingTop?: string;
        framePaddingBottom?: string;
        frameBorderWidth?: string;
        frameBorderRadiusRight?: string;
        frameBorderRadiusLeft?: string;
    } | null>(null);

    const [leftIllustrationSettings, setLeftIllustrationSettings] = useState<{
        imageUrl: string;
        height: string;
        positionTop?: string;
        positionLeft?: string;
        opacity: number;
    } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSiteSettings('background_decor_settings');
            if (data) {
                setBgSettings(data);
            }

            const logoData = await getSiteSettings('home_logo_settings');
            if (logoData && logoData.imageUrl) {
                setLogoSettings(logoData);
            }

            const leftData = await getSiteSettings('home_left_illustration_settings');
            if (leftData) {
                setLeftIllustrationSettings(leftData);
            }
        };
        fetchSettings();
    }, []);

    const location = useLocation();
    const isFeaturesPage = location.pathname === '/features';

    return (
        <div className="min-h-screen font-sans relative overflow-hidden flex flex-col bg-primary text-white">
            <Header />

            {/* Global Logo with Dynamic Frame Settings */}
            {logoSettings && (
                <Link
                    to="/"
                    className={`absolute z-[60] cursor-pointer transition-all duration-300 ease-in-out hover:opacity-80 flex items-center ${logoSettings.hasFrame ? 'bg-white border-primary shadow-lg' : ''}`}
                    style={{
                        height: logoSettings.height,
                        top: logoSettings.positionTop,
                        left: logoSettings.positionLeft,
                        opacity: (logoSettings.opacity ?? 100) / 100,
                        // Dynamic frame styles
                        paddingTop: logoSettings.hasFrame ? logoSettings.framePaddingTop : '0',
                        paddingBottom: logoSettings.hasFrame ? logoSettings.framePaddingBottom : '0',
                        paddingLeft: logoSettings.hasFrame ? logoSettings.framePaddingLeft : '0',
                        paddingRight: logoSettings.hasFrame ? logoSettings.framePaddingRight : '0',
                        borderWidth: logoSettings.hasFrame ? logoSettings.frameBorderWidth : '0',
                        borderTopRightRadius: logoSettings.hasFrame ? logoSettings.frameBorderRadiusRight : '0',
                        borderBottomRightRadius: logoSettings.hasFrame ? logoSettings.frameBorderRadiusRight : '0',
                        borderTopLeftRadius: logoSettings.hasFrame ? logoSettings.frameBorderRadiusLeft : '0',
                        borderBottomLeftRadius: logoSettings.hasFrame ? logoSettings.frameBorderRadiusLeft : '0',
                    }}
                >
                    <img
                        src={logoSettings.imageUrl}
                        alt="Site Logo"
                        className="h-full w-auto"
                    />
                </Link>
            )}

            {/* Global Left Illustration (Hidden on Features Page) */}
            {!isFeaturesPage && leftIllustrationSettings && leftIllustrationSettings.imageUrl && (
                <div
                    className="absolute pointer-events-none z-0 hidden md:block" // Changed from z-[55] to z-0 to avoid overlapping content
                    style={{
                        height: leftIllustrationSettings.height,
                        top: leftIllustrationSettings.positionTop || '50%',
                        left: leftIllustrationSettings.positionLeft || '-60px',
                        transform: !leftIllustrationSettings.positionTop ? 'translateY(-50%)' : undefined,
                        opacity: (leftIllustrationSettings.opacity ?? 100) / 100
                    }}
                >
                    <img
                        src={leftIllustrationSettings.imageUrl}
                        alt=""
                        className="object-contain w-auto h-full"
                    />
                </div>
            )}

            {/* Background Decorations (Hidden on Features Page) */}
            {!isFeaturesPage && bgSettings && bgSettings.imageUrl && (
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
                        className="object-contain"
                    />
                </div>
            )}

            <main className={`${isFeaturesPage ? 'w-full' : 'container mx-auto px-4'} pt-32 pb-32 relative z-10 flex-grow ${className}`}>
                {children}
            </main>

            {/* Footer Wave */}
            <div className="absolute bottom-0 left-0 right-0 z-0 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-auto fill-current opacity-5 text-white">
                    <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <Footer />
        </div>
    );
};

export default PageLayout;
