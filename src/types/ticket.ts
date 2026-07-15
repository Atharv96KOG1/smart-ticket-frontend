export type Priority = "High" | "Medium" | "Low";
export type Confidence = "High" | "Medium" | "Low";

export interface Issue {
  id: number;
  category: string;
  priority: Priority;
  assigned_team: string;
  reasoning: string;
  confidence?: Confidence;
}

export interface RouteResponse {
  issues: Issue[];
  processing_time_ms: number;
}

export interface ErrorResponse {
  detail?: string;
}

export interface SampleTicket {
  text: string;
}
