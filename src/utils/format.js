export function formatTime(value) {
  if (!value) return "—";
  const raw = String(value).slice(0, 8);
  const [hStr, mStr] = raw.split(":");
  let hours = Number(hStr);
  const minutes = mStr || "00";
  if (Number.isNaN(hours)) return raw;
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${suffix}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function formatSlotWindow(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function addMinutesToTime(time, minutesToAdd) {
  const [h, m] = String(time).slice(0, 5).split(":").map(Number);
  const total = h * 60 + m + Number(minutesToAdd);
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(wrapped / 60);
  const nm = wrapped % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
