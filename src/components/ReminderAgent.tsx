import React, { useState, useEffect } from "react";
import { 
  Bell, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle, 
  Smartphone,
  MessageSquare,
  Key,
  AlertTriangle,
  Activity,
  Filter,
  RefreshCw,
  Sliders
} from "lucide-react";

interface ReminderAgentProps {
  uid: string;
}

export default function ReminderAgent({ uid }: ReminderAgentProps) {
  const [bills, setBills] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [simulated, setSimulated] = useState(false);
  const [pushStatus, setPushStatus] = useState("Active");

  // New check-in tracking states
  const [events, setEvents] = useState<any[]>([]);
  const [mediumFilter, setMediumFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [simMedium, setSimMedium] = useState("manualButton");
  const [simStatus, setSimStatus] = useState("Success");
  const [isSubmittingSim, setIsSubmittingSim] = useState(false);

  const loadEvents = async () => {
    try {
      const res = await fetch(`/api/checkin/events/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to load check-in events:", e);
    }
  };

  const loadReminders = async () => {
    try {
      const res = await fetch(`/api/life-graph/${uid}`);
      const data = await res.json();
      if (data) {
        setBills(data.bills?.filter((b: any) => b.status === "Pending") || []);
        setAppts(data.appointments?.filter((a: any) => a.status === "Upcoming") || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReminders();
    loadEvents();
    
    // Poll for real-time updates
    const interval = setInterval(() => {
      loadEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [uid]);

  const handleSimulateAlert = () => {
    setSimulated(true);
    setTimeout(() => setSimulated(false), 5000);
  };

  const handleSimulateCheckInEvent = async () => {
    if (isSubmittingSim) return;
    setIsSubmittingSim(true);
    try {
      const res = await fetch("/api/checkin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          method: simMedium,
          status: simStatus
        })
      });
      if (res.ok) {
        await loadEvents();
        if (simStatus === "Success") {
          loadReminders();
        }
      }
    } catch (e) {
      console.error("Failed to submit simulator event:", e);
    } finally {
      setIsSubmittingSim(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "login":
        return <Key className="h-4 w-4 text-emerald-400" />;
      case "manualButton":
        return <ShieldCheck className="h-4 w-4 text-green-400" />;
      case "pushAction":
        return <Smartphone className="h-4 w-4 text-indigo-400" />;
      case "smsReply":
        return <MessageSquare className="h-4 w-4 text-cyan-400" />;
      case "missed":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-pink-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-950/40 px-2.5 py-1 rounded-full border border-green-800/40 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Success
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "Missed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-800/40 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Missed
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-800/40 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            Failed
          </span>
        );
      case "Escalated":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-800/40 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-900 px-2.5 py-1 rounded-full border border-gray-800">
            {status}
          </span>
        );
    }
  };

  const filteredEvents = events.filter(e => {
    const matchMedium = mediumFilter === "all" || e.method === mediumFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchMedium && matchStatus;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-[#e0dafc]">
      
      {/* Overview Block */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#1e233a] flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Lighthouse Automated Reminder Agent</h2>
            <p className="text-xs text-[#5d6fa3] mt-1">
              Daily cron jobs scan active lifegraph structures to distribute morning digests.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-950/40 px-3 py-1.5 rounded-full border border-green-800/60 shrink-0">
          <Clock className="h-3.5 w-3.5 animate-pulse text-green-400" />
          Scheduler Cron Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status panel */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-[#5d6fa3]/20 pb-2">
            <Smartphone className="h-4 w-4 text-[#e0dafc]" />
            Notification Channels
          </h3>

          <div className="space-y-3 text-xs text-[#e0dafc]">
            <div className="flex justify-between items-center bg-[#1e233a] p-3 rounded-xl border border-[#5d6fa3]/15">
              <div>
                <p className="font-bold text-white">Web Push Notifications</p>
                <p className="text-[10px] text-[#5d6fa3] mt-0.5">Delivered directly inside browser iframe</p>
              </div>
              <span className="text-[10px] font-bold text-green-400 uppercase bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/60">
                {pushStatus}
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#1e233a] p-3 rounded-xl border border-[#5d6fa3]/15">
              <div>
                <p className="font-bold text-white">Email Digest Delivery</p>
                <p className="text-[10px] text-[#5d6fa3] mt-0.5">Dispatched to registered credentials</p>
              </div>
              <span className="text-[10px] font-bold text-green-400 uppercase bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/60">
                Online
              </span>
            </div>
          </div>

          <button
            onClick={handleSimulateAlert}
            className="w-full bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2 cursor-pointer"
          >
            <Send className="h-4 w-4 text-[#2c3353]" />
            Simulate Daily Reminder Alert
          </button>
        </div>

        {/* Sync logs scanning / upcoming alerts */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 md:col-span-2 space-y-4">
          <h3 className="font-bold text-white text-sm border-b border-[#5d6fa3]/20 pb-2">Approaching Notifications Agenda</h3>

          {simulated && (
            <div className="bg-green-950/40 border border-green-900/50 text-green-400 p-4 rounded-xl text-xs font-semibold animate-fade-in space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Simulated push reminder dispatched successfully!</span>
              </div>
              <p className="text-[10px] text-green-300 font-medium leading-relaxed">
                "LIGHTHOUSE ALERTS: Hello Alex Mercer, you have {bills.length} pending obligations and {appts.length} appointments scheduled within the next 48 hours. Please review."
              </p>
            </div>
          )}

          <div className="space-y-3.5 max-h-[160px] overflow-y-auto">
            {bills.length === 0 && appts.length === 0 ? (
              <p className="text-xs text-[#5d6fa3] text-center py-8">No approaching due events found for this active user account.</p>
            ) : (
              <>
                {bills.map(b => (
                  <div key={b.id} className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Pending Financial Bill: {b.name}</p>
                      <p className="text-[10px] text-[#5d6fa3] mt-1">Amount: ${b.amount} • Due Date: {new Date(b.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[9px] font-bold text-red-400 uppercase bg-red-950/50 border border-red-900/50 px-1.5 py-0.5 rounded shrink-0">
                      Reminding soon
                    </span>
                  </div>
                ))}

                {appts.map(a => (
                  <div key={a.id} className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">Clinical/Life Appointment: {a.name}</p>
                      <p className="text-[10px] text-[#5d6fa3] mt-1">Schedule: {new Date(a.date).toLocaleDateString()} at {a.time} @ {a.location || "Clinic"}</p>
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase bg-indigo-950/50 border border-indigo-900/50 px-1.5 py-0.5 rounded shrink-0">
                      Scheduled
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Check-In Tracking & Activity History Section */}
      <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#5d6fa3]/25 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#1e233a] flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/20">
              <Activity className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Check-In Tracking & Activity History</h3>
              <p className="text-[11px] text-[#5d6fa3] mt-0.5">Chronological telemetry of proof-of-life confirmations stored securely in Supabase.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-950/40 px-2.5 py-1 rounded-full border border-green-800/40 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
              Supabase Live Connection Active
            </span>
            <button 
              onClick={loadEvents}
              className="p-1.5 hover:bg-[#1e233a]/80 rounded-lg text-[#5d6fa3] hover:text-white border border-[#5d6fa3]/20 transition-all cursor-pointer"
              title="Manual Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Bento Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1e233a]/65 p-3.5 rounded-xl border border-[#5d6fa3]/15 flex flex-col justify-between">
            <span className="text-[10px] text-[#5d6fa3] font-bold uppercase tracking-wider">App Logins</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-white">{events.filter(e => e.method === 'login').length}</span>
              <span className="text-[9px] text-green-400 font-semibold italic">✅ Success</span>
            </div>
          </div>
          
          <div className="bg-[#1e233a]/65 p-3.5 rounded-xl border border-[#5d6fa3]/15 flex flex-col justify-between">
            <span className="text-[10px] text-[#5d6fa3] font-bold uppercase tracking-wider">Manual Safes</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-white">{events.filter(e => e.method === 'manualButton').length}</span>
              <span className="text-[9px] text-green-400 font-semibold italic">🟢 Verified</span>
            </div>
          </div>

          <div className="bg-[#1e233a]/65 p-3.5 rounded-xl border border-[#5d6fa3]/15 flex flex-col justify-between">
            <span className="text-[10px] text-[#5d6fa3] font-bold uppercase tracking-wider">SMS & Push Replies</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-white">{events.filter(e => e.method === 'smsReply' || e.method === 'pushAction').length}</span>
              <span className="text-[9px] text-cyan-400 font-semibold italic">📱 Connected</span>
            </div>
          </div>

          <div className="bg-[#1e233a]/65 p-3.5 rounded-xl border border-[#5d6fa3]/15 flex flex-col justify-between">
            <span className="text-[10px] text-[#5d6fa3] font-bold uppercase tracking-wider">Missed Events</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-rose-400">{events.filter(e => e.method === 'missed' || e.status === 'Missed' || e.status === 'Escalated').length}</span>
              <span className="text-[9px] text-rose-400 font-semibold italic">⚠️ Triggers</span>
            </div>
          </div>
        </div>

        {/* Interactive Event Simulator form */}
        <div className="bg-[#1e233a]/30 border border-[#5d6fa3]/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              Event Telemetry Tester (Supabase Real-Time Pipeline)
            </h4>
            <span className="text-[9px] text-[#5d6fa3] italic">Logs directly to the active session</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#5d6fa3] uppercase tracking-wider">Check-In Medium</label>
              <select
                value={simMedium}
                onChange={e => setSimMedium(e.target.value)}
                className="w-full bg-[#1e233a] border border-[#5d6fa3]/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="login">✅ App Login</option>
                <option value="manualButton">🟢 Manual "I'm Safe"</option>
                <option value="pushAction">📱 Push Notification Response</option>
                <option value="smsReply">💬 SMS Reply</option>
                <option value="missed">❌ Missed Check-In</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#5d6fa3] uppercase tracking-wider">Event Status</label>
              <select
                value={simStatus}
                onChange={e => setSimStatus(e.target.value)}
                className="w-full bg-[#1e233a] border border-[#5d6fa3]/25 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Missed">Missed</option>
                <option value="Failed">Failed</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSimulateCheckInEvent}
                disabled={isSubmittingSim}
                className="w-full bg-[#e0dafc] hover:brightness-110 disabled:opacity-40 text-[#2c3353] font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {isSubmittingSim ? "Logging..." : "Log Test Event"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters and List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 text-[#5d6fa3]">
              <Filter className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">Filter History:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#5d6fa3]">Medium:</span>
                <select
                  value={mediumFilter}
                  onChange={e => setMediumFilter(e.target.value)}
                  className="bg-[#1e233a] border border-[#5d6fa3]/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Mediums</option>
                  <option value="login">App Logins</option>
                  <option value="manualButton">Manual Safe</option>
                  <option value="pushAction">Push notifications</option>
                  <option value="smsReply">SMS replies</option>
                  <option value="missed">Missed check-ins</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#5d6fa3]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-[#1e233a] border border-[#5d6fa3]/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Missed">Missed</option>
                  <option value="Failed">Failed</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="border border-[#5d6fa3]/20 rounded-xl overflow-hidden bg-[#1e233a]/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1e233a]/80 text-[#5d6fa3] font-black uppercase tracking-wider text-[9px] border-b border-[#5d6fa3]/20">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Check-In Medium</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5d6fa3]/10">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-[#5d6fa3] italic">
                        No telemetry matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map(event => (
                      <tr key={event.id} className="hover:bg-[#1e233a]/25 transition-colors text-[#e0dafc]">
                        <td className="py-3.5 px-4 font-medium">{event.date}</td>
                        <td className="py-3.5 px-4 text-[#5d6fa3] font-mono">{event.time}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {getMethodIcon(event.method)}
                            <span className="font-semibold text-white">{event.methodLabel}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(event.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
