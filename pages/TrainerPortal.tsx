import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User as UserIcon, MapPin, CheckCircle, Save, Mail, Briefcase, Star, ArrowRight, Activity, Zap, ClipboardList, History, Phone, Home, LogOut, LayoutDashboard, Ruler, Move, Lock, RefreshCw } from 'lucide-react';
import { Booking, AssessmentData, UserProfile, SessionLog } from '../types';
import { getTrainerBookings, getUserProfile, saveAssessment, saveSessionLog, markBookingCompleted, getTrainerProfile } from '../services/db';
import { updateSessionCompletion } from '../services/sheetService';
import { auth, db } from '../services/firebase';
import { useHistory } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

export const TrainerPortal: React.FC = () => {
    const history = useHistory();
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
        history.push('/'); 
    };

    if (view === 'AUTH') {
        return <TrainerAuth onLogin={() => { /* State handled by auth listener */ }} onBack={() => history.push('/')} />;
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
                            
                            {myBookings.length > 0 ? (
                                <div onClick={() => openSession(myBookings[0])} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                    <h3 className="font-bold text-lg text-secondary mb-1">{myBookings[0].userName}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{myBookings[0].category} <span className="text-gray-300 mx-1">•</span> (New Customer)</p>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mb-3">
                                        <span className="bg-gray-100 p-1 rounded-md"><Calendar size={12} /></span>
                                        {new Date(myBookings[0].date).toLocaleDateString()} @ {myBookings[0].time}
                                    </p>
                                    <div className="flex items-start gap-2 text-xs font-bold text-gray-400 bg-gray-50 p-3 rounded-xl">
                                        <MapPin size={14} className="shrink-0 mt-0.5 text-primary" /> 
                                        <span className="line-clamp-1">{myBookings[0].location}</span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-end text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">
                                        Start Session <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-[24px] p-8 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold text-sm">No assigned sessions.</p>
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
                                <div key={b.id} onClick={() => openSession(b)} className="group bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft cursor-pointer hover:shadow-lg transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-secondary">{b.userName || 'Client'}</h3>
                                            <p className="text-xs text-primary font-bold mt-0.5">{b.category} <span className="text-gray-300 mx-1">•</span> (New Customer)</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${b.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
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

const NavButton = ({ label, icon: Icon, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center space-y-1.5 w-16 transition-all duration-300 ${
            active ? 'text-primary translate-y-[-2px]' : 'text-gray-400 hover:text-secondary'
        }`}
    >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className={`text-[10px] font-bold transition-opacity ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </button>
);

const TrainerAuth: React.FC<{ onLogin: (user: any) => void, onBack: () => void }> = ({ onLogin, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetSent, setResetSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const cred = await auth.signInWithEmailAndPassword(email.trim(), password);
                // onLogin will be triggered by the listener in parent
            } else {
                const cred = await auth.createUserWithEmailAndPassword(email.trim(), password);
                if (cred.user) {
                    // Update Auth Profile Display Name immediately
                    await cred.user.updateProfile({
                        displayName: name
                    });

                    // Create Trainer Doc
                    await db.collection("trainers").doc(cred.user.uid).set({
                        uid: cred.user.uid,
                        name,
                        email: email.trim().toLowerCase(), // SAVE AS LOWERCASE
                        specialties: [specialty],
                        rating: 5.0,
                        joinedAt: Date.now()
                    });
                }
            }
        } catch (err: any) {
            setError(err.message.replace('Firebase:', '').trim());
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!email) {
            setError("Please enter your email address to reset password.");
            return;
        }
        try {
            setLoading(true);
            const actionCodeSettings = {
                url: window.location.origin + '/reset-password', // Redirect to custom reset page
                handleCodeInApp: false
            };
            await auth.sendPasswordResetEmail(email.trim(), actionCodeSettings);
            setResetSent(true);
            setError("");
        } catch (err: any) {
            setError(err.message.replace('Firebase:', '').trim());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6">
            <button onClick={onBack} className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={24} />
            </button>
            <div className="w-full max-w-md">
                 <div className="mb-8 text-center">
                    <div className="inline-block bg-primary text-secondary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        For Professionals
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2">{isLogin ? 'Trainer Login' : 'Join the Squad'}</h1>
                </div>
                 <form onSubmit={handleSubmit} className="space-y-4 bg-white/5 backdrop-blur-xl p-6 rounded-[32px] border border-white/10">
                    {!isLogin && (
                        <>
                        <div className="space-y-1">
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full bg-secondary/50 p-4 rounded-xl text-white placeholder:text-gray-400 outline-none" placeholder="Full Name (Must match Admin Sheet)" />
                        </div>
                        <div className="space-y-1">
                            <input type="text" value={specialty} onChange={e=>setSpecialty(e.target.value)} required className="w-full bg-secondary/50 p-4 rounded-xl text-white placeholder:text-gray-400 outline-none" placeholder="Specialty" />
                        </div>
                        </>
                    )}
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-secondary/50 p-4 rounded-xl text-white placeholder:text-gray-400 outline-none" placeholder="Email" />
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full bg-secondary/50 p-4 rounded-xl text-white placeholder:text-gray-400 outline-none" placeholder="Password" />

                    {/* Forgot Password Link */}
                    {isLogin && (
                        <div className="flex justify-end">
                            <button type="button" onClick={handleReset} className="text-xs font-bold text-white/60 hover:text-white transition-colors flex items-center gap-1">
                                <Lock size={12} /> Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
                    {resetSent && <p className="text-green-400 text-xs font-bold text-center">If account exists, reset link sent to email.</p>}

                    <button disabled={loading} className="w-full bg-primary text-secondary py-4 rounded-xl font-black text-lg mt-4 flex items-center justify-center gap-2">
                        {loading ? 'Processing...' : (isLogin ? 'Enter Portal' : 'Create Account')}
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                        {isLogin ? "New here? Apply as Trainer" : "Have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... Rest of the components (AssessmentWizard, SessionHistoryThread, etc.) remain unchanged
const SessionView: React.FC<{ booking: Booking, client: UserProfile, trainerName: string, onClose: () => void }> = ({ booking, client, trainerName, onClose }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'INFO' | 'ASSESS' | 'HISTORY' | 'CLOSE'>('INFO');
    
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
        if(!closureLog.activitiesDone || closureLog.activitiesDone.length < 25) {
            showToast("Please enter detailed activities (min 25 chars).", "error");
            return;
        }
        
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
            onClose();
        } catch (error: any) {
            console.error("Log failed", error);
            showToast("Failed to log session: " + error.message, "error");
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

                                <button onClick={handleFinishSession} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform">
                                    End Session
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

// ... Rest of the components (AssessmentWizard, SessionHistoryThread, etc.) remain unchanged
const AssessmentWizard: React.FC<{ initialData: AssessmentData, isLocked: boolean, onSave: (d: AssessmentData) => void }> = ({ initialData, isLocked, onSave }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<AssessmentData>(initialData);
    const totalSteps = 5;

    const validateStep = (currentStep: number): boolean => {
        if (currentStep === 1) {
            if (data.medicalConditions.length === 0) { showToast("Please select medical conditions or 'None'", "error"); return false; }
            if (data.injuryHistory.length === 0) { showToast("Please select injury history or 'None'", "error"); return false; }
        }
        if (currentStep === 2) {
             if (!data.measurements.height || !data.measurements.weight) { showToast("Height and Weight are required", "error"); return false; }
             if (!data.posture.alignment) { showToast("Posture selection required", "error"); return false; }
        }
        if (currentStep === 3) {
            if (!data.mobility.hip || !data.mobility.shoulder) { showToast("Mobility assessments required", "error"); return false; }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep(Math.min(step + 1, totalSteps));
    };

    const handlePrev = () => setStep(Math.max(step - 1, 1));
    
    const handleSave = () => {
        if (validateStep(step)) onSave(data);
    };

    // Helpers for form inputs
    const CheckboxGroup = ({ label, options, current, onChange }: any) => (
        <div className="mb-6">
            <label className="label">{label}</label>
            <div className="grid grid-cols-2 gap-2">
                {options.map((opt: string) => (
                    <button key={opt} disabled={isLocked} onClick={() => {
                        const newSet = current.includes(opt) ? current.filter((i: string) => i !== opt) : [...current, opt];
                        onChange(newSet);
                    }} className={`p-3 rounded-xl text-xs font-bold text-left border transition-all ${current.includes(opt) ? 'bg-primary/10 border-primary text-secondary' : 'bg-gray-50 border-gray-100 text-gray-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {opt} {current.includes(opt) && <CheckCircle size={12} className="inline ml-1 text-primary"/>}
                    </button>
                ))}
            </div>
        </div>
    );

    const RadioGroup = ({ label, options, current, onChange }: any) => (
        <div className="mb-6">
            <label className="label">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: string) => (
                    <button key={opt} disabled={isLocked} onClick={() => onChange(opt)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${current === opt ? 'bg-secondary text-white border-secondary' : 'bg-gray-50 border-gray-100 text-gray-500'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="font-extrabold text-lg text-secondary">Assessment Form</h2>
                 <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full text-xs">Step {step} of {totalSteps}</span>
             </div>

             {isLocked && (
                 <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-xl mb-6 flex items-center gap-2 font-bold">
                     <Lock size={14}/> Assessment is locked because it was already submitted.
                 </div>
             )}

             {/* Step 1: Health (B) */}
             {step === 1 && (
                 <div className="animate-in slide-in-from-right duration-300">
                     <h3 className="text-primary font-bold text-sm uppercase mb-4 flex items-center gap-2"><Activity size={16}/> Health & Safety</h3>
                     <CheckboxGroup 
                        label="Medical Conditions" 
                        options={['None', 'BP', 'Diabetes', 'Thyroid', 'Cardiac', 'Asthma', 'PCOS', 'Arthritis']} 
                        current={data.medicalConditions} 
                        onChange={(v: string[]) => setData({...data, medicalConditions: v})} 
                     />
                     <CheckboxGroup 
                        label="Injury History" 
                        options={['None', 'Knee', 'Lower Back', 'Upper Back', 'Shoulder', 'Neck', 'Ankle']} 
                        current={data.injuryHistory} 
                        onChange={(v: string[]) => setData({...data, injuryHistory: v})} 
                     />
                     <RadioGroup 
                        label="Lifestyle Movement" 
                        options={['Low', 'Moderate', 'High']} 
                        current={data.lifestyle.movement} 
                        onChange={(v: any) => setData({...data, lifestyle: {...data.lifestyle, movement: v}})} 
                     />
                 </div>
             )}

             {/* Step 2: Measurements (C) & Posture (D) */}
             {step === 2 && (
                 <div className="animate-in slide-in-from-right duration-300">
                     <h3 className="text-primary font-bold text-sm uppercase mb-4 flex items-center gap-2"><Ruler size={16}/> Stats & Posture</h3>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div><label className="label">Height (cm)</label><input type="text" disabled={isLocked} className="input" value={data.measurements.height || ''} onChange={e => setData({...data, measurements: {...data.measurements, height: e.target.value}})} /></div>
                        <div><label className="label">Weight (kg)</label><input type="text" disabled={isLocked} className="input" value={data.measurements.weight || ''} onChange={e => setData({...data, measurements: {...data.measurements, weight: e.target.value}})} /></div>
                     </div>
                     <RadioGroup 
                        label="Posture Alignment" 
                        options={['Neutral', 'Forward Head', 'Rounded Shoulders', 'APT']} 
                        current={data.posture.alignment} 
                        onChange={(v: any) => setData({...data, posture: {...data.posture, alignment: v}})} 
                     />
                 </div>
             )}

             {/* Step 3: Mobility (E) & Movement (F) */}
             {step === 3 && (
                 <div className="animate-in slide-in-from-right duration-300">
                     <h3 className="text-primary font-bold text-sm uppercase mb-4 flex items-center gap-2"><Move size={16}/> Mobility & Strength</h3>
                     <div className="grid grid-cols-2 gap-4">
                         <RadioGroup label="Hip Mobility" options={['Good', 'Avg', 'Poor']} current={data.mobility.hip} onChange={(v: any) => setData({...data, mobility: {...data.mobility, hip: v}})} />
                         <RadioGroup label="Shoulder Mob." options={['Good', 'Avg', 'Poor']} current={data.mobility.shoulder} onChange={(v: any) => setData({...data, mobility: {...data.mobility, shoulder: v}})} />
                     </div>
                     <div className="mt-4">
                        <label className="label">Movement Patterns</label>
                        <select disabled={isLocked} className="input mb-3" value={data.movement.squat} onChange={e => setData({...data, movement: {...data.movement, squat: e.target.value}})}>
                            <option value="Stable">Squat: Stable</option>
                            <option value="Knee Collapse">Squat: Knee Collapse</option>
                            <option value="Pain">Squat: Pain</option>
                        </select>
                        <select disabled={isLocked} className="input" value={data.movement.core} onChange={e => setData({...data, movement: {...data.movement, core: e.target.value}})}>
                            <option value="Good">Core: Good</option>
                            <option value="Average">Core: Average</option>
                            <option value="Weak">Core: Weak</option>
                        </select>
                     </div>
                 </div>
             )}

            {/* Step 4: Stamina (G) & Level (H) */}
            {step === 4 && (
                <div className="animate-in slide-in-from-right duration-300">
                    <h3 className="text-primary font-bold text-sm uppercase mb-4 flex items-center gap-2"><Zap size={16}/> Fitness Level</h3>
                    <RadioGroup 
                        label="Overall Stamina" 
                        options={['Low', 'Moderate', 'Good']} 
                        current={data.stamina.overall} 
                        onChange={(v: any) => setData({...data, stamina: {...data.stamina, overall: v}})} 
                     />
                     <RadioGroup 
                        label="Fitness Category" 
                        options={['Beginner', 'Intermediate', 'Advanced']} 
                        current={data.fitnessLevel.category} 
                        onChange={(v: any) => setData({...data, fitnessLevel: {...data.fitnessLevel, category: v}})} 
                     />
                </div>
            )}

            {/* Step 5: Goals (I) & Notes (J) */}
            {step === 5 && (
                 <div className="animate-in slide-in-from-right duration-300">
                     <h3 className="text-primary font-bold text-sm uppercase mb-4 flex items-center gap-2"><ClipboardList size={16}/> Goals & Notes</h3>
                     <RadioGroup 
                        label="Primary Goal" 
                        options={['Weight Loss', 'Strength', 'Mobility', 'Gen. Fitness']} 
                        current={data.goals.primary} 
                        onChange={(v: any) => setData({...data, goals: {...data.goals, primary: v}})} 
                     />
                     <div className="mb-4">
                        <label className="label">Trainer Notes (Critical)</label>
                        <textarea disabled={isLocked} className="input h-24 resize-none" placeholder="Exercises to avoid, coaching style..." value={data.trainerNotes.avoidExercises} onChange={e => setData({...data, trainerNotes: {...data.trainerNotes, avoidExercises: e.target.value}})} />
                     </div>
                 </div>
            )}

             <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                 {step > 1 && (
                     <button onClick={handlePrev} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Back</button>
                 )}
                 {step < totalSteps ? (
                     <button onClick={handleNext} className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                         Next <ArrowRight size={18} />
                     </button>
                 ) : (
                     !isLocked && (
                        <button onClick={handleSave} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                            <Save size={18} /> Save Assessment
                        </button>
                     )
                 )}
             </div>
        </div>
    );
};

const SessionHistoryThread: React.FC<{ logs: SessionLog[] }> = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="bg-white rounded-[32px] p-8 text-center border border-dashed border-gray-200">
                <History size={32} className="mx-auto text-gray-300 mb-2"/>
                <p className="text-gray-400 font-medium">No session history yet.</p>
            </div>
        );
    }

    // Sort logs descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <h2 className="font-extrabold text-xl text-secondary px-2">Session History</h2>
            <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                {sortedLogs.map((log, idx) => (
                    <div key={idx} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></div>
                        
                        <div className="bg-white p-5 rounded-[24px] shadow-soft border border-gray-50">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-secondary text-sm">{new Date(log.date).toLocaleDateString()}</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">{log.trainerName}</p>
                                </div>
                                <div className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-md font-bold border border-green-100">
                                    Completed
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Activities Done</p>
                                    <p className="text-sm font-medium text-gray-700 leading-relaxed">{log.activitiesDone}</p>
                                </div>
                                
                                {log.focusForNext && (
                                    <div className="flex items-start gap-2 text-xs font-medium text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                        <Zap size={14} className="shrink-0 mt-0.5" />
                                        <span><strong>Next Focus:</strong> {log.focusForNext}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

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