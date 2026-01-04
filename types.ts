
export interface ClinicalCondition {
  condition: string;
  ageAtDiagnosis: number;
}

export interface CheckupLog {
  id: string;
  date: string;
  weight: number;
  heartRate: number;
  systolic: number;
  diastolic: number;
  bloodSugar: number;
}

// Added CalendarEvent interface to fix import error in Calendar.tsx
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bloodPressure: { systolic: number; diastolic: number };
  bloodSugar: number;
  diet: string;
  activity: string;
  hydration: number;
  steps: number;
  heartRate: number;
  spo2: number;
  breathing: number;
  sleep: number;
  clinicalHistory: ClinicalCondition[];
  manualDiseases: string;    
  uploadedFile: string | null;
  familyHistory: Array<{ condition: string; ageAtDiagnosis: number }>;
  checkups: CheckupLog[];
  // Added events to store health scheduler data
  events: CalendarEvent[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: 'Cardiology' | 'Orthopedics' | 'Dentistry' | 'General Physician' | 'Neurology';
  email: string;
  image: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Updated DashboardTab to include 'calendar'
export type DashboardTab = 'insights' | 'mental-health' | 'vitality' | 'medical' | 'trends' | 'calendar';
