import { apiRequest } from "./client";

/** GET /api/slots?centreId=&cropId=&date= */
export function getAvailableSlots({ centreId, cropId, date }) {
  const params = new URLSearchParams({
    centreId: String(centreId),
    cropId: String(cropId),
    date
  });
  return apiRequest(`/api/slots?${params.toString()}`);
}
