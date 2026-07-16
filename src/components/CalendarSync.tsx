import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw, Plus, Trash2, MapPin, Clock, Info, CheckCircle, Shield, ExternalLink, Sparkles } from "lucide-react";

interface CalendarSyncProps {
  uid: string;
}

export default function CalendarSync({ uid }: CalendarSyncProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  
  // Manual Appointment Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventNotes, setEventNotes] = useState("");

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/life-graph/${uid}`);
      const data = await res.json();
      if (data) {
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error("Error loading appointments", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [uid]);

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      if (res.ok) {
        const data = await res.json();
        // Update list of appointments
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Calendar sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/life-graph/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          name: eventName,
          date: eventDate,
          time: eventTime,
          location: eventLocation,
          notes: eventNotes,
          status: "Upcoming"
        })
      });

      if (res.ok) {
        setEventName("");
        setEventDate("");
        setEventTime("");
        setEventLocation("");
        setEventNotes("");
        setShowAddForm(false);
        fetchCalendarData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event from your calendar?")) return;
    try {
      const res = await fetch(`/api/life-graph/appointment/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCalendarData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Group appointments by Date
  const sortedEvents = [...appointments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#e0dafc]">
      
      {/* Left side: OAuth & Controls Panel */}
      <div className="space-y-6">
        
        {/* Auth Connector */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3">
            <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Calendar Connector</h3>
              <p className="text-xs text-[#5d6fa3]">Authorized Google Calendar Sync</p>
            </div>
          </div>

          <p className="text-xs text-[#5d6fa3] leading-relaxed">
            Connect Google Calendar to synchronize medical visits, insurance renewals, and school schedules automatically. Synced events automatically update your emergency nominee continuity plan.
          </p>

          {authorized ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-950/40 p-3 rounded-xl border border-green-800/60">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Google Calendar Sync Authorized
            </div>
          ) : (
            <button
              onClick={() => setAuthorized(true)}
              className="w-full bg-[#e0dafc] hover:brightness-110 text-[#2c3353] font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              id="btn-calendar-authorize"
            >
              Authorize Google Calendar
              <ExternalLink className="h-3.5 w-3.5 text-[#2c3353]" />
            </button>
          )}

          <button
            onClick={handleSyncCalendar}
            disabled={isSyncing || !authorized}
            className={`w-full font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
              authorized
                ? "bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] border border-[#5d6fa3]/30 cursor-pointer"
                : "bg-[#1e233a] text-[#5d6fa3] border border-[#5d6fa3]/20 cursor-not-allowed"
            }`}
            id="btn-calendar-sync-trigger"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Google Calendar..." : "Sync Calendar Schedule"}
          </button>
        </div>

        {/* Add Manual Event Form Quick-Access */}
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#5d6fa3]/20 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#e0dafc]" />
              Add Calendar Event
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-[#e0dafc] hover:underline"
              >
                Configure
              </button>
            )}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAddAppointment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="e.g. Heart Clinic Checkup"
                  id="calendar-input-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Time</label>
                  <input
                    type="text"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl p-2.5 text-xs text-[#e0dafc] focus:outline-none focus:border-[#e0dafc]"
                  placeholder="e.g. Community Medical Center"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-[#5d6fa3] tracking-wider">Internal Notes</label>
                <textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#1e233a] border border-[#5d6fa3]/30 rounded-xl focus:outline-none focus:border-[#e0dafc] text-xs resize-none text-[#e0dafc]"
                  placeholder="Add prescriptions, guidelines or entry instructions..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#5d6fa3]/15">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-[#1e233a] hover:bg-[#1e233a]/80 text-[#e0dafc] text-xs rounded-lg font-semibold border border-[#5d6fa3]/25"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#e0dafc] text-[#2c3353] text-xs rounded-lg font-black hover:brightness-110 transition-all"
                >
                  Create Event
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-[#5d6fa3] space-y-3">
              <Calendar className="h-8 w-8 mx-auto opacity-40 text-[#5d6fa3]" />
              <p className="text-xs max-w-xs mx-auto leading-relaxed">
                Add medical checkups or household schedules to synchronize active alarms and safety routines.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#1e233a] hover:bg-[#5d6fa3]/20 text-xs font-bold text-[#e0dafc] border border-[#5d6fa3]/30 rounded-xl transition-colors inline-block cursor-pointer"
              >
                Create Manual Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right/Center: Calendar Timeline Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#2c3353] rounded-2xl border border-[#5d6fa3]/30 shadow-lg p-6">
          <div className="flex items-center gap-3 border-b border-[#5d6fa3]/20 pb-3 mb-6">
            <div className="h-10 w-10 bg-[#1e233a] rounded-lg flex items-center justify-center text-[#e0dafc] border border-[#5d6fa3]/25">
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Lighthouse Chronological Agenda</h3>
              <p className="text-xs text-[#5d6fa3]">Your integrated safety calendar and upcoming schedule logs</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#5d6fa3] animate-pulse flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 animate-spin text-[#e0dafc] mb-2" />
              <p className="text-xs">Reading calendar registry values...</p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-20 text-[#5d6fa3]">
              <Calendar className="h-14 w-14 mx-auto text-[#5d6fa3] opacity-60 mb-3" />
              <h4 className="text-sm font-semibold text-[#e0dafc]">Calendar agenda empty</h4>
              <p className="text-xs text-[#5d6fa3] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Authorize Google Calendar integration above or tap "Create Manual Event" to structure your critical appointments and life milestones.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((evt) => {
                return (
                  <div
                    key={evt.id}
                    className="p-4 border border-[#5d6fa3]/20 bg-[#1e233a] rounded-2xl hover:border-[#5d6fa3]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-1.5 bg-[#2c3353] rounded-lg text-white border border-[#5d6fa3]/20 shrink-0">
                          <Calendar className="h-4 w-4 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{evt.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#5d6fa3] mt-1 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(evt.date).toLocaleDateString()} at {evt.time}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1 truncate max-w-xs">
                                <MapPin className="h-3 w-3" />
                                {evt.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {evt.notes && (
                        <div className="ml-9 p-2.5 bg-[#2c3353]/40 rounded-xl text-xs text-[#e0dafc]/85 border border-[#5d6fa3]/10 flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 text-[#e0dafc] shrink-0 mt-0.5" />
                          <p className="font-medium">{evt.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0 self-end sm:self-center ml-9 sm:ml-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-950/40 text-green-400 border border-green-900/40">
                        Active Sync
                      </span>
                      <button
                        onClick={() => handleDeleteAppointment(evt.id)}
                        className="p-2 hover:bg-red-950/40 rounded-lg text-red-400 transition-colors border border-transparent hover:border-red-900/30"
                        title="Delete agenda item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
