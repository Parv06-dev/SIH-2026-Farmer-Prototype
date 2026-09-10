function channels() {
  return {
    sms: { label: "SMS", status: "SENT" },
    whatsapp: { label: "WhatsApp", status: "SENT" },
    ivr: { label: "IVR", status: "SENT" }
  };
}

export function buildIncidentNotification({ type, farmer, extras = {} }) {
  const windowBefore = extras.beforeWindow;
  const windowAfter = extras.afterWindow;
  let title = "Mandi update";
  let body = "Please check your procurement appointment.";
  let headline = "Update";

  if (type === "DELAY") {
    title = "Mandi delay detected";
    headline = "⚠️ Mandi delay detected";
    body = `Your procurement slot has been shifted from ${windowBefore} to ${windowAfter}. Please arrive accordingly.`;
  } else if (type === "EQUIPMENT") {
    title = "Equipment breakdown";
    headline = "⚠️ Equipment breakdown";
    body = `${extras.equipmentName || "Equipment"} is unavailable. Processing is slower than usual. Please expect delay at ${farmer.centreName || "the mandi"}.`;
  } else if (type === "RAIN") {
    title = "Heavy rain alert";
    headline = "🌧️ Heavy rain alert";
    body =
      "Procurement yard temporarily unavailable. New bookings are paused. Keep your existing token. Wait for the next update before travelling.";
  } else if (type === "FULL") {
    title = "Mandi capacity full";
    headline = "⚠️ Mandi capacity full";
    body =
      "Yard storage capacity reached. New bookings are paused. If you already have a token, please follow operator instructions.";
  }

  return {
    id: `n-${Date.now()}-${farmer.farmerId}`,
    farmerId: farmer.farmerId,
    farmerName: farmer.name,
    mobile: farmer.mobile,
    type,
    title,
    headline,
    body,
    beforeWindow: windowBefore,
    afterWindow: windowAfter,
    channels: channels(),
    createdAt: new Date().toISOString()
  };
}

export function summarizeAutomation(type, extras) {
  if (type === "DELAY") {
    return {
      banner: "⚠️ MANDI DELAY DETECTED",
      points: [
        "Slots automatically adjusted",
        `${extras.affectedCount} farmers affected`,
        `${extras.affectedCount} farmers notified`
      ]
    };
  }
  if (type === "EQUIPMENT") {
    return {
      banner: "⚠️ EQUIPMENT BREAKDOWN",
      subtitle: extras.equipmentName || "Equipment unavailable",
      points: [
        "Processing capacity recalculated",
        "Affected slots identified",
        "Farmers notified"
      ]
    };
  }
  if (type === "RAIN") {
    return {
      banner: "🌧️ HEAVY RAIN ALERT",
      subtitle: "New bookings: PAUSED",
      points: ["Procurement yard temporarily unavailable."]
    };
  }
  return {
    banner: "⚠️ MANDI CAPACITY FULL",
    subtitle: "New bookings: PAUSED",
    points: ["Yard storage capacity reached."]
  };
}
