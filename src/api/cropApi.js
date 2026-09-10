import { apiRequest } from "./client";

/** GET /api/crops */
export function getCrops() {
  return apiRequest("/api/crops");
}
