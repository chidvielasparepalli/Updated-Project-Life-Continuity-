export interface UnifiedEvent {
  id: string;
  type: "bill" | "appointment" | "gmail" | "document";
  name: string;
  date: string; // "YYYY-MM-DD"
  time?: string;
  amount?: number;
  status: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  location?: string;
  notes?: string;
}

export interface DayObj {
  dayNum: number;
  dateStr: string;
  isCurrentMonth: boolean;
}
