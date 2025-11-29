import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { Skull, Activity, Clock } from 'lucide-react';

const Home = () => {
    const [bodyPart, setBodyPart] = useState('');
    const [symptom, setSymptom] = useState('');
    const [duration, setDuration] = useState('');

    return (
        <PageLayout>
            <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    専門家のモニター診断をはじめ、<br />
                    整骨院、整体院、鍼灸院などが探せるスケルトン Lab.
                </h1>
            </div>

            {/* Central Questionnaire Card */}
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden text-gray-800 relative z-20">
                {/* Card Header */}
                <div className="bg-white border-b border-gray-100 p-6 text-center relative">
                    <div className="inline-block border-2 border-gray-800 px-6 py-2 rounded-lg text-xl font-bold relative bg-white z-10">
                        モニター診断のための問診票
                    </div>
                    {/* Decorative Line behind title */}
                    <div className="absolute top-1/2 left-10 right-10 h-px bg-gray-200 -z-0"></div>
                </div>

                <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    {/* Form Area */}
                    <div className="flex-1 w-full space-y-6">
                        {/* Question 1 */}
                        <div className="space-y-2">
                            <div className="flex items-center font-bold text-lg">
                                <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                気になる部位は？ <span className="text-xs font-normal text-gray-500 ml-2">※複数選択可</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={bodyPart}
                                    onChange={(e) => setBodyPart(e.target.value)}
                                    className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 focus:bg-white focus:border-accent outline-none transition-colors"
                                />
                                <button className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold hover:bg-primary transition-colors">完了</button>
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div className="space-y-2">
                            <div className="flex items-center font-bold text-lg">
                                <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                症状は？ <span className="text-xs font-normal text-gray-500 ml-2">※複数選択可</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={symptom}
                                    onChange={(e) => setSymptom(e.target.value)}
                                    className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 focus:bg-white focus:border-accent outline-none transition-colors"
                                />
                                <button className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold hover:bg-primary transition-colors">完了</button>
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div className="space-y-2">
                            <div className="flex items-center font-bold text-lg">
                                <span className="w-5 h-5 border-2 border-blue-400 mr-2 rounded-sm"></span>
                                症状の期間は？
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="flex-1 h-12 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 focus:bg-white focus:border-accent outline-none transition-colors"
                                />
                                <button className="px-4 py-2 bg-primary/80 text-white rounded-lg text-sm font-bold hover:bg-primary transition-colors">完了</button>
                            </div>
                        </div>
                    </div>

                    {/* Character Illustration */}
                    <div className="w-32 md:w-48 flex flex-col items-center justify-center text-primary opacity-80">
                        <Skull className="w-32 h-32 mb-2" />
                        <div className="h-16 w-4 bg-gray-200 rounded-full mx-auto relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200"></div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-200"></div>
                        </div>
                    </div>
                </div>
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
        </PageLayout>
    );
};

export default Home;
