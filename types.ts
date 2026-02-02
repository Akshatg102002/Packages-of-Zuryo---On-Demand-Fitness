
export interface Trainer {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  price: number;
  imageUrl: string;
  bio: string;
  distance: string; // e.g., "0.8 km away"
  available: boolean;
  experience: number; // Years
  certifications: string[];
}

export interface SessionLog {
  date: string; // ISO String
  trainerName: string;
  
  // K. Session Outcome
  completed: 'Yes' | 'No';
  comfortLevel: 'Very Comfortable' | 'Comfortable' | 'Uncomfortable';
  verbalFeedback?: string;
  nextRecommendation?: string;
  focusForNext?: string;
  
  // What was done
  activitiesDone: string;
}

export interface AssessmentData {
  // B. Health, Safety & Lifestyle
  medicalConditions: string[]; // BP, Diabetes, etc.
  injuryHistory: string[]; // Knee, Lower Back, etc.
  currentPain: {
    exists: boolean;
    location?: string;
    scale?: number; // 1-10
  };
  lifestyle: {
    sedentary: boolean;
    movement: 'Low' | 'Moderate' | 'High';
    sleep: 'Poor' | 'Average' | 'Good';
  };
  safetyClearance: {
    fitToExercise: boolean;
    doctorRestrictions: boolean;
    restrictionDetails?: string;
  };

  // C. Measurements
  measurements: {
    height?: string;
    weight?: string;
    waist?: string;
    hip?: string;
    chest?: string;
    bicepsLeft?: string;
    bicepsRight?: string;
  };

  // D. Posture
  posture: {
    alignment: string; // Neutral, Forward Head, etc.
    balance: 'Stable' | 'Slight Imbalance' | 'Poor';
    notes?: string;
  };

  // E. Mobility & Flexibility
  mobility: {
    hip: 'Good' | 'Average' | 'Poor';
    ankle: 'Good' | 'Average' | 'Poor';
    shoulder: 'Good' | 'Average' | 'Poor';
    spine: 'Good' | 'Average' | 'Poor';
  };
  flexibility: {
    hamstrings: 'Tight' | 'Moderate' | 'Flexible';
    hipFlexors: 'Tight' | 'Moderate' | 'Flexible';
    chest: 'Tight' | 'Moderate' | 'Flexible';
  };
  
  // F. Movement & Strength
  movement: {
    squat: string;
    lunge: string;
    push: string;
    core: string;
  };

  // G. Stamina
  stamina: {
    overall: 'Low' | 'Moderate' | 'Good';
    breathControl: 'Comfortable' | 'Breathless quickly';
  };

  // H. Overall Level
  fitnessLevel: {
    category: 'Beginner' | 'Intermediate' | 'Advanced';
    riskLevel: 'Low' | 'Medium' | 'High';
  };

  // I. Goals
  goals: {
    primary: string; // Weight Loss, Strength, etc.
    secondary?: string;
    intensityPref: 'Low' | 'Moderate' | 'High';
    timePref: 'Morning' | 'Evening';
    equipment: string;
    dislikes?: string;
  };

  // J. Trainer Notes (Critical)
  trainerNotes: {
    avoidExercises?: string;
    goodExercises?: string;
    coachingStyle: 'Calm' | 'Motivational' | 'Technical';
    behavioralNotes?: string;
  };
}

export interface Booking {
  id: string;
  userId: string;
  trainerId?: string; // Assigned trainer ID
  trainerName: string; 
  trainerEmail?: string; // Added for precise assignment
  category: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  price: number;
  location: string; // Full address string
  
  // Specific Location Details
  apartmentName?: string;
  flatNo?: string;
  
  userName?: string;
  userPhone?: string;

  sessionNotes?: string;
  paymentId?: string;
  createdAt: number;
}

export interface UserPackage {
  id: string;
  name: string; // '12 Sessions' | '16 Sessions'
  price: number;
  totalSessions: number;
  sessionsUsed: number;
  purchaseDate: string;
  expiryDate: string;
  isActive: boolean; // Controlled by Admin (0 or 1 in sheet/db)
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phoneNumber?: string;
  
  // Detailed Address
  address?: string; // Street/Area
  apartmentName?: string;
  flatNo?: string;
  
  age: string;
  gender: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
  injuries: string;
  onboardingComplete: boolean;
  walletBalance?: number;
  
  // Package Data
  activePackage?: UserPackage;

  // Stored Assessment (Single Source of Truth)
  latestAssessment?: AssessmentData;
  sessionHistory?: SessionLog[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image: string;
}

export enum ViewState {
  HOME = 'HOME',
  BOOK_SESSION = 'BOOK_SESSION',
  OUR_TRAINERS = 'OUR_TRAINERS',
  BOOKINGS = 'BOOKINGS',
  PROFILE = 'PROFILE',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  POLICIES = 'POLICIES', // Privacy Policy
  REFUND_POLICY = 'REFUND_POLICY',
  POSH_POLICY = 'POSH_POLICY',
  TERMS = 'TERMS',
  TRAINER_PORTAL = 'TRAINER_PORTAL'
}

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  bg: string;
  active: boolean; 
}
