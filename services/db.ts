
import { db, auth } from './firebase';
import firebase from 'firebase/compat/app';
import { Booking, UserProfile, AssessmentData, SessionLog, UserPackage, ErrorLog } from '../types';

// --- User Profile Operations ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docSnap = await db.collection("users").doc(uid).get();
    if (docSnap.exists) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (e) {
    console.error("Error fetching profile", e);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
        const snap = await db.collection("users").get();
        const users = snap.docs.map(doc => doc.data() as UserProfile);
        // Sort by createdAt descending
        return users.sort((a, b) => {
             const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
             const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
             return dateB - dateA;
        });
    } catch (e) {
        console.error("Error fetching all users", e);
        return [];
    }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await db.collection("users").doc(profile.uid).set(profile, { merge: true });
  } catch (e) {
    console.error("Error saving profile", e);
    throw e;
  }
};

export const deleteUser = async (uid: string): Promise<void> => {
    try {
        await db.collection("users").doc(uid).delete();
    } catch (e) {
        console.error("Error deleting user", e);
        throw e;
    }
};

export const saveUserPackage = async (userId: string, pkg: UserPackage): Promise<void> => {
  try {
    // We update the activePackage field on the user profile
    await db.collection("users").doc(userId).update({
        activePackage: pkg
    });
  } catch (e) {
    console.error("Error saving package", e);
    throw e;
  }
};

export const checkPhoneDuplicate = async (phoneNumber: string, currentUid: string): Promise<boolean> => {
  try {
    const querySnapshot = await db.collection("users").where("phoneNumber", "==", phoneNumber).get();
    if (querySnapshot.empty) return false;
    let isDuplicate = false;
    querySnapshot.forEach((doc) => {
        if (doc.id !== currentUid) isDuplicate = true;
    });
    return isDuplicate;
  } catch (e) {
    console.error("Error checking phone", e);
    return false;
  }
};

// --- Booking Operations ---

export const addBooking = async (booking: Booking): Promise<void> => {
  try {
    await db.collection("bookings").doc(booking.id).set(booking);
  } catch (e) {
    console.error("Error adding booking", e);
    throw e;
  }
};

export const updateBookingStatus = async (bookingId: string, status: string, paymentId?: string): Promise<void> => {
  try {
    const updateData: any = { status };
    if (paymentId) updateData.paymentId = paymentId;
    await db.collection("bookings").doc(bookingId).update(updateData);
  } catch (e) {
    console.error("Error updating booking status", e);
    throw e;
  }
};

export const getBookings = async (uid: string): Promise<Booking[]> => {
  try {
    const snap = await db.collection("bookings").where("userId", "==", uid).get();
    const data = snap.docs.map(doc => doc.data() as Booking);
    return data.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Error fetching bookings", e);
    return [];
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        const snap = await db.collection("bookings").get();
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Booking));
        // Sort by createdAt descending (latest booked on top)
        return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (e) {
        console.error("Error fetching all bookings", e);
        return [];
    }
};

export const subscribeToAllBookings = (callback: (bookings: Booking[]) => void): () => void => {
    return db.collection("bookings").onSnapshot((snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Booking));
        const sortedData = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(sortedData);
    }, (error) => {
        console.error("Error subscribing to bookings", error);
    });
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
    try {
        await db.collection("bookings").doc(bookingId).update(updates);
    } catch (e) {
        console.error("Error updating booking", e);
        throw e;
    }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
    try {
        await db.collection("bookings").doc(bookingId).delete();
    } catch (e) {
        console.error("Error deleting booking", e);
        throw e;
    }
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await db.collection("bookings").doc(bookingId).update({ status: 'cancelled' });
  } catch (e) {
    console.error("Error cancelling booking", e);
  }
};

// --- Trainer Portal Operations ---

export const getTrainerProfile = async (uid: string): Promise<any | null> => {
  try {
    const docSnap = await db.collection("trainers").doc(uid).get();
    if (docSnap.exists) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    console.error("Error fetching trainer profile", e);
    return null;
  }
};

export const getAllTrainers = async (): Promise<any[]> => {
    try {
        const snap = await db.collection("trainers").get();
        if (snap.empty) {
             return []; 
        }
        return snap.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
    } catch (e) {
        console.error("Error fetching trainers", e);
        return [];
    }
};

export const createTrainerAccount = async (name: string, email: string, pass: string): Promise<void> => {
    // Hack: Initialize a secondary app to create a user without logging out the admin
    const config = {
        apiKey: "AIzaSyBrjDlJeHPo66cf8EpM0YQjXSsjmighNXU",
        authDomain: "zuryo-2f32a.firebaseapp.com",
        projectId: "zuryo-2f32a",
        storageBucket: "zuryo-2f32a.firebasestorage.app",
        messagingSenderId: "1061685847140",
        appId: "1:1061685847140:web:2d2a120bd0775fb0132b71"
    };
    
    // Check if app already initialized
    let secondaryApp = firebase.apps.find(app => app.name === "SecondaryApp");
    if (!secondaryApp) {
        secondaryApp = firebase.initializeApp(config, "SecondaryApp");
    }

    try {
        const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, pass);
        if (userCred.user) {
            await userCred.user.updateProfile({ displayName: name });
            // Create in 'trainers' collection
            await db.collection("trainers").doc(userCred.user.uid).set({
                name,
                email,
                specialties: ["General Fitness"], // Default
                price: 499,
                bio: "Certified Trainer",
                createdAt: new Date().toISOString()
            });
        }
        await secondaryApp.auth().signOut();
    } catch (e) {
        console.error("Error creating trainer", e);
        throw e;
    }
};

