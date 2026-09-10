import { create } from "zustand";
import { createInitialMandiState } from "../data/mockMandi";
import { applyAutomation } from "../services/automationService";

function cloneState() {
  return structuredClone(createInitialMandiState());
}

export const useMandiStore = create((set) => ({
  role: "farmer",
  sessionFarmer: null,
  sessionBooking: null,
  sessionProcurement: null,
  lookupFarmer: null,
  bookingNotice: null,
  ...cloneState(),

  setRole: (role) => set({ role }),

  setSessionFarmer: (farmer) =>
    set((state) => {
      const farmers = farmer
        ? upsertFarmer(state.farmers, farmer)
        : state.farmers;
      return { sessionFarmer: farmer, farmers, lookupFarmer: farmer };
    }),

  setLookupFarmer: (farmer) => set({ lookupFarmer: farmer }),

  setSessionBooking: (booking) =>
    set((state) => {
      if (!booking || !state.sessionFarmer) {
        return { sessionBooking: booking, bookingNotice: booking };
      }
      const mergedFarmer = {
        ...state.sessionFarmer,
        centreName: booking.centreName,
        cropName: booking.cropName || state.sessionFarmer.cropName,
        booking: {
          ...booking,
          procurementStatus: booking.procurementStatus || "SLOT_CONFIRMED"
        }
      };
      return {
        sessionBooking: booking,
        bookingNotice: booking,
        sessionFarmer: mergedFarmer,
        occupied: Math.min(state.capacity, state.occupied + 1),
        available: Math.max(0, state.available - 1),
        slots: state.slots.map((slot) =>
          slot.slotId === booking.slotId
            ? {
                ...slot,
                availableCapacity: Math.max(0, slot.availableCapacity - 1)
              }
            : slot
        ),
        farmers: upsertFarmer(state.farmers, mergedFarmer)
      };
    }),

  setSessionProcurement: (record) => set({ sessionProcurement: record }),

  mergeLiveSlots: (slots) =>
    set((state) => {
      if (!slots?.length) return {};
      const byId = new Map(state.slots.map((slot) => [String(slot.slotId), slot]));
      slots.forEach((slot) => {
        const existing = byId.get(String(slot.slotId));
        byId.set(String(slot.slotId), existing ? { ...existing, ...slot, startTime: existing.startTime !== existing.originalStartTime ? existing.startTime : slot.startTime, endTime: existing.endTime !== existing.originalEndTime ? existing.endTime : slot.endTime } : slot);
      });
      return { slots: Array.from(byId.values()) };
    }),

  triggerAutomation: (payload) =>
    set((state) => {
      const next = applyAutomation(state, payload);
      const sessionFarmer = syncSessionFarmer(state.sessionFarmer, next.farmers);
      const sessionBooking = overlayBooking(state.sessionBooking, sessionFarmer);
      return {
        ...next,
        sessionFarmer,
        sessionBooking,
        bookingNotice: sessionBooking || state.bookingNotice
      };
    }),

  resetDemo: () =>
    set((state) => {
      const fresh = cloneState();
      let farmers = fresh.farmers;
      let sessionFarmer = state.sessionFarmer;
      if (sessionFarmer) {
        const booking = state.sessionBooking
          ? restoreBookingTimes(state.sessionBooking, fresh.slots)
          : null;
        sessionFarmer = {
          ...sessionFarmer,
          booking
        };
        farmers = upsertFarmer(farmers, sessionFarmer);
      }
      return {
        ...fresh,
        role: state.role,
        sessionFarmer,
        sessionBooking: sessionFarmer?.booking || null,
        sessionProcurement: state.sessionProcurement,
        lookupFarmer: sessionFarmer,
        bookingNotice: sessionFarmer?.booking || null,
        farmers
      };
    })
}));

function upsertFarmer(farmers, farmer) {
  const index = farmers.findIndex(
    (item) => String(item.farmerId) === String(farmer.farmerId)
  );
  if (index === -1) return [farmer, ...farmers];
  const next = farmers.slice();
  next[index] = { ...next[index], ...farmer };
  return next;
}

function syncSessionFarmer(sessionFarmer, farmers) {
  if (!sessionFarmer) return sessionFarmer;
  return (
    farmers.find(
      (farmer) => String(farmer.farmerId) === String(sessionFarmer.farmerId)
    ) || sessionFarmer
  );
}

function overlayBooking(sessionBooking, sessionFarmer) {
  if (sessionFarmer?.booking) return sessionFarmer.booking;
  return sessionBooking;
}

function restoreBookingTimes(booking, slots) {
  const slot = slots.find((item) => item.slotId === booking.slotId);
  return {
    ...booking,
    startTime: slot?.startTime || booking.originalStartTime || booking.startTime,
    endTime: slot?.endTime || booking.originalEndTime || booking.endTime,
    recentlyChanged: false
  };
}
