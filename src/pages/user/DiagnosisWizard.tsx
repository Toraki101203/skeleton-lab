import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Activity } from 'lucide-react';
import { saveDiagnosis } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

type Step = 1 | 2 | 3;

interface DiagnosisData {
    bodyPart: string;
    symptoms: string[];
    duration: string;
}

import { BODY_PARTS, SYMPTOMS, DURATIONS } from '../../constants/diagnosis';

const DiagnosisWizard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>(1);
    const [data, setData] = useState<DiagnosisData>({
        bodyPart: '',
        symptoms: [],
        duration: ''
    });

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('diagnosis_draft');
        if (saved) {
            setData(JSON.parse(saved));
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('diagnosis_draft', JSON.stringify(data));
    }, [data]);

    const handleNext = () => {
        if (step < 3) setStep((s) => (s + 1) as Step);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep((s) => (s - 1) as Step);
    };

    const handleSubmit = async () => {
        if (user) {
            try {
                await saveDiagnosis(user.uid, data);
            } catch (e) {
                console.error("Failed to save diagnosis", e);
            }
        }

        // Clear draft
        localStorage.removeItem('diagnosis_draft');

        // Navigate to results with state
        navigate('/diagnosis/result', { state: data });
    };

    const toggleSymptom = (symptomId: string) => {
        setData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptomId)
                ? prev.symptoms.filter(s => s !== symptomId)
                : [...prev.symptoms, symptomId]
        }));
    };

    const getProgress = () => ((step / 3) * 100);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Unified Gradient Header */}
            <div className="bg-gradient-to-b from-primary to-blue-600 text-white pt-10 pb-20 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden transition-all duration-500">
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-4">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">モニター診断 問診</h1>
                    <p className="text-blue-100 text-sm md:text-base">
                        最適な解決策をご提案するため、<br className="sm:hidden" />3つの質問にお答えください
                    </p>
                </div>

                {/* Decorative circles matching DiagnosisResult */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            </div>

            {/* Overlapping Card Container */}
            <div className="max-w-xl mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">

                    {/* Progress Bar */}
                    <div className="bg-gray-100 h-2 w-full">
                        <div
                            className="bg-accent h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            style={{ width: `${getProgress()}%` }}
                        />
                    </div>

                    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                        <div className="mb-8 text-center">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Step {step} / 3</span>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-4 leading-relaxed">
                                {step === 1 && "どこが気になりますか？"}
                                {step === 2 && "どのような症状ですか？"}
                                {step === 3 && "いつから続いていますか？"}
                            </h2>
                        </div>

                        <div className="min-h-[300px] animate-fade-in">
                            {/* Step 1: Body Part */}
                            {step === 1 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    {BODY_PARTS.map(part => (
                                        <button
                                            key={part.id}
                                            onClick={() => setData({ ...data, bodyPart: part.id })}
                                            className={`p-4 md:p-5 rounded-2xl border-2 transition-all active:scale-95 min-h-[80px] flex items-center justify-center text-center font-bold text-base md:text-lg ${data.bodyPart === part.id
                                                ? 'border-accent bg-accent/5 text-accent shadow-inner ring-2 ring-accent/20'
                                                : 'border-gray-100 hover:border-blue-200 bg-white hover:bg-gray-50 shadow-sm'
                                                }`}
                                        >
                                            {part.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Symptoms */}
                            {step === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {SYMPTOMS.map(sym => (
                                        <button
                                            key={sym.id}
                                            onClick={() => toggleSymptom(sym.id)}
                                            className={`p-4 md:p-5 rounded-2xl border-2 transition-all active:scale-95 min-h-[70px] flex items-center justify-center text-center font-bold text-base md:text-lg ${data.symptoms.includes(sym.id)
                                                ? 'border-accent bg-accent/5 text-accent shadow-inner ring-2 ring-accent/20'
                                                : 'border-gray-100 hover:border-blue-200 bg-white hover:bg-gray-50 shadow-sm'
                                                }`}
                                        >
                                            {sym.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Duration */}
                            {step === 3 && (
                                <div className="space-y-3">
                                    {DURATIONS.map(dur => (
                                        <button
                                            key={dur.id}
                                            onClick={() => setData({ ...data, duration: dur.id })}
                                            className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-98 min-h-[64px] flex items-center justify-between font-bold text-base md:text-lg ${data.duration === dur.id
                                                ? 'border-accent bg-accent/5 text-accent shadow-inner ring-2 ring-accent/20'
                                                : 'border-gray-100 hover:border-blue-200 bg-white hover:bg-gray-50 shadow-sm'
                                                }`}
                                        >
                                            <span>{dur.label}</span>
                                            {data.duration === dur.id && <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex justify-between items-center gap-4">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center px-4 py-3 rounded-xl font-bold transition-colors ${step === 1
                                ? 'text-gray-300 cursor-not-allowed opacity-0'
                                : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" /> 戻る
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={
                                (step === 1 && !data.bodyPart) ||
                                (step === 2 && data.symptoms.length === 0) ||
                                (step === 3 && !data.duration)
                            }
                            className={`flex-1 max-w-[240px] flex items-center justify-center px-6 py-4 rounded-xl shadow-lg transition-all active:scale-95 font-bold text-lg
                                ${(step === 1 && !data.bodyPart) || (step === 2 && data.symptoms.length === 0) || (step === 3 && !data.duration)
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-accent to-green-500 text-white hover:shadow-green-200 hover:shadow-xl'
                                }`}
                        >
                            {step === 3 ? '診断結果を見る' : '次へ進む'}
                            {step !== 3 && <ChevronRight className="w-5 h-5 ml-1" />}
                        </button>
                    </div>
                </div>

                {/* Cancel Link */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 text-sm hover:text-gray-600 underline"
                    >
                        トップに戻る
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisWizard;
