const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export function validateRegistration(values) {
  const errors = {};

  if (!values.name?.trim()) errors.name = "Enter the farmer's full name.";
  if (!values.mobile?.trim()) {
    errors.mobile = "Enter a mobile number.";
  } else if (!INDIAN_MOBILE.test(values.mobile.trim())) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!values.village?.trim()) errors.village = "Enter village.";
  if (!values.district?.trim()) errors.district = "Enter district.";
  if (!values.state?.trim()) errors.state = "Enter state.";
  if (!values.cropId && !values.cropName?.trim()) {
    errors.cropName = "Select or enter a crop.";
  }
  if (!values.season?.trim()) errors.season = "Enter season.";

  const qty = Number(values.estimatedQuantity);
  if (values.estimatedQuantity === "" || values.estimatedQuantity == null) {
    errors.estimatedQuantity = "Enter estimated quantity.";
  } else if (Number.isNaN(qty)) {
    errors.estimatedQuantity = "Quantity must be a number.";
  } else if (qty < 0) {
    errors.estimatedQuantity = "Quantity cannot be negative.";
  } else if (qty === 0) {
    errors.estimatedQuantity = "Quantity must be greater than zero.";
  }

  return errors;
}

export function isIndianMobile(value) {
  return INDIAN_MOBILE.test(String(value || "").trim());
}

export function looksLikeFarmerId(value) {
  return /^\d+$/.test(String(value || "").trim());
}
