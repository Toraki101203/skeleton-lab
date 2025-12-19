import { useState, useEffect } from 'react';
import { getSiteSettings } from '../services/db';

const FeaturesLeftDecor = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('features_left_decor_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) return null;

    return (
        <div
            className="absolute pointer-events-none hidden md:block z-0"
            style={{
                top: settings.positionTop || '50%',
                left: settings.positionLeft || '0px',
                height: settings.height || '300px',
                opacity: (settings.opacity ?? 100) / 100,
                transform: !settings.positionTop ? 'translateY(-50%)' : undefined
            }}
        >
            <img
                src={settings.imageUrl}
                alt="Left Decor"
                className="h-full w-auto object-contain"
            />
        </div>
    );
};

const FeaturesRightDecor = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('features_right_decor_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) return null;

    return (
        <div
            className="absolute pointer-events-none hidden md:block z-0"
            style={{
                top: settings.positionTop || '50%',
                right: settings.positionLeft || '0px', // Using positionLeft field as "Right" value
                height: settings.height || '300px',
                opacity: (settings.opacity ?? 100) / 100,
                transform: !settings.positionTop ? 'translateY(-50%)' : undefined
            }}
        >
            <img
                src={settings.imageUrl}
                alt="Right Decor"
                className="h-full w-auto object-contain"
            />
        </div>
    );
};

const FeaturesMainImage = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('features_main_image_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) return null;

    return (
        <div
            className="w-full flex justify-center z-10 relative px-4"
            style={{
                marginTop: settings.positionTop || '0px',
                marginBottom: settings.positionBottom || '0px',
                opacity: (settings.opacity ?? 100) / 100,
            }}
        >
            <img
                src={settings.imageUrl}
                alt="Features"
                style={{
                    height: settings.height || 'auto',
                    maxWidth: settings.positionLeft || '1000px', // Using positionLeft as maxWidth
                    width: '100%'
                }}
                className="object-contain"
            />
        </div>
    );
};

const Features = () => {
    return (
        <div className="relative w-full">
            {/* White Frame Container */}
            <div className="bg-white relative -top-[88px] min-h-[60vh] w-full overflow-hidden mt-8 flex flex-col pt-20">

                {/* Dynamic Decorations */}
                <FeaturesLeftDecor />
                <FeaturesRightDecor />

                {/* Hero Section */}
                <section className="relative pb-20 flex flex-col items-center text-center px-6">
                    <div className="z-10 animate-fade-in-up flex flex-col items-center">
                        <span className="text-[70px] font-black text-[#444] tracking-[0.25em] mt-[10px] leading-none">
                            キモチよりそう
                        </span>
                        <h1 className="text-[70px] font-black text-[#333] tracking-[0.25em] mb-12 font-sans leading-none">
                            Skeleton Lab.
                        </h1>
                        <p className="text-[40px] text-gray-500 font-medium tracking-[0.3em]">
                            あなたの健康な毎日をサポートする 3 つの特徴
                        </p>
                    </div>
                </section>

                {/* Bottom Custom Shape */}
                <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none">
                    <svg
                        viewBox="0 0 1000 100"
                        preserveAspectRatio="none"
                        className="w-full h-12 md:h-20 text-primary fill-current"
                    >
                        <path d="M0,0 L440,0 C495,0 498,50 500,100 C502,50 505,0 560,0 L1000,0 V100 H0 Z" />
                    </svg>
                </div>
            </div>

            {/* Main Features Image */}
            <FeaturesMainImage />
        </div>
    );
};

export default Features;
