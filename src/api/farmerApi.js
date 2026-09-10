import { apiRequest } from "./client";

/** POST /api/farmers — body: { name, mobile, district, village, location } */
export function createFarmer(payload) {
  return apiRequest("/api/farmers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** GET /api/farmers/:id — lookup by generated farmer_id only */
export function getFarmerById(farmerId) {
  return apiRequest(`/api/farmers/${encodeURIComponent(farmerId)}`);
}
