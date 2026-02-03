import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar, LocateFixed, Loader2, Clock, MapPin, CheckCircle, CreditCard, Sun, Moon, Sparkles, Map, User, Phone, Ticket, Package, Lock, Star } from 'lucide-react';
import { CATEGORIES, PACKAGES } from '../constants';
import { Booking, UserProfile, UserPackage } from '../types';
import { addBooking, saveUserProfile, checkPhoneDuplicate, saveUserPackage } from '../services/db';
import { submitBookingToSheet, submitPackageToSheet } from '../services/sheetService';
import firebase from 'firebase/compat/app';
import { useHistory } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

interface BookSessionProps {
    currentUser: firebase.User | null;
    userProfile: UserProfile | null;
    onLoginReq: () => void;
}

// ---------------------------------------------------
// Geofencing Logic
// ---------------------------------------------------
const SERVICE_ZONES = [
    { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
    { name: 'Bellandur', lat: 12.9260, lng: 77.6762 },
    { name: 'Sarjapur - Wipro', lat: 12.9165, lng: 77.6737 },
    { name: 'Sarjapur - Fire Station', lat: 12.9255, lng: 77.6705 } 
];
const MAX_RADIUS_KM = 1.0; 

// Haversine formula to calculate distance
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1); 
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

const deg2rad = (deg: number) => {
    return deg * (Math.PI/180)
}

