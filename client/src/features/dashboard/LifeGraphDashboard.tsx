import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  CalendarCheck, 
  GraduationCap, 
  PiggyBank, 
  ShieldCheck, 
  HeartPulse, 
  RefreshCw, 
  Plus, 
  Trash2, 
  CheckSquare, 
  FileSpreadsheet, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlertCircle,
  Sliders 
} from "lucide-react";

interface LifeGraphDashboardProps {
  uid: string;
  onCheckInTriggered?: () => void;
  checkInTriggerCounter?: number;
  onNavigate?: (tab: string) => void;
}

interface UnifiedEvent {
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

export default function LifeGraphDashboard({ uid, onCheckInTriggered, checkInTriggerCounter, onNavigate }: LifeGraphDashboardProps) {
  const [bills, setBills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  // Calendar states
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(6); // 0-indexed, 6 = July 2026
  const [selectedDayStr, setSelectedDayStr] = useState("2026-07-04"); // Default to Saturday, Jul 4, 2026 as in the reference

  // Modal Custom Event state
  const [showAddCustomEvent, setShowAddCustomEvent] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<"Medical Consults" | "Financial / EMI" | "Family & School">("Medical Consults");
  const [customDate, setCustomDate] = useState("2026-07-04");
  const [customTime, setCustomTime] = useState("10:00 AM");
  const [customPriority, setCustomPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [customAmount, setCustomAmount] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Active selection and config states for Node Drill-Down Analytics
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Configure form fields
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editCategory, setEditCategory] = useState<"Medical Consults" | "Financial / EMI" | "Family & School">("Medical Consults");
  const [editStatus, setEditStatus] = useState("Pending");
  const [editLocation, setEditLocation] = useState("");

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/life-graph/${uid}`);
      const data = await res.json();
      if (data) {
        setBills(data.bills || []);
        setAppointments(data.appointments || []);
        setStats(data.checkInStats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [uid, checkInTriggerCounter]);

  const handleManualCheckIn = async () => {
    if (onNavigate) {
      onNavigate("SafetyPanel");
    } else {
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, method: "manualButton" })
        });
        if (res.ok) {
          fetchGraphData();
          if (onCheckInTriggered) onCheckInTriggered();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddCustomEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (customCategory === "Financial / EMI") {
        const res = await fetch("/api/life-graph/bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            name: customTitle,
            dueDate: customDate,
            amount: Number(customAmount) || 0,
            category: Number(customAmount) > 500 ? "Loans/EMIs" : "Upcoming Bills",
            status: "Pending",
            priority: customPriority,
            notes: customNotes
          })
        });
        if (res.ok) {
          resetCustomForm();
          fetchGraphData();
        }
      } else {
        const res = await fetch("/api/life-graph/appointment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            name: customTitle,
            date: customDate,
            time: customTime,
            location: customLocation,
            notes: customNotes,
            status: "Upcoming",
            priority: customPriority,
            category: customCategory
          })
        });
        if (res.ok) {
          resetCustomForm();
          fetchGraphData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetCustomForm = () => {
    setCustomTitle("");
    setCustomCategory("Medical Consults");
    setCustomDate("2026-07-04");
    setCustomTime("10:00 AM");
    setCustomPriority("Medium");
    setCustomAmount("");
    setCustomLocation("");
    setCustomNotes("");
    setShowAddCustomEvent(false);
  };

  const handleDeleteEvent = async (event: UnifiedEvent) => {
    try {
      const endpoint = event.type === "bill" 
        ? `/api/life-graph/bill/${event.id}` 
        : `/api/life-graph/appointment/${event.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        fetchGraphData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEventStatus = async (event: UnifiedEvent) => {
    try {
      if (event.type === "bill") {
        const nextStatus = event.status === "Paid" ? "Pending" : "Paid";
        const res = await fetch(`/api/life-graph/bill/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) fetchGraphData();
      } else {
        const nextStatus = event.status === "Completed" ? "Upcoming" : "Completed";
        const res = await fetch(`/api/life-graph/appointment/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) fetchGraphData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectEventForEdit = (event: UnifiedEvent) => {
    setSelectedEventId(event.id);
    setIsConfiguring(false);
    setEditName(event.name);
    setEditDate(event.date);
    setEditTime(event.time || "10:00 AM");
    setEditAmount(event.amount ? String(event.amount) : "");
    setEditNotes(event.notes || "");
    setEditPriority(event.priority);
    setEditCategory(event.category);
    setEditStatus(event.status);
    setEditLocation(event.location || "");
  };

  const handleSaveConfiguredEvent = async () => {
    if (!selectedEventId) return;
    
    const isBill = selectedEventId.startsWith("bill");
    const endpoint = isBill 
      ? `/api/life-graph/bill/${selectedEventId}`
      : `/api/life-graph/appointment/${selectedEventId}`;
      
    const payload = isBill ? {
      name: editName,
      dueDate: editDate,
      amount: Number(editAmount) || 0,
      status: editStatus,
      category: editCategory === "Family & School" ? "School Fees" : editCategory === "Medical Consults" ? "Upcoming Bills" : "Loans/EMIs",
      priority: editPriority,
      notes: editNotes
    } : {
      name: editName,
      date: editDate,
      time: editTime,
      status: editStatus,
      location: editLocation,
      notes: editNotes,
      priority: editPriority,
      category: editCategory
    };

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsConfiguring(false);
        fetchGraphData();
      }
    } catch (e) {
      console.error("Failed to update event", e);
    }
  };

  // Prefill default selected event on database load
  useEffect(() => {
    const list = getUnifiedEvents();
    if (list.length > 0 && !selectedEventId) {
      const defaultEv = list.find(e => e.id === "appt-cardio-july4") || list[0];
      if (defaultEv) {
        setSelectedEventId(defaultEv.id);
        setEditName(defaultEv.name);
        setEditDate(defaultEv.date);
        setEditTime(defaultEv.time || "10:00 AM");
        setEditAmount(defaultEv.amount ? String(defaultEv.amount) : "");
        setEditNotes(defaultEv.notes || "");
        setEditPriority(defaultEv.priority);
        setEditCategory(defaultEv.category);
        setEditStatus(defaultEv.status);
        setEditLocation(defaultEv.location || "");
      }
    }
  }, [bills, appointments]);

  // Helper mapping helper to produce standard UnifiedEvents
  const getUnifiedEvents = (): UnifiedEvent[] => {
    const list: UnifiedEvent[] = [];

    bills.forEach((b) => {
      // Classify category
      let category: "Medical Consults" | "Financial / EMI" | "Family & School" = "Financial / EMI";
      if (b.category === "School Fees") {
        category = "Family & School";
      }
      
      list.push({
        id: b.id,
        type: "bill",
        name: b.name,
        date: b.dueDate,
        amount: b.amount,
        status: b.status,
        category,
        priority: b.priority || (b.category === "Loans/EMIs" ? "High" : "Medium"),
        notes: b.notes || ""
      });
    });

    appointments.forEach((a) => {
      let category: "Medical Consults" | "Financial / EMI" | "Family & School" = "Medical Consults";
      
      // Determine from direct category field or inferred name/notes
      if (a.category) {
        category = a.category;
      } else if (a.name.toLowerCase().includes("school") || a.notes?.toLowerCase().includes("school") || a.notes?.toLowerCase().includes("kids")) {
        category = "Family & School";
      }

      list.push({
        id: a.id,
        type: "appointment",
        name: a.name,
        date: a.date,
        time: a.time,
        status: a.status,
        category,
        priority: a.priority || "Medium",
        location: a.location,
        notes: a.notes
      });
    });

    return list;
  };

  const unifiedEvents = getUnifiedEvents();

  // Category statistics card counters
  const billsCount = bills.filter(b => b.category === "Upcoming Bills" && b.status !== "Paid").length;
  const loansCount = bills.filter(b => b.category === "Loans/EMIs" && b.status !== "Paid").length;
  const schoolCount = bills.filter(b => b.category === "School Fees" && b.status !== "Paid").length;
  const apptsCount = appointments.filter(a => a.status !== "Completed").length;

  // Search, Category, and Priority filters applied to lists
  const filteredEvents = unifiedEvents.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === "All Categories" || e.category === categoryFilter;
    
    const matchesPriority = 
      priorityFilter === "All Priorities" || e.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Export functions
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(unifiedEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Life_Graph_Obligations_${uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Calendar setup helpers
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sun, ..., 6 = Sat
  };

  const daysInCurrentMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDayIndex = getFirstDayOfMonth(calendarYear, calendarMonth);

  // Pad prev month days
  const prevMonthIndex = calendarMonth === 0 ? 11 : calendarMonth - 1;
  const prevMonthYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  const calendarDaysList: { day: number; month: number; year: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Add padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayVal = daysInPrevMonth - i;
    const mStr = String(prevMonthIndex + 1).padStart(2, "0");
    const dStr = String(dayVal).padStart(2, "0");
    calendarDaysList.push({
      day: dayVal,
      month: prevMonthIndex,
      year: prevMonthYear,
      isCurrentMonth: false,
      dateStr: `${prevMonthYear}-${mStr}-${dStr}`
    });
  }

  // Add current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const mStr = String(calendarMonth + 1).padStart(2, "0");
    const dStr = String(i).padStart(2, "0");
    calendarDaysList.push({
      day: i,
      month: calendarMonth,
      year: calendarYear,
      isCurrentMonth: true,
      dateStr: `${calendarYear}-${mStr}-${dStr}`
    });
  }

  // Pad next month days to align to grid
  const totalSlots = 42; // 6 rows of 7 days
  const nextMonthPadding = totalSlots - calendarDaysList.length;
  const nextMonthIndex = calendarMonth === 11 ? 0 : calendarMonth + 1;
  const nextMonthYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
  for (let i = 1; i <= nextMonthPadding; i++) {
    const mStr = String(nextMonthIndex + 1).padStart(2, "0");
    const dStr = String(i).padStart(2, "0");
    calendarDaysList.push({
      day: i,
      month: nextMonthIndex,
      year: nextMonthYear,
      isCurrentMonth: false,
      dateStr: `${nextMonthYear}-${mStr}-${dStr}`
    });
  }

  // Prev/Next Month handlers
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Get selected day events (sorted by priority or time)
  const selectedDayEvents = filteredEvents.filter(e => e.date === selectedDayStr);

  const getDayFormattedTitle = (dateString: string) => {
    try {
      const parts = dateString.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-950/40 text-green-400 border-green-800/60";
      case "AwaitingCheckIn": return "bg-amber-950/40 text-amber-400 border-amber-800/60";
      case "Unverified": return "bg-red-950/40 text-red-400 border-red-800/60";
      case "EmergencyVerificationActive": return "bg-rose-600 text-white border-rose-800 animate-pulse";
      default: return "bg-[#1e233a] text-[#5d6fa3] border-[#5d6fa3]/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8" id="life-graph-root">
      
      {/* Top Banner: Safety Status Widget (Maintained from original) */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#1e233a] flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex flex-wrap items-center gap-2">
              Lighthouse Safety Check-in Dashboard
              {stats && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusBadgeClass(stats.status)}`}>
                  {stats.status}
                </span>
              )}
            </h2>
            <p className="text-xs text-[#5d6fa3] mt-1">
              Daily proof-of-life status. Checking in postpones automated emergency nominee triggers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 shrink-0">
          <div className="text-left md:text-right">
            <p className="text-[10px] text-[#5d6fa3] uppercase font-bold tracking-widest">Current Streak</p>
            <p className="text-2xl font-black text-[#e0dafc] flex items-center gap-1 md:justify-end">
              {stats?.currentStreak || 0}
              <span className="text-xs text-[#5d6fa3] font-normal">days consecutive</span>
            </p>
          </div>
          
          <button
            onClick={handleManualCheckIn}
            className="bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-black text-sm py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            id="btn-safety-checkin-dashboard"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-[#2c3353]" />
            I'm Safe — Check In Now
          </button>
        </div>
      </div>

      {/* Redesigned Life Graph Agenda Header */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#5d6fa3]/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Life Graph Agenda
            </h3>
            <p className="text-xs text-[#5d6fa3] mt-0.5">Chronological heatmaps and obligations catalog</p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCustomDate(selectedDayStr);
                setShowAddCustomEvent(true);
              }}
              className="flex-1 sm:flex-none bg-gradient-to-tr from-indigo-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-add-custom-event"
            >
              <Plus className="h-4 w-4" />
              Add Custom Event
            </button>
            <button
              onClick={handleExportData}
              className="flex-1 sm:flex-none bg-[#1e233a] border border-[#5d6fa3]/30 text-[#e0dafc] hover:bg-[#1e233a]/80 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Export report"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Export Life Graph
            </button>
          </div>
        </div>

        {/* Care & Obligation Heatmap Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-[#e0dafc]/80 tracking-widest">Care & Obligation Heatmap</h4>
            <div className="flex items-center gap-2 bg-[#1e233a] border border-[#5d6fa3]/25 px-2.5 py-1 rounded-xl">
              <button onClick={handlePrevMonth} className="p-1 hover:text-white transition-colors cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-white min-w-28 text-center select-none">
                {months[calendarMonth]} {calendarYear}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:text-white transition-colors cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Heatmap Grid */}
          <div className="bg-[#1e233a] p-4 rounded-xl border border-[#5d6fa3]/15 space-y-3">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
                <span key={day} className="text-[10px] font-black text-[#5d6fa3] tracking-wider">{day}</span>
              ))}
            </div>

            {/* Heatmap days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDaysList.map((dayObj, index) => {
                const dayEvents = unifiedEvents.filter(e => e.date === dayObj.dateStr);
                const hasFinancial = dayEvents.some(e => e.category === "Financial / EMI");
                const hasMedical = dayEvents.some(e => e.category === "Medical Consults");
                const hasFamily = dayEvents.some(e => e.category === "Family & School");
                
                // Determine category overlap
                let categoryTypesCount = 0;
                if (hasFinancial) categoryTypesCount++;
                if (hasMedical) categoryTypesCount++;
                if (hasFamily) categoryTypesCount++;

                const isSelected = selectedDayStr === dayObj.dateStr;

                // Color code backgrounds
                let bgClass = "bg-[#2c3353]/30 text-indigo-200/50";
                let ringClass = "border border-[#5d6fa3]/10 hover:border-[#5d6fa3]/40";
                
                if (dayObj.isCurrentMonth) {
                  bgClass = "bg-[#2c3353]/60 text-white font-medium";
                  ringClass = "border border-[#5d6fa3]/20 hover:border-indigo-400/50";
                }

                if (isSelected) {
                  ringClass = "ring-2 ring-indigo-400 border-indigo-400";
                }

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDayStr(dayObj.dateStr)}
                    className={`relative aspect-square sm:h-12 flex flex-col justify-between p-1.5 rounded-xl transition-all select-none cursor-pointer text-left ${bgClass} ${ringClass}`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{dayObj.day}</span>
                    
                    {/* Event indicators */}
                    <div className="flex gap-1 items-center justify-start mt-1">
                      {categoryTypesCount > 1 ? (
                        <span className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-amber-500 animate-pulse" title="Multiple categories" />
                      ) : (
                        <>
                          {hasFinancial && <span className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-blue-500" title="Financial / EMI" />}
                          {hasMedical && <span className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-red-500" title="Medical Consult" />}
                          {hasFamily && <span className="h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full bg-purple-500" title="Family & School" />}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 border-t border-[#5d6fa3]/10 text-[10px] font-bold uppercase tracking-wider text-[#5d6fa3]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2c3353]/60 border border-[#5d6fa3]/20" />
                <span>Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Financial / EMI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Medical / Consult</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Family / School</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Multiple</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Four Category Summary Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Upcoming Bills", count: billsCount, desc: "Active ledger statements", icon: CreditCard, color: "text-red-400 bg-red-950/20 border-red-500/20" },
          { title: "Clinical Appts", count: apptsCount, desc: "Pending health consultations", icon: CalendarCheck, color: "text-green-400 bg-green-950/20 border-green-500/20" },
          { title: "School Tuition", count: schoolCount, desc: "Quarterly education dues", icon: GraduationCap, color: "text-indigo-400 bg-indigo-950/20 border-indigo-500/20" },
          { title: "Active Loans / EMIs", count: loansCount, desc: "Auto-debit amortization assets", icon: PiggyBank, color: "text-blue-400 bg-blue-950/20 border-blue-500/20" }
        ].map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div key={index} className={`p-4 rounded-2xl border flex items-start justify-between gap-4 shadow-md ${item.color}`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e0dafc]/50">{item.title}</span>
                <p className="text-2xl font-black text-white mt-1.5">{item.count}</p>
                <p className="text-[9px] text-[#e0dafc]/70 font-medium leading-none mt-1">{item.desc}</p>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <ItemIcon className="h-5.5 w-5.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters Segment */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5d6fa3]" />
          <input
            type="text"
            placeholder="Search events, notes, locations or partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-indigo-400 placeholder-[#5d6fa3]"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl px-2.5 py-1">
            <Filter className="h-3.5 w-3.5 text-[#5d6fa3]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-[#e0dafc] focus:outline-none cursor-pointer border-none py-1.5 pr-2"
            >
              <option value="All Categories">All Categories</option>
              <option value="Medical Consults">Medical Consults</option>
              <option value="Financial / EMI">Financial / EMI</option>
              <option value="Family & School">Family & School</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl px-2.5 py-1">
            <Sliders className="h-3.5 w-3.5 text-[#5d6fa3]" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-[#e0dafc] focus:outline-none cursor-pointer border-none py-1.5 pr-2"
            >
              <option value="All Priorities">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dual Panel: Selected Day Agenda & Node Drill-Down Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Selected Day Agenda (Screenshot 1 Layout) */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase text-[#e0dafc]/50 tracking-widest block">SELECTED DAY AGENDA</span>
              <h3 className="text-xl font-bold text-white mt-1" id="selected-day-title">
                {getDayFormattedTitle(selectedDayStr)}
              </h3>
            </div>

            <div className="space-y-4">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 bg-[#1e233a]/30 border border-[#5d6fa3]/10 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-[#5d6fa3] mx-auto mb-3" />
                  <p className="text-xs text-[#5d6fa3] font-medium max-w-sm mx-auto leading-relaxed">
                    No critical life obligations scheduled for this day matching selected category/priority filters.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map(event => {
                  const isSelected = selectedEventId === event.id;
                  const isCompleted = event.status === "Paid" || event.status === "Completed";
                  
                  // Color mapping for Category Tag
                  let tagText = "FAMILY";
                  let tagStyles = "bg-purple-950/40 text-purple-400 border-purple-900/50";
                  if (event.category === "Medical Consults") {
                    tagText = "MEDICAL";
                    tagStyles = "bg-red-950/40 text-red-400 border-red-900/50";
                  } else if (event.category === "Financial / EMI") {
                    tagText = "FINANCIAL";
                    tagStyles = "bg-blue-950/40 text-blue-400 border-blue-900/50";
                  }

                  return (
                    <div
                      key={event.id}
                      onClick={() => handleSelectEventForEdit(event)}
                      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer hover:brightness-110 ${
                        isSelected 
                          ? "bg-[#1e233a] border-indigo-500 shadow-md ring-1 ring-indigo-500/30" 
                          : "bg-[#1e233a]/60 border-[#5d6fa3]/15 hover:border-[#5d6fa3]/30"
                      }`}
                    >
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold text-white ${isCompleted ? "line-through opacity-50" : ""}`}>
                            {event.name}
                          </h4>
                          {event.amount && (
                            <span className="text-[10px] font-mono bg-[#2c3353]/80 border border-[#5d6fa3]/20 px-2 py-0.5 rounded text-slate-300">
                              ${event.amount}
                            </span>
                          )}
                        </div>
                        
                        {event.notes && (
                          <p className="text-xs text-slate-300 leading-relaxed truncate max-w-md">
                            {event.notes}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-[#5d6fa3] font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{event.time || "All Day"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${tagStyles}`}>
                          {tagText}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Node Drill-Down Analytics (Screenshot 2 Layout) */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#5d6fa3]/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#e0dafc]/50 tracking-widest block">NODE DRILL-DOWN ANALYTICS</span>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All Categories");
                  setPriorityFilter("All Priorities");
                  const list = getUnifiedEvents();
                  const todayList = list.filter(e => e.date === selectedDayStr);
                  if (todayList.length > 0) {
                    handleSelectEventForEdit(todayList[0]);
                  }
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Reset view
              </button>
            </div>

            {/* Selected Event Details Card */}
            {(() => {
              const currentEvent = filteredEvents.find(e => e.id === selectedEventId) || selectedDayEvents[0];
              if (!currentEvent) {
                return (
                  <div className="text-center py-16 bg-[#1e233a]/30 border border-[#5d6fa3]/10 rounded-2xl flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-[#5d6fa3] mb-3 animate-pulse" />
                    <p className="text-xs text-[#5d6fa3] font-medium">Select an obligation from the agenda to drill down</p>
                  </div>
                );
              }

              // Category mapping for vertical border line & theme
              let categoryColor = "border-purple-500";
              let categoryTagText = "FAMILY";
              let categoryTagStyle = "bg-purple-950/40 text-purple-400 border-purple-900/50";
              if (currentEvent.category === "Medical Consults") {
                categoryColor = "border-red-500";
                categoryTagText = "MEDICAL";
                categoryTagStyle = "bg-red-950/40 text-red-400 border-red-900/50";
              } else if (currentEvent.category === "Financial / EMI") {
                categoryColor = "border-blue-500";
                categoryTagText = "FINANCIAL";
                categoryTagStyle = "bg-blue-950/40 text-blue-400 border-blue-900/50";
              }

              // Severity level mapping
              let severityText = `${currentEvent.priority || "Medium"} Severity`;
              let severityTagStyle = "bg-slate-800 text-slate-300 border-slate-700";
              if (currentEvent.priority === "High") {
                severityTagStyle = "bg-red-950/40 text-red-400 border-red-900/50";
              } else if (currentEvent.priority === "Low") {
                severityTagStyle = "bg-green-950/40 text-green-400 border-green-900/50";
              }

              return (
                <div className="space-y-6">
                  {/* Outer White Card layout styled beautifully */}
                  <div className={`bg-white text-slate-900 rounded-2xl border-l-4 ${categoryColor} border border-slate-200/80 p-6 space-y-4 shadow-xl`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-tight">
                          {currentEvent.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Calendar Schedule: <span className="font-semibold text-slate-700">{getDayFormattedTitle(currentEvent.date)}</span> {currentEvent.time ? `at ${currentEvent.time}` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${categoryTagStyle.replace("bg-purple-950/40", "bg-purple-50").replace("bg-red-950/40", "bg-red-50").replace("bg-blue-950/40", "bg-blue-50").replace("bg-indigo-950/40", "bg-indigo-50")}`}>
                          {categoryTagText}
                        </span>
                        <span className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded border ${severityTagStyle.replace("bg-slate-800", "bg-slate-100").replace("bg-red-950/40", "bg-red-50").replace("bg-green-950/40", "bg-green-50")}`}>
                          {severityText}
                        </span>
                      </div>
                    </div>

                    {/* Centered notes box */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {currentEvent.notes || "No detailed notes or documentation uploaded for this obligation."}
                      </p>
                    </div>

                    {/* Bottom row metrics */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-8">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">COMMITTED FUNDING</span>
                          <span className="text-lg font-black text-slate-900 mt-0.5 block">
                            {currentEvent.amount ? `$${currentEvent.amount}` : "N/A"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">STATUS STATE</span>
                          <span className="inline-flex items-center gap-1.5 mt-1">
                            <span className={`h-2 w-2 rounded-full ${
                              currentEvent.status === "Paid" || currentEvent.status === "Completed" 
                                ? "bg-emerald-500 animate-pulse" 
                                : "bg-green-500"
                            }`} />
                            <span className="text-sm font-black text-slate-800">
                              {currentEvent.status || "Pending"}
                            </span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsConfiguring(!isConfiguring);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer self-stretch sm:self-center"
                      >
                        Configure Event Action &gt;
                      </button>
                    </div>

                    {/* Inline Expandable Configuration Tray */}
                    {isConfiguring && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-widest">Configure Obligation Suite</h5>
                          <button 
                            onClick={() => setIsConfiguring(false)}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Event Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Time</label>
                              <input
                                type="text"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as any)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="Medical Consults">Medical Consults</option>
                              <option value="Financial / EMI">Financial / EMI</option>
                              <option value="Family & School">Family & School</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Priority / Severity</label>
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value as any)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Committed Funding ($)</label>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                              placeholder="N/A"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status State</label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Upcoming">Upcoming</option>
                              <option value="Paid">Paid</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Obligation Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={2}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Enter notes..."
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this event?")) {
                                await handleDeleteEvent(currentEvent);
                                setSelectedEventId(null);
                                setIsConfiguring(false);
                              }
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete Obligation
                          </button>

                          <button
                            onClick={handleSaveConfiguredEvent}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-sm cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Add Custom Event Modal Redesign */}
      {showAddCustomEvent && (
        <div className="fixed inset-0 z-50 bg-[#1e233a]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2c3353] rounded-2xl max-w-md w-full p-6 border border-[#5d6fa3]/30 shadow-2xl space-y-4 text-[#e0dafc] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#5d6fa3]/20 pb-3">
              <h4 className="font-bold text-white text-base">Add Custom Life Obligation</h4>
              <button onClick={resetCustomForm} className="text-[#5d6fa3] hover:text-white transition-colors cursor-pointer text-sm font-bold">Close</button>
            </div>
            
            <form onSubmit={handleAddCustomEventSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Event / Obligation Title</label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="e.g. Cardiology Consult — Dr. Gupta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Event Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  >
                    <option value="Medical Consults">Medical Consults</option>
                    <option value="Financial / EMI">Financial / EMI</option>
                    <option value="Family & School">Family & School</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Priority Level</label>
                  <select
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value as any)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Target Date</label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Time</label>
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
              </div>

              {customCategory === "Financial / EMI" ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Ledger Amount ($)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                    placeholder="e.g. 1200"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Clinical / Meeting Location</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                    placeholder="e.g. Desk 4, Apollo Clinic"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#5d6fa3]">Detailed Description & Guidance notes</label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl focus:outline-none focus:border-[#e0dafc] text-xs resize-none text-[#e0dafc]"
                  placeholder="e.g. Monthly apartment lease amortization auto-debit process or Medical follow-up instructions..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#5d6fa3]/10">
                <button
                  type="button"
                  onClick={resetCustomForm}
                  className="px-4 py-2.5 bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#5d6fa3] text-xs rounded-xl font-bold border border-[#5d6fa3]/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs rounded-xl font-extrabold hover:brightness-110 shadow-lg transition-all cursor-pointer"
                >
                  Save Obligation Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
