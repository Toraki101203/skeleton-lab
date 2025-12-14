import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Search, Phone, ArrowRight, MapPin } from 'lucide-react';
import type { Clinic } from '../../types';
import { BODY_PARTS, DURATIONS } from '../../constants/diagnosis';

// Mock Recommendations (would be fetched based on criteria in a real app)
const MOCK_RECOMMENDATIONS: Clinic[] = [
    {
        id: 'c1',
        ownerUid: 'owner1',
        name: 'スケルトン整骨院 東京本院',
        description: 'デスクワークによる肩こり・腰痛の専門治療。最新機器と手技を組み合わせた施術が評判です。',
        images: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600'],
        businessHours: {} as any, // Simplified for mock
        location: { lat: 35.6895, lng: 139.6917, address: '東京都新宿区西新宿' },
        staffIds: ['s1']
    },
    {
        id: 'c2',
        ownerUid: 'owner2',
        name: 'オアシス鍼灸院',
        description: '自律神経の乱れや慢性の痛みに。落ち着いた個室での施術を提供しています。',
        images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600'],
        businessHours: {} as any,
        location: { lat: 35.6895, lng: 139.6917, address: '東京都渋谷区神宮前' },
        staffIds: ['s2']
    }
];

const DiagnosisResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [diagnosisData, setDiagnosisData] = useState<any>(null);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        console.log('DiagnosisResult: location.state', location.state);
        if (location.state) {
            setDiagnosisData(location.state);
        }
    }, [location]);

    if (!diagnosisData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
                    <p className="text-gray-500 mb-6 font-medium">診断データが見つかりませんでした。</p>
                    <Link to="/diagnosis" className="block w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all">
                        問診をはじめる
                    </Link>
                </div>
            </div>
        );
    }

    const handleSearchClick = () => {
        setIsLocating(true);

        if (!navigator.geolocation) {
            navigate('/search', {
                state: {
                    prefill: { bodyPart: diagnosisData.bodyPart }
                }
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                navigate('/search', {
                    state: {
                        prefill: { bodyPart: diagnosisData.bodyPart },
                        userLocation: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }
                });
            },
            (error) => {
                console.warn("Location access denied", error);
                setIsLocating(false);
                // Fallback: navigate without location
                navigate('/search', {
                    state: {
                        prefill: { bodyPart: diagnosisData.bodyPart }
                    }
                });
            },
            { timeout: 5000 }
        );
    };

    // Helper to get labels
    const getBodyPartLabel = (id: string) => {
        if (!id) return '不明な部位';
        return BODY_PARTS.find(p => p.id === id)?.label || id;
    };
    const getDurationLabel = (id: string) => {
        if (!id) return '不明な期間';
        return DURATIONS.find(d => d.id === id)?.label || id;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Outcome Summary */}
            <div className="bg-gradient-to-b from-primary to-blue-600 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-6">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">問診が完了しました</h1>
                    <p className="text-lg text-blue-100 leading-relaxed max-w-xl mx-auto">
                        <span className="font-bold border-b border-white/40">{getBodyPartLabel(diagnosisData?.bodyPart)}</span> の
                        <span className="font-bold border-b border-white/40 mx-2">{getDurationLabel(diagnosisData?.duration)}</span> 続く症状ですね。<br />
                        あなたの状況に合わせて、2つの解決方法をご提案します。
                    </p>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            </div>

            {/* Dual Options Container */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
                <div className="grid md:grid-cols-2 gap-6">

                    {/* Option A: Search Clinics */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform hover:-translate-y-1 transition-all duration-300">
                        <div className="bg-blue-50 p-6 text-center border-b border-blue-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">A. 自分で探したい方</h2>
                            <p className="text-sm text-gray-600">条件に合う治療院を検索します</p>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                                あなたの症状（{getBodyPartLabel(diagnosisData?.bodyPart)}）を得意とする<br />
                                近くのクリニックを表示します。
                            </p>
                            <button
                                onClick={handleSearchClick}
                                disabled={isLocating}
                                className={`w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group ${isLocating ? 'opacity-75 cursor-wait' : ''}`}
                            >
                                <Search className="w-5 h-5" />
                                {isLocating ? '現在地を取得中...' : 'おすすめの院を見る'}
                                {!isLocating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>

                    {/* Option B: Diagnosis Monitoring */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-accent/20 transform hover:-translate-y-1 transition-all duration-300 relative">
                        {/* Recommended Badge */}
                        <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                            お悩みならこちら
                        </div>

                        <div className="bg-green-50 p-6 text-center border-b border-green-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">B. 相談して決めたい方</h2>
                            <p className="text-sm text-gray-600">専門家に電話で相談できます</p>
                        </div>
                        <div className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-green-100 text-accent rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Phone className="w-10 h-10" />
                            </div>
                            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                                「どの治療が合うかわからない」<br />
                                「まずは話を聞いてほしい」という方へ。
                            </p>
                            <a
                                href="tel:03-1234-5678"
                                className="w-full py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2 group mb-3"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert('デモ環境のため発信しません。\n専門家相談ダイヤルにつながります。');
                                }}
                            >
                                <Phone className="w-5 h-5" />
                                電話相談（無料）
                            </a>
                            <p className="text-xs text-gray-400">
                                受付時間: 9:00 - 18:00 (平日)
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Quick Recommendation Preview */}
            <div className="max-w-2xl mx-auto mt-16 px-4">
                <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                        あなたの症状に合いそうなクリニック
                    </h3>
                    <p className="text-sm text-gray-500">
                        {getBodyPartLabel(diagnosisData?.bodyPart)}治療の評判が良い医院の一部です
                    </p>
                </div>

                <div className="space-y-4">
                    {MOCK_RECOMMENDATIONS.map(clinic => (
                        <Link to={`/clinic/${clinic.id}`} key={clinic.id} className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                            <div className="w-24 h-24 sm:w-32 sm:h-auto shrink-0 bg-gray-200 relative">
                                <img src={clinic.images[0]} alt={clinic.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-center">
                                <h4 className="font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">{clinic.name}</h4>
                                <div className="flex items-center text-xs text-gray-500 mb-2">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {clinic.location.address}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-1">{clinic.description}</p>
                            </div>
                            <div className="w-10 flex items-center justify-center text-gray-300">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleSearchClick}
                        className="text-primary font-bold hover:text-blue-700 hover:underline transition-all text-sm"
                    >
                        すべてのクリニックを見る
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisResult;
