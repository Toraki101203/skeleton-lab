
const FAQ = () => {
    return (
        <div className="py-4 px-6">
            <h1 className="text-5xl font-bold text-white mb-12 text-center">よくある質問</h1>
            <div className="max-w-4xl mx-auto space-y-8 text-gray-800">
                <div className="bg-white p-10 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-3xl mb-4">Q. 利用料金はかかりますか？</h3>
                    <p className="text-2xl text-gray-600 leading-relaxed">A. ユーザー登録、クリニック検索、予約機能はすべて無料でご利用いただけます。</p>
                </div>
                <div className="bg-white p-10 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-3xl mb-4">Q. 予約のキャンセルはできますか？</h3>
                    <p className="text-2xl text-gray-600 leading-relaxed">A. はい、マイページから予約の確認・キャンセルが可能です。直前のキャンセルの場合は、直接クリニックへご連絡ください。</p>
                </div>
                <div className="bg-white p-10 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-3xl mb-4">Q. モニター診断とは何ですか？</h3>
                    <p className="text-2xl text-gray-600 leading-relaxed">A. あなたの症状や痛みの箇所を入力いただくことで、一般的な原因や推奨される施術内容を提示する機能です。医療診断ではありません。</p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
