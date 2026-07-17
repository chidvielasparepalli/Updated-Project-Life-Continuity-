import React, { useState, useEffect } from "react";
import { AlertOctagon, Sparkles, Volume2, HelpCircle, FileText, Send, XOctagon, Check, Copy, RefreshCw } from "lucide-react";
import { apiFetch } from "../lib/api";

interface EmergencyCenterProps {
  uid: string;
  onEmergencyStatusChanged?: () => void;
  triggerRefreshCounter?: number;
}

export default function EmergencyCenter({ uid, onEmergencyStatusChanged, triggerRefreshCounter }: EmergencyCenterProps) {
  const [isActive, setIsActive] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Drafting options
  const [sendTo, setSendTo] = useState("Family Group");
  const [tone, setTone] = useState("Reassuring");
  const [draftText, setDraftText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  // TTS speaking state
  const [speaking, setSpeaking] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await apiFetch(`/api/emergency/status/${uid}`);
      const data = await res.json();
      setIsActive(data.active);
      setPlan(data.plan || null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [uid, triggerRefreshCounter]);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/emergency/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, triggeredBy: "manual" })
      });
      if (res.ok) {
        await checkStatus();
        if (onEmergencyStatusChanged) onEmergencyStatusChanged();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/emergency/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      if (res.ok) {
        setDraftText("");
        if ("speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
          } catch (e) {
            console.warn("Deactivate speech cancel failed:", e);
          }
        }
        setSpeaking(false);
        await checkStatus();
        if (onEmergencyStatusChanged) onEmergencyStatusChanged();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    setDrafting(true);
    setCopied(false);
    try {
      const res = await apiFetch("/api/emergency/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, sendTo, tone })
      });
      const data = await res.json();
      if (res.ok) {
        setDraftText(data.draft);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrafting(false);
    }
  };

  const handleCopyDraft = () => {
    if (!draftText) return;
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakBriefing = () => {
    if (!plan || !plan.aiSummary) return;

    if (speaking) {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("Speech synthesis cancel failed:", e);
        }
      }
      setSpeaking(false);
      return;
    }

    try {
      const cleanText = plan.aiSummary.replace(/[*#]/g, ""); // clean markdown characters
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.speak(utterance);
      } else {
        setSpeaking(false);
      }
    } catch (err) {
      console.warn("Speech synthesis failed to speak:", err);
      setSpeaking(false);
    }
  };

  // Stop reading voice if component unmounts
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn("Speech synthesis unmount cancel failed:", e);
        }
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {!isActive ? (
        // INACTIVE PREPARATION SCREEN
        <div className="bg-[#2c3353] rounded-3xl border border-dashed border-red-900/50 p-8 text-center max-w-2xl mx-auto space-y-6 shadow-xl text-[#e0dafc]">
          <div className="h-16 w-16 bg-[#1e233a] rounded-full flex items-center justify-center text-red-400 mx-auto border border-[#5d6fa3]/30">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Emergency Standby Mode</h2>
            <p className="text-xs text-[#5d6fa3] max-w-md mx-auto leading-relaxed">
              When triggered, Lighthouse automatically bundles all pending financial commitments, healthcare extractions, active schedules, and secure vault documents. Authorized nominees can unlock read-only handover portals immediately.
            </p>
          </div>

          <div className="bg-[#1e233a] p-5 rounded-2xl border border-red-950/60 text-left space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase flex items-center gap-1.5 tracking-wider">
              <Sparkles className="h-4 w-4 text-red-400" />
              Pre-activation Checklist
            </h4>
            <ul className="text-xs text-[#e0dafc]/80 space-y-1.5 list-disc list-inside">
              <li>Emergency Contacts and Mobile number of Nominee are specified under Profile (Tab 2).</li>
              <li>Required insurance schedules are toggled to "Nominee allowed" in Vault (Tab 3).</li>
              <li>Proof-of-life checking intervals are specified in Safety Panel (Tab 9).</li>
            </ul>
          </div>

          <button
            onClick={handleActivate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm py-3 px-8 rounded-xl shadow-lg transition-all"
            id="btn-activate-emergency-manual"
          >
            {loading ? "Compiling Continuity Plan..." : "Manual Emergency Activation"}
          </button>
        </div>
      ) : (
        // ACTIVE COMMAND CENTER VIEW
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* AI Coordination & Voice Briefing */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary Card */}
            <div className="bg-[#2c3353] rounded-2xl border-2 border-red-600 shadow-xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-2 bg-red-600 w-full" />
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-red-400 border border-[#5d6fa3]/25">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Lighthouse AI Response Summary
                    </h3>
                    <p className="text-[10px] font-bold uppercase text-red-400 tracking-wider">
                      Emergency Verification Mode: ACTIVE (Trigger: {plan?.triggeredBy})
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shrink-0"
                  id="btn-emergency-deactivate"
                >
                  <XOctagon className="h-3.5 w-3.5" />
                  Stand Down Mode
                </button>
              </div>

              {/* Narrated Summary text block */}
              <div className="prose prose-sm text-[#e0dafc]/90 leading-relaxed bg-[#1e233a] p-5 rounded-2xl border border-[#5d6fa3]/20 font-medium">
                {plan?.aiSummary}
              </div>

              {/* TTS Voice Briefing controls */}
              <div className="flex items-center gap-3 bg-[#1e233a] p-4 rounded-xl border border-[#5d6fa3]/30 justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Volume2 className="h-5 w-5 text-[#e0dafc]" />
                  Play Voice Briefing Playbook hands-free
                </div>
                <button
                  onClick={handleSpeakBriefing}
                  className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 ${
                    speaking
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[#e0dafc] text-[#2c3353] hover:brightness-110"
                  }`}
                  id="btn-emergency-tts"
                >
                  {speaking ? "Pause Briefing" : "Read Aloud"}
                </button>
              </div>
            </div>

            {/* Compiled Continuity Plan details */}
            <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-6 text-[#e0dafc]">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#5d6fa3]/20 pb-3">
                <FileText className="h-5 w-5 text-[#e0dafc]" />
                Compiled Nominee Continuity Ledger
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#e0dafc]">
                <div className="space-y-2">
                  <h4 className="font-bold text-[#5d6fa3] uppercase text-[10px] tracking-wider">Things to Pay This Week</h4>
                  {plan?.thingsToPayThisWeek?.length === 0 ? (
                    <p className="text-[#5d6fa3] italic">None on record.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {plan?.thingsToPayThisWeek?.map((b: string, idx: number) => (
                        <li key={idx} className="font-medium text-[#e0dafc]/90">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#5d6fa3] uppercase text-[10px] tracking-wider">Medicine Refill Schedule</h4>
                  {plan?.medicinesToRefill?.length === 0 ? (
                    <p className="text-[#5d6fa3] italic">None specified.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {plan?.medicinesToRefill?.map((m: string, idx: number) => (
                        <li key={idx} className="font-medium text-[#e0dafc]/90">{m}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 border-t border-[#5d6fa3]/20 pt-4 md:col-span-2">
                  <h4 className="font-bold text-[#5d6fa3] uppercase text-[10px] tracking-wider">Insurance claims roadmap</h4>
                  {plan?.insuranceClaimChecklist?.length === 0 ? (
                    <p className="text-[#5d6fa3] italic">None specified.</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {plan?.insuranceClaimChecklist?.map((cl: string, idx: number) => (
                        <li key={idx} className="font-medium text-[#e0dafc]/90">{cl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Smart Update Update Drafter panel */}
          <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-5 text-[#e0dafc]">
            <div className="flex items-center gap-2 pb-1 border-b border-[#5d6fa3]/20">
              <Sparkles className="h-5 w-5 text-[#e0dafc]" />
              <h3 className="font-bold text-white text-base">Smart Update Drafter</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Target Recipient</label>
                <select
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                >
                  <option value="Family Group">Family Coordinator</option>
                  <option value="Work Manager">Professional Manager / Boss</option>
                  <option value="Emergency Contact">Emergency Responder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-[#5d6fa3] uppercase tracking-wider">Communication Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                >
                  <option value="Reassuring">Reassuring & Calm</option>
                  <option value="Urgent">Urgent & Clear</option>
                  <option value="Professional">Professional Notice</option>
                </select>
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={drafting}
                className="w-full bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                id="btn-emergency-draft-generate"
              >
                <RefreshCw className={`h-4 w-4 ${drafting ? "animate-spin" : ""}`} />
                {drafting ? "Drafting with Gemini..." : "Generate Custom Draft"}
              </button>

              {draftText && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#5d6fa3] uppercase tracking-wider">Draft Subject & Copy</span>
                    <button
                      onClick={handleCopyDraft}
                      className="text-[#e0dafc] font-bold hover:underline flex items-center gap-1 text-[10px] uppercase tracking-wider"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy text
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={draftText}
                    rows={8}
                    className="w-full p-3 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl font-sans text-xs text-[#e0dafc] leading-relaxed outline-none resize-none"
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
