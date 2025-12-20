import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import { getSiteSettings } from '../services/db';

const Home = () => {
    const [illustrationSettings, setIllustrationSettings] = useState<{
        imageUrl: string;
        height: string;
        positionTop?: string;
        positionLeft?: string;
        opacity: number;
    } | null>(null);


    useEffect(() => {
        const fetchSettings = async () => {
            const illusData = await getSiteSettings('home_illustration_settings');
            if (illusData) {
                setIllustrationSettings(illusData);
            } else {
                setIllustrationSettings({
                    imageUrl: '/home-illustration.png',
                    height: '128px',
                    opacity: 80
                });
            }

        };
        fetchSettings();
    }, []);

    return (
        <>

            <div className="text-center mb-12">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed relative z-50"
                    style={{
                        WebkitTextStroke: '4px #869ABE',
                        paintOrder: 'stroke fill'
                    }}
                >
                    モニター診断のための問診票
                </h1>
            </div>

            {/* Central Questionnaire Card Wrapper */}
            <div className="max-w-3xl mx-auto relative z-20">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-gray-800 relative">
                    {/* Card Header */}
                    <div className="bg-white border-b border-gray-100 p-6 text-center relative">
                        <div className="inline-block border-2 border-gray-800 px-6 py-2 rounded-lg text-xl font-bold relative bg-white z-10">
                            気になる部位は？
                        </div>
                        {/* Decorative Line behind title */}
                        <div className="absolute top-1/2 left-10 right-10 h-px bg-gray-200 -z-0"></div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Form Area */}
                        <div className="w-full space-y-6 max-w-lg mx-auto md:mr-auto md:ml-0">
                            {/* Question 1 */}
                            <div className="space-y-2">
                                <div className="flex items-center font-bold text-lg">
                                    <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                    気になる部位は？ <span className="text-xs font-normal text-gray-500 ml-2">※複数選択可</span>
                                </div>
                                <Link to="/diagnosis" className="flex gap-2 group">
                                    <div className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 group-hover:bg-white group-hover:border-accent flex items-center text-gray-400 transition-colors">
                                        例: 首、腰
                                    </div>
                                    <div className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold group-hover:bg-primary transition-colors flex items-center">
                                        選択
                                    </div>
                                </Link>
                            </div>

                            {/* Question 2 */}
                            <div className="space-y-2">
                                <div className="flex items-center font-bold text-lg">
                                    <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                    症状は？ <span className="text-xs font-normal text-gray-500 ml-2">※複数選択可</span>
                                </div>
                                <Link to="/diagnosis" className="flex gap-2 group">
                                    <div className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 group-hover:bg-white group-hover:border-accent flex items-center text-gray-400 transition-colors">
                                        例: 痛み、しびれ
                                    </div>
                                    <div className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold group-hover:bg-primary transition-colors flex items-center">
                                        選択
                                    </div>
                                </Link>
                            </div>

                            {/* Question 3 */}
                            <div className="space-y-2">
                                <div className="flex items-center font-bold text-lg">
                                    <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                    症状の期間は？
                                </div>
                                <Link to="/diagnosis" className="flex gap-2 group">
                                    <div className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 group-hover:bg-white group-hover:border-accent flex items-center text-gray-400 transition-colors">
                                        例: 1週間前から
                                    </div>
                                    <div className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold group-hover:bg-primary transition-colors flex items-center">
                                        選択
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Character Illustration (Right - Absolute) */}
                {illustrationSettings && illustrationSettings.imageUrl && (
                    <div
                        className="absolute pointer-events-none z-30 hidden md:block" // Increased z-index
                        style={{
                            height: illustrationSettings.height,
                            top: illustrationSettings.positionTop || '50%',
                            right: illustrationSettings.positionLeft || '-60px', // Default pushed out slightly
                            transform: !illustrationSettings.positionTop ? 'translateY(-50%)' : undefined, // Center vertically if no top set
                            opacity: (illustrationSettings.opacity ?? 100) / 100
                        }}
                    >
                        <img
                            src={illustrationSettings.imageUrl}
                            alt=""
                            className="object-contain w-auto h-full"
                        />
                    </div>
                )}

            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-center gap-6 mt-12 relative z-30">
                <Link to="/search" className="px-8 py-4 bg-accent text-white rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105 flex items-center">
                    <Clock className="mr-2" /> クリニックを探す
                </Link>
                <Link to="/diagnosis" className="px-8 py-4 bg-attention text-white rounded-full text-xl font-bold shadow-lg hover:bg-opacity-90 transition-transform hover:scale-105 flex items-center">
                    <Activity className="mr-2" /> 診断のモニタリング
                </Link>
            </div>
        </>
    );
};

export default Home;
