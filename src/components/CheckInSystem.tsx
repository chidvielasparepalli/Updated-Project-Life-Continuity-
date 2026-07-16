import React, { useState, useEffect } from "react";
import { Clock, Sliders, Calendar, AlertTriangle, CheckCircle, Smartphone, Flame, Settings, Play, ArrowUpRight } from "lucide-react";
import { CheckInMethod } from "../types";

interface CheckInSystemProps {
  uid: string;
  onCheckInTriggered?: () => void;
  checkInTriggerCounter?: number;
  onNavigate?: (tab: string) => void;
}

export default function CheckInSystem({ uid, onCheckInTriggered, checkInTriggerCounter, onNavigate }: CheckInSystemProps) {
  const [stats, setStats] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Settings editing states
  const [winStart, setWinStart] = useState("08:00");
  const [winEnd, setWinEnd] = useState("20:00");
  const [grace, setGrace] = useState(120);

  const [loading, setLoading] = useState(false);
  const [simStatus, setSimStatus] = useState("");

  const loadCheckInData = async () => {
    try {
      // Get stats
      const res = await fetch(`/api/life-graph/${uid}`);
      const data = await res.json();
      if (data) {
        setStats(data.checkInStats);
      }

      // Get settings
      const setRes = await fetch(`/api/checkin/settings/${uid}`);
      const setData = await setRes.json();
      if (setData) {
        setSettings(setData);
        setWinStart(setData.checkInWindowStart || "08:00");
        setWinEnd(setData.checkInWindowEnd || "20:00");
        setGrace(setData.gracePeriodMinutes || 120);
      }

      // Get history
      const histRes = await fetch(`/api/checkin/history/${uid}`);
      const histData = await histRes.json();
      setHistory(histData || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCheckInData();
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
          await loadCheckInData();
          if (onCheckInTriggered) onCheckInTriggered();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/settings/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInWindowStart: winStart,
          checkInWindowEnd: winEnd,
          reminderIntervals: [120, 60, 15],
          gracePeriodMinutes: Number(grace)
        })
      });
      if (res.ok) {
        loadCheckInData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate missed check-in escalation
  const handleSimulateMissedCheckIn = async () => {
    setSimStatus("Escalating...");
    try {
      const res = await fetch("/api/emergency/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          triggeredBy: "missedCheckIn"
        })
      });
      if (res.ok) {
        setSimStatus("Escalated! Emergency mode active.");
        await loadCheckInData();
        if (onCheckInTriggered) onCheckInTriggered();
        setTimeout(() => setSimStatus(""), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate one-tap webhook callback
  const handleSimulateWebhook = async (method: CheckInMethod) => {
    setSimStatus(`Firing webhook (${method})...`);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, method })
      });
      if (res.ok) {
        setSimStatus(`Webhook check-in recorded via ${method}!`);
        await loadCheckInData();
        if (onCheckInTriggered) onCheckInTriggered();
        setTimeout(() => setSimStatus(""), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-950/40 text-green-400 border-green-800/60";
      case "AwaitingCheckIn": return "bg-amber-950/40 text-amber-400 border-amber-800/60";
      case "Unverified": return "bg-red-950/40 text-red-400 border-red-800/60";
      case "EmergencyVerificationActive": return "bg-[#e11d48] text-white border-rose-800 animate-pulse";
      default: return "bg-[#1e233a] text-[#5d6fa3] border-[#5d6fa3]/30";
    }
  };

  // Calendar timeline days simulation
  const daysInMonth = 30;
  const currentDayOfMonth = new Date().getDate();

  const getMethodColor = (method: string) => {
    switch (method) {
      case "login": return "bg-[#1e233a] text-[#e0dafc] border border-[#5d6fa3]/40";
      case "manualButton": return "bg-[#5d6fa3]/25 text-[#e0dafc] border border-[#5d6fa3]/50";
      case "smsReply": return "bg-green-950/50 text-green-400 border border-green-800/40";
      case "pushAction": return "bg-indigo-950/50 text-indigo-400 border border-indigo-800/40";
      default: return "bg-red-950/40 border border-red-900/50 text-red-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Settings Panel & Simulation Controls */}
      <div className="space-y-6">
        
        {/* Settings Box */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4 text-[#e0dafc]">
          <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
            <Settings className="h-5 w-5 text-[#e0dafc]" />
            <h3 className="font-bold text-white text-sm">Escalation Window Settings</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#5d6fa3] uppercase tracking-widest">Window Open</label>
                <input
                  type="text"
                  value={winStart}
                  onChange={(e) => setWinStart(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-center font-mono font-bold text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="08:00"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#5d6fa3] uppercase tracking-widest">Window Close</label>
                <input
                  type="text"
                  value={winEnd}
                  onChange={(e) => setWinEnd(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-center font-mono font-bold text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="20:00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#5d6fa3] uppercase tracking-widest">Grace Period (Minutes)</label>
              <input
                type="number"
                value={grace}
                onChange={(e) => setGrace(Number(e.target.value))}
                className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-center font-mono font-semibold text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                placeholder="120"
              />
              <p className="text-[9px] text-[#5d6fa3] mt-1.5 leading-relaxed">
                Delay past Window Close before activating Nominee handover automatically.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-extrabold py-2.5 px-4 rounded-xl transition-all shadow-md mt-2"
            >
              {loading ? "Persisting settings..." : "Update Settings"}
            </button>
          </form>
        </div>

        {/* Real-time Webhook Simulation Panel */}
        <div className="bg-[#2c3353] rounded-2xl border border-red-900/50 shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
            <Sliders className="h-5 w-5 text-red-400" />
            <h3 className="font-bold text-white text-sm">Escalation Simulation Engine</h3>
          </div>

          <p className="text-xs text-[#5d6fa3] leading-relaxed">
            Test and audit both the background webhook fallback loops and automated nominee triggers instantly.
          </p>

          {simStatus && (
            <div className="bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-xl text-[10px] font-bold animate-fade-in">
              {simStatus}
            </div>
          )}

          <div className="space-y-2.5 text-xs">
            {/* One-tap Webhook simulated loops */}
            <button
              onClick={() => handleSimulateWebhook(CheckInMethod.SmsReply)}
              className="w-full bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-green-400" />
                Simulate SMS Reply Webhook ("SAFE")
              </span>
              <ArrowUpRight className="h-4 w-4 text-[#5d6fa3]" />
            </button>

            <button
              onClick={() => handleSimulateWebhook(CheckInMethod.PushAction)}
              className="w-full bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                Simulate Push Action Webhook
              </span>
              <ArrowUpRight className="h-4 w-4 text-[#5d6fa3]" />
            </button>

            {/* Missed check-in grace trigger */}
            <button
              onClick={handleSimulateMissedCheckIn}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
            >
              <Play className="h-4 w-4 fill-current text-white" />
              Simulate Grace Period Timeout
            </button>
          </div>
        </div>

      </div>

      {/* Check-in Calendar Timeline Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Proof-of-Life Security Timeline</h3>
                <p className="text-xs text-[#5d6fa3]">Verified logs mapping out daily check-in safety patterns</p>
              </div>
            </div>

            {stats && (
              <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider self-start sm:self-center ${getBadgeClass(stats.status)}`}>
                {stats.status}
              </span>
            )}
          </div>

          {/* Grid Map / heatmap */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Proof-of-Life Heatmap Grid</h4>
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2.5" id="checkin-heatmap-grid">
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isFuture = dayNum > currentDayOfMonth;
                const isToday = dayNum === currentDayOfMonth;

                // Determine if checked in
                let checkInEntry = history.find(h => Number(h.date.split("-")[2]) === dayNum);
                
                // Demo data preloads
                let method = checkInEntry ? checkInEntry.method : null;
                if (!checkInEntry && dayNum < currentDayOfMonth && dayNum > currentDayOfMonth - 12) {
                  // Simulate past consecutive checked in days for beautiful heatmap
                  method = dayNum % 3 === 0 ? "login" : dayNum % 3 === 1 ? "manualButton" : "smsReply";
                }

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold relative transition-all ${
                      isFuture
                        ? "bg-[#1e233a]/30 border border-[#5d6fa3]/15 text-[#5d6fa3]/40"
                        : method
                        ? getMethodColor(method)
                        : "bg-red-950/40 border border-red-900/50 text-red-400"
                    } ${isToday ? "ring-2 ring-[#e0dafc] ring-offset-2 ring-offset-[#2c3353] scale-105" : ""}`}
                    title={method ? `Day ${dayNum}: Verified via ${method}` : `Day ${dayNum}: Unverified`}
                  >
                    <span>{dayNum}</span>
                    {method && (
                      <span className="text-[7px] opacity-75 font-normal block scale-90 uppercase">
                        {method.substring(0, 3)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend explanation */}
          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-[#5d6fa3] border-t border-[#5d6fa3]/25 pt-4 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[#1e233a] border border-[#5d6fa3]/40" />
              <span>Full Login</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[#5d6fa3]/25 border border-[#5d6fa3]/50" />
              <span>Dashboard checklist</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-green-950/50 border border-green-800/40" />
              <span>SMS Reply ("SAFE")</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-indigo-950/50 border border-indigo-800/40" />
              <span>Push Action</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-red-950/40 border border-red-900/50" />
              <span>Missed</span>
            </div>
          </div>

          {/* Streak tracker record box */}
          <div className="bg-[#1e233a] p-4 rounded-xl border border-[#5d6fa3]/20 flex items-center justify-between gap-4">
            <div className="text-xs">
              <p className="font-bold text-white">Streak Record Tracker</p>
              <p className="text-[10px] text-[#5d6fa3] mt-1 leading-relaxed">
                Current streak: <span className="font-bold text-[#e0dafc]">{stats?.currentStreak || 0} days</span> • Longest streak record: <span className="font-bold text-[#e0dafc]">{stats?.longestStreak || 0} days</span>
              </p>
            </div>
            <button
              onClick={handleManualCheckIn}
              className="bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md shrink-0"
              id="btn-timeline-manual-checkin"
            >
              Check In Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
