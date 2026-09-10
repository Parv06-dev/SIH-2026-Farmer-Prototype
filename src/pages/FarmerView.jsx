import { useEffect, useMemo, useState } from "react";
import StatusPipeline from "../components/StatusPipeline";
import { DEMO_DATE, FALLBACK_CENTRES, FALLBACK_CROPS } from "../data/mockMandi";
import {
  bookSlot,
  loadProcurement,
  resolvePipelineIndex
} from "../services/bookingService";
import { lookupFarmer, registerFarmer } from "../services/farmerService";
import { loadCentres, loadCrops, loadSlots } from "../services/slotService";
import { useMandiStore } from "../store/useMandiStore";
import { formatDate, formatSlotWindow } from "../utils/format";
import { validateRegistration } from "../utils/validation";

const EMPTY_FORM = {
  name: "",
  mobile: "",
  village: "",
  district: "",
  state: "",
  cropId: String(FALLBACK_CROPS[0].crop_id),
  cropName: FALLBACK_CROPS[0].crop_name,
  season: FALLBACK_CROPS[0].season,
  estimatedQuantity: "",
  centreId: String(FALLBACK_CENTRES[0].centre_id),
  centreName: FALLBACK_CENTRES[0].centre_name
};

export default function FarmerView() {
  const sessionFarmer = useMandiStore((s) => s.sessionFarmer);
  const sessionBooking = useMandiStore((s) => s.sessionBooking);
  const sessionProcurement = useMandiStore((s) => s.sessionProcurement);
  const lookupResult = useMandiStore((s) => s.lookupFarmer);
  const bookingNotice = useMandiStore((s) => s.bookingNotice);
  const slots = useMandiStore((s) => s.slots);
  const farmers = useMandiStore((s) => s.farmers);
  const bookingsPaused = useMandiStore((s) => s.bookingsPaused);
  const pauseReason = useMandiStore((s) => s.pauseReason);
  const mandiStatus = useMandiStore((s) => s.mandiStatus);
  const lastAutomation = useMandiStore((s) => s.lastAutomation);
  const flashKey = useMandiStore((s) => s.flashKey);

  const setSessionFarmer = useMandiStore((s) => s.setSessionFarmer);
  const setLookupFarmer = useMandiStore((s) => s.setLookupFarmer);
  const setSessionBooking = useMandiStore((s) => s.setSessionBooking);
  const setSessionProcurement = useMandiStore((s) => s.setSessionProcurement);
  const mergeLiveSlots = useMandiStore((s) => s.mergeLiveSlots);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registered, setRegistered] = useState(false);

  const [crops, setCrops] = useState(FALLBACK_CROPS);
  const [centres, setCentres] = useState(FALLBACK_CENTRES);
  const [slotDate, setSlotDate] = useState(DEMO_DATE);
  const [slotCentreId, setSlotCentreId] = useState(String(FALLBACK_CENTRES[0].centre_id));
  const [slotCropId, setSlotCropId] = useState(String(FALLBACK_CROPS[0].crop_id));
  const [visibleSlots, setVisibleSlots] = useState([]);
  const [slotSource, setSlotSource] = useState("mock");
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadCrops(), loadCentres()]).then(([cropResult, centreResult]) => {
      if (cancelled) return;
      setCrops(cropResult.items);
      setCentres(centreResult.items);
      if (cropResult.items[0]) {
        setSlotCropId(String(cropResult.items[0].crop_id));
        setForm((current) =>
          current.cropId
            ? current
            : {
                ...current,
                cropId: String(cropResult.items[0].crop_id),
                cropName: cropResult.items[0].crop_name,
                season: cropResult.items[0].season || current.season
              }
        );
      }
      if (centreResult.items[0]) {
        setSlotCentreId(String(centreResult.items[0].centre_id));
        setForm((current) =>
          current.centreId
            ? current
            : {
                ...current,
                centreId: String(centreResult.items[0].centre_id),
                centreName: centreResult.items[0].centre_name
              }
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!slotCentreId || !slotCropId || !slotDate) return;
    let cancelled = false;
    setSlotLoading(true);
    setSlotError("");
    loadSlots({
      centreId: slotCentreId,
      cropId: slotCropId,
      date: slotDate,
      centres,
      crops,
      mockSlots: useMandiStore.getState().slots
    })
      .then((result) => {
        if (cancelled) return;
        setVisibleSlots(result.items);
        setSlotSource(result.source);
        if (result.source === "api") mergeLiveSlots(result.items);
      })
      .catch((error) => {
        if (!cancelled) setSlotError(error.message);
      })
      .finally(() => {
        if (!cancelled) setSlotLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slotCentreId, slotCropId, slotDate, centres, crops, mergeLiveSlots]);

  useEffect(() => {
    if (!sessionBooking?.bookingId) return;
    loadProcurement(sessionBooking.bookingId).then((record) => {
      if (record) setSessionProcurement(record);
    });
  }, [sessionBooking?.bookingId, setSessionProcurement]);

  const profile = lookupResult || sessionFarmer;
  const booking = sessionFarmer?.booking || sessionBooking;
  const pipelineIndex = resolvePipelineIndex({
    farmer: profile,
    booking,
    procurement: sessionProcurement
  });

  const displayedSlots = useMemo(() => {
    return visibleSlots.map((slot) => {
      const live = slots.find((item) => String(item.slotId) === String(slot.slotId));
      return live ? { ...slot, ...live, availableCapacity: live.availableCapacity } : slot;
    });
  }, [visibleSlots, slots]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function onCropChange(cropId) {
    const crop = crops.find((item) => String(item.crop_id) === String(cropId));
    updateField("cropId", cropId);
    updateField("cropName", crop?.crop_name || "");
    updateField("season", crop?.season || "");
    setSlotCropId(cropId);
  }

  function onCentreChange(centreId) {
    const centre = centres.find((item) => String(item.centre_id) === String(centreId));
    updateField("centreId", centreId);
    updateField("centreName", centre?.centre_name || "");
    setSlotCentreId(centreId);
  }

  async function onRegister(event) {
    event.preventDefault();
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    setRegisterError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const farmer = await registerFarmer(form);
      setSessionFarmer(farmer);
      setRegistered(true);
      if (farmer.cropId) setSlotCropId(String(farmer.cropId));
      if (farmer.centreId) setSlotCentreId(String(farmer.centreId));
    } catch (error) {
      setRegisterError(error.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onBook(slot) {
    if (!sessionFarmer) {
      setBookingError("Register or check registration before booking a slot.");
      return;
    }
    setBookingError("");
    setBookingLoading(true);
    try {
      const created = await bookSlot({
        farmer: sessionFarmer,
        slot,
        bookingsPaused
      });
      setSessionBooking(created);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  }

  async function onLookup(event) {
    event.preventDefault();
    setLookupError("");
    setLookupLoading(true);
    try {
      const farmer = await lookupFarmer({
        query: lookupQuery,
        localFarmers: farmers,
        sessionFarmer
      });
      setLookupFarmer(farmer);
      if (!sessionFarmer) setSessionFarmer(farmer);
    } catch (error) {
      setLookupError(error.message);
    } finally {
      setLookupLoading(false);
    }
  }

  const selectedCentre = centres.find(
    (item) => String(item.centre_id) === String(slotCentreId)
  );

  return (
    <div className="farmer-layout">
      {(bookingsPaused || lastAutomation) && (
        <div className={`live-banner ${mandiStatus === "TEMPORARILY_UNAVAILABLE" ? "rain" : "warn"}`}>
          <strong>
            {lastAutomation?.summary.banner || "Mandi status updated"}
          </strong>
          {bookingsPaused && (
            <span>
              New bookings: PAUSED{pauseReason ? ` · ${pauseReason}` : ""}
            </span>
          )}
          {booking?.recentlyChanged && (
            <span>
              Your appointment is now {formatSlotWindow(booking.startTime, booking.endTime)}
            </span>
          )}
        </div>
      )}

      <section className="panel" id="register">
        <h2>Farmer Registration</h2>
        <p className="lede">
          Register once. The system creates your Farmer ID. You do not enter it yourself.
        </p>
        <form className="form-grid" onSubmit={onRegister}>
          <fieldset>
            <legend>Personal details</legend>
            <label>
              Full Name
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              {errors.name && <small className="error">{errors.name}</small>}
            </label>
            <label>
              Mobile Number
              <input
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ""))}
              />
              {errors.mobile && <small className="error">{errors.mobile}</small>}
            </label>
            <label>
              Village
              <input
                value={form.village}
                onChange={(e) => updateField("village", e.target.value)}
              />
              {errors.village && <small className="error">{errors.village}</small>}
            </label>
            <label>
              District
              <input
                value={form.district}
                onChange={(e) => updateField("district", e.target.value)}
              />
              {errors.district && <small className="error">{errors.district}</small>}
            </label>
            <label>
              State
              <input
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
              {errors.state && <small className="error">{errors.state}</small>}
            </label>
          </fieldset>
          <fieldset>
            <legend>Crop details</legend>
            <label>
              Crop Name
              <select value={form.cropId} onChange={(e) => onCropChange(e.target.value)}>
                <option value="">Select crop</option>
                {crops.map((crop) => (
                  <option key={crop.crop_id} value={crop.crop_id}>
                    {crop.crop_name}
                  </option>
                ))}
              </select>
              {errors.cropName && <small className="error">{errors.cropName}</small>}
            </label>
            <label>
              Season
              <input
                value={form.season}
                onChange={(e) => updateField("season", e.target.value)}
              />
              {errors.season && <small className="error">{errors.season}</small>}
            </label>
            <label>
              Estimated Quantity (quintals)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.estimatedQuantity}
                onChange={(e) => updateField("estimatedQuantity", e.target.value)}
              />
              {errors.estimatedQuantity && (
                <small className="error">{errors.estimatedQuantity}</small>
              )}
            </label>
            <label>
              Preferred Procurement Centre
              <select value={form.centreId} onChange={(e) => onCentreChange(e.target.value)}>
                <option value="">Select centre</option>
                {centres.map((centre) => (
                  <option key={centre.centre_id} value={centre.centre_id}>
                    {centre.centre_name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          {registerError && <p className="error banner-error">{registerError}</p>}
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Register Farmer"}
          </button>
        </form>
      </section>

      {registered && sessionFarmer && (
        <section className="success-card">
          <h3>✓ REGISTRATION SUCCESSFUL</h3>
          <dl>
            <div>
              <dt>Farmer ID</dt>
              <dd>{sessionFarmer.farmerId}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{sessionFarmer.name}</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>{sessionFarmer.mobile}</dd>
            </div>
            <div>
              <dt>Registration Status</dt>
              <dd>{sessionFarmer.verificationStatus}</dd>
            </div>
          </dl>
          <p className="keep-id">
            Please keep your Farmer ID for future slot booking and status checking.
          </p>
        </section>
      )}

      <section className="panel" id="check">
        <h2>Check Registration</h2>
        <p className="lede">
          After registration, enter the generated Farmer ID or the registered mobile number.
        </p>
        <form className="inline-form" onSubmit={onLookup}>
          <input
            placeholder="Farmer ID or mobile number"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
          />
          <button className="btn" type="submit" disabled={lookupLoading}>
            {lookupLoading ? "Checking…" : "Check"}
          </button>
        </form>
        {lookupError && <p className="error">{lookupError}</p>}
      </section>

      {profile && (
        <section className="panel" id="profile">
          <h2>Farmer Profile</h2>
          <div className="profile-grid">
            <ProfileItem label="Farmer Name" value={profile.name} />
            <ProfileItem label="Farmer ID" value={profile.farmerId} />
            <ProfileItem label="Mobile Number" value={profile.mobile} />
            <ProfileItem label="Village" value={profile.village} />
            <ProfileItem label="District" value={profile.district} />
            <ProfileItem label="State" value={profile.state || "—"} />
            <ProfileItem label="Crop" value={profile.cropName || "—"} />
            <ProfileItem
              label="Estimated Quantity"
              value={
                profile.estimatedQuantity != null && profile.estimatedQuantity !== "—"
                  ? `${profile.estimatedQuantity} quintals`
                  : "—"
              }
            />
            <ProfileItem
              label="Procurement Centre"
              value={profile.centreName || booking?.centreName || "—"}
            />
            <ProfileItem
              label="Registration Status"
              value={profile.verificationStatus || "PENDING"}
            />
          </div>
        </section>
      )}

      <section className="panel" id="slots">
        <h2>Available Procurement Slots</h2>
        <div className="filters">
          <label>
            Centre
            <select value={slotCentreId} onChange={(e) => setSlotCentreId(e.target.value)}>
              {centres.map((centre) => (
                <option key={centre.centre_id} value={centre.centre_id}>
                  {centre.centre_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Crop
            <select value={slotCropId} onChange={(e) => setSlotCropId(e.target.value)}>
              {crops.map((crop) => (
                <option key={crop.crop_id} value={crop.crop_id}>
                  {crop.crop_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
          </label>
        </div>
        {bookingsPaused && (
          <p className="paused-note">New bookings are paused. Existing tokens remain valid.</p>
        )}
        <h3 className="centre-heading">
          {selectedCentre?.centre_name || "Procurement Centre"}
        </h3>
        <p className="date-heading">{formatDate(slotDate)}</p>
        {slotLoading && <p>Loading slots…</p>}
        {slotError && <p className="error">{slotError}</p>}
        <div className="slot-list">
          {displayedSlots.map((slot) => (
            <article
              key={slot.slotId}
              className={`slot-card ${slot.recentlyChanged ? "changed" : ""}`}
            >
              <p className="slot-time">{formatSlotWindow(slot.startTime, slot.endTime)}</p>
              <p>
                Available: <strong>{slot.availableCapacity}</strong> slots
              </p>
              <button
                className="btn primary"
                type="button"
                disabled={bookingsPaused || bookingLoading || slot.availableCapacity <= 0}
                onClick={() => onBook(slot)}
              >
                Book Slot
              </button>
            </article>
          ))}
          {!slotLoading && displayedSlots.length === 0 && (
            <p>No available slots for this centre, crop and date.</p>
          )}
        </div>
        {slotSource === "mock" && (
          <p className="hint">
            Showing live mandi slots from shared demo state. Connect the backend slot API
            (GET /api/slots) when seed data is present.
          </p>
        )}
        {bookingError && <p className="error">{bookingError}</p>}
      </section>

      {bookingNotice && (
        <section className="success-card" key={`book-${flashKey}`}>
          <h3>✓ BOOKING CONFIRMED</h3>
          <dl>
            <div>
              <dt>Token</dt>
              <dd>{bookingNotice.tokenNumber}</dd>
            </div>
            <div>
              <dt>Centre</dt>
              <dd>{bookingNotice.centreName}</dd>
            </div>
            <div>
              <dt>Crop</dt>
              <dd>{bookingNotice.cropName || profile?.cropName}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(bookingNotice.date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd className={bookingNotice.recentlyChanged ? "changed-text" : ""}>
                {formatSlotWindow(bookingNotice.startTime, bookingNotice.endTime)}
              </dd>
            </div>
          </dl>
          <ul className="notify-status">
            <li>✓ SMS sent</li>
            <li>✓ WhatsApp notification sent</li>
          </ul>
        </section>
      )}

      <section className="panel" id="status">
        <h2>Current Booking Status</h2>
        {booking && (
          <p className="lede">
            Token {booking.tokenNumber} · {formatDate(booking.date)} ·{" "}
            <strong className={booking.recentlyChanged ? "changed-text" : ""}>
              {formatSlotWindow(booking.startTime, booking.endTime)}
            </strong>
          </p>
        )}
        <StatusPipeline activeIndex={pipelineIndex} />
      </section>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="muted">{label}</p>
      <p className="value">{value ?? "—"}</p>
    </div>
  );
}
