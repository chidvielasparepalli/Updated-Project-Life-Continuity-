import React from "react";

interface AddCustomEventModalProps {
  customTitle: string;
  setCustomTitle: (val: string) => void;
  customCategory: "Medical Consults" | "Financial / EMI" | "Family & School";
  setCustomCategory: (val: "Medical Consults" | "Financial / EMI" | "Family & School") => void;
  customPriority: "High" | "Medium" | "Low";
  setCustomPriority: (val: "High" | "Medium" | "Low") => void;
  customDate: string;
  setCustomDate: (val: string) => void;
  customTime: string;
  setCustomTime: (val: string) => void;
  customAmount: string;
  setCustomAmount: (val: string) => void;
  customLocation: string;
  setCustomLocation: (val: string) => void;
  customNotes: string;
  setCustomNotes: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddCustomEventModal({
  customTitle,
  setCustomTitle,
  customCategory,
  setCustomCategory,
  customPriority,
  setCustomPriority,
  customDate,
  setCustomDate,
  customTime,
  setCustomTime,
  customAmount,
  setCustomAmount,
  customLocation,
  setCustomLocation,
  customNotes,
  setCustomNotes,
  onClose,
  onSubmit,
}: AddCustomEventModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1e233a]/80 backdrop-blur-sm flex items-center justify-center p-4" id="modal-add-custom-event">
      <div className="bg-[#2c3353] rounded-2xl max-w-md w-full p-6 border border-[#5d6fa3]/30 shadow-2xl space-y-4 text-[#e0dafc] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#5d6fa3]/20 pb-3">
          <h4 className="font-bold text-white text-base">Add Custom Life Obligation</h4>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-[#5d6fa3] hover:text-white transition-colors cursor-pointer text-sm font-bold"
          >
            Close
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
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
              onClick={onClose}
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
  );
}
