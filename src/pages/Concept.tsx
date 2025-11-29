import PageLayout from '../components/PageLayout';

const Concept = () => {
    return (
        <PageLayout>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">コンセプト</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm max-w-3xl mx-auto text-gray-800">
                <p className="text-lg leading-relaxed mb-6">
                    Skeleton Lab.は、体のバランスと骨格の健康を第一に考える、新しい形のクリニック検索・予約プラットフォームです。
                </p>
                <p className="text-lg leading-relaxed">
                    専門家によるモニター診断を通じて、あなたに最適な治療院（整骨院、整体院、鍼灸院）をご提案します。
                    痛みの原因を根本から見直し、健康な体づくりをサポートします。
                </p>
            </div>
        </PageLayout>
    );
};

export default Concept;
