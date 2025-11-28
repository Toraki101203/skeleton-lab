import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { saveDiagnosis } from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';

type Step = 1 | 2 | 3;

interface DiagnosisData {
    bodyPart: string;
    symptoms: string[];
    duration: string;
}

const BODY_PARTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Arms', 'Legs', 'Hips'];
const SYMPTOMS = ['Pain', 'Stiffness', 'Numbness', 'Weakness', 'Swelling'];
const DURATIONS = ['Today', 'A few days', '1-2 weeks', '1 month+', 'Chronic (Years)'];

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

    const toggleSymptom = (symptom: string) => {
        setData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom]
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
                        {step === 1 && "Where does it hurt?"}
                        {step === 2 && "What are your symptoms?"}
                        {step === 3 && "How long has it been?"}
                    </h2>

                    <div className="min-h-[300px]">
                        {/* Step 1: Body Part */}
                        {step === 1 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {BODY_PARTS.map(part => (
                                    <button
                                        key={part}
                                        onClick={() => setData({ ...data, bodyPart: part })}
                                        className={`p-6 rounded-xl border-2 transition-all ${data.bodyPart === part
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        {part}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Symptoms */}
                        {step === 2 && (
                            <div className="grid grid-cols-2 gap-4">
                                {SYMPTOMS.map(sym => (
                                    <button
                                        key={sym}
                                        onClick={() => toggleSymptom(sym)}
                                        className={`p-6 rounded-xl border-2 transition-all ${data.symptoms.includes(sym)
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        {sym}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 3: Duration */}
                        {step === 3 && (
                            <div className="space-y-3">
                                {DURATIONS.map(dur => (
                                    <button
                                        key={dur}
                                        onClick={() => setData({ ...data, duration: dur })}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.duration === dur
                                            ? 'border-accent bg-green-50 text-accent font-bold'
                                            : 'border-gray-200 hover:border-blue-200'
                                            }`}
                                    >
                                        {dur}
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
                            <ChevronLeft className="w-5 h-5 mr-1" /> Back
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
                            {step === 3 ? 'Finish Diagnosis' : 'Next'}
                            {step !== 3 && <ChevronRight className="w-5 h-5 ml-1" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisWizard;
