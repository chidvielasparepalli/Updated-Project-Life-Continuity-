import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, Sliders, CheckSquare, Sparkles, FolderSync, ExternalLink, ShieldCheck } from "lucide-react";

interface DataExtractorProps {
  uid: string;
}

export default function DataExtractor({ uid }: DataExtractorProps) {
  const [senders, setSenders] = useState("");
  const [keywords, setKeywords] = useState("");
  const [emailRecords, setEmailRecords] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const fetchSettingsAndRecords = async () => {
    try {
      const sRes = await fetch(`/api/gmail/settings/${uid}`);
      const sData = await sRes.json();
      if (sData) {
        setSenders(sData.sendersToSync || "");
        setKeywords(sData.targetKeywords || "");
      }

      const rRes = await fetch(`/api/gmail/records/${uid}`);
      const rData = await rRes.json();
      setEmailRecords(rData || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettingsAndRecords();
  }, [uid]);

  const handleSaveSettings = async () => {
    try {
      await fetch(`/api/gmail/settings/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sendersToSync: senders,
          targetKeywords: keywords
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    // Persist active settings first
    await handleSaveSettings();

    try {
      const res = await fetch("/api/gmail/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      if (res.ok) {
        fetchSettingsAndRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Bills": return "bg-red-950/40 text-red-400 border border-red-900/50";
      case "Insurance": return "bg-blue-950/40 text-blue-400 border border-blue-900/50";
      case "Travel": return "bg-amber-950/40 text-amber-400 border border-amber-900/50";
      case "Healthcare": return "bg-green-950/40 text-green-400 border border-green-900/50";
      case "Appointments": return "bg-indigo-950/40 text-indigo-400 border border-indigo-900/50";
      default: return "bg-[#2c3353] text-[#e0dafc] border border-[#5d6fa3]/20";
    }
  };

  const filteredRecords = activeCategory === "All"
    ? emailRecords
    : emailRecords.filter(r => r.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#e0dafc]">
      
      {/* OAuth & Sync Configuration */}
      <div className="space-y-6">
        
        {/* Workspace Auth Box */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
            <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
              <FolderSync className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Workspace Connector</h3>
              <p className="text-xs text-[#5d6fa3]">Authorized Google API syncing</p>
            </div>
          </div>

          <p className="text-xs text-[#5d6fa3] leading-relaxed">
            By connecting Google Workspace, Lighthouse securely scans your inbox and scheduled agendas for important alerts (renewals, bills, appointments, healthcare summaries) to map out a complete real-time continuity timeline automatically.
          </p>

          {authorized ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-950/40 p-3 rounded-xl border border-green-800/60">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              Google Workspace Account Authorized
            </div>
          ) : (
            <button
              onClick={() => setAuthorized(true)}
              className="w-full bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              id="btn-workspace-authorize"
            >
              Authorize Google Workspace Sync
              <ExternalLink className="h-3.5 w-3.5 text-[#2c3353]" />
            </button>
          )}
        </div>

        {/* Sync Filters Setting */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#5d6fa3]/20 pb-2">
            <Sliders className="h-4 w-4 text-[#e0dafc]" />
            Synchronization Filters
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Specific Senders to Sync</label>
              <input
                type="text"
                value={senders}
                onChange={(e) => setSenders(e.target.value)}
                onBlur={handleSaveSettings}
                className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                placeholder="billing@pge.com, loan@hdfc.com"
                id="input-sync-senders"
              />
              <p className="text-[9px] text-[#5d6fa3] opacity-80">Restrict scanning to particular senders. Comma-separated.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Target Subject Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onBlur={handleSaveSettings}
                className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                placeholder="loan, emi, bills, policy, booking"
                id="input-sync-keywords"
              />
              <p className="text-[9px] text-[#5d6fa3] opacity-80">Restrict search queries to terms. Comma-separated.</p>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !authorized}
              className={`w-full font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                authorized
                  ? "bg-[#e0dafc] hover:brightness-110 text-[#2c3353] shadow-md border border-[#5d6fa3]/10 cursor-pointer"
                  : "bg-[#1e233a] text-[#5d6fa3] border border-[#5d6fa3]/20 cursor-not-allowed"
              }`}
              id="btn-sync-trigger"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing Workspace..." : "Scan & Classify Inbox"}
            </button>
          </div>
        </div>
      </div>

      {/* Sync Timeline Results Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 text-[#e0dafc]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#5d6fa3]/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Synced Gmail Timeline</h3>
                <p className="text-xs text-[#5d6fa3]">Automatically classified bills, healthcare and booking events</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-[#1e233a] p-1 rounded-xl self-start border border-[#5d6fa3]/20" id="gmail-category-filters">
              {["All", "Bills", "Insurance", "Healthcare", "Appointments"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-[#2c3353] text-[#e0dafc] border border-[#5d6fa3]/25 shadow-md"
                      : "text-[#5d6fa3] hover:text-[#e0dafc]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-16 text-[#5d6fa3]">
                <Mail className="h-12 w-12 mx-auto text-[#5d6fa3] opacity-60 mb-3" />
                <p className="text-sm font-semibold text-[#e0dafc]">No synchronized email records yet.</p>
                <p className="text-xs text-[#5d6fa3] mt-1 max-w-sm mx-auto leading-relaxed">Authorize your workspace connection and run "Scan & Classify Inbox" to sync critical timelines.</p>
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 border border-[#5d6fa3]/20 rounded-xl hover:border-[#5d6fa3]/40 bg-[#1e233a] space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{rec.subject}</h4>
                      <p className="text-[10px] text-[#5d6fa3] mt-0.5">Sender: {rec.sender} • {new Date(rec.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryColor(rec.category)}`}>
                      {rec.category}
                    </span>
                  </div>

                  <div className="bg-[#2c3353] p-3 rounded-lg border border-[#5d6fa3]/15">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#e0dafc] shrink-0" />
                      Gemini Extracted Action Item Summary:
                    </p>
                    <p className="text-xs text-[#e0dafc]/90 leading-relaxed font-medium">{rec.extractedSummary}</p>
                  </div>

                  <details className="group">
                    <summary className="text-[10px] font-bold text-[#5d6fa3] cursor-pointer hover:text-[#e0dafc] select-none list-none flex items-center gap-1">
                      <span>▶</span> View Original Email Snippet
                    </summary>
                    <div className="mt-2 p-2.5 bg-[#1e233a]/80 rounded text-[11px] font-mono text-[#5d6fa3] border border-[#5d6fa3]/15 whitespace-pre-wrap leading-relaxed">
                      {rec.rawSnippet}...
                    </div>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
