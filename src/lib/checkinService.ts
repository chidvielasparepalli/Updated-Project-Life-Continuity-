import { CheckInStats, CheckInEntry } from "../types";
import { apiFetch } from "./api";

export interface CheckInResponse {
  success: boolean;
  stats: CheckInStats;
  history: CheckInEntry[];
  events: any[];
}

/**
 * Triggers a Proof of Life check-in on the backend.
 * Returns the fully compiled, updated stats, history and chronological events.
 */
export async function triggerCheckIn(uid: string, method: string = "manualButton"): Promise<CheckInResponse> {
  const res = await apiFetch("/api/checkin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid, method }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status} error during check-in`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to log check-in");
  }

  return {
    success: true,
    stats: data.stats,
    history: data.history || [],
    events: data.events || [],
  };
}
