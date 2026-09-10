import * as cropApi from "../api/cropApi";
import * as centreApi from "../api/centreApi";
import * as slotApi from "../api/slotApi";
import { FALLBACK_CENTRES, FALLBACK_CROPS } from "../data/mockMandi";

export async function loadCrops() {
  try {
    const rows = await cropApi.getCrops();
    if (Array.isArray(rows) && rows.length) return { items: rows, source: "api" };
  } catch {
    /* fallback below */
  }
  return { items: FALLBACK_CROPS, source: "mock" };
}

export async function loadCentres() {
  try {
    const rows = await centreApi.getCentres();
    if (Array.isArray(rows) && rows.length) return { items: rows, source: "api" };
  } catch {
    /* fallback below */
  }
  return { items: FALLBACK_CENTRES, source: "mock" };
}

function normalizeApiSlot(row, centres, crops) {
  const centre = centres.find((item) => item.centre_id === row.centre_id);
  const crop = crops.find((item) => item.crop_id === row.crop_id);
  const startTime = String(row.start_time).slice(0, 5);
  const endTime = String(row.end_time).slice(0, 5);
  return {
    slotId: row.slot_id,
    centreId: row.centre_id,
    centreName: centre?.centre_name || "Procurement Centre",
    cropId: row.crop_id,
    cropName: crop?.crop_name || "Crop",
    date: String(row.date).slice(0, 10),
    startTime,
    endTime,
    originalStartTime: startTime,
    originalEndTime: endTime,
    capacity: row.capacity,
    availableCapacity: row.available_capacity,
    source: "api",
    recentlyChanged: false
  };
}

export async function loadSlots({ centreId, cropId, date, centres, crops, mockSlots }) {
  try {
    const rows = await slotApi.getAvailableSlots({ centreId, cropId, date });
    if (Array.isArray(rows) && rows.length) {
      return {
        items: rows.map((row) => normalizeApiSlot(row, centres, crops)),
        source: "api"
      };
    }
  } catch {
    /* fallback below */
  }

  const filtered = mockSlots.filter((slot) => {
    const centreOk = !centreId || Number(slot.centreId) === Number(centreId);
    const cropOk = !cropId || Number(slot.cropId) === Number(cropId);
    const dateOk = !date || slot.date === date;
    return centreOk && cropOk && dateOk;
  });
  const items = (filtered.length ? filtered : mockSlots).filter(
    (slot) => slot.availableCapacity > 0 || slot.recentlyChanged
  );

  return { items, source: "mock" };
}
