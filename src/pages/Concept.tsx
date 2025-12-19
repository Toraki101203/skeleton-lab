import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSiteSettings } from '../services/db';

const PlatformIllustration = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('concept_platform_image_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) {
        return (
            <div className="flex justify-center py-8">
                <div className="relative w-64 h-48 border-4 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-blue-50">
                    <span className="text-primary/60 font-bold">プラットフォーム概念図</span>
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">イラスト作成予定</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center" style={{ marginTop: settings.positionTop }}>
            <img
                src={settings.imageUrl}
                alt="Platform Concept"
                style={{
                    height: settings.height || 'auto',
                    opacity: (settings.opacity ?? 100) / 100,
                    maxWidth: settings.positionLeft || '100%' // Reusing positionLeft as MaxWidth based on SiteSettings
                }}
            />
        </div>
    );
};

const WorryItem = ({ settingId, title }: { settingId: string, title: React.ReactNode }) => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings(settingId).then(data => {
            if (data) setSettings(data);
        });
    }, [settingId]);

    return (
        <div className="flex flex-col items-center space-y-4">
            <h3 className="text-3xl font-extrabold text-gray-800 h-16 flex items-center justify-center text-center leading-tight">
                {title}
            </h3>
            <div className="w-64 h-64 rounded-full bg-yellow-100 flex items-center justify-center relative border-4 border-yellow-200 shadow-inner overflow-hidden">
                {settings?.imageUrl ? (
                    <img
                        src={settings.imageUrl}
                        alt="Worry Illustration"
                        className="object-contain"
                        style={{
                            height: settings.height || '64px',
                            opacity: (settings.opacity ?? 100) / 100,
                            marginTop: settings.positionTop ? settings.positionTop : 0,
                        }}
                    />
                ) : (
                    <div className="text-center">
                        <div className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-md shadow-md">
                            該当する<br />イラスト作成予定
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SolutionIcon = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('concept_solution_icon_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) {
        // Return default placeholder if no image is set, or maybe nothing.
        // The user asked to make it changeable. If not set, maybe keep the Brain icon?
        // But in previous task user asked to remove Brain icon.
        // I will return a subtle placeholder or nothing.
        // Let's return a placeholder that says "Icon Unset" or similar, or just the white circle.
        return (
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-[10px] text-gray-400">Icon</span>
            </div>
        );
    }

    return (
        <div className="w-16 h-16 flex items-center justify-center relative">
            <img
                src={settings.imageUrl}
                alt="Solution Icon"
                className="object-contain"
                style={{
                    height: settings.height || '40px',
                    opacity: (settings.opacity ?? 100) / 100,
                    top: settings.positionTop ? settings.positionTop : 'auto',
                    left: settings.positionLeft ? settings.positionLeft : 'auto',
                    position: (settings.positionTop || settings.positionLeft) ? 'relative' : 'static'
                }}
            />
        </div>
    );
};

const SolutionDecor = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('concept_solution_decor_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    if (!settings?.imageUrl) {
        // Return nothing if unset, or maybe the Brain icon? Use asks to "change it", so presumably replace.
        // Return nothing.
        return null;
    }

    return (
        <div
            className="absolute pointer-events-none"
            style={{
                top: settings.positionTop || '50%',
                right: settings.positionLeft || '-20px', // Using positionLeft as "Right"
                transform: 'translateY(-50%)', // Centering vertically by default if 50%
                opacity: (settings.opacity ?? 20) / 100,
            }}
        >
            <img
                src={settings.imageUrl}
                alt="Decoration"
                style={{
                    height: settings.height || '192px',
                    width: 'auto'
                }}
            />
        </div>
    );
};

const MonitorImage = () => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        getSiteSettings('concept_monitor_image_settings').then(data => {
            if (data) setSettings(data);
        });
    }, []);

    const defaultImage = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
    const imageUrl = settings?.imageUrl || defaultImage;
    const opacity = settings?.opacity ?? 80;

    return (
        <img
            src={imageUrl}
            alt="Monitor Diagnosis"
            className="w-full h-full object-cover transition-opacity"
            style={{ opacity: opacity / 100 }}
        />
    );
};

