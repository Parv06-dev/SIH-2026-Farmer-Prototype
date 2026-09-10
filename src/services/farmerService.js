import * as farmerApi from "../api/farmerApi";
import { isIndianMobile } from "../utils/validation";

export async function registerFarmer(form) {
  const location = [form.village, form.district, form.state]
    .filter(Boolean)
    .join(", ");

  const created = await farmerApi.createFarmer({
    name: form.name.trim(),
    mobile: form.mobile.trim(),
    district: form.district.trim(),
    village: form.village.trim(),
    location
  });

  return {
    farmerId: created.farmer_id,
    name: created.name,
    mobile: created.mobile,
    village: created.village,
    district: created.district,
    location: created.location,
    state: form.state.trim(),
    verificationStatus: created.verification_status,
    cropId: form.cropId ? Number(form.cropId) : null,
    cropName: form.cropName,
    season: form.season,
    estimatedQuantity: Number(form.estimatedQuantity),
    centreId: form.centreId ? Number(form.centreId) : null,
    centreName: form.centreName || "",
    source: "api"
  };
}

export async function lookupFarmer({ query, localFarmers, sessionFarmer }) {
  const value = String(query || "").trim();
  if (!value) {
    throw new Error("Enter Farmer ID or registered mobile number.");
  }

  if (isIndianMobile(value)) {
    if (sessionFarmer?.mobile === value) return sessionFarmer;
    const local = localFarmers.find((farmer) => farmer.mobile === value);
    if (local) return local;
    throw new Error(
      "No farmer found for this mobile number in the current session. The backend only looks up farmers by generated Farmer ID."
    );
  }

  try {
    const remote = await farmerApi.getFarmerById(value);
    const local = localFarmers.find(
      (farmer) => String(farmer.farmerId) === String(remote.farmer_id)
    );
    return {
      farmerId: remote.farmer_id,
      name: remote.name,
      mobile: remote.mobile,
      village: remote.village,
      district: remote.district,
      location: remote.location,
      verificationStatus: remote.verification_status,
      cropName: local?.cropName || sessionFarmer?.cropName || "—",
      estimatedQuantity:
        local?.estimatedQuantity ?? sessionFarmer?.estimatedQuantity ?? "—",
      centreName: local?.centreName || sessionFarmer?.centreName || "—",
      state: local?.state || sessionFarmer?.state || "",
      source: "api"
    };
  } catch (error) {
    if (sessionFarmer && String(sessionFarmer.farmerId) === value) {
      return sessionFarmer;
    }
    const local = localFarmers.find(
      (farmer) => String(farmer.farmerId) === value
    );
    if (local) return local;
    throw error;
  }
}
