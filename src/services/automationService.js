import { addMinutesToTime, formatSlotWindow } from "../utils/format";
import {
  buildIncidentNotification,
  summarizeAutomation
} from "./notificationService";

function withBooking(farmer, updater) {
  if (!farmer.booking) return farmer;
  return { ...farmer, booking: updater(farmer.booking) };
}

function upcomingFarmers(farmers) {
  return farmers.filter((farmer) => {
    const status = farmer.booking?.procurementStatus;
    return (
      farmer.booking &&
      farmer.booking.status !== "CANCELLED" &&
      status !== "ACCEPTED" &&
      farmer.booking.paymentStatus !== "COMPLETED"
    );
  });
}

export function applyAutomation(state, payload) {
  const type = payload.type;
  const now = new Date().toISOString();
  let next = {
    ...state,
    equipment: {
      ...state.equipment,
      weighingMachine: { ...state.equipment.weighingMachine },
      moistureMeter: { ...state.equipment.moistureMeter },
      baggingUnit: { ...state.equipment.baggingUnit }
    },
    slots: state.slots.map((slot) => ({ ...slot, recentlyChanged: false })),
    farmers: state.farmers.map((farmer) =>
      withBooking(farmer, (booking) => ({ ...booking, recentlyChanged: false }))
    )
  };

  let affected = [];
  let extras = {};

  if (type === "DELAY") {
    const delay = Number(payload.delayMinutes) || 0;
    extras.delayMinutes = delay;
    next.slots = next.slots.map((slot) => {
      const startTime = addMinutesToTime(slot.startTime, delay);
      const endTime = addMinutesToTime(slot.endTime, delay);
      return {
        ...slot,
        startTime,
        endTime,
        recentlyChanged: true
      };
    });

    next.farmers = next.farmers.map((farmer) => {
      if (!farmer.booking || farmer.booking.status === "CANCELLED") return farmer;
      const startTime = addMinutesToTime(farmer.booking.startTime, delay);
      const endTime = addMinutesToTime(farmer.booking.endTime, delay);
      affected.push({
        ...farmer,
        booking: { ...farmer.booking, startTime, endTime }
      });
      return withBooking(farmer, (booking) => ({
        ...booking,
        startTime,
        endTime,
        recentlyChanged: true
      }));
    });

    extras.affectedCount = affected.length;
  }

  if (type === "EQUIPMENT") {
    const equipmentName =
      payload.equipmentName || "Electronic weighing machine unavailable";
    extras.equipmentName = equipmentName;
    next.equipment.weighingMachine.available = false;
    next.processingCapacity = Math.max(
      40,
      Math.round(next.originalProcessingCapacity * 0.55)
    );
    next.available = Math.max(4, Math.round(next.available * 0.6));
    next.occupied = Math.min(next.capacity, next.capacity - next.available);

    next.slots = next.slots.map((slot) => ({
      ...slot,
      availableCapacity: Math.max(0, Math.floor(slot.availableCapacity * 0.7)),
      recentlyChanged: true
    }));

    affected = upcomingFarmers(next.farmers);
    next.farmers = next.farmers.map((farmer) => {
      if (!affected.some((item) => item.farmerId === farmer.farmerId)) {
        return farmer;
      }
      return withBooking(farmer, (booking) => ({
        ...booking,
        recentlyChanged: true
      }));
    });
    extras.affectedCount = affected.length;
  }

  if (type === "RAIN") {
    next.mandiStatus = "TEMPORARILY_UNAVAILABLE";
    next.bookingsPaused = true;
    next.pauseReason = "Procurement yard temporarily unavailable.";
    affected = next.farmers.filter((farmer) => farmer.booking);
    extras.affectedCount = affected.length;
  }

  if (type === "FULL") {
    next.occupied = next.capacity;
    next.available = 0;
    next.mandiStatus = "CAPACITY_FULL";
    next.bookingsPaused = true;
    next.pauseReason = "Yard storage capacity reached.";
    next.slots = next.slots.map((slot) => ({
      ...slot,
      availableCapacity: 0,
      recentlyChanged: true
    }));
    affected = upcomingFarmers(next.farmers);
    extras.affectedCount = affected.length;
  }

  const notifications = affected.map((farmer) =>
    buildIncidentNotification({
      type,
      farmer,
      extras: {
        ...extras,
        beforeWindow: farmer.booking
          ? formatSlotWindow(
              farmer.booking.originalStartTime || farmer.booking.startTime,
              farmer.booking.originalEndTime || farmer.booking.endTime
            )
          : undefined,
        afterWindow: farmer.booking
          ? formatSlotWindow(farmer.booking.startTime, farmer.booking.endTime)
          : undefined
      }
    })
  );

  const summary = summarizeAutomation(type, extras);
  const incident = {
    id: `inc-${Date.now()}`,
    type,
    createdAt: now,
    extras,
    summary,
    affectedCount: extras.affectedCount || affected.length
  };

  next.incidents = [incident, ...next.incidents];
  next.notifications = [...notifications, ...next.notifications];
  next.latestNotification = notifications[0] || {
    id: `n-system-${Date.now()}`,
    headline: summary.banner,
    title: summary.banner,
    body: summary.points.join(" "),
    channels: {
      sms: { label: "SMS", status: "SENT" },
      whatsapp: { label: "WhatsApp", status: "SENT" },
      ivr: { label: "IVR", status: "SENT" }
    },
    farmerName: "All registered farmers",
    createdAt: now
  };
  next.lastAutomation = incident;
  next.affectedFarmerIds = affected.map((farmer) => farmer.farmerId);
  next.flashKey = state.flashKey + 1;

  return next;
}
