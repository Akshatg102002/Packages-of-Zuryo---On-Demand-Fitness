import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User as UserIcon, MapPin, CheckCircle, Save, Mail, Briefcase, Star, ArrowRight, Activity, Zap, ClipboardList, History, Phone, Home, LogOut, LayoutDashboard, Ruler, Move, Lock, RefreshCw, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Booking, AssessmentData, UserProfile, SessionLog } from '../types';
import { getTrainerBookings, getUserProfile, saveAssessment, saveSessionLog, markBookingCompleted, getTrainerProfile } from '../services/db';
import { updateSessionCompletion } from '../services/sheetService';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

export const TrainerPortal: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [trainerName, setTrainerName] = useState<string>(''); 
    const [trainerEmail, setTrainerEmail] = useState<string>(''); // Store email for querying
    const [view, setView] = useState<'AUTH' | 'DASHBOARD' | 'SESSION'>('AUTH');
    const [activeTab, setActiveTab] = useState<'HOME' | 'SCHEDULE'>('HOME');
    const [refreshing, setRefreshing] = useState(false);
    
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);

    // Initial check & Identity Resolution
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if(user) {
                setCurrentUser(user);
                // Store email for queries - FORCE LOWERCASE
                if (user.email) setTrainerEmail(user.email.toLowerCase());
                
                // 1. Try to get name from Auth Profile for display
                let resolvedName = user.displayName;

                // 2. If missing, fetch from Firestore 'trainers' collection
                if (!resolvedName) {
                    const profile = await getTrainerProfile(user.uid);
                    if (profile && profile.name) {
                        resolvedName = profile.name;
                    }
                }

                if (resolvedName) {
                    setTrainerName(resolvedName);
                } else {
                    setTrainerName('Trainer'); 
                }
                setView('DASHBOARD');
            } else {
                setCurrentUser(null);
                setTrainerName('');
                setTrainerEmail('');
                setView('AUTH');
            }
        });
        return () => unsubscribe();
    }, []);

    const loadData = async () => {
        if(!trainerEmail) return; 
        setRefreshing(true);
        try {
            // Query bookings by Email
            const my = await getTrainerBookings(trainerEmail);
            const filtered = my.filter(booking => booking.status !== 'cancelled');
            setMyBookings(filtered);
        } catch(e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    // Load data whenever view changes or trainer is identified (by email)
    useEffect(() => {
        if (view === 'DASHBOARD' && trainerEmail) loadData();
    }, [view, trainerEmail, activeTab]);

    const openSession = async (booking: Booking) => {
        setSelectedBooking(booking);
        const user = await getUserProfile(booking.userId);
        setClientProfile(user);
        setView('SESSION');
    };

    const handleLogout = async () => {
        await auth.signOut();
        setCurrentUser(null);
        setTrainerName('');
        setTrainerEmail('');
        navigate('/'); 
    };

    // Helper: Get next upcoming CONFIRMED session
    const getNextSession = () => {
        const confirmed = myBookings.filter(b => b.status === 'confirmed');
        // Sort ascending by date (Nearest future date first)
        return confirmed.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    };

    const nextSession = getNextSession();

    if (view === 'AUTH') {
        return <TrainerAuth onLogin={() => { /* State handled by auth listener */ }} onBack={() => navigate('/')} />;
    }

    if (view === 'SESSION' && selectedBooking && clientProfile) {
        return <SessionView 
            booking={selectedBooking} 
            client={clientProfile} 
            onClose={() => { setView('DASHBOARD'); loadData(); }} 
            trainerName={trainerName}
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Dedicated Trainer Top Nav */}
            <div className="fixed top-0 left-0 right-0 bg-secondary z-50 px-6 py-4 shadow-md flex justify-between items-center h-[70px]">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-secondary font-black text-sm">Z</div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight leading-none">Zuryo Pro</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            {trainerName || 'Trainer'} Console
                        </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <button onClick={loadData} className={`text-white/70 hover:text-white transition-colors ${refreshing ? 'animate-spin' : ''}`}>
                         <RefreshCw size={20} />
                     </button>
                     <button onClick={handleLogout} className="text-white/70 hover:text-white transition-colors">
                         <LogOut size={20} />
                     </button>
                 </div>
            </div>

            {/* Main Content Area */}
            <div className="pt-24 px-6 pb-28 max-w-2xl mx-auto min-h-screen">
                
                {/* --- TAB: HOME (Stats & Overview) --- */}
                {activeTab === 'HOME' && (
                    <div className="animate-in fade-in duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-secondary font-bold text-xl">
                                {trainerName.charAt(0) || 'T'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-secondary">Hello, {trainerName.split(' ')[0]}</h2>
                                <p className="text-gray-400 font-medium text-sm">You have {myBookings.filter(b => b.status === 'confirmed').length} active sessions.</p>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-secondary to-slate-800 text-white p-6 rounded-[32px] shadow-xl shadow-secondary/20 relative overflow-hidden col-span-2">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-5 -mt-5"></div>
                                <h3 className="text-4xl font-black">{myBookings.filter(b => b.status === 'confirmed').length}</h3>
                                <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Assigned Sessions</p>
                            </div>
                        </div>

                        {/* Next Session Snippet */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-secondary text-lg">Up Next</h3>
                                {myBookings.length > 0 && (
                                    <button onClick={() => setActiveTab('SCHEDULE')} className="text-primary text-xs font-bold hover:underline">View All</button>
                                )}
                            </div>
                            
                            {nextSession ? (
                                <div onClick={() => openSession(nextSession)} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                    <h3 className="font-bold text-lg text-secondary mb-1">{nextSession.userName}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{nextSession.category} <span className="text-gray-300 mx-1">•</span> (New Customer)</p>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-3">
                                        <span className="bg-gray-100 p-1 rounded-md"><Calendar size={12} /></span>
                                        {new Date(nextSession.date).toLocaleDateString()} @ {nextSession.time}
                                    </p>
                                    <div className="flex items-start gap-2 text-xs font-bold text-gray-400 bg-gray-50 p-3 rounded-xl">
                                        <MapPin size={14} className="shrink-0 mt-0.5 text-primary" /> 
                                        <span className="line-clamp-1">{nextSession.location}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-end text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">
                                        Start Session <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-[24px] p-8 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold text-sm">No upcoming sessions.</p>
                                    <p className="text-xs text-gray-400 mt-2">Bookings assigned by Admin will appear here.</p>
                                    <button onClick={loadData} className="mt-4 text-primary text-xs font-bold underline">Refresh</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: SCHEDULE (My Sessions) --- */}
                {activeTab === 'SCHEDULE' && (
                    <div className="animate-in slide-in-from-right duration-300">
                        <h2 className="text-2xl font-black text-secondary mb-6 flex items-center gap-2">
                            My Dashboard
                        </h2>
                        <div className="space-y-4">
                            {myBookings.length === 0 && (
                                <div className="bg-white rounded-[32px] p-10 text-center border border-dashed border-gray-200">
                                    <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-gray-400 font-medium">No bookings assigned yet.</p>
                                    <button onClick={loadData} className="mt-4 text-primary text-xs font-bold underline">Refresh List</button>
                                </div>
                            )}
                            {myBookings.map(b => (
                                <div key={b.id} onClick={() => openSession(b)} className={`group bg-white p-5 rounded-[24px] border shadow-soft cursor-pointer hover:shadow-lg transition-all relative overflow-hidden ${b.status === 'completed' ? 'border-green-100 opacity-80' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-secondary">{b.userName || 'Client'}</h3>
                                            <p className="text-xs text-primary font-bold mt-0.5">{b.category} <span className="text-gray-300 mx-1">•</span> (New Customer)</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${b.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {b.status}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-3 mt-2">
                                        <Calendar size={14} className="text-primary"/>
                                        {new Date(b.date).toLocaleDateString()} @ {b.time}
                                    </p>
                                    <div className="flex items-start gap-2 text-xs font-bold text-gray-400 bg-gray-50 p-3 rounded-xl">
                                        <MapPin size={14} className="shrink-0 mt-0.5 text-primary" /> 
                                        {b.location}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Dedicated Trainer Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-up pb-safe pt-2 px-6 flex justify-around items-center z-40 h-[80px] rounded-t-[30px]">
                <NavButton 
                    label="Home" 
                    icon={Home} 
                    active={activeTab === 'HOME'} 
                    onClick={() => setActiveTab('HOME')} 
                />
                <NavButton 
                    label="Schedule" 
                    icon={LayoutDashboard} 
                    active={activeTab === 'SCHEDULE'} 
                    onClick={() => setActiveTab('SCHEDULE')} 
                />
            </div>
        </div>
    );
};

const SessionView: React.FC<{ booking: Booking, client: UserProfile, trainerName: string, onClose: () => void }> = ({ booking, client, trainerName, onClose }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'INFO' | 'ASSESS' | 'HISTORY' | 'CLOSE'>('INFO');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Default Assessment Data Structure
    const defaultAssessment: AssessmentData = {
        medicalConditions: [], injuryHistory: [], 
        currentPain: { exists: false }, 
        lifestyle: { sedentary: false, movement: 'Moderate', sleep: 'Average' },
        safetyClearance: { fitToExercise: true, doctorRestrictions: false },
        measurements: {}, 
        posture: { alignment: 'Neutral', balance: 'Stable' },
        mobility: { hip: 'Average', ankle: 'Average', shoulder: 'Average', spine: 'Average' },
        flexibility: { hamstrings: 'Moderate', hipFlexors: 'Moderate', chest: 'Moderate' },
        movement: { squat: 'Stable', lunge: 'Stable', push: 'Stable', core: 'Good' },
        stamina: { overall: 'Moderate', breathControl: 'Comfortable' },
        fitnessLevel: { category: 'Beginner', riskLevel: 'Low' },
        goals: { primary: 'General Fitness', intensityPref: 'Moderate', timePref: 'Morning', equipment: 'None' },
        trainerNotes: { coachingStyle: 'Motivational' }
    };

    const hasSavedAssessment = !!client.latestAssessment && client.latestAssessment.medicalConditions.length > 0;
    const [assessment, setAssessment] = useState<AssessmentData>(client.latestAssessment || defaultAssessment);
    
    // Closure Log State
    const [closureLog, setClosureLog] = useState<Partial<SessionLog>>({
        completed: 'Yes',
        comfortLevel: 'Comfortable',
        activitiesDone: ''
    });

    const isSessionClosed = booking.status === 'completed';

    const handleSaveAssessment = async (data: AssessmentData) => {
        try {
            setAssessment(data);
            await saveAssessment(client.uid, data);
            showToast("Assessment Saved & Locked!", "success");
        } catch (error: any) {
            console.error("Save failed", error);
            showToast("Failed to save: " + error.message, "error");
        }
    };

    const handleFinishSession = async () => {
        if(isSubmitting) return; // Prevent double click

        if(!closureLog.activitiesDone || closureLog.activitiesDone.length < 25) {
            showToast("Please enter detailed activities (min 25 chars).", "error");
            return;
        }
        
        setIsSubmitting(true);

        try {
            const finalLog: SessionLog = {
                date: new Date().toISOString(),
                trainerName,
                completed: closureLog.completed as any,
                comfortLevel: closureLog.comfortLevel as any,
                verbalFeedback: closureLog.verbalFeedback || '',
                nextRecommendation: closureLog.nextRecommendation || '',
                focusForNext: closureLog.focusForNext || '',
                activitiesDone: closureLog.activitiesDone || ''
            };

            // 1. Save to Firestore
            await saveSessionLog(client.uid, finalLog);
            await markBookingCompleted(booking.id);
            
            // 2. Sync to Google Sheet (Update columns M)
            await updateSessionCompletion(booking.id, closureLog.activitiesDone || '');

            showToast("Session Completed & Logged!", "success");
            onClose(); // Will trigger refresh in dashboard
        } catch (error: any) {
            console.error("Log failed", error);
            showToast("Failed to log session: " + error.message, "error");
            setIsSubmitting(false); // Only enable if failed
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-12 md:pt-4 px-4 pb-28 font-sans">
            <button onClick={onClose} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-secondary"><ArrowLeft size={16} /> Back to Dashboard</button>
            
            <div className="bg-white rounded-[32px] p-6 shadow-soft mb-6 border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black text-secondary mb-1">{client.name}</h1>
                        <p className="text-gray-400 font-medium text-sm">{booking.category} Session</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
                             <UserIcon size={12} className="text-blue-600" />
                             <span className="text-xs font-bold text-blue-700">Trainer: {trainerName}</span>
                        </div>
                        {isSessionClosed && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md ml-2">
                                <CheckCircle size={12} className="text-green-600" />
                                <span className="text-xs font-bold text-green-700">Completed</span>
                           </div>
                        )}
                    </div>
                    <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                        <UserIcon size={24} />
                    </div>
                </div>
                {/* Scrollable Tabs */}
                <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
                    <TabButton label="Profile" active={activeTab === 'INFO'} onClick={() => setActiveTab('INFO')} />
                    <TabButton label="Assessment" active={activeTab === 'ASSESS'} onClick={() => setActiveTab('ASSESS')} />
                    <TabButton label="History" active={activeTab === 'HISTORY'} onClick={() => setActiveTab('HISTORY')} />
                    <TabButton label="End Session" active={activeTab === 'CLOSE'} onClick={() => setActiveTab('CLOSE')} highlight />
                </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {activeTab === 'INFO' && (
                    <div className="space-y-4">
                        <InfoCard title="Location" value={`${client.apartmentName || ''}, ${client.flatNo || ''}\n${client.address}`} icon={<MapPin size={18}/>} />
                        <InfoCard title="Contact" value={client.phoneNumber || 'N/A'} icon={<Mail size={18}/>} />
                        {client.latestAssessment?.goals && (
                             <InfoCard title="Primary Goal" value={client.latestAssessment.goals.primary} icon={<Star size={18}/>} />
                        )}
                    </div>
                )}

                {activeTab === 'ASSESS' && (
                    <AssessmentWizard 
                        initialData={assessment} 
                        isLocked={hasSavedAssessment}
                        onSave={handleSaveAssessment} 
                    />
                )}

                {activeTab === 'HISTORY' && (
                    <SessionHistoryThread logs={client.sessionHistory || []} />
                )}

                {activeTab === 'CLOSE' && (
                    <div className="bg-white rounded-[32px] p-6 shadow-soft space-y-6">
                        <h2 className="font-extrabold text-xl text-secondary">Session Closure</h2>
                        
                        {isSessionClosed ? (
                             <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                 <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                 <h3 className="text-lg font-bold text-secondary">Session Completed</h3>
                                 <p className="text-sm text-gray-500 mt-1">This session has been logged and closed.</p>
                             </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Session Completed?</label>
                                    <div className="flex gap-4">
                                        {['Yes', 'No'].map(opt => (
                                            <button key={opt} onClick={() => setClosureLog({...closureLog, completed: opt as any})} className={`flex-1 py-3 rounded-xl font-bold border ${closureLog.completed === opt ? 'bg-secondary text-white border-secondary' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{opt}</button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="label">Activities Done Today (Min 25 chars)</label>
                                    <textarea className="input h-32 resize-none" value={closureLog.activitiesDone} onChange={e => setClosureLog({...closureLog, activitiesDone: e.target.value})} placeholder="e.g. Warmup 5 mins, 3x10 Squats, 3x10 Lunges, Cool down..." />
                                </div>

                                <div>
                                    <label className="label">Next Session Focus (For Next Trainer)</label>
                                    <input className="input" value={closureLog.focusForNext} onChange={e => setClosureLog({...closureLog, focusForNext: e.target.value})} placeholder="e.g. Focus on Upper Body strength" />
                                </div>

                                <button 
                                    onClick={handleFinishSession} 
                                    disabled={isSubmitting}
                                    className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'End Session'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <style>{`
                .label { display: block; font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .input { width: 100%; padding: 1rem; border: 2px solid #f1f5f9; border-radius: 1rem; font-size: 0.9rem; font-weight: 600; color: #334155; outline: none; transition: all 0.2s; background: #f8fafc; }
                .input:focus { border-color: #243A6C; background: #fff; }
            `}</style>
        </div>
    );
};

// ---------------------------
// SUB COMPONENTS
// ---------------------------

const NavButton = ({ label, icon: Icon, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1.5 w-16 transition-all duration-300 ${active ? 'text-primary translate-y-[-2px]' : 'text-gray-400 hover:text-secondary'}`}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-[10px] font-bold transition-opacity ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </button>
);

const TabButton = ({ label, active, onClick, highlight }: any) => (
    <button onClick={onClick} className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-wide rounded-xl transition-all whitespace-nowrap ${active ? (highlight ? 'bg-red-500 text-white' : 'bg-secondary text-white shadow-md') : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{label}</button>
);

const InfoCard = ({ title, value, icon }: any) => (
    <div className="bg-white p-5 rounded-[20px] border border-gray-50 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="mt-1 text-primary bg-primary/5 p-2 rounded-lg">{icon}</div>
        <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className="text-sm font-bold text-secondary whitespace-pre-line leading-relaxed">{value || 'Not provided'}</p>
        </div>
    </div>
);

// --- TRAINER AUTH ---
const TrainerAuth: React.FC<{ onLogin: (user: any) => void, onBack: () => void }> = ({ onLogin, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await auth.signInWithEmailAndPassword(email.trim(), password);
            // Auth listener in parent will handle the state update to DASHBOARD
        } catch (err: any) {
            console.error(err);
            setError("Invalid credentials or access denied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -ml-16 -mb-16"></div>

            <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
                <button onClick={onBack} className="mb-6 text-gray-400 hover:text-secondary flex items-center gap-1 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={14}/> Back to Home</button>
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary font-black text-2xl mx-auto mb-4 shadow-lg">Z</div>
                    <h1 className="text-2xl font-black text-secondary">Trainer Portal</h1>
                    <p className="text-gray-400 text-xs font-medium mt-1">Authorized Personnel Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Trainer Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 font-bold text-secondary outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 font-bold text-secondary outline-none focus:border-primary"
                        />
                    </div>

                    {error && <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-lg">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-secondary text-white py-4 rounded-xl font-bold shadow-xl shadow-secondary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin"/> : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- ASSESSMENT WIZARD ---
const AssessmentWizard: React.FC<{ initialData: AssessmentData, isLocked: boolean, onSave: (d: AssessmentData) => void }> = ({ initialData, isLocked, onSave }) => {
    const [data, setData] = useState<AssessmentData>(initialData);
    const [step, setStep] = useState(1); // 1: Vitals, 2: Fitness, 3: Goals

    const updateField = (category: keyof AssessmentData, field: string, value: any) => {
        if(isLocked) return;
        setData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        } as AssessmentData));
    };

    if (isLocked) {
        return (
            <div className="bg-white rounded-[32px] p-8 text-center border border-gray-100 shadow-soft">
                <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-secondary">Assessment Locked</h3>
                <p className="text-sm text-gray-500 mt-2 mb-6">An assessment has already been filed for this client.</p>
                <div className="bg-gray-50 p-4 rounded-xl text-left text-xs font-medium text-gray-600 space-y-2">
                    <p><strong>Conditions:</strong> {data.medicalConditions.join(', ') || 'None'}</p>
                    <p><strong>Goal:</strong> {data.goals.primary}</p>
                    <p><strong>Fitness Level:</strong> {data.fitnessLevel.category}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-secondary">New Assessment</h2>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-100'}`}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {step === 1 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Vitals & Health</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Height (cm)</label>
                                <input type="text" className="input" value={data.measurements?.height || ''} onChange={e => updateField('measurements', 'height', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Weight (kg)</label>
                                <input type="text" className="input" value={data.measurements?.weight || ''} onChange={e => updateField('measurements', 'weight', e.target.value)} />
                            </div>
                        </div>

                        <div>
                             <label className="label">Medical Conditions</label>
                             <div className="flex flex-wrap gap-2">
                                 {['Diabetes', 'BP', 'Asthma', 'None'].map(cond => (
                                     <button 
                                        key={cond} 
                                        onClick={() => {
                                            const current = data.medicalConditions || [];
                                            const updated = current.includes(cond) ? current.filter(c => c !== cond) : [...current, cond];
                                            setData({...data, medicalConditions: updated});
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${data.medicalConditions?.includes(cond) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                     >
                                         {cond}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fitness Level</h3>
                         
                         <div>
                            <label className="label">Current Activity Level</label>
                            <select className="input" value={data.lifestyle.movement} onChange={e => updateField('lifestyle', 'movement', e.target.value)}>
                                <option value="Low">Low (Sedentary)</option>
                                <option value="Moderate">Moderate</option>
                                <option value="High">High (Active)</option>
                            </select>
                         </div>

                         <div>
                            <label className="label">Categorized Level</label>
                            <div className="flex gap-2">
                                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                                    <button 
                                        key={lvl}
                                        onClick={() => updateField('fitnessLevel', 'category', lvl)}
                                        className={`flex-1 py-3 rounded-xl font-bold text-xs border ${data.fitnessLevel.category === lvl ? 'bg-secondary text-white border-secondary' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in slide-in-from-right duration-300 space-y-4">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Goals & Notes</h3>
                         
                         <div>
                             <label className="label">Primary Goal</label>
                             <input type="text" className="input" value={data.goals.primary} onChange={e => updateField('goals', 'primary', e.target.value)} placeholder="e.g. Weight Loss" />
                         </div>

                         <div>
                             <label className="label">Trainer Notes (Internal)</label>
                             <textarea 
                                className="input h-24 resize-none" 
                                value={data.trainerNotes?.behavioralNotes || ''} 
                                onChange={e => updateField('trainerNotes', 'behavioralNotes', e.target.value)} 
                                placeholder="Client specific needs..." 
                             />
                         </div>
                    </div>
                )}

                <div className="flex justify-between pt-4 mt-4 border-t border-gray-50">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s-1)} className="text-gray-400 font-bold text-xs uppercase tracking-wide">Back</button>
                    ) : <div></div>}
                    
                    {step < 3 ? (
                        <button onClick={() => setStep(s => s+1)} className="bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md">Next Step</button>
                    ) : (
                        <button onClick={() => onSave(data)} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
                            <Save size={16} /> Save Assessment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- SESSION HISTORY THREAD ---
const SessionHistoryThread: React.FC<{ logs: SessionLog[] }> = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                <History className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-400 font-bold text-sm">No session history found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {logs.slice().reverse().map((log, idx) => (
                <div key={idx} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm relative pl-8">
                    {/* Timeline Line */}
                    <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-100"></div>
                    <div className="absolute top-6 left-[13px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-white"></div>
                    
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                {new Date(log.date).toLocaleDateString()}
                            </p>
                            <h4 className="font-bold text-secondary text-sm">Trainer: {log.trainerName}</h4>
                        </div>
                        <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500 font-bold">
                            {log.comfortLevel}
                        </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 leading-relaxed mb-2">
                        <p className="font-bold text-gray-400 text-[10px] uppercase mb-1">Activities</p>
                        {log.activitiesDone}
                    </div>

                    {log.focusForNext && (
                         <div className="flex items-start gap-2 mt-2">
                             <ArrowRight size={12} className="text-primary mt-0.5" />
                             <p className="text-xs font-bold text-secondary">Next Focus: <span className="font-medium text-gray-500">{log.focusForNext}</span></p>
                         </div>
                    )}
                </div>
            ))}
        </div>
    );
};
