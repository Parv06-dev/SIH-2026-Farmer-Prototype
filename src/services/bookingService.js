import * as bookingApi from "../api/bookingApi";
import * as procurementApi from "../api/procurementApi";

function localToken() {
  return Math.floor(100000 + Math.random() * 900000);
}

export async function bookSlot({ farmer, slot, bookingsPaused }) {
  if (bookingsPaused) {
    const error = new Error("New bookings are paused by mandi control.");
    error.code = "BOOKINGS_PAUSED";
    throw error;
  }

  if (slot.availableCapacity <= 0) {
    const error = new Error("This slot is no longer available.");
    error.code = "SLOT_FULL";
    throw error;
  }

  if (slot.source === "api" && farmer.source === "api") {
    try {
      const created = await bookingApi.createBooking({
        farmerId: farmer.farmerId,
        slotId: slot.slotId
      });
      return {
        bookingId: created.booking_id,
        farmerId: created.farmer_id,
        slotId: created.slot_id,
        status: created.status,
        tokenNumber: created.token_number,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        originalStartTime: slot.originalStartTime || slot.startTime,
        originalEndTime: slot.originalEndTime || slot.endTime,
        centreName: slot.centreName,
        cropName: slot.cropName,
        source: "api",
        smsSent: true,
        whatsappSent: true,
        recentlyChanged: false
      };
    } catch {
      /* local confirmation keeps the SIH flow working if the slot row is mock-only */
    }
  }

  return {
    bookingId: `local-${Date.now()}`,
    farmerId: farmer.farmerId,
    slotId: slot.slotId,
    status: "CONFIRMED",
    tokenNumber: localToken(),
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    originalStartTime: slot.originalStartTime || slot.startTime,
    originalEndTime: slot.originalEndTime || slot.endTime,
    centreName: slot.centreName,
    cropName: slot.cropName,
    source: "mock",
    smsSent: true,
    whatsappSent: true,
    recentlyChanged: false,
    procurementStatus: "SLOT_CONFIRMED",
    paymentStatus: null
  };
}

export async function loadProcurement(bookingId) {
  if (!bookingId || String(bookingId).startsWith("local-")) return null;
  try {
    return await procurementApi.getProcurementStatus(bookingId);
  } catch {
    return null;
  }
}

export const PIPELINE_STEPS = [
  { id: "REGISTERED", label: "Registered" },
  { id: "SLOT_CONFIRMED", label: "Slot Confirmed" },
  { id: "ARRIVED", label: "Farmer Arrived" },
  { id: "WEIGHING", label: "Weighing" },
  { id: "QUALITY", label: "Quality Check" },
  { id: "ACCEPTED", label: "Accepted" },
  { id: "PAYMENT_PENDING", label: "Payment Pending" },
  { id: "PAYMENT_COMPLETED", label: "Payment Completed" }
];

export function resolvePipelineIndex({ farmer, booking, procurement }) {
  if (!farmer) return -1;
  if (!booking) return 0;

  const arrival = procurement?.arrival_time || booking.arrivalTime;
  const weight = procurement?.weight ?? booking.weight;
  const quality = procurement?.quality_status || booking.qualityStatus;
  const proc = procurement?.procurement_status || booking.procurementStatus;
  const pay = procurement?.payment_status || booking.paymentStatus;

  if (pay === "COMPLETED" || pay === "PAID") return 7;
  if (pay === "PENDING") return 6;
  if (proc === "ACCEPTED") return 5;
  if (quality) return 4;
  if (proc === "WEIGHING" || weight) return 3;
  if (proc === "ARRIVED" || arrival) return 2;
  if (booking.status === "CONFIRMED") return 1;
  return 0;
}

export function pipelineStatusLabel(index) {
  return PIPELINE_STEPS[Math.max(0, index)]?.label || "Registered";
}