export const updateTrainer = async (uid: string, data: any): Promise<void> => {
    try {
        await db.collection("trainers").doc(uid).update(data);
    } catch (e) {
        console.error("Error updating trainer", e);
        throw e;
    }
};

export const deleteTrainer = async (uid: string): Promise<void> => {
    try {
        await db.collection("trainers").doc(uid).delete();
    } catch (e) {
        console.error("Error deleting trainer", e);
        throw e;
    }
};

// Modified to search by Email OR Name
export const getTrainerBookings = async (trainerEmail: string, trainerName?: string): Promise<Booking[]> => {
    try {
        const bookingsMap = new Map<string, Booking>();

        // 1. Fetch by Email (if authenticated properly)
        if (trainerEmail) {
            const emailQuery = trainerEmail.toLowerCase().trim();
            const snap = await db.collection("bookings").where("trainerEmail", "==", emailQuery).get();
            snap.docs.forEach(doc => {
                bookingsMap.set(doc.id, { ...doc.data(), id: doc.id } as Booking);
            });
        }

        // 2. Fetch by Name (Fallback for manual admin assignment)
        if (trainerName) {
             const snapName = await db.collection("bookings").where("trainerName", "==", trainerName).get();
             snapName.docs.forEach(doc => {
                 bookingsMap.set(doc.id, { ...doc.data(), id: doc.id } as Booking);
             });
        }

        const data = Array.from(bookingsMap.values());
        return data.sort((a, b) => {
            const statusOrder: Record<string, number> = {
                'confirmed': 0,
                'pending': 1,
                'completed': 2,
                'failed': 3,
                'cancelled': 4
            };
            const statusA = statusOrder[a.status] ?? 99;
            const statusB = statusOrder[b.status] ?? 99;
            
            if (statusA !== statusB) return statusA - statusB;

            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            
            if (dateA !== dateB) {
                if (statusA < 2) {
                    return dateA - dateB;
                } else {
                    return dateB - dateA;
                }
            }

            const parseTime = (timeStr: string) => {
                if (!timeStr) return 0;
                const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (!match) return 0;
                let hours = parseInt(match[1], 10);
                const minutes = parseInt(match[2], 10);
                const period = match[3].toUpperCase();
                if (period === 'PM' && hours < 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                return hours * 60 + minutes;
            };

            if (statusA < 2) {
                return parseTime(a.time) - parseTime(b.time);
            } else {
                return parseTime(b.time) - parseTime(a.time);
            }
        });
    } catch(e) {
        console.error("Error fetching trainer bookings", e);
        return [];
    }
};

export const markBookingCompleted = async (bookingId: string, log: string, nextRecommendation?: string): Promise<void> => {
    const updateData: any = {
        status: 'completed',
        sessionLog: log
    };
    if (nextRecommendation) {
        updateData.sessionNotes = nextRecommendation;
    }
    await db.collection("bookings").doc(bookingId).update(updateData);
};

export const saveAssessment = async (userId: string, assessment: AssessmentData): Promise<void> => {
    await db.collection("users").doc(userId).update({ latestAssessment: assessment });
};

export const saveSessionLog = async (userId: string, log: SessionLog): Promise<void> => {
    await db.collection("users").doc(userId).update({ sessionHistory: firebase.firestore.FieldValue.arrayUnion(log) });
};

export const logoutUser = async (): Promise<void> => {
  await auth.signOut();
};

export const logError = async (log: Omit<ErrorLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Sanitize details to prevent Firestore errors (circular refs, undefined, etc)
    let safeDetails = log.details;
    try {
      safeDetails = JSON.parse(JSON.stringify(log.details, (key, value) => {
        if (value instanceof Error) {
          return { message: value.message, stack: value.stack, name: value.name };
        }
        return value;
      }));
    } catch (e) {
      safeDetails = String(log.details);
    }

    const errorLog: ErrorLog = {
      ...log,
      details: safeDetails,
      id,
      timestamp: Date.now(),
    };
    await db.collection("error_logs").doc(id).set(errorLog);
  } catch (e) {
    console.error("Failed to save error log", e);
  }
};

export const getLogs = async (): Promise<ErrorLog[]> => {
  try {
    const snap = await db.collection("error_logs").get();
    const data = snap.docs.map(doc => doc.data() as ErrorLog);
    return data.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error("Error fetching logs", e);
    return [];
  }
};
