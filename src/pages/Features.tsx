import PageLayout from '../components/PageLayout';
import { ArrowDown } from 'lucide-react';

const Features = () => {
    return (
        <PageLayout>
            {/* Hero Section */}
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative">
                <div className="z-10 animate-fade-in-up space-y-6">
                    <h1 className="text-5xl md:text-8xl font-bold text-white leading-tight tracking-tighter whitespace-nowrap">
                        キモチよりそう Skeleton Lab.
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 font-light tracking-[0.2em]">
                        あなたの健康な毎日をサポートする<br className="md:hidden" />3つの特徴
                    </p>
                </div>

                <div className="absolute bottom-12 animate-bounce text-white/60">
                    <ArrowDown className="w-8 h-8" />
                </div>
            </section>

            {/* Features Grid Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto flex flex-col gap-12">
                    {/* Feature 1 */}
                    <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/30 hover:bg-white/30 transition-all duration-300 group flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">安心のモニター診断</h3>
                            <p className="text-white/90 leading-relaxed text-lg font-medium">
                                簡単な問診にお答えいただき、症状に合った施術方法やメソッドをご提案。<br />
                                モニター診断は予約制となります。
                            </p>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/30 hover:bg-white/30 transition-all duration-300 group flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">迅速なクリニック検索</h3>
                            <p className="text-white/90 leading-relaxed text-lg font-medium">
                                ご希望のエリアや症状に合う施術施設やクリニックを検索でピックアップ。<br />
                                忙しい方にオススメの機能です。
                            </p>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white/30 hover:bg-white/30 transition-all duration-300 group flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
                        <div className="flex-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">信頼の登録基準</h3>
                            <p className="text-white/90 leading-relaxed text-lg font-medium">
                                ご紹介する施術施設やクリニックは、厳正な審査を行い掲載しております。<br />
                                技術と実績の高さを実感いただけます。
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default Features;
