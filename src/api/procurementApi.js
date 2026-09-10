import { apiRequest } from "./client";

/** GET /api/procurement/:bookingId */
export function getProcurementStatus(bookingId) {
  return apiRequest(`/api/procurement/${encodeURIComponent(bookingId)}`);
}

/** PATCH /api/procurement/:bookingId/status */
export function updateProcurementStatus(bookingId, payload) {
  return apiRequest(`/api/procurement/${encodeURIComponent(bookingId)}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