const Concept = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="min-h-[45vh] flex flex-col items-center justify-start text-center px-6 relative pt-16 md:pt-24">
                <div className="z-10 space-y-2">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tighter drop-shadow-md">
                        カラダかろやか、<br className="md:hidden" />
                        ココロまろやか
                    </h1>
                    <p className="text-base md:text-xl text-white/95 font-medium tracking-[0.2em] drop-shadow-sm">
                        ～体が整うと、暮らしの質がもっと高まる～
                    </p>
                </div>

                <div className="absolute bottom-8 animate-bounce text-white/70">
                    <ArrowDown className="w-8 h-8" />
                </div>
            </section>

            {/* Intro Section - Platform Definition */}
            <section className="py-20 px-6 bg-white mx-4 md:mx-auto max-w-[1000px] rounded-3xl shadow-xl -mt-32 relative z-20 text-center">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 border-b-4 border-primary inline-block pb-2 px-8 tracking-widest">
                            新しい形の検索・予約プラットフォーム
                        </h2>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-loose text-xl md:text-2xl font-medium tracking-widest">
                        <p>
                            Skeleton Lab. は、整骨院、整体院、鍼灸院など、<br className="hidden md:block" />
                            施術施設を中心とした新しいプラットフォームです。
                        </p>
                        <p>
                            ただ探すだけではなく、あなたの「カラダ」と「ココロ」に<br className="hidden md:block" />
                            本当に合う場所を見つけるお手伝いをします。
                        </p>
                    </div>

                    {/* Dynamic Platform Intro Illustration */}
                    <PlatformIllustration />
                </div>
            </section>

            {/* Worries Section - Wave Top & Yellow Circles */}
            <div className="w-screen relative left-[calc(-50vw+50%)]">
                <div className="relative z-10 mt-12">
                    {/* Wave Decoration Top */}
                    <div className="w-full h-[60px] md:h-[120px] overflow-hidden leading-[0]">
                        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-full fill-white">
                            <path d="M0,64 C480,140, 720,-20, 1200,64 V120 H0 Z"></path>
                        </svg>
                    </div>

                    <section className="pb-24 px-6 bg-white pt-12">
                        {/* Top Curve Decoration (Visual hack using SVG or just section color transition if pure white)
                         Since the intro card is white and this section is white, they blend.
                         Let's make this section slight off-white or keep white but emphasize the content.
                      */}

                        <div className="max-w-6xl mx-auto text-center space-y-16">
                            <div className="inline-block bg-pink-500 text-white px-36 py-3 rounded-full text-xl md:text-2xl font-bold shadow-lg transform -rotate-1">
                                こんなお悩みありませんか？
                            </div>

                            {/* The 3 Circles */}
                            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                                <WorryItem
                                    settingId="concept_worry_1"
                                    title="肩が凝る、腰が痛い"
                                />
                                <WorryItem
                                    settingId="concept_worry_2"
                                    title={<>なんとなく<br />体調が優れない</>}
                                />
                                <WorryItem
                                    settingId="concept_worry_3"
                                    title={<>自分に合う<br />施術がわからない</>}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Wave Decoration Bottom */}
                    <div className="w-full h-[60px] md:h-[120px] overflow-hidden leading-[0] transform rotate-180 -mt-1">
                        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-full fill-white">
                            <path d="M0,64 C480,140, 720,-20, 1200,64 V120 H0 Z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Solution Section "Skeleton Lab. Nara" */}
            <section className="py-24 px-6 relative bg-primary/10">
                {/* Using primary/10 to distinguish from the white worries section */}
                <div className="max-w-4xl mx-auto text-center relative z-10">

                    {/* Header with Icon */}
                    <div className="flex justify-center items-center gap-4 mb-12">
                        <SolutionIcon />
                        <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
                            スケルトン Lab. なら
                        </h2>
                    </div>


                    {/* Main Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        {/* Peeking Decoration (Absolute) */}
                        <SolutionDecor />

                        <div className="border-4 border-pink-500 rounded-full inline-block px-24 py-3 mb-8 bg-white shadow-sm">
                            <h3 className="text-2xl font-bold text-pink-600">
                                スマートな検索
                            </h3>
                        </div>

                        <p className="text-lg md:text-xl font-bold text-gray-800 mb-8 leading-relaxed">
                            「症状を診てもらいながら相談したい」という方のために、<br />
                            専門家によるモニター診断（予約制）もご用意しております。
                        </p>

                        {/* Monitor Diagnosis Image Placeholder */}
                        <div className="max-w-lg mx-auto rounded-xl overflow-hidden shadow-lg border-4 border-gray-100 relative bg-gray-200 h-64 flex items-center justify-center group">
                            <MonitorImage />
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer Tagline */}
            <section className="py-20 text-center">
                <div className="space-y-4">
                    <h2 className="text-6xl md:text-7xl font-bold text-white">体を整える</h2>
                </div>
            </section>

        </>
    );
};

export default Concept;
