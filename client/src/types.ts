export enum DocumentType {
  Insurance = "Insurance",
  MedicalReport = "Medical Report",
  Aadhaar = "Aadhaar",
  Other = "Other"
}

export enum CheckInMethod {
  Login = "login",
  ManualButton = "manualButton",
  SmsReply = "smsReply",
  PushAction = "pushAction"
}

export enum CheckInStatus {
  Verified = "Verified",
  AwaitingCheckIn = "AwaitingCheckIn",
  Unverified = "Unverified",
  EmergencyVerificationActive = "EmergencyVerificationActive"
}

export interface User {
  uid: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface EmergencyProfile {
  uid: string;
  name: string;
  age: number;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalInfo: string;
  nomineePin: string; // 4-6 digit code, stored securely
  nomineePhone: string; // used for SMS verification
}

export interface SecuritySession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
}

export interface SecurityAlert {
  id: string;
  uid: string;
  timestamp: string;
  event: string;
  details: string;
}

export interface DocumentVaultItem {
  id: string;
  uid: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  notes: string;
  isNomineeAccessSecured: boolean;
}

export interface PolicyExtraction {
  id: string;
  documentId: string;
  uid: string;
  policyNumber: string | null;
  expiryDate: string | null;
  coverage: string | null;
  nominee: string | null;
  hospitalName: string | null;
  extractedAt: string;
}

export interface EmailRecord {
  id: string;
  uid: string;
  subject: string;
  sender: string;
  category: "Bills" | "Insurance" | "Travel" | "Healthcare" | "Appointments";
  date: string;
  extractedSummary: string;
  rawSnippet: string;
}

export interface BillItem {
  id: string;
  uid: string;
  name: string;
  dueDate: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  category: "Upcoming Bills" | "Loans/EMIs" | "School Fees";
}

export interface AppointmentItem {
  id: string;
  uid: string;
  name: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  location?: string;
  notes?: string;
}

export interface ContinuityPlan {
  id: string;
  uid: string;
  activatedAt: string;
  triggeredBy: "manual" | "missedCheckIn";
  lastKnownCheckIn?: string;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    batteryLevel?: number; // e.g. 0 to 100
    isCharging?: boolean;
  };
  thingsToPayThisWeek: string[];
  pendingBills: string[];
  upcomingAppointments: string[];
  medicinesToRefill: string[];
  insuranceClaimChecklist: string[];
  importantEmails: string[];
}

export interface CheckInEntry {
  date: string; // YYYY-MM-DD
  timestamp: string;
  method: CheckInMethod;
}

export interface CheckInStats {
  uid: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate: string | null;
  lastCheckInTimestamp: string | null;
  status: CheckInStatus;
  lastKnownLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
    batteryLevel?: number;
    isCharging?: boolean;
  } | null;
}

export interface CheckInSettings {
  uid: string;
  checkInWindowStart: string; // e.g., "08:00"
  checkInWindowEnd: string; // e.g., "20:00"
  reminderIntervals: number[]; // e.g., [120, 60, 15] in minutes before deadline
  gracePeriodMinutes: number; // e.g., 60
}
