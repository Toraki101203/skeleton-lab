import PageLayout from '../components/PageLayout';
import { Activity, Search, ShieldCheck } from 'lucide-react';

const Features = () => {
    return (
        <PageLayout>
            <h1 className="text-3xl font-bold text-white mb-12 text-center">Skeleton Lab.の特徴</h1>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-800">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">モニター診断</h3>
                    <p className="text-gray-600">
                        簡単な問診票に答えるだけで、あなたの症状に合った施術方針を提案します。
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-800">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">最適なクリニック検索</h3>
                    <p className="text-gray-600">
                        現在地や症状から、近くの信頼できる整骨院・整体院をすぐに見つけられます。
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-800">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">安心の掲載基準</h3>
                    <p className="text-gray-600">
                        厳格な審査を通過した、技術と実績のある治療院のみを掲載しています。
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};

export default Features;
