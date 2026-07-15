import type { RouteResponse } from "./ticket";

export interface HistoryEntry {
  id: string;
  message: string;
  timestamp: number;
  result: RouteResponse;
}
