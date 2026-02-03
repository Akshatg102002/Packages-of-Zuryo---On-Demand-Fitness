
import React, { useState } from 'react';
import { AssessmentData } from '../types';
import { Save, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
    initialData: AssessmentData;
    isLocked: boolean;
    onSave?: (data: AssessmentData) => void;
    mode?: 'TRAINER_EDIT' | 'USER_VIEW';
}

export const AssessmentWizard: React.FC<Props> = ({ initialData, isLocked, onSave, mode = 'TRAINER_EDIT' }) => {
    // Ensure deep merge/defaults to avoid undefined errors if legacy data exists
    const [data, setData] = useState<AssessmentData>(initialData);
    const [step, setStep] = useState(1); 

    const updateDeep = (path: string[], value: any) => {
        if (isLocked) return;
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            let current = newData;
            for (let i = 0; i < path.length - 1; i++) {
                if (!current[path[i]]) current[path[i]] = {};
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newData;
        });
    };

    const steps = [
        { id: 1, title: 'Basic Profile', section: 'A' },
        { id: 2, title: 'Health & Lifestyle', section: 'B' },
        { id: 3, title: 'Body Metrics', section: 'C' },
        { id: 4, title: 'Trainer Eval', section: 'D-G' },
        { id: 5, title: 'Goals & Outcomes', section: 'H-K' }
    ];

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100">
            {isLocked && mode === 'TRAINER_EDIT' && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6 flex items-start gap-3">
                    <Lock className="text-yellow-600 mt-0.5" size={18} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">View Only Mode</h4>
                        <p className="text-yellow-700 text-xs mt-1">Assessment submitted. You can view details but cannot edit.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black text-secondary">{mode === 'USER_VIEW' ? 'My Assessment' : 'Client Assessment'}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{steps[step-1].title}</p>
                </div>
                <div className="flex gap-1">
                    {steps.map(s => (
                        <div key={s.id} className={`w-6 h-1 rounded-full ${step >= s.id ? 'bg-primary' : 'bg-gray-100'}`}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-6 min-h-[300px]">
                
                {/* SECTION A: BASIC PROFILE */}
                {step === 1 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Full Name" value={data.basic?.fullName} onChange={v => updateDeep(['basic', 'fullName'], v)} disabled={isLocked} />
                            <InputGroup label="Age" value={data.basic?.age} onChange={v => updateDeep(['basic', 'age'], v)} disabled={isLocked} type="number" />
                        </div>
                        <InputGroup label="Gender" value={data.basic?.gender} onChange={v => updateDeep(['basic', 'gender'], v)} disabled={isLocked} />
                        <InputGroup label="Contact Number" value={data.basic?.contactNumber} onChange={v => updateDeep(['basic', 'contactNumber'], v)} disabled={isLocked} />
                        <InputGroup label="Address (Apt/Flat/Tower)" value={data.basic?.address} onChange={v => updateDeep(['basic', 'address'], v)} disabled={isLocked} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="First Session Date" value={data.basic?.dateOfFirstSession} onChange={v => updateDeep(['basic', 'dateOfFirstSession'], v)} disabled={isLocked} type="date" />
                            <InputGroup label="Trainer Name" value={data.basic?.trainerName} onChange={v => updateDeep(['basic', 'trainerName'], v)} disabled={isLocked} />
                        </div>
                    </div>
                )}

                {/* SECTION B: HEALTH */}
                {step === 2 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <MultiSelect 
                            label="Medical Conditions" 
                            options={["None", "BP", "Diabetes", "Thyroid", "Cardiac", "Asthma", "PCOS", "Cholesterol", "Arthritis", "Other"]}
                            values={data.health?.medicalConditions || []}
                            onChange={v => updateDeep(['health', 'medicalConditions'], v)}
                            disabled={isLocked}
                        />
                        <MultiSelect 
                            label="Injury History" 
                            options={["Knee", "Lower Back", "Upper Back", "Shoulder", "Neck", "Ankle", "Wrist", "None"]}
                            values={data.health?.injuryHistory || []}
                            onChange={v => updateDeep(['health', 'injuryHistory'], v)}
                            disabled={isLocked}
                        />
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <label className="label">Current Pain</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="Location" className="input" value={data.health?.currentPain?.location || ''} onChange={e => updateDeep(['health', 'currentPain', 'location'], e.target.value)} disabled={isLocked} />
                                <input placeholder="Scale (1-10)" className="input" type="number" value={data.health?.currentPain?.painScale || ''} onChange={e => updateDeep(['health', 'currentPain', 'painScale'], e.target.value)} disabled={isLocked} />
                            </div>
                        </div>
                        <SelectGroup 
                            label="Daily Movement"
                            options={["Low", "Moderate", "High"]}
                            value={data.health?.lifestyle?.dailyMovement}
                            onChange={v => updateDeep(['health', 'lifestyle', 'dailyMovement'], v)}
                            disabled={isLocked}
                        />
                    </div>
                )}

                {/* SECTION C: BODY */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Height (cm)" value={data.body?.height} onChange={v => updateDeep(['body', 'height'], v)} disabled={isLocked} type="number" />
                            <InputGroup label="Weight (kg)" value={data.body?.weight} onChange={v => updateDeep(['body', 'weight'], v)} disabled={isLocked} type="number" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <InputGroup label="Waist (in)" value={data.body?.waist} onChange={v => updateDeep(['body', 'waist'], v)} disabled={isLocked} type="number" />
                            <InputGroup label="Hip (in)" value={data.body?.hip} onChange={v => updateDeep(['body', 'hip'], v)} disabled={isLocked} type="number" />
                            <InputGroup label="Chest (in)" value={data.body?.chest} onChange={v => updateDeep(['body', 'chest'], v)} disabled={isLocked} type="number" />
                        </div>
                    </div>
                )}

                {/* SECTION D-G: EVALUATION */}
                {step === 4 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4 h-80 overflow-y-auto pr-2">
                        <SelectGroup label="Posture" options={["Neutral", "Forward Head", "Rounded Shoulders", "APT", "Other"]} value={data.evaluation?.posture} onChange={v => updateDeep(['evaluation', 'posture'], v)} disabled={isLocked} />
                        
                        <div className="p-3 border border-gray-100 rounded-xl">
                            <label className="label text-primary">Mobility Check</label>
                            <div className="grid grid-cols-2 gap-2">
                                <SelectGroup label="Hip" options={["Good", "Avg", "Poor"]} value={data.evaluation?.mobility?.hip} onChange={v => updateDeep(['evaluation', 'mobility', 'hip'], v)} disabled={isLocked} compact />
                                <SelectGroup label="Ankle" options={["Good", "Avg", "Poor"]} value={data.evaluation?.mobility?.ankle} onChange={v => updateDeep(['evaluation', 'mobility', 'ankle'], v)} disabled={isLocked} compact />
                                <SelectGroup label="Shoulder" options={["Good", "Avg", "Poor"]} value={data.evaluation?.mobility?.shoulder} onChange={v => updateDeep(['evaluation', 'mobility', 'shoulder'], v)} disabled={isLocked} compact />
                                <SelectGroup label="Spine" options={["Good", "Avg", "Poor"]} value={data.evaluation?.mobility?.spine} onChange={v => updateDeep(['evaluation', 'mobility', 'spine'], v)} disabled={isLocked} compact />
                            </div>
                        </div>

                        <SelectGroup label="Squat Pattern" options={["Stable", "Knee collapse", "Limited depth", "Pain"]} value={data.evaluation?.movementStrength?.squatPattern} onChange={v => updateDeep(['evaluation', 'movementStrength', 'squatPattern'], v)} disabled={isLocked} />
                        <SelectGroup label="Core Engagement" options={["Good", "Average", "Weak"]} value={data.evaluation?.movementStrength?.coreEngagement} onChange={v => updateDeep(['evaluation', 'movementStrength', 'coreEngagement'], v)} disabled={isLocked} />
                    </div>
                )}

                {/* SECTION H-K: GOALS */}
                {step === 5 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <SelectGroup label="Category" options={["Beginner", "Intermediate", "Advanced"]} value={data.goals?.fitnessCategory} onChange={v => updateDeep(['goals', 'fitnessCategory'], v)} disabled={isLocked} />
                            <SelectGroup label="Risk Level" options={["Low", "Medium", "High"]} value={data.goals?.riskLevel} onChange={v => updateDeep(['goals', 'riskLevel'], v)} disabled={isLocked} />
                        </div>
                        <SelectGroup label="Primary Goal" options={["Weight Loss", "Strength", "Mobility", "General Fitness", "Medical"]} value={data.goals?.primaryGoal} onChange={v => updateDeep(['goals', 'primaryGoal'], v)} disabled={isLocked} />
                        
                        <div>
                            <label className="label text-red-500">Exercises to Avoid</label>
                            <textarea className="input h-20" value={data.goals?.trainerNotes?.exercisesToAvoid || ''} onChange={e => updateDeep(['goals', 'trainerNotes', 'exercisesToAvoid'], e.target.value)} disabled={isLocked} />
                        </div>

                        {mode === 'TRAINER_EDIT' && (
                            <div>
                                <label className="label text-green-600">Next Session Focus</label>
                                <input className="input" value={data.goals?.sessionOutcome?.nextSessionFocus || ''} onChange={e => updateDeep(['goals', 'sessionOutcome', 'nextSessionFocus'], e.target.value)} disabled={isLocked} />
                            </div>
                        )}
                         {mode === 'USER_VIEW' && (
                            <div className="bg-green-50 p-4 rounded-xl">
                                <label className="label text-green-800">For Next Session</label>
                                <p className="font-bold text-secondary">{data.goals?.sessionOutcome?.nextSessionFocus || 'No specific focus set.'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4 mt-4 border-t border-gray-50">
                {step > 1 ? (
                    <button onClick={() => setStep(s => s-1)} className="flex items-center gap-1 text-gray-400 font-bold text-xs uppercase tracking-wide hover:text-secondary">
                        <ArrowLeft size={14}/> Back
                    </button>
                ) : <div></div>}
                
                {step < 5 ? (
                    <button onClick={() => setStep(s => s+1)} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
                        Next <ArrowRight size={14}/>
                    </button>
                ) : (
                    mode === 'TRAINER_EDIT' && !isLocked && onSave && (
                        <button onClick={() => onSave(data)} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
                            <Save size={16} /> Save Form
                        </button>
                    )
                )}
            </div>
            
            <style>{`
                .label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 0.3rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .input { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.85rem; font-weight: 600; color: #334155; outline: none; background: #f8fafc; }
                .input:focus { border-color: #243A6C; background: #fff; }
                .input:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, disabled, type="text" }: any) => (
    <div>
        <label className="label">{label}</label>
        <input type={type} className="input" value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled} />
    </div>
);

const SelectGroup = ({ label, options, value, onChange, disabled, compact }: any) => (
    <div>
        {!compact && <label className="label">{label}</label>}
        {compact && <label className="text-[10px] font-bold text-gray-400 mb-1 block">{label}</label>}
        <div className={`flex flex-wrap gap-2 ${compact ? 'flex-col' : ''}`}>
            {options.map((opt: string) => (
                <button 
                    key={opt}
                    onClick={() => onChange(opt)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        value === opt 
                        ? 'bg-secondary text-white border-secondary' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-secondary/30'
                    } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

const MultiSelect = ({ label, options, values, onChange, disabled }: any) => (
    <div>
        <label className="label">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((opt: string) => (
                <button 
                    key={opt}
                    onClick={() => {
                        if(disabled) return;
                        const current = values || [];
                        const updated = current.includes(opt) ? current.filter((c: string) => c !== opt) : [...current, opt];
                        onChange(updated);
                    }}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        (values || []).includes(opt) 
                        ? 'bg-red-50 text-red-600 border-red-200' 
                        : 'bg-white text-gray-500 border-gray-200'
                    } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);
