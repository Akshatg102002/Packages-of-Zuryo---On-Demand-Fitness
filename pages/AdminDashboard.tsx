
import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Calendar, User, Mail, Save, Filter, CheckCircle, XCircle, Layout, Users, Edit2, Loader2, Package, MapPin, Eye } from 'lucide-react';
import { getAllBookings, getAllUsers, updateBooking } from '../services/db';
import { Booking, UserProfile } from '../types';
import { useToast } from '../components/ToastContext';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'USERS'>('BOOKINGS');
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-secondary">
            {/* Admin Header */}
            <div className="bg-secondary text-white px-6 py-4 shadow-md flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-secondary font-black text-sm">Z</div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none">Zuryo Admin</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
                            Operations Console
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('BOOKINGS')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'BOOKINGS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Layout size={14} /> Bookings
                    </button>
                    <button 
                        onClick={() => setActiveTab('USERS')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-primary text-secondary' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Users size={14} /> Users
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {activeTab === 'BOOKINGS' ? <BookingsManager /> : <UsersManager />}
            </div>
        </div>
    );
};

// --- BOOKINGS MANAGER ---
const BookingsManager = () => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    
    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ trainerName: string, trainerEmail: string, status: string }>({ trainerName: '', trainerEmail: '', status: '' });

    const loadBookings = async () => {
        setLoading(true);
        const data = await getAllBookings();
        setBookings(data);
        setLoading(false);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const startEdit = (booking: Booking) => {
        setEditingId(booking.id);
        setEditForm({
            trainerName: booking.trainerName === "Matching with Pro..." ? "" : booking.trainerName,
            trainerEmail: booking.trainerEmail || '',
            status: booking.status
        });
    };

    const saveEdit = async (bookingId: string) => {
        try {
            await updateBooking(bookingId, {
                trainerName: editForm.trainerName || "Matching with Pro...",
                trainerEmail: editForm.trainerEmail ? editForm.trainerEmail.toLowerCase().trim() : "",
                status: editForm.status as any
            });
            showToast("Booking updated successfully", "success");
            setEditingId(null);
            loadBookings();
        } catch(e) {
            showToast("Failed to update", "error");
        }
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search ID, Name, Location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                        />
                    </div>
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <button onClick={loadBookings} className="p-2.5 bg-white border border-gray-200 rounded-xl text-secondary hover:bg-gray-50 transition-colors" title="Refresh">
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-wider border-b border-gray-100">
                            <th className="p-4 w-20">ID</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Location</th>
                            <th className="p-4 w-48">Trainer Name</th>
                            <th className="p-4 w-48">Trainer Email</th>
                            <th className="p-4 w-32">Status</th>
                            <th className="p-4 text-right w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-400">No bookings found.</td></tr>
                        ) : (
                            filteredBookings.map(b => {
                                const isEditing = editingId === b.id;
                                return (
                                    <tr key={b.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 font-mono text-xs text-gray-400">#{b.id.slice(-6)}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-secondary">{new Date(b.date).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">{b.time}</div>
                                            <div className="text-[10px] text-primary font-bold uppercase mt-1">{b.category}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold">{b.userName}</div>
                                            <div className="text-xs text-gray-500">{b.userPhone}</div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <div className="text-xs text-gray-600 line-clamp-2" title={b.location}>
                                                {b.apartmentName ? `${b.apartmentName}, ${b.flatNo}` : b.location}
                                            </div>
                                        </td>
                                        
                                        {/* Editable Fields */}
                                        <td className="p-4">
                                            {isEditing ? (
                                                <input 
                                                    className="w-full p-2 border border-blue-200 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                                    value={editForm.trainerName}
                                                    onChange={e => setEditForm({...editForm, trainerName: e.target.value})}
                                                    placeholder="Trainer Name"
                                                />
                                            ) : (
                                                <span className={`text-xs font-bold ${b.trainerName === "Matching with Pro..." ? "text-orange-400 italic" : "text-secondary"}`}>
                                                    {b.trainerName}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isEditing ? (
                                                <input 
                                                    className="w-full p-2 border border-blue-200 rounded-lg text-xs font-medium bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                                    value={editForm.trainerEmail}
                                                    onChange={e => setEditForm({...editForm, trainerEmail: e.target.value})}
                                                    placeholder="email@zuryo.co"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-500 break-all">{b.trainerEmail || '-'}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {isEditing ? (
                                                <select 
                                                    className="w-full p-2 border border-blue-200 rounded-lg text-xs font-bold bg-white outline-none"
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
                                        
                                        <td className="p-4 text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => saveEdit(b.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><CheckCircle size={16}/></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"><XCircle size={16}/></button>
                                                </div>
                                            ) : (
                                                <button onClick={() => startEdit(b)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                {/* User List Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-secondary"
                        />
                    </div>
                    <button onClick={loadUsers} className="p-2.5 bg-white border border-gray-200 rounded-xl text-secondary hover:bg-gray-50">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* User List Table */}
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                            <tr className="text-gray-500 text-[10px] uppercase font-black tracking-wider">
                                <th className="p-4">User</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Package</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredUsers.map(u => (
                                <tr key={u.uid} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${selectedUser?.uid === u.uid ? 'bg-blue-50' : ''}`} onClick={() => setSelectedUser(u)}>
                                    <td className="p-4">
                                        <div className="font-bold text-secondary">{u.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-400">{u.gender}, {u.age} yrs</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs font-bold">{u.phoneNumber}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {u.activePackage?.isActive ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                                                <Package size={10} /> Active
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-primary hover:bg-primary/10 p-2 rounded-lg">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Detail Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto h-[calc(100vh-140px)] p-6">
                {selectedUser ? (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-secondary text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg">
                                {selectedUser.name?.charAt(0) || 'U'}
                            </div>
                            <h2 className="text-2xl font-black text-secondary">{selectedUser.name}</h2>
                            <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Height</p>
                                <p className="font-black text-secondary">{selectedUser.height || '-'} cm</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Weight</p>
                                <p className="font-black text-secondary">{selectedUser.weight || '-'} kg</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Location</h3>
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                                <MapPin size={18} className="text-primary mt-0.5" />
                                <div className="text-sm text-gray-600 font-medium">
                                    <p className="font-bold text-secondary mb-1">{selectedUser.apartmentName}, {selectedUser.flatNo}</p>
                                    {selectedUser.address}
                                </div>
                            </div>
                        </div>

                        {selectedUser.activePackage?.isActive && (
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Active Membership</h3>
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-green-800">{selectedUser.activePackage.name}</span>
                                        <span className="text-xs font-bold bg-white px-2 py-1 rounded text-green-600">
                                            {selectedUser.activePackage.sessionsUsed} / {selectedUser.activePackage.totalSessions} Used
                                        </span>
                                    </div>
                                    <div className="w-full bg-green-200 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500" style={{width: `${(selectedUser.activePackage.sessionsUsed / selectedUser.activePackage.totalSessions) * 100}%`}}></div>
                                    </div>
                                    <p className="text-[10px] text-green-700 mt-2 text-right">Expires: {new Date(selectedUser.activePackage.expiryDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Health Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500">Injuries</span>
                                    <span className="font-bold text-secondary">{selectedUser.injuries || 'None'}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500">Goal</span>
                                    <span className="font-bold text-secondary">{selectedUser.goal || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                        <User size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">Select a user to view details</p>
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
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
};
