
import { Booking, UserProfile, UserPackage } from '../types';

// UPDATED URL from your latest deployment
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyajFJHK6GJwYmcKrLGwLsXEd2iRFdIGzg-NZETDXA8fMCc-iziSBqqTNJ8sCvQuLOQ/exec'; 

export const submitBookingToSheet = async (booking: Booking, user: UserProfile | null) => {
  if (!SHEET_API_URL || !SHEET_API_URL.includes('/exec')) {
    console.error("Configuration Error: Invalid Sheet URL");
    return;
  }

  // Format Date to DD/MM/YYYY
  const dateObj = new Date(booking.date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const payload = {
    action: "create_booking", // Explicit action
    id: booking.id,
    date: formattedDate,
    time: booking.time,
    category: booking.category,
    status: booking.status,
    price: booking.price,
    trainerName: booking.trainerName,
    userName: user?.name || booking.userName || 'Guest',
    userPhone: user?.phoneNumber || booking.userPhone || 'N/A',
    address: booking.location,
    apartment: booking.apartmentName || '',
    flat: booking.flatNo || '',
    paymentId: booking.paymentId || 'N/A'
  };

  try {
    // Send as JSON text/plain to avoid CORS preflight issues in some envs
    await fetch(SHEET_API_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify(payload)
    });
    console.log("Booking submitted to sheet (blind mode)");
  } catch (error) {
    console.error("Error submitting to sheet:", error);
  }
};

export const submitProfileToSheet = async (user: UserProfile) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "update_profile",
        uid: user.uid,
        name: user.name,
        phone: user.phoneNumber,
        email: user.email,
        address: user.address,
        apartment: user.apartmentName,
        flat: user.flatNo,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
        injuries: user.injuries
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error(e);
    }
};

export const updateSessionCompletion = async (bookingId: string, activities: string) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "complete_session",
        bookingId: bookingId,
        activities: activities
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error(e);
    }
};

// NEW: Submit Package Purchase
export const submitPackageToSheet = async (user: UserProfile, pkg: UserPackage) => {
    if (!SHEET_API_URL) return;

    const payload = {
        action: "purchase_package", // Script should handle this action and route to new tab
        uid: user.uid,
        userName: user.name,
        userPhone: user.phoneNumber,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        totalSessions: pkg.totalSessions,
        purchaseDate: pkg.purchaseDate,
        expiryDate: pkg.expiryDate,
        isActive: pkg.isActive ? 1 : 0
    };

    try {
        await fetch(SHEET_API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        console.log("Package purchase submitted to sheet");
    } catch (e) {
        console.error("Error submitting package:", e);
    }
};
