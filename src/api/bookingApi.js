import { apiRequest } from "./client";

/** POST /api/bookings — body: { farmerId, slotId } */
export function createBooking({ farmerId, slotId }) {
  return apiRequest("/api/bookings", {
    method: "POST",
    body: JSON.stringify({ farmerId, slotId })
  });
}

/** GET /api/bookings/:id */
export function getBookingById(bookingId) {
  return apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}`);
}

/** DELETE /api/bookings/:id */
export function cancelBooking(bookingId) {
  return apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "DELETE"
  });
}
