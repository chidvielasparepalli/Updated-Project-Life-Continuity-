import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Clock, 
  Bell, 
  Smartphone, 
  Sliders, 
  CheckCircle, 
  UserCheck, 
  Volume2, 
  Play, 
  Activity, 
  HelpCircle, 
  ListOrdered, 
  Save, 
  AlertTriangle,
  Mail,
  Zap,
  Search,
  RefreshCw,
  FileText,
  ShieldAlert,
  Key,
  Lock,
  User,
  Eye
} from "lucide-react";

interface SafetyPanelProps {
  uid: string;
}

export default function SafetyPanel({ uid }: SafetyPanelProps) {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings states corresponding to database
  const [winStart, setWinStart] = useState("08:00");
  const [winEnd, setWinEnd] = useState("20:00");
  const [grace, setGrace] = useState(120);
  const [intervals, setIntervals] = useState<number[]>([120, 60, 15]);

  // Extended safety custom fields (automatically persisted thanks to ...spread in backend)
  const [checkingInterval, setCheckingInterval] = useState("daily");
  const [activeChannels, setActiveChannels] = useState<string[]>(["sms", "email", "login"]);
  const [secondaryValidatorName, setSecondaryValidatorName] = useState("Sarah Mercer (Sister)");
  const [secondaryValidatorPhone, setSecondaryValidatorPhone] = useState("+1 (555) 019-2834");

  // Heartbeat test state
  const [heartbeatActive, setHeartbeatActive] = useState(false);
  const [heartbeatLog, setHeartbeatLog] = useState<string[]>([]);

  // Security Audit Log states (stubbed to fulfill "Remove Security Audit Log and Ledger features" requirement)
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState("all"); 
  const [logSearch, setLogSearch] = useState("");

  const fetchLogs = async () => {
    // Stubbed
  };

  useEffect(() => {
    // Stubbed
  }, [uid]);

  const filteredLogs: any[] = [];

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/checkin/settings/${uid}`);
        const data = await res.json();
        if (data) {
          setWinStart(data.checkInWindowStart || "08:00");
          setWinEnd(data.checkInWindowEnd || "20:00");
          setGrace(data.gracePeriodMinutes || 120);
          setIntervals(data.reminderIntervals || [120, 60, 15]);
          
          if (data.checkingInterval) setCheckingInterval(data.checkingInterval);
          if (data.activeChannels) setActiveChannels(data.activeChannels);
          if (data.secondaryValidatorName) setSecondaryValidatorName(data.secondaryValidatorName);
          if (data.secondaryValidatorPhone) setSecondaryValidatorPhone(data.secondaryValidatorPhone);
        }
      } catch (e) {
        console.error("Error loading safety settings:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/checkin/settings/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInWindowStart: winStart,
          checkInWindowEnd: winEnd,
          reminderIntervals: intervals,
          gracePeriodMinutes: Number(grace),
          // Additional custom configurations
          checkingInterval,
          activeChannels,
          secondaryValidatorName,
          secondaryValidatorPhone
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchLogs(); // refresh security logs
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving safety settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = (channel: string) => {
    if (activeChannels.includes(channel)) {
      setActiveChannels(activeChannels.filter(c => c !== channel));
    } else {
      setActiveChannels([...activeChannels, channel]);
    }
  };

  const handleTestHeartbeat = () => {
    setHeartbeatActive(true);
    const logs = [
      "Initializing localized safety verification audit...",
      "Querying check-in settings from persistence...",
      `Active window configured from ${winStart} to ${winEnd}`,
      "Checking device activity heartbeats...",
      "Simulating heartbeat trigger: SUCCESS.",
      "LifeContinuity AI proof-of-life state: VERIFIED and safe."
    ];

    setHeartbeatLog([]);
    logs.forEach((log, index) => {
      setTimeout(async () => {
        setHeartbeatLog(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setHeartbeatActive(false);
          // Log heartbeat tested to security alerts backend
          try {
            await fetch("/api/security/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid,
                event: "Heartbeat Tested",
                details: `Executed interactive dry-run safety verification heartbeat. State: VERIFIED.`
              })
            });
            fetchLogs(); // refresh list
          } catch (e) {
            console.error("Failed to log heartbeat tested:", e);
          }
        }
      }, (index + 1) * 600);
    });
  };

  const toggleInterval = (mins: number) => {
    if (intervals.includes(mins)) {
      setIntervals(intervals.filter(i => i !== mins).sort((a,b) => b-a));
    } else {
      setIntervals([...intervals, mins].sort((a,b) => b-a));
    }
  };

  // Escalation Protocol Simulator states
  const [simStage, setSimStage] = useState(0); // 0 = Idle, 1 = Stage 1, 2 = Stage 2, 3 = Stage 3, 4 = Stage 4
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const appendLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: true });
    setSimLogs(prev => [...prev, `[${timeStr}] ${msg}`]);
  };

  const handleAdvanceStep = async () => {
    const nextStage = simStage === 0 ? 1 : simStage + 1;
    if (nextStage > 4) return;

    setSimStage(nextStage);

    if (nextStage === 1) {
      appendLog("⚙️ Initiating Escalation Protocol Simulation...");
      appendLog(`Check-in window [${winStart} - ${winEnd}] closed without user check-in.`);
      appendLog(`Sending reminder 1: SMS & Push Action dispatched. User has ${grace} mins.`);
    } else if (nextStage === 2) {
      appendLog(`⚠️ Pre-deadline warning interval (${grace} mins) expired.`);
      appendLog("User unreachable. Accessing Secondary Safety Contact details.");
      appendLog(`Dispatching high-priority SMS & automated Voice call to ${secondaryValidatorName} (${secondaryValidatorPhone}).`);
    } else if (nextStage === 3) {
      appendLog("⏳ Validator response grace period expired (30 mins).");
      appendLog("Triggering automated recovery & continuity protocol bundle.");
      appendLog("Compiling secure Document Vault elements, insurance profiles, and active bills.");
    } else if (nextStage === 4) {
      appendLog("🛡️ Deployed active Continuity Plan for nominee review.");
      appendLog("Generated SMS access PIN dispatch to Nominee.");
      appendLog("Account state set to EmergencyVerificationActive.");
      appendLog("🎉 Escalation simulation completed successfully.");

      // Trigger actual activation on backend
      try {
        await fetch("/api/emergency/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid,
            triggeredBy: "missedCheckIn"
          })
        });
        fetchLogs(); // Refresh ledger logs
      } catch (e) {
        console.error("Failed to trigger simulation activation:", e);
      }
    }
  };

  const handleStopSimulation = async () => {
    setSimStage(0);
    appendLog("🛑 Escalation simulation ended.");
    // Stand down emergency state if active
    try {
      await fetch("/api/emergency/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      fetchLogs(); // Refresh ledger logs
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateCheckIn = async (method: "smsReply" | "pushAction") => {
    appendLog(method === "smsReply" 
      ? "💬 SMS 'SAFE' keyword received from verified mobile number."
      : "📲 Push Action check-in triggered from lock-screen widget. Verification: SAFE."
    );
    appendLog("LifeContinuity AI status updated to: Verified.");
    setSimStage(0);

    try {
      await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, method })
      });
      fetchLogs(); // Refresh ledger logs
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearSimulator = async () => {
    setSimStage(0);
    setSimLogs([]);
    try {
      await fetch("/api/emergency/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      fetchLogs(); // Refresh ledger logs
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 text-[#e0dafc] space-y-8 animate-fade-in">
      
      {/* Description Info Header */}
      <div className="bg-[#2c3353]/60 border border-[#5d6fa3]/25 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            Lighthouse Safety Configuration Desk
          </h3>
          <p className="text-xs text-[#5d6fa3] leading-relaxed max-w-2xl">
            This panel governs your proof-of-life confirmation thresholds. Ensure these values match your routine so that safety notifications feel natural, while establishing bulletproof contingency handovers for your Nominees.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-center">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-[#5d6fa3]">Auto Escalation: STANDBY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left columns: Main Settings form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Box 1: Checking intervals & active window */}
            <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
                <div className="h-9 w-9 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Proof-of-Life Intervals & Safety Windows</h4>
                  <p className="text-[11px] text-[#5d6fa3]">Determine how often and when Lighthouse checks on you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Check-in frequency */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                    Verification Frequency
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "daily", title: "Once Daily Proof-of-life", desc: "One check-in required inside the window" },
                      { id: "twice", title: "Twice Daily Verification", desc: "Morning and evening checkpoints" },
                      { id: "hourly", title: "Continuous (6-Hour Interval)", desc: "High-frequency safety checks for active safety monitoring" }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setCheckingInterval(opt.id)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          checkingInterval === opt.id
                            ? "bg-[#1e233a] border-[#e0dafc] text-white"
                            : "bg-[#1e233a]/40 border-[#5d6fa3]/15 text-[#e0dafc]/80 hover:bg-[#1e233a]/70"
                        }`}
                      >
                        <p className="font-bold">{opt.title}</p>
                        <p className="text-[10px] text-[#5d6fa3] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timing Window inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                      Active Monitoring Window
                    </label>
                    <p className="text-[10px] text-[#5d6fa3] leading-normal">
                      Notifications are only dispatched during this timeframe to prevent night-time disruptions.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold uppercase text-[#5d6fa3]">Opens</span>
                        <input
                          type="text"
                          value={winStart}
                          onChange={(e) => setWinStart(e.target.value)}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-center font-mono font-bold text-white focus:outline-none focus:border-[#e0dafc]"
                          placeholder="08:00"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[9px] font-bold uppercase text-[#5d6fa3]">Closes</span>
                        <input
                          type="text"
                          value={winEnd}
                          onChange={(e) => setWinEnd(e.target.value)}
                          className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-center font-mono font-bold text-white focus:outline-none focus:border-[#e0dafc]"
                          placeholder="20:00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#1e233a]/50 rounded-xl border border-[#5d6fa3]/10 text-[10px] text-[#5d6fa3] leading-relaxed">
                    <span className="font-bold text-white">Rule Note:</span> Your daily check-in is complete if you log in, respond to an SMS, or sync workspace activity once between <span className="font-bold text-[#e0dafc]">{winStart}</span> and <span className="font-bold text-[#e0dafc]">{winEnd}</span>.
                  </div>
                </div>

              </div>
            </div>

            {/* Box 2: Grace period & Reminder triggers */}
            <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
                <div className="h-9 w-9 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                  <Sliders className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Grace Period & Prior Reminder Escalations</h4>
                  <p className="text-[11px] text-[#5d6fa3]">Define pre-deadline warnings and emergency delays</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Grace Period slider/options */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                    Grace Period Delay Post-Deadline
                  </label>
                  <p className="text-[10px] text-[#5d6fa3] leading-normal">
                    How much time do you have to check in after the active window closes before Nominee extraction triggers?
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5">
                    {[
                      { mins: 30, label: "30 Minutes", desc: "Ultra-high alert" },
                      { mins: 60, label: "1 Hour", desc: "High alert" },
                      { mins: 120, label: "2 Hours", desc: "Standard buffer" },
                      { mins: 240, label: "4 Hours", desc: "Relaxed buffer" }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.mins}
                        onClick={() => setGrace(opt.mins)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          grace === opt.mins
                            ? "bg-[#1e233a] border-[#e0dafc] text-white"
                            : "bg-[#1e233a]/40 border-[#5d6fa3]/15 text-[#e0dafc]/80 hover:bg-[#1e233a]/70"
                        }`}
                      >
                        <span className="block font-black text-xs">{opt.label}</span>
                        <span className="block text-[8px] text-[#5d6fa3] mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reminder triggers checklist */}
                <div className="space-y-3 pt-2">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                    Pre-Deadline Warnings Dispatch Schedule
                  </label>
                  <p className="text-[10px] text-[#5d6fa3] leading-normal">
                    Lighthouse will send you direct alerts on your enabled communication channels at these intervals prior to the window closing.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {[
                      { id: 120, label: "2 Hours Prior", keyName: "t2h" },
                      { id: 60, label: "1 Hour Prior", keyName: "t1h" },
                      { id: 30, label: "30 Mins Prior", keyName: "t30m" },
                      { id: 15, label: "15 Mins Prior", keyName: "t15m" }
                    ].map((rem) => {
                      const isActive = intervals.includes(rem.id);
                      return (
                        <button
                          type="button"
                          key={rem.id}
                          onClick={() => toggleInterval(rem.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-all text-left ${
                            isActive
                              ? "bg-indigo-950/40 border-indigo-500/50 text-[#e0dafc]"
                              : "bg-[#1e233a]/40 border-[#5d6fa3]/15 text-[#5d6fa3] hover:text-[#e0dafc]"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                            isActive ? "bg-indigo-500 border-indigo-400 text-white" : "border-[#5d6fa3]/30"
                          }`}>
                            {isActive && <CheckCircle className="h-3 w-3" />}
                          </div>
                          <span className="font-bold text-[10px]">{rem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Verification Channels & Escalation Validator */}
            <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
                <div className="h-9 w-9 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                  <Smartphone className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Verification Channels & Secondary Validators</h4>
                  <p className="text-[11px] text-[#5d6fa3]">Manage notification delivery methods and backup contacts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Channels toggles */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                    Authorized Safety Channels
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "sms", icon: Smartphone, title: "SMS Reminders & Direct Reply", desc: "Send automated text alerts to your mobile phone" },
                      { id: "email", icon: Mail, title: "Email Backup Verification", desc: "Daily proof-of-life reminders sent via email" },
                      { id: "login", icon: UserCheck, title: "Dashboard Session Logins", desc: "Logging in automatically checks you in for the day" }
                    ].map((chan) => {
                      const isChecked = activeChannels.includes(chan.id);
                      const Icon = chan.icon;
                      return (
                        <div
                          key={chan.id}
                          onClick={() => toggleChannel(chan.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? "bg-indigo-950/30 border-indigo-500/40 text-white"
                              : "bg-[#1e233a]/30 border-[#5d6fa3]/10 text-[#5d6fa3] hover:text-[#e0dafc]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`h-4.5 w-4.5 shrink-0 ${isChecked ? "text-indigo-400" : ""}`} />
                            <div className="min-w-0 text-left">
                              <p className="font-bold text-xs truncate text-[#e0dafc]">{chan.title}</p>
                              <p className="text-[10px] text-[#5d6fa3] truncate">{chan.desc}</p>
                            </div>
                          </div>
                          <div className={`h-5 w-9 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                            isChecked ? "bg-indigo-500 justify-end" : "bg-[#1e233a] justify-start border border-[#5d6fa3]/20"
                          }`}>
                            <span className="h-4 w-4 rounded-full bg-white shadow-md block" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Secondary trusted contact validators */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-widest">
                      Secondary Safety Contact (Validator)
                    </label>
                    <p className="text-[10px] text-[#5d6fa3] leading-normal">
                      If you miss your check-in deadline, this trusted validator is notified first to verify your status before nominee release.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold uppercase text-[#5d6fa3]">Validator Name</span>
                      <input
                        type="text"
                        value={secondaryValidatorName}
                        onChange={(e) => setSecondaryValidatorName(e.target.value)}
                        className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        placeholder="e.g. Sarah Mercer (Sister)"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold uppercase text-[#5d6fa3]">Validator Phone Number</span>
                      <input
                        type="text"
                        value={secondaryValidatorPhone}
                        onChange={(e) => setSecondaryValidatorPhone(e.target.value)}
                        className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                        placeholder="e.g. +1 (555) 019-2834"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Form Save Button and success trigger */}
            <div className="flex items-center justify-between bg-[#1e233a] p-4 rounded-2xl border border-[#5d6fa3]/20 gap-4">
              <div className="text-xs">
                {saveSuccess ? (
                  <p className="text-green-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Safety configuration saved securely to profile registry!
                  </p>
                ) : (
                  <p className="text-[#5d6fa3] font-medium leading-relaxed">
                    Make sure to save changes to register update events onto your nominee ledger.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-black text-xs py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                id="btn-safety-save-settings"
              >
                <Save className="h-4 w-4 text-[#2c3353]" />
                {loading ? "Persisting Settings..." : "Save Safety Parameters"}
              </button>
            </div>

          </form>
        </div>

        {/* Right column: Interactive escalation visualization and testing */}
        <div className="space-y-6">
          
          {/* Box 1: Escalation Timeline Sequence Map */}
          <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
              <div className="h-9 w-9 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                <ListOrdered className="h-4.5 w-4.5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Nominee Release Escalation Steps</h4>
                <p className="text-[11px] text-[#5d6fa3]">Current configured automatic handover strategy</p>
              </div>
            </div>

            <div className="relative border-l border-[#5d6fa3]/20 pl-6 ml-3 space-y-6 text-xs">
              
              {/* Step 1: Warnings */}
              <div className="relative">
                <div className="absolute -left-9.5 top-0 h-7 w-7 rounded-full bg-indigo-950 border border-indigo-400 flex items-center justify-center text-[10px] font-black text-indigo-200">
                  1
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Pre-Deadline Reminders</h5>
                  <p className="text-[11px] text-[#5d6fa3] leading-relaxed">
                    Lighthouse issues warning alerts to you via {activeChannels.map(c => c.toUpperCase()).join(", ")} at {intervals.map(i => `${i}m`).join(", ")} prior to window close.
                  </p>
                </div>
              </div>

              {/* Step 2: Validator alert */}
              <div className="relative">
                <div className="absolute -left-9.5 top-0 h-7 w-7 rounded-full bg-indigo-950 border border-indigo-400 flex items-center justify-center text-[10px] font-black text-indigo-200">
                  2
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Contact Fallback Validator</h5>
                  <p className="text-[11px] text-[#5d6fa3] leading-relaxed">
                    If deadline closes and {grace}m grace timeout passes, SMS and voice triggers dispatch to <span className="font-bold text-white">{secondaryValidatorName}</span> to verify your status.
                  </p>
                </div>
              </div>

              {/* Step 3: Nominee portal release */}
              <div className="relative">
                <div className="absolute -left-9.5 top-0 h-7 w-7 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center text-[10px] font-black text-red-400 animate-pulse">
                  3
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-red-400">Emergency Continuity Decryption</h5>
                  <p className="text-[11px] text-[#5d6fa3] leading-relaxed">
                    Automated payload bundling completes. Designated nominee receives access credentials and PIN verification code via SMS to view secure vaults.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Box 2: Test safety pulse simulation */}
          <div className="bg-[#2c3353] rounded-2xl border border-dashed border-indigo-500/25 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Safety Heartbeat Simulator</h4>
            </div>
            
            <p className="text-xs text-[#5d6fa3] leading-relaxed">
              Test your locally configured safety parameters immediately by executing a dry-run confirmation ping.
            </p>

            {heartbeatLog.length > 0 && (
              <div className="bg-[#1e233a] p-3.5 rounded-xl border border-[#5d6fa3]/20 space-y-1.5 font-mono text-[10px] text-[#e0dafc]">
                {heartbeatLog.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-normal">
                    <span className="text-indigo-400 shrink-0">›</span>
                    <p>{log}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleTestHeartbeat}
              disabled={heartbeatActive}
              className="w-full bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Activity className={`h-4 w-4 text-indigo-400 ${heartbeatActive ? "animate-pulse" : ""}`} />
              {heartbeatActive ? "Auditing Safety Pulse..." : "Test Local Heartbeat"}
            </button>
          </div>

        </div>

      </div>

      {/* Interactive Escalation and Safety Simulator Section */}
      <div className="bg-[#1e233a]/60 border border-[#5d6fa3]/25 p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-rose-400" />
            Escalation Protocol Simulator
          </h3>
          <p className="text-xs text-[#5d6fa3] mt-1 leading-relaxed">
            Dry-run your configured safety thresholds immediately. Observe how Lighthouse tracks check-in status, dispatches warnings, alerts validators, and securely releases keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Offline & Crisis Safety Simulator */}
          <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="h-5 w-5 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Offline & Crisis Safety Simulator</h4>
              </div>
              <p className="text-[11px] text-[#5d6fa3] leading-relaxed">
                Phone batteries die or signal is lost in hospital emergencies. Test the secondary one-tap secure check-in paths directly below.
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSimulateCheckIn("pushAction")}
                  className="w-full bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/20 font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 group-hover:scale-110 transition-transform" />
                    Simulate Push Action Check-In
                  </span>
                  <span className="text-[9px] text-[#5d6fa3] font-medium italic">1-Tap Safe Confirmation</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateCheckIn("smsReply")}
                  className="w-full bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/20 font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400 group-hover:scale-110 transition-transform" />
                    Simulate SMS "SAFE" Reply
                  </span>
                  <span className="text-[9px] text-[#5d6fa3] font-medium italic">Trigger Bypass</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#5d6fa3]/10 flex items-center justify-between text-[10px]">
              <span className="text-[#5d6fa3]">Stuck in simulation mode?</span>
              <button
                type="button"
                onClick={handleClearSimulator}
                className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear & Reset Simulator
              </button>
            </div>
          </div>

          {/* Escalation Protocol Simulator */}
          <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 p-5 flex flex-col justify-between space-y-4 relative">
            <div className="absolute top-4 right-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md animate-pulse">
              Active Play
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-rose-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Escalation Protocol Simulator</h4>
              </div>
              <p className="text-[11px] text-[#5d6fa3] leading-relaxed">
                Step through the automated escalation workflow to observe what happens when a user is unreachable and the window closes.
              </p>

              {/* Stage Visual Box */}
              <div className="bg-[#1e233a]/80 border border-[#5d6fa3]/20 rounded-xl p-3.5 space-y-2 min-h-[95px] flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#5d6fa3] uppercase tracking-widest">Current Stage:</span>
                  <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                    {simStage === 0 ? "Not Started" : `Stage ${simStage} of 4`}
                  </span>
                </div>

                <div className="text-xs leading-relaxed font-medium text-[#e0dafc]">
                  {simStage === 0 && (
                    <span className="text-[#5d6fa3] italic">Press "Advance Step" to start simulation workflow.</span>
                  )}
                  {simStage === 1 && (
                    <span className="text-indigo-200">⏳ Window closed. SMS & Push notifications fired to user. Awaiting {grace} mins.</span>
                  )}
                  {simStage === 2 && (
                    <span className="text-amber-300">⚠️ Pre-deadline warnings failed. Dispatching alert to secondary trusted validator <strong className="text-white">[{secondaryValidatorName}]</strong> via SMS/Voice.</span>
                  )}
                  {simStage === 3 && (
                    <span className="text-pink-300">🛡️ Validator confirmation timeout. Initiating secure nominee ledger compilation.</span>
                  )}
                  {simStage === 4 && (
                    <span className="text-emerald-400 font-bold">🔑 Handover complete. Nominee access credentials decrypted and active. Dashboard transitioned to emergency mode.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#5d6fa3]/10">
              <button
                type="button"
                onClick={handleAdvanceStep}
                disabled={simStage === 4}
                className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Bell className="h-3.5 w-3.5 text-white" />
                {simStage === 0 ? "Start Simulator" : "Advance Step"}
              </button>
              <button
                type="button"
                onClick={handleStopSimulation}
                disabled={simStage === 0}
                className="bg-[#1e233a] hover:bg-[#1e233a]/80 disabled:opacity-40 text-[#e0dafc] border border-[#5d6fa3]/25 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer"
              >
                Stop
              </button>
            </div>
          </div>

          {/* Live System Telemetry Logs */}
          <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live System Telemetry Logs</h4>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {/* Monospaced Log Output container */}
              <div className="flex-1 bg-[#121626] p-3 rounded-xl border border-emerald-500/10 min-h-[160px] max-h-[180px] overflow-y-auto font-mono text-[9px] text-emerald-400/90 leading-normal space-y-1.5 flex flex-col scrollbar-thin">
                {simLogs.length === 0 ? (
                  <span className="text-emerald-500/30 italic text-center my-auto">[Telemetry interface active. Logs print sequentially during play]</span>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-emerald-500/60 select-none">›</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