export const BookSession: React.FC<BookSessionProps> = ({ currentUser, userProfile, onLoginReq }) => {
    const history = useHistory();
    const { showToast } = useToast();
    
    // Booking Type State: 'SESSION' (default) or 'PACKAGE'
    const [bookingType, setBookingType] = useState<'SESSION' | 'PACKAGE'>('SESSION');

    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    
    // Validated Coordinates for Geofencing
    const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: userProfile?.name || '',
        email: userProfile?.email || '',
        phone: userProfile?.phoneNumber || '',
        address: userProfile?.address || '',
        apartmentName: userProfile?.apartmentName || '',
        flatNo: userProfile?.flatNo || '',
        gender: userProfile?.gender || ''
    });
    
    useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                name: userProfile.name || prev.name,
                email: userProfile.email || prev.email,
                phone: userProfile.phoneNumber || prev.phone,
                address: userProfile.address || prev.address,
                apartmentName: userProfile.apartmentName || prev.apartmentName,
                flatNo: userProfile.flatNo || prev.flatNo,
                gender: userProfile.gender || prev.gender
            }));
        }
    }, [userProfile]);

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    // Reset coords if user manually types address to force re-verification
    const handleAddressChange = (newAddress: string) => {
        setFormData(prev => ({ ...prev, address: newAddress }));
        // If user modifies address, we clear coords so we can re-geocode/check on Next
        setUserCoords(null); 
    };

    // --- Active Package Check ---
    if (userProfile?.activePackage?.isActive) {
        return (
            <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30">
                    <Package size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-secondary mb-2">Active Package Found</h2>
                    <p className="text-gray-500 max-w-[280px] mx-auto text-sm leading-relaxed mb-2">
                        You are already subscribed to the <span className="text-secondary font-bold">{userProfile.activePackage.name}</span> plan.
                    </p>
                    <p className="text-gray-400 text-xs">
                        You cannot book a new session or package until your current package is complete or discontinued.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left w-full max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-gray-500 uppercase">Sessions</span>
                         <span className="text-sm font-black text-secondary">{userProfile.activePackage.sessionsUsed} / {userProfile.activePackage.totalSessions}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{width: `${(userProfile.activePackage.sessionsUsed/userProfile.activePackage.totalSessions)*100}%`}}></div>
                    </div>
                </div>
                <button onClick={() => history.push('/profile')} className="text-primary font-bold text-sm underline">
                    View Package Details
                </button>
            </div>
        );
    }

    // --- Logic for Date & Time ---
    const getNext3Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 3; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const next3Days = getNext3Days();

    const generateSlots = (date: Date | null) => {
        if (!date) return { morning: [], evening: [] };
        
        const morningSlots: string[] = [];
        const eveningSlots: string[] = [];
        const now = new Date();
        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();

        const addSlotIfValid = (hour: number, minute: number, targetArray: string[]) => {
            const timeDate = new Date(date);
            timeDate.setHours(hour, minute, 0, 0);
            
            if (!isToday || timeDate > now) {
                let hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const minuteStr = minute === 0 ? '00' : minute;
                targetArray.push(`${hour12}:${minuteStr} ${ampm}`);
            }
        };

        // Morning: 5:00 AM to 10:00 AM
        for (let h = 5; h <= 10; h++) {
            addSlotIfValid(h, 0, morningSlots);
            if (h < 10) addSlotIfValid(h, 30, morningSlots);
        }

        // Evening: 5:00 PM to 8:00 PM (20:00)
        for (let h = 17; h <= 20; h++) {
            addSlotIfValid(h, 0, eveningSlots);
            if (h < 20) addSlotIfValid(h, 30, eveningSlots);
        }

        return { morning: morningSlots, evening: eveningSlots };
    };

    const availableSlots = generateSlots(selectedDate);

    // --- Check Serviceability (Geofence) ---
    const checkServiceability = (lat: number, lng: number): boolean => {
        for (const zone of SERVICE_ZONES) {
            const dist = getDistanceFromLatLonInKm(lat, lng, zone.lat, zone.lng);
            if (dist <= MAX_RADIUS_KM) {
                console.log(`Matched zone: ${zone.name} (${dist.toFixed(2)}km)`);
                return true;
            }
        }
        return false;
    };

    // --- Steps Logic ---

    const handleNext = async () => {
        if (step === 1) {
            if (bookingType === 'SESSION') {
                if (!selectedCategory) { showToast("Please select a workout type", "error"); return; }
            } else {
                if (!selectedPackageId) { showToast("Please select a package", "error"); return; }
            }

            if (!formData.address) {
                showToast("Please enter your location to proceed", "error");
                return;
            }

            // GEOFENCING & VALIDATION CHECK
            let validLocation = false;
            let currentCoords = userCoords;

            setIsProcessing(true);

            // 1. Text Keyword Check (Fast Pass - Loose)
            const lowerAddr = formData.address.toLowerCase();
            const allowedKeywords = ['sarjapur', 'hsr', 'bellandur'];
            const hasKeywordMatch = allowedKeywords.some(k => lowerAddr.includes(k));

            try {
                // 2. Geocoding
                if (!currentCoords) {
                    if (formData.address.length > 3) {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&addressdetails=1&limit=1`);
                        const results = await response.json();
                        
                        if (results && results.length > 0) {
                            const lat = parseFloat(results[0].lat);
                            const lng = parseFloat(results[0].lon);
                            currentCoords = { lat, lng };
                            setUserCoords(currentCoords);
                        }
                    }
                }

                // 3. Radius Check
                let insideRadius = false;
                if (currentCoords) {
                    insideRadius = checkServiceability(currentCoords.lat, currentCoords.lng);
                }

                // 4. Combined Validation
                if (insideRadius || hasKeywordMatch) {
                    validLocation = true;
                } else {
                    validLocation = false;
                }

                if (!validLocation) {
                    showToast("We currently serve Sarjapur, HSR, and Bellandur. Please check your address.", "error");
                    setIsProcessing(false);
                    return;
                }

            } catch (e) {
                console.warn("Location verification error", e);
                if (hasKeywordMatch) {
                    validLocation = true;
                } else {
                    showToast("Could not verify location. Please use the 'Detect' button or ensure address mentions service areas.", "error");
                    setIsProcessing(false);
                    return;
                }
            }
            
            setIsProcessing(false);

            if (!currentUser) {
                onLoginReq();
                return;
            }

            // If Package selected, SKIP Step 2 (Date/Time)
            if (bookingType === 'PACKAGE') {
                setStep(3); // Go directly to details
                return;
            }
        }
        
        if (step === 2) {
            if (!selectedDate) { showToast("Please select a date", "error"); return; }
            if (!selectedTime) { showToast("Please select a time slot", "error"); return; }
        }

        if (step === 3) {
             if (!formData.name || !formData.phone || !formData.apartmentName || !formData.flatNo || !formData.address || !formData.gender) {
                 showToast("Please fill in all mandatory details (*)", "error");
                 return;
             }
             if (formData.phone.length < 10) { showToast("Invalid Phone Number", "error"); return; }
        }

        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (bookingType === 'PACKAGE' && step === 3) {
            setStep(1); // Go back to package selection
        } else {
            setStep(prev => prev - 1);
        }
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lng: longitude });

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, { headers: { 'Accept-Language': 'en-US' } });
                const data = await response.json();
                if (data && data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                    showToast("Location updated successfully", "success");
                }
            } catch (error) {
                setFormData(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` })); 
                showToast("Used coordinates as address", "success");
            } finally {
                setLocLoading(false);
            }
        }, () => {
            showToast("Unable to retrieve location.", "error");
            setLocLoading(false);
        }, { enableHighAccuracy: true });
    };

    const processPayment = async () => {
        if (!currentUser) return;
        setIsProcessing(true);

        if (userProfile && formData.phone !== userProfile.phoneNumber) {
            const isDup = await checkPhoneDuplicate(formData.phone, currentUser.uid);
            if (isDup) {
                showToast("Phone number already in use by another account.", "error");
                setIsProcessing(false);
                return;
            }
        }

        // Save detailed profile
        if (userProfile) {
            await saveUserProfile({ 
                ...userProfile, 
                name: formData.name,
                phoneNumber: formData.phone,
                address: formData.address,
                apartmentName: formData.apartmentName,
                flatNo: formData.flatNo,
                gender: formData.gender
            });
        }

        let price = 0;
        let desc = "";
        let selectedPkg = null;

        if (bookingType === 'SESSION') {
             price = 399;
             desc = `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Session`;
        } else {
             selectedPkg = PACKAGES.find(p => p.id === selectedPackageId);
             price = selectedPkg?.price || 0;
             desc = `${selectedPkg?.name} Package`;
        }

        const options = {
            key: "rzp_test_1DP5mmOlF5G5ag",
            amount: price * 100,
            currency: "INR",
            name: "Zuryo",
            description: desc,
            image: "https://www.karmisalon.com/wp-content/uploads/2026/01/Zuryo_L.webp",
            handler: async function (response: any) {
                if (response.razorpay_payment_id) {
                    if (bookingType === 'SESSION') {
                        await finalizeBooking(response.razorpay_payment_id);
                    } else {
                        await finalizePackagePurchase(response.razorpay_payment_id, selectedPkg!);
                    }
                } else {
                    showToast("Payment verification failed", "error");
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: formData.name,
                contact: formData.phone,
                email: formData.email
            },
            theme: { color: "#142B5D" },
            modal: { 
                ondismiss: () => {
                    setIsProcessing(false);
                    showToast("Payment cancelled", "error");
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any){
                showToast(response.error.description || "Payment Failed", "error");
                setIsProcessing(false);
            });
            rzp.open();
        } catch (e) {
            showToast("Payment gateway failed to load", "error");
            setIsProcessing(false);
        }
    };

    const finalizeBooking = async (paymentId: string) => {
        if (!currentUser || !selectedCategory || !selectedTime || !selectedDate) return;

        const newBooking: Booking = {
            id: Date.now().toString(),
            userId: currentUser.uid,
            trainerName: "Matching with Pro...",
            category: CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Fitness',
            date: selectedDate.toISOString(),
            time: selectedTime,
            status: 'confirmed',
            price: 399,
            location: `${formData.apartmentName}, ${formData.flatNo}, ${formData.address}`,
            apartmentName: formData.apartmentName,
            flatNo: formData.flatNo,
            userName: formData.name,
            userPhone: formData.phone,
            sessionNotes: 'Standard Booking',
            paymentId: paymentId,
            createdAt: Date.now()
        };

        await addBooking(newBooking);
        await submitBookingToSheet(newBooking, userProfile);
        
        showToast("Booking Confirmed! 🎉", "success");
        setIsProcessing(false);
        history.push('/bookings');
    };

    const finalizePackagePurchase = async (paymentId: string, pkg: { id: string, name: string, price: number, sessions: number }) => {
        if (!currentUser || !userProfile) return;

        const today = new Date();
        const expiry = new Date(today);
        expiry.setMonth(today.getMonth() + 1); // 1 Month Validity

        const newPackage: UserPackage = {
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            totalSessions: pkg.sessions,
            sessionsUsed: 0,
            purchaseDate: today.toISOString(),
            expiryDate: expiry.toISOString(),
            isActive: true
        };

        await saveUserPackage(currentUser.uid, newPackage);
        await submitPackageToSheet(userProfile, newPackage);

        showToast("Package Purchased Successfully! 🎉", "success");
        setIsProcessing(false);
        history.push('/profile'); // Redirect to profile to see package
    };

    const isNextDisabled = () => {
        if (step === 1) {
            if (bookingType === 'SESSION') return !selectedCategory || !formData.address;
            return !selectedPackageId || !formData.address;
        }
        if (step === 2) return !selectedDate || !selectedTime;
        if (step === 3) return !formData.name || !formData.phone || !formData.apartmentName || !formData.flatNo || !formData.address || !formData.gender;
        return false;
    }

    return (
        <div className="pt-8 md:pt-4 pb-16 px-6 min-h-screen flex flex-col items-center justify-start max-w-4xl mx-auto">
            
            <div className="w-full mb-8 px-4">
                <div className="flex items-center justify-between relative z-10">
                    {(bookingType === 'PACKAGE' ? [1, 3, 4] : [1, 2, 3, 4]).map((i, idx) => (
                        <div key={i} className={`flex flex-col items-center gap-2 transition-all duration-300 ${step >= i ? 'scale-110' : 'opacity-80'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-base transition-all duration-300 shadow-md ${
                                step >= i ? 'bg-primary text-secondary' : 'bg-white text-gray-400 border-2 border-gray-200'
                            }`}>
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                    <div className="absolute top-6 left-0 w-full h-3 bg-gray-100 rounded-full -z-10"></div>
                </div>
                <div className="flex justify-between mt-3 text-xs font-black uppercase tracking-widest text-gray-400">
                    <span>Selection</span>
                    {bookingType === 'SESSION' && <span>Time</span>}
                    <span>Details</span>
                    <span>Pay</span>
                </div>
            </div>

            <div className="w-full bg-white md:p-10 md:rounded-[40px] md:shadow-2xl md:shadow-secondary/5 transition-all rounded-[32px] p-6 text-secondary shadow-lg border border-gray-100">
                
                <div className="flex-1 min-h-[400px]">
                    {step === 1 && (
                        /* Step 1 Code (Omitted for brevity, unchanged) */
                        <div className="animate-in slide-in-from-right duration-300">
                            <div className="bg-gray-100 p-1 rounded-xl flex mb-8">
                                <button 
                                    onClick={() => { setBookingType('SESSION'); setSelectedPackageId(null); }}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${bookingType === 'SESSION' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500'}`}
                                >
                                    Single Session
                                </button>
                                <button 
                                    onClick={() => { setBookingType('PACKAGE'); setSelectedCategory(null); }}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 ${bookingType === 'PACKAGE' ? 'bg-white shadow-sm text-secondary' : 'text-gray-500'}`}
                                >
                                    <Sparkles size={14} className="text-primary"/> Packages
                                </button>
                            </div>
                            
                            {/* ... Content of Step 1 ... */}
                            {bookingType === 'SESSION' ? (
                                <>
                                    <h2 className="text-2xl font-black text-secondary mb-1">Choose Workout</h2>
                                    <p className="text-gray-400 text-sm font-medium mb-6">Select your preferred training style</p>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                disabled={!cat.active}
                                                onClick={() => cat.active && setSelectedCategory(cat.id)}
                                                className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-start gap-3 group overflow-hidden h-32 md:h-40 justify-between ${
                                                    cat.active 
                                                        ? selectedCategory === cat.id 
                                                            ? 'border-secondary bg-secondary shadow-xl shadow-secondary/20' 
                                                            : `border-transparent ${cat.bg} hover:shadow-lg` 
                                                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-60' 
                                                }`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                                    cat.active 
                                                    ? selectedCategory === cat.id ? 'bg-primary text-secondary' : 'bg-white shadow-sm'
                                                    : 'bg-white/50 text-gray-300'
                                                }`}>
                                                    <cat.icon size={24} strokeWidth={2.5} className={selectedCategory === cat.id ? '' : cat.color} />
                                                </div>
                                                <div className="text-left w-full">
                                                    <span className={`font-black text-base leading-tight block ${selectedCategory === cat.id ? 'text-white' : 'text-secondary'}`}>{cat.name}</span>
                                                    {cat.active && <span className={`text-[10px] font-bold uppercase tracking-wide block mt-1 ${selectedCategory === cat.id ? 'text-white/60' : 'text-gray-400'}`}>60 Mins</span>}
                                                </div>
                                                {!cat.active && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                         <span className="bg-secondary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg transform -rotate-6">Coming Soon</span>
                                                    </div>
                                                )}
                                                {selectedCategory === cat.id && (
                                                    <div className="absolute top-3 right-3 text-white animate-in zoom-in">
                                                        <CheckCircle size={20} fill="currentColor" className="text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-black text-secondary mb-1">Select Package</h2>
                                    <p className="text-gray-400 text-sm font-medium mb-6">Commit to fit and save more</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {PACKAGES.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                onClick={() => setSelectedPackageId(pkg.id)}
                                                className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col text-left gap-4 ${
                                                    selectedPackageId === pkg.id 
                                                    ? 'border-primary bg-secondary text-white shadow-xl shadow-secondary/30' 
                                                    : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-lg'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div>
                                                        <span className="bg-primary text-secondary px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{pkg.validity}</span>
                                                        <h3 className={`text-xl font-black mt-2 ${selectedPackageId === pkg.id ? 'text-white' : 'text-secondary'}`}>{pkg.name}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-black ${selectedPackageId === pkg.id ? 'text-primary' : 'text-secondary'}`}>₹{pkg.price}</p>
                                                        <p className={`text-[10px] font-bold uppercase ${selectedPackageId === pkg.id ? 'text-white/50' : 'text-gray-400'}`}>Total Price</p>
                                                    </div>
                                                </div>
                                                <div className={`p-4 rounded-xl flex items-center gap-3 ${selectedPackageId === pkg.id ? 'bg-white/10' : 'bg-gray-50'}`}>
                                                    <Star className="text-primary" size={20} fill="currentColor" />
                                                    <div>
                                                        <p className={`text-sm font-bold ${selectedPackageId === pkg.id ? 'text-white' : 'text-secondary'}`}>{pkg.sessions} Sessions</p>
                                                        <p className={`text-xs ${selectedPackageId === pkg.id ? 'text-white/60' : 'text-gray-400'}`}>{pkg.description}</p>
                                                    </div>
                                                </div>
                                                {selectedPackageId === pkg.id && (
                                                    <div className="absolute top-3 right-3 text-white animate-in zoom-in">
                                                        <CheckCircle size={24} fill="currentColor" className="text-primary" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Service Location *</h3>
                                    <button onClick={handleCurrentLocation} className="text-[10px] font-bold text-primary flex items-center gap-1 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 hover:text-primaryDark">
                                        {locLoading ? <Loader2 size={10} className="animate-spin" /> : <LocateFixed size={10} />} Detect
                                    </button>
                                </div>
                                <textarea 
                                    placeholder="Enter your Area (e.g. HSR Layout)" 
                                    value={formData.address} 
                                    onChange={e=>handleAddressChange(e.target.value)} 
                                    className="input-field bg-white min-h-[60px] resize-none" 
                                />
                                <p className="text-[10px] text-gray-400 mt-2">Currently serving: Sarjapur, HSR, Bellandur</p>
                            </div>
                        </div>
                    )}

                    {step === 2 && bookingType === 'SESSION' && (
                        /* Step 2 Code (Time) */
                        <div className="animate-in slide-in-from-right duration-300">
                             {/* ... Omitted for brevity, logic unchanged ... */}
                             <h2 className="text-2xl font-black text-secondary mb-1">When to train?</h2>
                             <p className="text-gray-400 text-sm font-medium mb-6">Select a convenient date and time</p>
                             <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
                                {next3Days.map((date) => {
                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    return (
                                        <button
                                            key={date.toString()}
                                            onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                            className={`min-w-[100px] py-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                                                isSelected 
                                                ? 'border-primary bg-secondary text-white shadow-lg shadow-secondary/20 scale-105' 
                                                : 'border-gray-100 bg-white text-gray-400 hover:border-primary/30'
                                            }`}
                                        >
                                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                                                {isToday ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className="text-2xl font-black">{date.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedDate ? (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                                    {availableSlots.morning.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Sun size={14} className="text-orange-400" /> Morning Session
                                            </h3>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                {availableSlots.morning.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedTime(slot)}
                                                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                                            selectedTime === slot 
                                                            ? 'bg-primary text-secondary border-primary shadow-md scale-105' 
                                                            : 'bg-white border-gray-100 text-gray-600 hover:border-primary/30 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {availableSlots.evening.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Moon size={14} className="text-blue-500" /> Evening Session
                                            </h3>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                {availableSlots.evening.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedTime(slot)}
                                                        className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                                            selectedTime === slot 
                                                            ? 'bg-primary text-secondary border-primary shadow-md scale-105' 
                                                            : 'bg-white border-gray-100 text-gray-600 hover:border-primary/30 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {availableSlots.morning.length === 0 && availableSlots.evening.length === 0 && (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Clock className="mx-auto text-gray-300 mb-3" size={40} />
                                            <p className="text-gray-500 font-bold text-sm">All slots booked for this date.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
                                    <p className="text-gray-400 font-bold text-sm">Select a date above to view available slots</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        /* Step 3 Code (Details) */
                        <div className="animate-in slide-in-from-right duration-300 space-y-6">
                            <h2 className="text-2xl font-black text-secondary mb-1">Contact Details</h2>
                            <p className="text-gray-400 text-sm font-medium">Where should the trainer arrive?</p>
                            
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Full Name *</label>
                                        <div className="relative mt-1">
                                            <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" placeholder="John Doe" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Gender *</label>
                                        <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="input-field mt-1">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Phone *</label>
                                        <div className="relative mt-1">
                                            <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})} className="input-field" placeholder="9876543210" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Email</label>
                                        <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="input-field mt-1" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Apartment *</label>
                                            <input type="text" placeholder="Apartment Name" value={formData.apartmentName} onChange={e=>setFormData({...formData, apartmentName: e.target.value})} className="input-field bg-white mt-1" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Flat No *</label>
                                            <input type="text" placeholder="Flat No" value={formData.flatNo} onChange={e=>setFormData({...formData, flatNo: e.target.value})} className="input-field bg-white mt-1" />
                                        </div>
                                    </div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-1">Full Address *</label>
                                    <textarea placeholder="Street Address / Landmark" value={formData.address} onChange={e=>handleAddressChange(e.target.value)} className="input-field bg-white min-h-[60px] resize-none mt-1" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in slide-in-from-right duration-300">
                             <h2 className="text-2xl font-black text-secondary mb-1">Confirm {bookingType === 'SESSION' ? 'Session' : 'Package'}</h2>
                             <p className="text-gray-400 text-sm font-medium mb-6">Review details before payment</p>

                             {/* Premium Ticket UI */}
                             <div className="relative bg-secondary text-white rounded-[24px] overflow-hidden shadow-2xl shadow-secondary/20">
                                {/* Top Section (Navy) */}
                                <div className="p-6 relative">
                                    
                                    {/* Removed the background Sparkles icon here */}
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                                {bookingType === 'SESSION' ? 'Session Pass' : 'Package Deal'}
                                            </span>
                                            <h3 className="text-2xl font-black mt-2 text-primary">
                                                {bookingType === 'SESSION' 
                                                    ? CATEGORIES.find(c => c.id === selectedCategory)?.name 
                                                    : PACKAGES.find(p => p.id === selectedPackageId)?.name}
                                            </h3>
                                            <p className="text-white/60 text-xs font-medium">
                                                {bookingType === 'SESSION' 
                                                    ? '60 Minutes • Personal Training'
                                                    : `${PACKAGES.find(p => p.id === selectedPackageId)?.sessions} Sessions • 1 Month Validity`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black tracking-tight">
                                                ₹{bookingType === 'SESSION' ? 399 : PACKAGES.find(p => p.id === selectedPackageId)?.price}
                                            </div>
                                            <div className="text-[10px] text-white/50 font-bold uppercase">Total Price</div>
                                        </div>
                                    </div>

                                    {bookingType === 'SESSION' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Date</p>
                                                <p className="font-bold text-lg">{selectedDate?.getDate()} {selectedDate?.toLocaleDateString('en-US', { month: 'short' })}</p>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Time</p>
                                                <p className="font-bold text-lg">{selectedTime}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tear Line */}
                                <div className="relative flex items-center justify-between">
                                    <div className="w-6 h-6 bg-white rounded-full -ml-3"></div>
                                    <div className="flex-1 border-b-2 border-dashed border-white/20 mx-2"></div>
                                    <div className="w-6 h-6 bg-white rounded-full -mr-3"></div>
                                </div>

                                {/* Bottom Section (White) */}
                                <div className="bg-white p-6 text-secondary">
                                    <div className="flex items-start gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-tight">{formData.apartmentName}, {formData.flatNo}</p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{formData.address}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle size={16} />
                                        </div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Payment secured by <span className="font-bold text-gray-800">Razorpay</span>
                                        </p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-4">
                    {step > 1 && (
                        <button onClick={handleBack} className="px-6 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <button 
                        onClick={step === 4 ? processPayment : handleNext}
                        disabled={isProcessing || (step !== 4 && isNextDisabled())}
                        className={`flex-1 bg-primary text-secondary py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:grayscale disabled:hover:scale-100`}
                    >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : (step === 4 ? 'Confirm & Pay' : 'Next Step')} 
                        {!isProcessing && step !== 4 && <ChevronRight size={20} />}
                        {!isProcessing && step === 4 && <CreditCard size={20} />}
                    </button>
                </div>
            </div>
            
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 14px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #0f172a;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .input-field:focus {
                    border-color: #FFB435;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(255, 180, 53, 0.1);
                }
            `}</style>
        </div>
    );
};