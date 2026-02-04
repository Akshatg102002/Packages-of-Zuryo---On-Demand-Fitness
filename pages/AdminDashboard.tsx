
import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Layout, Users, CheckCircle, XCircle, Edit2, Package, MapPin, Eye, Download, Save, ChevronDown, Lock, Plus, Briefcase, Mail, Key, Loader2 } from 'lucide-react';
import { getAllBookings, getAllUsers, updateBooking, getAllTrainers, createTrainerAccount } from '../services/db';
import { Booking, UserProfile } from '../types';
import { useToast } from '../components/ToastContext';
import { MOCK_TRAINERS } from '../constants';
import { auth } from '../services/firebase';

export const AdminDashboard: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            // First, validate credentials hardcoded for this specific request
            if(email === 'admin@zuryo.co' && password === 'admin123') {
                // Try to login to Firebase to get permissions
                try {
                    await auth.signInWithEmailAndPassword(email, password);
                } catch (firebaseErr: any) {
                    // If user not found, create it (Bootstrap Admin)
                    if (firebaseErr.code === 'auth/user-not-found') {
                        try {
                            await auth.createUserWithEmailAndPassword(email, password);
                        } catch (createErr: any) {
                            setError("Failed to create admin user: " + createErr.message);
                            setIsLoggingIn(false);
                            return;
                        }
                    } else if (firebaseErr.code === 'auth/wrong-password') {
                        setError("Invalid Firebase Password (Sync Issue)");
                        setIsLoggingIn(false);
                        return;
                    } else {
                        setError("Auth Error: " + firebaseErr.message);
                        setIsLoggingIn(false);
                        return;
                    }
                }
                setIsAuthenticated(true);
            } else {
                setError('Invalid Admin Credentials');
            }
        } catch (e: any) {
            setError(e.message || 'Login failed');
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-primary font-black text-2xl">Z</div>
                    </div>
                    <h2 className="text-xl font-black text-center text-secondary mb-6">Admin Console</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="email" 
                            placeholder="Admin Email" 
                            className="w-full p-3 border rounded-lg"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full p-3 border rounded-lg"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                        <button type="submit" disabled={isLoggingIn} className="w-full bg-secondary text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                            {isLoggingIn && <Loader2 size={16} className="animate-spin" />}
                            Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return <AuthenticatedDashboard />;
};

const AuthenticatedDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'USERS' | 'TRAINERS'>('BOOKINGS');
    
    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans text-secondary overflow-hidden">
            {/* Admin Header - Compact */}
            <div className="bg-secondary text-white px-4 py-2 shadow-md flex justify-between items-center z-50 shrink-0 h-14">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-secondary font-black text-sm">Z</div>
                    <div>
                        <h1 className="text-base font-black tracking-tight leading-none">Zuryo Admin</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            Operations Console
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('BOOKINGS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'BOOKINGS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Layout size={14} /> Bookings
                    </button>
                    <button 
                        onClick={() => setActiveTab('USERS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Users size={14} /> Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('TRAINERS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'TRAINERS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Briefcase size={14} /> Trainers
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'BOOKINGS' ? <BookingsManager /> : 
                 activeTab === 'USERS' ? <UsersManager /> : 
                 <TrainersManager />}
            </div>
        </div>
    );
};

