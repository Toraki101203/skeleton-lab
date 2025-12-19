import { ArrowDown } from 'lucide-react';

const Concept = () => {
    return (
        <>
            {/* Hero Section */}
            <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative">
                <div className="z-10 animate-fade-in-up space-y-8">
                    <h1 className="text-5xl md:text-8xl font-bold text-white leading-tight tracking-tighter">
                        カラダかろやか、<br className="md:hidden" />
                        ココロまろやか
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 font-light tracking-[0.2em]">
                        〜体が整うと、暮らしの質がもっと高まる〜
                    </p>
                </div>

                <div className="absolute bottom-12 animate-bounce text-white/50">
                    <ArrowDown className="w-6 h-6" />
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        新しい形の<br />検索・予約プラットフォーム
                    </h2>
                    <p className="text-lg md:text-xl text-white/80 leading-loose font-light">
                        Skeleton Lab.は、整骨院、整体院、鍼灸院など、<br className="hidden md:block" />
                        施術施設を中心とした新しいプラットフォームです。<br /><br />
                        ただ探すだけではなく、<br className="md:hidden" />あなたの「カラダ」と「ココロ」に<br className="md:hidden" />本当に合う場所を見つけるお手伝いをします。
                    </p>
                </div>
            </section>

            {/* Problem & Solution Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-24">
                    {/* Worries */}
                    <div className="space-y-10">
                        <h3 className="text-2xl md:text-4xl font-bold text-white/90">
                            こんなお悩み<br className="md:hidden" />ありませんか？
                        </h3>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-white/90 text-xl md:text-2xl font-normal flex-wrap">
                            <p className="whitespace-nowrap">肩が凝る、腰が痛い</p>
                            <span className="hidden md:block text-white/40">|</span>
                            <p className="whitespace-nowrap">なんとなく体調が優れない</p>
                            <span className="hidden md:block text-white/40">|</span>
                            <p className="whitespace-nowrap">自分に合う施術がわからない</p>
                        </div>
                    </div>

                    {/* Solutions */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">
                                スマートな検索
                            </h3>
                            <p className="text-white/80 leading-relaxed font-normal text-lg">
                                症状からの検索や、お住まいのエリアに近いところから。<br />
                                あなたの条件にぴったりの施設が見つかります。
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">
                                専門家による<br className="md:hidden" />モニター診断
                            </h3>
                            <p className="text-white/80 leading-relaxed font-normal text-lg">
                                「症状を診てもらいながら相談したい」という方のために、<br />
                                <span className="whitespace-nowrap">専門家によるモニター診断（予約制）もご用意しております。</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-40 px-6 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                        ボディバランスと<br />骨格の健康を第一に
                    </h2>
                    <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                        体を <span className="text-white font-bold border-b border-white/50 pb-1">整える</span> ことで<br className="md:hidden" />より充実した日々をお過ごしいただきたい。<br /><br />
                        それが Skeleton Lab.の願いです。
                    </p>
                </div>
            </section>
        </>
    );
};

export default Concept;
