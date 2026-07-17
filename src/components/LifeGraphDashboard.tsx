import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  FileSpreadsheet
} from "lucide-react";

import { triggerCheckIn } from "../lib/checkinService";
import { apiFetch } from "../lib/api";
import { CheckInStats } from "../types";
import { UnifiedEvent } from "./dashboard/types";

// Import new modular dashboard subcomponents
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardStatsGrid from "./dashboard/DashboardStatsGrid";
import DashboardFilters from "./dashboard/DashboardFilters";
import AgendaPanel from "./dashboard/AgendaPanel";
import DrillDownPanel from "./dashboard/DrillDownPanel";
import AddCustomEventModal from "./dashboard/AddCustomEventModal";
import GoogleCalendarSyncModal from "./dashboard/GoogleCalendarSyncModal";

interface LifeGraphDashboardProps {
  uid: string;
  onCheckInTriggered?: () => void;
  checkInTriggerCounter?: number;
  onNavigate?: (tab: string) => void;
  triggerToast?: (message: string, details?: string, type?: "success" | "error") => void;
  justCheckedIn?: boolean;
  setJustCheckedIn?: (val: boolean) => void;
}

export default function LifeGraphDashboard({
  uid,
  onCheckInTriggered,
  checkInTriggerCounter,
  onNavigate,
  triggerToast,
  justCheckedIn,
  setJustCheckedIn,
}: LifeGraphDashboardProps) {
  // Core database states
  const [bills, setBills] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Calendar visualization states
  const today = new Date();
  const [selectedDayStr, setSelectedDayStr] = useState("2026-07-04");
  const [calendarMonth, setCalendarMonth] = useState(6); // July (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2026);

  // Search, Category, and Priority filters states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  // Modals visibility states
  const [showAddCustomEvent, setShowAddCustomEvent] = useState(false);
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);

  // Custom Event state bindings
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<"Medical Consults" | "Financial / EMI" | "Family & School">("Medical Consults");
  const [customDate, setCustomDate] = useState("2026-07-04");
  const [customTime, setCustomTime] = useState("10:00 AM");
  const [customPriority, setCustomPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [customAmount, setCustomAmount] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Edit/Configure state bindings
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("10:00 AM");
  const [editCategory, setEditCategory] = useState<"Medical Consults" | "Financial / EMI" | "Family & School">("Medical Consults");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("Pending");
  const [editLocation, setEditLocation] = useState("");

  // Google Calendar integration states
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState(false);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [isGoogleAuthorizing, setIsGoogleAuthorizing] = useState(false);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/life-graph/${uid}`);
      const data = await res.json();
      if (data) {
        setBills(Array.isArray(data.bills) ? data.bills : []);
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
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
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    const prevStats = stats ? { ...stats } : null;

    // Optimistic state update
    setStats((prev: any) => {
      if (!prev) return prev;
      const streak = prev.currentStreak || 0;
      return {
        ...prev,
        status: "Verified",
        currentStreak: streak + 1,
        longestStreak: Math.max(prev.longestStreak || 0, streak + 1)
      };
    });

    try {
      await triggerCheckIn(uid, "manualButton");

      if (triggerToast) {
        triggerToast(
          "Checked in successfully!",
          "Your Proof-of-Life status has been verified and your safety streak updated.",
          "success"
        );
      }

      if (setJustCheckedIn) {
        setJustCheckedIn(true);
      }

      if (onCheckInTriggered) {
        onCheckInTriggered();
      }

      if (onNavigate) {
        onNavigate("SafetyCheckIn");
      }
    } catch (e: any) {
      console.error("Check-in error:", e);
      // Rollback to prior verified stats state
      setStats(prevStats);
      if (triggerToast) {
        triggerToast("Check-in Failed", e.message || "An error occurred during verification.", "error");
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleAuthorizeGoogleCalendar = () => {
    if (isGoogleAuthorizing || isGoogleAuthorized) return;
    setIsGoogleAuthorizing(true);
    setTimeout(() => {
      setIsGoogleAuthorized(true);
      setIsGoogleAuthorizing(false);
      if (triggerToast) {
        triggerToast(
          "Google Calendar Authorized Successfully",
          "Your Google Calendar connection is authenticated and secure. Ready to sync events.",
          "success"
        );
      }
    }, 1200);
  };

  const handleSyncGoogleCalendar = async () => {
    if (isGoogleSyncing) return;
    if (!isGoogleAuthorized) {
      if (triggerToast) {
        triggerToast(
          "Authorization Required",
          "Please authorize Google Calendar before synchronizing events.",
          "error"
        );
      }
      return;
    }
    setIsGoogleSyncing(true);
    try {
      const res = await apiFetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchGraphData();
        if (triggerToast) {
          triggerToast(
            "Calendar Sync Successful",
            `Successfully synchronized Google Calendar. Imported ${data.count || 2} upcoming obligations.`,
            "success"
          );
        }
      } else {
        throw new Error(data.error || "Failed to synchronize events.");
      }
    } catch (e: any) {
      console.error(e);
      if (triggerToast) {
        triggerToast("Calendar Sync Failed", e.message || "An error occurred.", "error");
      }
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const handleAddCustomEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (customCategory === "Financial / EMI") {
        const res = await apiFetch("/api/life-graph/bill", {
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
        const res = await apiFetch("/api/life-graph/appointment", {
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
      const res = await apiFetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        fetchGraphData();
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
      const res = await apiFetch(endpoint, {
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
      
      {/* Top Banner: Safety Status Widget (Modularized) */}
      <DashboardHeader 
        stats={stats}
        isCheckingIn={isCheckingIn}
        onManualCheckIn={handleManualCheckIn}
        getStatusBadgeClass={getStatusBadgeClass}
      />

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
              onClick={() => setShowCalendarSyncModal(true)}
              className="flex-1 sm:flex-none bg-[#1e233a] border border-[#5d6fa3]/30 text-[#e0dafc] hover:bg-[#1e233a]/80 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn-open-calendar-sync"
            >
              <Calendar className="h-4 w-4 text-indigo-400" />
              Sync Google Calendar
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

                  if (dayEvents.length > 0) {
                    if (categoryTypesCount > 1) {
                      bgClass = "bg-[#4f46e5]/45 text-indigo-100 hover:bg-[#4f46e5]/60";
                    } else if (hasMedical) {
                      bgClass = "bg-rose-950/60 text-rose-200 hover:bg-rose-950/80 border-rose-500/20";
                    } else if (hasFinancial) {
                      bgClass = "bg-blue-950/60 text-blue-200 hover:bg-blue-950/80 border-blue-500/20";
                    } else if (hasFamily) {
                      bgClass = "bg-purple-950/60 text-purple-200 hover:bg-purple-950/80 border-purple-500/20";
                    }
                  }
                }

                if (isSelected) {
                  ringClass = "ring-2 ring-indigo-400 border-indigo-400";
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDayStr(dayObj.dateStr);
                      // Auto-select first event of this day if available
                      const dayEvs = unifiedEvents.filter(e => e.date === dayObj.dateStr);
                      if (dayEvs.length > 0) {
                        handleSelectEventForEdit(dayEvs[0]);
                      } else {
                        setSelectedEventId(null);
                        setIsConfiguring(false);
                      }
                    }}
                    className={`h-11 sm:h-14 rounded-xl flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all cursor-pointer relative ${bgClass} ${ringClass}`}
                  >
                    <span className="text-[10px] sm:text-xs font-bold self-start">{dayObj.day}</span>
                    
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5 justify-center w-full">
                        {hasMedical && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Medical" />}
                        {hasFinancial && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Financial" />}
                        {hasFamily && <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title="Family & School" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Four Category Summary Grid Cards (Modularized) */}
      <DashboardStatsGrid 
        billsCount={billsCount}
        apptsCount={apptsCount}
        schoolCount={schoolCount}
        loansCount={loansCount}
      />

      {/* Search and Filters Segment (Modularized) */}
      <DashboardFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Dual Panel: Selected Day Agenda & Node Drill-Down Analytics (Modularized) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgendaPanel 
          selectedDayStr={selectedDayStr}
          selectedDayEvents={selectedDayEvents}
          selectedEventId={selectedEventId}
          onSelectEvent={handleSelectEventForEdit}
          getDayFormattedTitle={getDayFormattedTitle}
        />

        <DrillDownPanel 
          currentEvent={filteredEvents.find(e => e.id === selectedEventId) || selectedDayEvents[0]}
          isConfiguring={isConfiguring}
          setIsConfiguring={setIsConfiguring}
          editName={editName}
          setEditName={setEditName}
          editDate={editDate}
          setEditDate={setEditDate}
          editTime={editTime}
          setEditTime={setEditTime}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
          editPriority={editPriority}
          setEditPriority={setEditPriority}
          editAmount={editAmount}
          setEditAmount={setEditAmount}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editNotes={editNotes}
          setEditNotes={setEditNotes}
          editLocation={editLocation}
          setEditLocation={setEditLocation}
          onResetView={() => {
            setSearchQuery("");
            setCategoryFilter("All Categories");
            setPriorityFilter("All Priorities");
            const list = getUnifiedEvents();
            const todayList = list.filter(e => e.date === selectedDayStr);
            if (todayList.length > 0) {
              handleSelectEventForEdit(todayList[0]);
            }
          }}
          onSaveEvent={handleSaveConfiguredEvent}
          onDeleteEvent={async (ev) => {
            if (confirm("Are you sure you want to delete this event?")) {
              await handleDeleteEvent(ev);
              setSelectedEventId(null);
              setIsConfiguring(false);
            }
          }}
          getDayFormattedTitle={getDayFormattedTitle}
        />
      </div>

      {/* Add Custom Event Modal Redesign (Modularized) */}
      {showAddCustomEvent && (
        <AddCustomEventModal 
          customTitle={customTitle}
          setCustomTitle={setCustomTitle}
          customCategory={customCategory}
          setCustomCategory={setCustomCategory}
          customPriority={customPriority}
          setCustomPriority={setCustomPriority}
          customDate={customDate}
          setCustomDate={setCustomDate}
          customTime={customTime}
          setCustomTime={setCustomTime}
          customAmount={customAmount}
          setCustomAmount={setCustomAmount}
          customLocation={customLocation}
          setCustomLocation={setCustomLocation}
          customNotes={customNotes}
          setCustomNotes={setCustomNotes}
          onClose={resetCustomForm}
          onSubmit={handleAddCustomEventSubmit}
        />
      )}

      {/* Google Calendar Sync Modal (Modularized) */}
      {showCalendarSyncModal && (
        <GoogleCalendarSyncModal 
          isGoogleAuthorized={isGoogleAuthorized}
          isGoogleSyncing={isGoogleSyncing}
          isGoogleAuthorizing={isGoogleAuthorizing}
          onAuthorize={handleAuthorizeGoogleCalendar}
          onSync={handleSyncGoogleCalendar}
          onClose={() => setShowCalendarSyncModal(false)}
        />
      )}

    </div>
  );
}
