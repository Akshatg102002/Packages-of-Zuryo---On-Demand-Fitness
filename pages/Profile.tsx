import React, { useEffect, useState } from 'react';
import { MapPin, LogOut, ChevronRight, FileText, Info, Phone, Edit2, Save, UserCircle, ShieldCheck, Calendar, Lock, Loader2, X, Ruler, Weight, Activity, Mail, Package, CheckCircle, Headphones } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { getBookings, getUserProfile, logoutUser, saveUserProfile } from '../services/db';
import { auth } from '../services/firebase';
import { useHistory } from 'react-router-dom';
import { submitProfileToSheet } from '../services/sheetService';
import { useToast } from '../components/ToastContext';

interface ProfileProps {
    onLogout: () => void;
    onLoginReq: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout, onLoginReq }) => {
  const history = useHistory();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'PERSONAL' | 'ADDRESS' | null>(null);

  const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=142B5D&color=fff&name=";

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        if (auth.currentUser) {
            const profile = await getUserProfile(auth.currentUser.uid);
            setUserProfile(profile);
            const userBookings = await getBookings(auth.currentUser.uid);
            setBookings(userBookings);
        }
        setLoading(false);
    };
    loadData();
  }, []);

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
      // Profile details are locked for editing by user
      return; 
  };

  const MenuItem = ({ icon, label, onClick, badge, subLabel }: any) => (
      <button 
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="w-full bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/20 transition-all mb-3 group relative overflow-hidden"
      >
          <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors">
                  {icon}
              </div>
              <div className="text-left">
                  <span className="font-bold text-secondary text-sm block">{label}</span>
                  {subLabel && <span className="text-[10px] text-gray-400 font-medium">{subLabel}</span>}
              </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
            <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
          </div>
      </button>
  );

  if (!auth.currentUser) {
      return (
        <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 shadow-inner">
                <Lock size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-secondary mb-2">Profile Locked</h2>
                <p className="text-gray-500 max-w-[240px] mx-auto text-sm leading-relaxed">
                    Please log in to manage your profile and view settings.
                </p>
            </div>
            <button onClick={onLoginReq} className="bg-primary text-secondary px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Log In
            </button>
        </div>
      );
  }

  if (loading) return <div className="pt-40 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="pt-8 md:pt-10 px-6 pb-28 min-h-screen max-w-2xl mx-auto relative">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="relative mb-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <img 
                        src={DEFAULT_AVATAR + (userProfile?.name || 'User')} 
                        className="w-full h-full object-cover" 
                        alt="Profile" 
                    />
                </div>
            </div>
            <h1 className="text-2xl font-extrabold text-secondary">{userProfile?.name || 'User'}</h1>
            <p className="text-sm text-gray-500 font-medium">{userProfile?.phoneNumber || userProfile?.email}</p>
        </div>

        {/* Stats Grid - Hide bookings count if package user? Or show package stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
             {userProfile?.activePackage?.isActive ? (
                 <div className="bg-gradient-to-br from-secondary to-slate-800 text-white p-5 rounded-[24px] border border-white/10 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="w-10 h-10 bg-white/10 text-primary rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                        <Package size={20} />
                    </div>
                    <p className="text-2xl font-black">{userProfile.activePackage.sessionsUsed} / {userProfile.activePackage.totalSessions}</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-wide">Sessions Used</p>
                 </div>
             ) : (
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <Activity size={20} />
                    </div>
                    <p className="text-2xl font-black text-secondary">{bookings.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sessions</p>
                </div>
             )}
            
            <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-soft flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
                    <Calendar size={20} />
                </div>
                <p className="text-lg font-black text-secondary">Jan 2026</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Member Since</p>
            </div>
        </div>

        {/* Active Package Card (If exists) */}
        {userProfile?.activePackage?.isActive && (
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Current Membership</h3>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Active</span>
                            <h3 className="text-xl font-black text-secondary mt-2">{userProfile.activePackage.name}</h3>
                            <p className="text-xs text-gray-500 font-medium">Valid until {new Date(userProfile.activePackage.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-secondary">
                             <Package size={24} />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                         <div className="flex justify-between text-xs font-bold text-gray-500">
                             <span>Progress</span>
                             <span>{userProfile.activePackage.sessionsUsed} of {userProfile.activePackage.totalSessions} Sessions</span>
                         </div>
                         <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-secondary rounded-full" 
                                style={{width: `${(userProfile.activePackage.sessionsUsed / userProfile.activePackage.totalSessions) * 100}%`}}
                             ></div>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* Account Settings */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Account Settings</h3>
            
            <MenuItem 
                icon={<UserCircle size={20} />} 
                label="Personal Details" 
                subLabel="Name, Age, Gender, Stats"
                onClick={() => setActiveModal('PERSONAL')} 
            />
            <MenuItem 
                icon={<MapPin size={20} />} 
                label="Saved Addresses" 
                subLabel="Home, Office"
                onClick={() => setActiveModal('ADDRESS')} 
            />
            
            {/* Conditional Menu Item: Package Details vs Booking History */}
            {userProfile?.activePackage?.isActive ? (
                 <MenuItem 
                    icon={<Package size={20} />} 
                    label="My Package Details" 
                    subLabel="View usage & validity"
                    onClick={() => { /* Could open a modal or just rely on the card above */ }} 
                    badge="Active"
                />
            ) : (
                <MenuItem 
                    icon={<Calendar size={20} />} 
                    label="Booking History" 
                    subLabel="View past and upcoming sessions"
                    onClick={() => history.push('/bookings')} 
                    badge={bookings.filter(b => b.status === 'confirmed').length > 0 ? `${bookings.filter(b => b.status === 'confirmed').length}` : undefined}
                />
            )}
        </div>

        {/* Support & Legal */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Support & Legal</h3>
            
            <MenuItem 
                icon={<Info size={20} />} 
                label="About Zuryo" 
                onClick={() => history.push('/about-us')} 
            />
            <MenuItem 
                icon={<FileText size={20} />} 
                label="Terms & Policies" 
                onClick={() => history.push('/terms')} 
            />
            <MenuItem 
                icon={<Phone size={20} />} 
                label="Contact Support" 
                onClick={() => history.push('/contact')} 
            />
        </div>

        {/* New Contact Card */}
        <div className="mb-8 bg-blue-50/50 rounded-[24px] p-6 border border-blue-100">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                     <Headphones size={20} />
                 </div>
                 <div>
                     <h3 className="font-bold text-secondary text-sm">Need Help?</h3>
                     <p className="text-[10px] text-gray-500">We are here for you 24/7</p>
                 </div>
             </div>
             <div className="space-y-3">
                 <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                     <Phone size={16} className="text-primary" />
                     <span className="text-xs font-bold text-gray-600">+91 73537 62555</span>
                 </div>
                 <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                     <Mail size={16} className="text-primary" />
                     <span className="text-xs font-bold text-gray-600">founder@zuryo.co</span>
                 </div>
             </div>
        </div>

        <button 
            onClick={onLogout}
            className="w-full p-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
            <LogOut size={20} /> Log Out
        </button>

        <div className="mt-8 text-center pb-8">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Version 1.0.4</p>
        </div>

        {/* Modals - Rendered outside the flow to prevent z-index issues */}
        {activeModal === 'PERSONAL' && userProfile && (
            <PersonalDetailsModal 
                profile={userProfile} 
                onClose={() => setActiveModal(null)} 
            />
        )}

        {activeModal === 'ADDRESS' && userProfile && (
            <AddressModal 
                profile={userProfile} 
                onClose={() => setActiveModal(null)} 
            />
        )}
    </div>
  );
};

// --- Modal Components ---

const PersonalDetailsModal: React.FC<{ 
    profile: UserProfile, 
    onClose: () => void 
}> = ({ profile, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-secondary">Personal Details</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mb-4 flex items-center gap-2 border border-yellow-100">
                    <Lock size={14}/> Details are locked. Contact support to update.
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Full Name</label>
                        <div className="relative mt-1">
                            <UserCircle size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="text" value={profile.name || ''} disabled className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500" />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Phone Number</label>
                        <div className="relative mt-1">
                            <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="tel" value={profile.phoneNumber || ''} disabled className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Age</label>
                            <input type="number" value={profile.age || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Gender</label>
                            <input type="text" value={profile.gender || ''} disabled className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Height (cm)</label>
                            <div className="relative mt-1">
                                <Ruler size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input type="number" value={profile.height || ''} disabled className="w-full p-3 pl-9 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Weight (kg)</label>
                            <div className="relative mt-1">
                                <Weight size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input type="number" value={profile.weight || ''} disabled className="w-full p-3 pl-9 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500" />
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Email</label>
                         <div className="relative mt-1">
                            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="text" value={profile.email || ''} disabled className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 font-medium" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddressModal: React.FC<{ 
    profile: UserProfile, 
    onClose: () => void 
}> = ({ profile, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-secondary">Manage Address</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mb-4 flex items-center gap-2 border border-yellow-100">
                    <Lock size={14}/> Addresses are locked. Contact support to update.
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Apartment</label>
                            <input 
                                type="text" 
                                value={profile.apartmentName || ''} 
                                disabled
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Flat No</label>
                            <input 
                                type="text" 
                                value={profile.flatNo || ''} 
                                disabled
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 mt-1" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Street Address</label>
                        <div className="relative mt-1">
                            <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <textarea 
                                value={profile.address || ''} 
                                disabled
                                className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-500 min-h-[100px] resize-none" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};