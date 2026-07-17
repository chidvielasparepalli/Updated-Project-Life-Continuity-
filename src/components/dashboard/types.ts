export interface UnifiedEvent {
  id: string;
  type: "bill" | "appointment";
  name: string;
  date: string; // "YYYY-MM-DD"
  time?: string;
  amount?: number;
  status: string;
  category: "Medical Consults" | "Financial / EMI" | "Family & School";
  priority: "High" | "Medium" | "Low";
  location?: string;
  notes?: string;
}

export interface DayObj {
  dayNum: number;
  dateStr: string;
  isCurrentMonth: boolean;
}