// --- BOOKINGS MANAGER ---
const BookingsManager = () => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [trainers, setTrainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ 
        trainerId: string, 
        trainerName: string, 
        trainerEmail: string, 
        status: string 
    }>({ trainerId: '', trainerName: '', trainerEmail: '', status: '' });

    const loadData = async () => {
        setLoading(true);
        const [bookingsData, trainersData] = await Promise.all([
            getAllBookings(),
            getAllTrainers()
        ]);
        setBookings(bookingsData);
        // Merge DB trainers with Mock trainers for demo purposes
        const dbTrainerEmails = new Set(trainersData.map(t => t.email));
        const combinedTrainers = [...trainersData];
        MOCK_TRAINERS.forEach(mt => {
             const email = `${mt.name.split(' ')[0].toLowerCase()}@zuryo.co`;
             if (!dbTrainerEmails.has(email)) {
                 combinedTrainers.push({
                     uid: mt.id,
                     name: mt.name,
                     email: email
                 });
             }
        });
        setTrainers(combinedTrainers);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const startEdit = (booking: Booking) => {
        setEditingId(booking.id);
        setEditForm({
            trainerId: booking.trainerId || '',
            trainerName: booking.trainerName,
            trainerEmail: booking.trainerEmail || '',
            status: booking.status
        });
    };

    const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const trainer = trainers.find(t => t.uid === selectedId);
        if (trainer) {
            setEditForm(prev => ({
                ...prev,
                trainerId: trainer.uid,
                trainerName: trainer.name,
                trainerEmail: trainer.email
            }));
        } else {
            // Reset if "Assign Trainer" selected
            setEditForm(prev => ({ ...prev, trainerId: '', trainerName: 'Matching with Pro...', trainerEmail: '' }));
        }
    };

    const saveEdit = async (bookingId: string) => {
        try {
            await updateBooking(bookingId, {
                trainerId: editForm.trainerId,
                trainerName: editForm.trainerName,
                trainerEmail: editForm.trainerEmail ? editForm.trainerEmail.toLowerCase().trim() : "",
                status: editForm.status as any
            });
            showToast("Booking updated successfully", "success");
            setEditingId(null);
            loadData();
        } catch(e) {
            showToast("Failed to update", "error");
        }
    };

    const exportCSV = () => {
        const headers = ["ID", "Date", "Time", "Category", "Customer Name", "Customer Phone", "Location", "Status", "Trainer Name", "Trainer Email", "Price", "Payment ID", "History Notes", "Session Log"];
        const csvContent = [
            headers.join(","),
            ...bookings.map(b => [
                b.id,
                new Date(b.date).toLocaleDateString(),
                b.time,
                b.category,
                `"${b.userName || ''}"`,
                `"${b.userPhone || ''}"`,
                `"${b.location?.replace(/\n/g, ' ') || ''}"`,
                b.status,
                `"${b.trainerName || ''}"`,
                `"${b.trainerEmail || ''}"`,
                b.price,
                b.paymentId || '',
                `"${b.sessionNotes || ''}"`,
                `"${b.sessionLog || ''}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Zuryo_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            (b.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
            (b.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (b.id || '').includes(searchTerm);
        
        const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 bg-white flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={loadData} className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-secondary hover:bg-gray-200 transition-colors" title="Refresh">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Dense Table Container */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[1400px]">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase font-black tracking-wider border-b border-gray-200">
                            <th className="p-3 w-20 border-r border-gray-200">ID</th>
                            <th className="p-3 w-24 border-r border-gray-200">Date</th>
                            <th className="p-3 w-20 border-r border-gray-200">Time</th>
                            <th className="p-3 w-24 border-r border-gray-200">Category</th>
                            <th className="p-3 w-32 border-r border-gray-200">Customer Name</th>
                            <th className="p-3 w-28 border-r border-gray-200">Customer Phone</th>
                            <th className="p-3 w-64 border-r border-gray-200">Location</th>
                            <th className="p-3 w-28 border-r border-gray-200">Status</th>
                            <th className="p-3 w-48 border-r border-gray-200">Trainer (Name/Email)</th>
                            <th className="p-3 w-20 border-r border-gray-200">Price</th>
                            <th className="p-3 w-32 border-r border-gray-200">Payment ID</th>
                            <th className="p-3 w-40 border-r border-gray-200">History Notes</th>
                            <th className="p-3 w-40 text-center">Session Log</th>
                            <th className="p-3 w-16 text-center sticky right-0 bg-gray-100 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.1)]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100">
                        {filteredBookings.map((b, idx) => {
                            const isEditing = editingId === b.id;
                            return (
                                <tr key={b.id} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="p-3 font-mono text-gray-400 border-r border-gray-100 select-all">#{b.id.slice(-4)}</td>
                                    <td className="p-3 font-bold text-secondary border-r border-gray-100">{new Date(b.date).toLocaleDateString()}</td>
                                    <td className="p-3 border-r border-gray-100">{b.time}</td>
                                    <td className="p-3 border-r border-gray-100 font-bold text-primaryDark">{b.category}</td>
                                    <td className="p-3 border-r border-gray-100 font-bold">{b.userName}</td>
                                    <td className="p-3 border-r border-gray-100 text-gray-500 font-mono">{b.userPhone}</td>
                                    <td className="p-3 border-r border-gray-100 truncate max-w-[250px]" title={b.location}>
                                        {b.apartmentName ? `${b.apartmentName}, ${b.flatNo}, ${b.location}` : b.location}
                                    </td>
                                    
                                    {/* Editable Status */}
                                    <td className="p-3 border-r border-gray-100">
                                        {isEditing ? (
                                            <select 
                                                className="w-full p-1 border border-blue-300 rounded bg-white text-xs"
                                                value={editForm.status}
                                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                                            >
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <Badge status={b.status} />
                                        )}
                                    </td>

                                    {/* Editable Trainer */}
                                    <td className="p-3 border-r border-gray-100">
                                        {isEditing ? (
                                            <div className="relative">
                                                <select 
                                                    className="w-full p-1 pr-6 border border-blue-300 rounded bg-white text-xs appearance-none"
                                                    value={editForm.trainerId}
                                                    onChange={handleTrainerChange}
                                                >
                                                    <option value="">-- Assign Trainer --</option>
                                                    {trainers.map(t => (
                                                        <option key={t.uid} value={t.uid}>
                                                            {t.name} ({t.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={10} className="absolute right-2 top-2 pointer-events-none text-gray-400" />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${b.trainerName === "Matching with Pro..." ? "text-orange-400 italic" : "text-secondary"}`}>
                                                    {b.trainerName}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{b.trainerEmail}</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-3 border-r border-gray-100 font-mono">₹{b.price}</td>
                                    <td className="p-3 border-r border-gray-100 font-mono text-[10px] text-gray-400 truncate max-w-[100px]" title={b.paymentId}>{b.paymentId || '-'}</td>
                                    
                                    {/* Text Areas for History and Log */}
                                    <td className="p-2 border-r border-gray-100">
                                        <textarea readOnly className="w-full h-16 text-[10px] bg-gray-50 border border-gray-100 rounded p-1 resize-none outline-none focus:bg-white" value={b.sessionNotes || ''}></textarea>
                                    </td>
                                    <td className="p-2 text-center border-r border-gray-100">
                                        <textarea readOnly className="w-full h-16 text-[10px] bg-green-50 border border-green-100 text-green-900 rounded p-1 resize-none outline-none focus:bg-white" value={b.sessionLog || ''}></textarea>
                                    </td>

                                    {/* Action Buttons */}
                                    <td className="p-3 text-center sticky right-0 bg-white border-l border-gray-100 group-hover:bg-blue-50/50">
                                        {isEditing ? (
                                            <div className="flex justify-center gap-1">
                                                <button onClick={() => saveEdit(b.id)} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save size={14}/></button>
                                                <button onClick={() => setEditingId(null)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle size={14}/></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(b)} className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- TRAINERS MANAGER ---
const TrainersManager = () => {
    const { showToast } = useToast();
    const [trainers, setTrainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    const [newTrainer, setNewTrainer] = useState({ name: '', email: '', password: '' });
    const [creating, setCreating] = useState(false);

    const loadTrainers = async () => {
        setLoading(true);
        const data = await getAllTrainers();
        setTrainers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTrainers();
    }, []);

    const handleCreateTrainer = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createTrainerAccount(newTrainer.name, newTrainer.email, newTrainer.password);
            showToast("Trainer account created successfully!", "success");
            setNewTrainer({ name: '', email: '', password: '' });
            setShowCreateForm(false);
            loadTrainers();
        } catch(e: any) {
            showToast(e.message || "Failed to create trainer", "error");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex h-full">
            {/* List */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-secondary text-lg">Registered Trainers</h2>
                    <button 
                        onClick={() => setShowCreateForm(true)} 
                        className="bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary hover:text-secondary transition-colors"
                    >
                        <Plus size={14} /> Add Trainer
                    </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainers.map((t, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-primary shadow-sm">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-secondary">{t.name}</h3>
                                    <p className="text-xs text-gray-500">{t.email}</p>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded mt-2 inline-block font-bold uppercase">Active</span>
                                </div>
                            </div>
                        ))}
                        {trainers.length === 0 && !loading && (
                            <div className="col-span-3 text-center text-gray-400 py-10">No trainers found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-secondary">New Trainer Account</h3>
                            <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><XCircle size={20} className="text-gray-400"/></button>
                        </div>
                        <form onSubmit={handleCreateTrainer} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Trainer Name</label>
                                <div className="relative mt-1">
                                    <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="text" required className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="John Doe" value={newTrainer.name} onChange={e => setNewTrainer({...newTrainer, name: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Email Address (Login ID)</label>
                                <div className="relative mt-1">
                                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="email" required className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="trainer@zuryo.co" value={newTrainer.email} onChange={e => setNewTrainer({...newTrainer, email: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Set Password</label>
                                <div className="relative mt-1">
                                    <Key size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <input type="password" required minLength={6} className="w-full pl-10 p-2.5 bg-gray-50 border rounded-lg text-sm font-bold" placeholder="******" value={newTrainer.password} onChange={e => setNewTrainer({...newTrainer, password: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" disabled={creating} className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-primary hover:text-secondary transition-colors mt-4">
                                {creating ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- USERS MANAGER ---
const UsersManager = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(u => 
        (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber?.includes(searchTerm)) ||
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex h-full">
            <div className="w-2/3 flex flex-col border-r border-gray-200 bg-white">
                {/* User List Header */}
                <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center gap-3 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search Users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-secondary"
                        />
                    </div>
                    <button onClick={loadUsers} className="p-2 bg-gray-100 border border-gray-200 rounded-lg text-secondary hover:bg-gray-200">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* User List Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-100 text-gray-600 text-[10px] uppercase font-black tracking-wider border-b border-gray-200">
                                <th className="p-3">User</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3">Package</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs divide-y divide-gray-100">
                            {filteredUsers.map(u => (
                                <tr key={u.uid} className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedUser?.uid === u.uid ? 'bg-blue-50 border-l-4 border-primary' : ''}`} onClick={() => setSelectedUser(u)}>
                                    <td className="p-3">
                                        <div className="font-bold text-secondary">{u.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-400">{u.gender}, {u.age} yrs</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold">{u.phoneNumber}</div>
                                        <div className="text-[10px] text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="p-3">
                                        {u.activePackage?.isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                                <Package size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button className="text-primary hover:bg-primary/10 p-1.5 rounded">
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Panel */}
            <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 border-l border-gray-200">
                {selectedUser ? (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg">
                                {selectedUser.name?.charAt(0) || 'U'}
                            </div>
                            <h2 className="text-xl font-black text-secondary">{selectedUser.name}</h2>
                            <p className="text-gray-500 text-xs">{selectedUser.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Height</p>
                                <p className="font-black text-secondary text-sm">{selectedUser.height || '-'} cm</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-gray-200 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p>
                                <p className="font-black text-secondary text-sm">{selectedUser.weight || '-'} kg</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location Details</h3>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                                <div className="text-xs text-gray-600 font-medium">
                                    <p className="font-bold text-secondary mb-1 text-sm">{selectedUser.apartmentName}, {selectedUser.flatNo}</p>
                                    <p className="leading-relaxed">{selectedUser.address}</p>
                                </div>
                            </div>
                        </div>

                        {selectedUser.activePackage?.isActive && (
                            <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-2">Membership</h3>
                                <div className="pl-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-green-800 text-sm">{selectedUser.activePackage.name}</span>
                                        <span className="text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded text-green-700">
                                            {selectedUser.activePackage.sessionsUsed} / {selectedUser.activePackage.totalSessions}
                                        </span>
                                    </div>
                                    <div className="w-full bg-green-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{width: `${(selectedUser.activePackage.sessionsUsed / selectedUser.activePackage.totalSessions) * 100}%`}}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 text-right">Expires: {new Date(selectedUser.activePackage.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Health Profile</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="text-gray-500 font-medium">Injuries</span>
                                    <span className="font-bold text-red-500">{selectedUser.injuries || 'None'}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="text-gray-500 font-medium">Goal</span>
                                    <span className="font-bold text-secondary">{selectedUser.goal || '-'}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="text-gray-500 font-medium">Activity Level</span>
                                    <span className="font-bold text-secondary">{selectedUser.activityLevel || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <Users size={32} className="mb-2 opacity-20" />
                        <p className="font-bold text-xs">Select user to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Badge = ({ status }: { status: string }) => {
    const styles: any = {
        confirmed: "bg-green-100 text-green-800 border-green-200",
        completed: "bg-blue-100 text-blue-800 border-blue-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
};
