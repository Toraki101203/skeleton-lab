import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { saveDiagnosis } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

type Step = 1 | 2 | 3;

interface DiagnosisData {
    bodyPart: string;
    symptoms: string[];
    duration: string;
}

const BODY_PARTS = [
    { id: 'Head', label: '頭・顔' },
    { id: 'Neck', label: '首' },
    { id: 'Shoulders', label: '肩' },
    { id: 'Back', label: '背中・腰' },
    { id: 'Arms', label: '腕・手' },
    { id: 'Legs', label: '脚・足' },
    { id: 'Hips', label: '股関節・お尻' }
];

const SYMPTOMS = [
    { id: 'Pain', label: '痛み' },
    { id: 'Stiffness', label: 'こり・張り' },
    { id: 'Numbness', label: 'しびれ' },
    { id: 'Weakness', label: '力が入りにくい' },
    { id: 'Swelling', label: '腫れ' }
];

const DURATIONS = [
    { id: 'Today', label: '今日から' },
    { id: 'A few days', label: '数日前から' },
    { id: '1-2 weeks', label: '1〜2週間前から' },
    { id: '1 month+', label: '1ヶ月以上前から' },
    { id: 'Chronic (Years)', label: '長期間（慢性）' }
];

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
                // Save English IDs for consistency, or Japanese labels if preferred.
                // Here we save the ID to keep backend data consistent/analyzable, 
                // but for display we might want to map it back.
                // For now, let's save the ID as it was before.
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="bg-gray-200 h-2 w-full">
                    <div
                        className="bg-accent h-full transition-all duration-300 ease-out"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                        {step === 1 && "どこが気になりますか？"}
                        {step === 2 && "どのような症状ですか？"}
                        {step === 3 && "いつから続いていますか？"}
                    </h2>

                    <div className="min-h-[300px]">
                        {/* Step 1: Body Part */}
                        {step === 1 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {BODY_PARTS.map(part => (
                                    <button
                                        key={part.id}
                                        onClick={() => setData({ ...data, bodyPart: part.id })}
                                        className={`p-6 rounded-xl border-2 transition-all ${data.bodyPart === part.id
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        {part.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Symptoms */}
                        {step === 2 && (
                            <div className="grid grid-cols-2 gap-4">
                                {SYMPTOMS.map(sym => (
                                    <button
                                        key={sym.id}
                                        onClick={() => toggleSymptom(sym.id)}
                                        className={`p-6 rounded-xl border-2 transition-all ${data.symptoms.includes(sym.id)
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
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
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.duration === dur.id
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        {dur.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`flex items-center px-6 py-2 rounded-lg ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
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
                            className="flex items-center px-8 py-3 bg-accent text-white rounded-lg shadow-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {step === 3 ? '診断結果を見る' : '次へ'}
                            {step !== 3 && <ChevronRight className="w-5 h-5 ml-1" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisWizard;
