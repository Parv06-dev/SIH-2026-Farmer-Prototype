import { apiRequest } from "./client";

/** GET /api/centres */
export function getCentres() {
  return apiRequest("/api/centres");
}
