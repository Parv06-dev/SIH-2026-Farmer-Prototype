import { useMemo, useState } from "react";
import NotificationPhone from "../components/NotificationPhone";
import { useMandiStore } from "../store/useMandiStore";
import { formatDate, formatSlotWindow, nowLabel } from "../utils/format";
import { pipelineStatusLabel, resolvePipelineIndex } from "../services/bookingService";

const INCIDENT_OPTIONS = [
  { id: "DELAY", label: "Mandi Delay" },
  { id: "EQUIPMENT", label: "Equipment Breakdown" },
  { id: "RAIN", label: "Heavy Rain" },
  { id: "FULL", label: "Space Full / Overcrowding" }
];

export default function OperatorView() {
  const capacity = useMandiStore((s) => s.capacity);
  const occupied = useMandiStore((s) => s.occupied);
  const available = useMandiStore((s) => s.available);
  const processingCapacity = useMandiStore((s) => s.processingCapacity);
  const mandiStatus = useMandiStore((s) => s.mandiStatus);
  const bookingsPaused = useMandiStore((s) => s.bookingsPaused);
  const pauseReason = useMandiStore((s) => s.pauseReason);
  const slots = useMandiStore((s) => s.slots);
  const farmers = useMandiStore((s) => s.farmers);
  const equipment = useMandiStore((s) => s.equipment);
  const currentSlotId = useMandiStore((s) => s.currentSlotId);
  const lastAutomation = useMandiStore((s) => s.lastAutomation);
  const affectedFarmerIds = useMandiStore((s) => s.affectedFarmerIds);
  const latestNotification = useMandiStore((s) => s.latestNotification);
  const incidents = useMandiStore((s) => s.incidents);
  const flashKey = useMandiStore((s) => s.flashKey);
  const triggerAutomation = useMandiStore((s) => s.triggerAutomation);
  const resetDemo = useMandiStore((s) => s.resetDemo);

  const [incidentType, setIncidentType] = useState("DELAY");
  const [delayMinutes, setDelayMinutes] = useState("60");
  const [equipmentName, setEquipmentName] = useState(
    "Electronic weighing machine unavailable"
  );

  const currentSlot = slots.find((slot) => slot.slotId === currentSlotId) || slots[0];
  const upcomingSlots = slots.filter((slot) => slot.slotId !== currentSlot?.slotId);

  const activeFarmers = farmers.filter(
    (farmer) => farmer.booking && farmer.booking.status !== "CANCELLED"
  );
  const affectedFarmers = farmers.filter((farmer) =>
    affectedFarmerIds.includes(farmer.farmerId)
  );

  const statusLabel = useMemo(() => {
    if (mandiStatus === "TEMPORARILY_UNAVAILABLE") return "Temporarily unavailable";
    if (mandiStatus === "CAPACITY_FULL") return "Capacity full";
    return "Operational";
  }, [mandiStatus]);

  function onTrigger() {
    triggerAutomation({
      type: incidentType,
      delayMinutes: Number(delayMinutes),
      equipmentName
    });
  }

  return (
    <div className="operator-shell">
      <div className="operator-main">
        <div className="ops-header">
          <div>
            <p className="brand-kicker">Live operations</p>
            <h2>Mandi Live Control Center</h2>
            <p className="clock">Clock {nowLabel()}</p>
          </div>
          <button type="button" className="btn danger" onClick={resetDemo}>
            Reset Demo
          </button>
        </div>

        {lastAutomation && (
          <section className="automation-result" key={flashKey}>
            <h3>{lastAutomation.summary.banner}</h3>
            {lastAutomation.summary.subtitle && <p>{lastAutomation.summary.subtitle}</p>}
            <ul>
              {lastAutomation.summary.points.map((point) => (
                <li key={point}>✓ {point}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="metric-row">
          <article className="metric">
            <p>Mandi capacity</p>
            <strong>
              {occupied} / {capacity} slots occupied
            </strong>
            <div className="meter">
              <span style={{ width: `${(occupied / capacity) * 100}%` }} />
            </div>
          </article>
          <article className="metric">
            <p>Available capacity</p>
            <strong>{available} slots</strong>
          </article>
          <article className="metric">
            <p>Processing capacity</p>
            <strong>{processingCapacity}%</strong>
          </article>
          <article className={`metric status-${mandiStatus.toLowerCase()}`}>
            <p>Current mandi status</p>
            <strong>{statusLabel}</strong>
            {bookingsPaused && <span>New bookings paused</span>}
            {pauseReason && <span>{pauseReason}</span>}
          </article>
        </section>

        <section className="split">
          <article className="panel">
            <h3>Current slot</h3>
            {currentSlot && (
              <div className={`slot-card ${currentSlot.recentlyChanged ? "changed" : ""}`}>
                <p className="muted">{currentSlot.centreName}</p>
                <p className="slot-time">
                  {formatSlotWindow(currentSlot.startTime, currentSlot.endTime)}
                </p>
                <p>{formatDate(currentSlot.date)}</p>
                <p>
                  Available: {currentSlot.availableCapacity} / {currentSlot.capacity}
                </p>
              </div>
            )}
            <h3>Upcoming slots</h3>
            <div className="slot-list compact">
              {upcomingSlots.map((slot) => (
                <article
                  key={slot.slotId}
                  className={`slot-card ${slot.recentlyChanged ? "changed" : ""}`}
                >
                  <p className="muted">{slot.centreName}</p>
                  <p className="slot-time">{formatSlotWindow(slot.startTime, slot.endTime)}</p>
                  <p>
                    Available: {slot.availableCapacity} · {slot.cropName}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="panel">
            <h3>Equipment</h3>
            <ul className="equip-list">
              {Object.values(equipment).map((item) => (
                <li key={item.name} className={item.available ? "ok" : "down"}>
                  {item.available ? "●" : "▲"} {item.name} —{" "}
                  {item.available ? "Available" : "Unavailable"}
                </li>
              ))}
            </ul>
            <h3>Active incidents</h3>
            {incidents.length === 0 && <p className="muted">No active incidents.</p>}
            <ul className="incident-list">
              {incidents.map((incident) => (
                <li key={incident.id}>{incident.summary.banner}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="panel">
          <h3>Active farmers / tokens</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeFarmers.map((farmer) => {
                  const index = resolvePipelineIndex({
                    farmer,
                    booking: farmer.booking
                  });
                  const affected = affectedFarmerIds.includes(farmer.farmerId);
                  return (
                    <tr key={farmer.farmerId} className={affected ? "affected" : ""}>
                      <td>{farmer.booking.tokenNumber}</td>
                      <td>
                        {farmer.name}
                        <small>ID {farmer.farmerId}</small>
                      </td>
                      <td>{farmer.cropName}</td>
                      <td className={farmer.booking.recentlyChanged ? "changed-text" : ""}>
                        {formatSlotWindow(farmer.booking.startTime, farmer.booking.endTime)}
                      </td>
                      <td>{pipelineStatusLabel(index)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h3>Affected farmers</h3>
          {affectedFarmers.length === 0 && (
            <p className="muted">No farmers flagged. Trigger automation to identify impact.</p>
          )}
          <ul className="affected-list">
            {affectedFarmers.map((farmer) => (
              <li key={farmer.farmerId}>
                <strong>{farmer.name}</strong> · Token {farmer.booking?.tokenNumber} ·{" "}
                {formatSlotWindow(farmer.booking?.startTime, farmer.booking?.endTime)}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel incident-control">
          <h3>Smart Incident Control</h3>
          <p className="lede">
            Report a mandi problem. The system identifies impact, updates capacity and slots,
            and notifies farmers.
          </p>
          <div className="incident-options">
            {INCIDENT_OPTIONS.map((option) => (
              <label key={option.id} className={incidentType === option.id ? "selected" : ""}>
                <input
                  type="radio"
                  name="incident"
                  value={option.id}
                  checked={incidentType === option.id}
                  onChange={() => setIncidentType(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
          {incidentType === "DELAY" && (
            <label className="field">
              Delay (minutes)
              <input
                type="number"
                min="1"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
              />
            </label>
          )}
          {incidentType === "EQUIPMENT" && (
            <label className="field">
              Equipment issue
              <input
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
              />
            </label>
          )}
          <button type="button" className="btn primary large" onClick={onTrigger}>
            Trigger Smart Automation
          </button>
        </section>
      </div>
      <NotificationPhone notification={latestNotification} flashKey={flashKey} />
    </div>
  );
}
