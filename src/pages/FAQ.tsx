import PageLayout from '../components/PageLayout';

const FAQ = () => {
    return (
        <PageLayout>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">よくある質問</h1>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-800">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-2">Q. 利用料金はかかりますか？</h3>
                    <p className="text-gray-600">A. ユーザー登録、クリニック検索、予約機能はすべて無料でご利用いただけます。</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-2">Q. 予約のキャンセルはできますか？</h3>
                    <p className="text-gray-600">A. はい、マイページから予約の確認・キャンセルが可能です。直前のキャンセルの場合は、直接クリニックへご連絡ください。</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-2">Q. モニター診断とは何ですか？</h3>
                    <p className="text-gray-600">A. あなたの症状や痛みの箇所を入力いただくことで、一般的な原因や推奨される施術内容を提示する機能です。医療診断ではありません。</p>
                </div>
            </div>
        </PageLayout>
    );
};

export default FAQ;
