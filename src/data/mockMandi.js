export const DEMO_DATE = "2026-09-15";

export const FALLBACK_CROPS = [
  { crop_id: 1, crop_name: "Wheat", season: "Rabi" },
  { crop_id: 2, crop_name: "Paddy", season: "Kharif" },
  { crop_id: 3, crop_name: "Maize", season: "Kharif" },
  { crop_id: 4, crop_name: "Mustard", season: "Rabi" },
  { crop_id: 5, crop_name: "Soybean", season: "Kharif" }
];

export const FALLBACK_CENTRES = [
  {
    centre_id: 1,
    centre_name: "Central Procurement Centre",
    location: "Indore Mandi Yard",
    capacity: 100
  },
  {
    centre_id: 2,
    centre_name: "District Mandi Yard",
    location: "Dewas",
    capacity: 60
  }
];

function slot({
  slotId,
  centreId = 1,
  centreName = "Central Procurement Centre",
  cropId = 1,
  cropName = "Wheat",
  startTime,
  endTime,
  capacity,
  availableCapacity
}) {
  return {
    slotId,
    centreId,
    centreName,
    cropId,
    cropName,
    date: DEMO_DATE,
    startTime,
    endTime,
    originalStartTime: startTime,
    originalEndTime: endTime,
    capacity,
    availableCapacity,
    source: "mock",
    recentlyChanged: false
  };
}

export const INITIAL_SLOTS = [
  slot({
    slotId: 101,
    startTime: "09:00",
    endTime: "11:00",
    capacity: 20,
    availableCapacity: 8
  }),
  slot({
    slotId: 102,
    startTime: "11:00",
    endTime: "13:00",
    capacity: 20,
    availableCapacity: 12
  }),
  slot({
    slotId: 103,
    startTime: "14:00",
    endTime: "16:00",
    capacity: 20,
    availableCapacity: 5
  }),
  slot({
    slotId: 201,
    centreId: 2,
    centreName: "District Mandi Yard",
    cropId: 2,
    cropName: "Paddy",
    startTime: "10:00",
    endTime: "12:00",
    capacity: 15,
    availableCapacity: 9
  })
];

export function createInitialFarmers() {
  return [
    {
      farmerId: 9001,
      name: "Ramesh Yadav",
      mobile: "9876543210",
      village: "Kheda",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 28,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 501,
        slotId: 101,
        tokenNumber: 102341,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "09:00",
        endTime: "11:00",
        originalStartTime: "09:00",
        originalEndTime: "11:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: "2026-09-15T09:20:00",
        weight: 27.4,
        qualityStatus: "PENDING",
        procurementStatus: "WEIGHING",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9002,
      name: "Sunita Patel",
      mobile: "9826011122",
      village: "Sanwer",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 18,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 502,
        slotId: 101,
        tokenNumber: 102342,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "09:00",
        endTime: "11:00",
        originalStartTime: "09:00",
        originalEndTime: "11:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: "2026-09-15T09:35:00",
        weight: null,
        qualityStatus: null,
        procurementStatus: "ARRIVED",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9003,
      name: "Harpal Singh",
      mobile: "9755012345",
      village: "Depalpur",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 40,
      centreName: "Central Procurement Centre",
      verificationStatus: "PENDING",
      source: "mock",
      booking: {
        bookingId: 503,
        slotId: 102,
        tokenNumber: 118901,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "11:00",
        endTime: "13:00",
        originalStartTime: "11:00",
        originalEndTime: "13:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: null,
        weight: null,
        qualityStatus: null,
        procurementStatus: "SLOT_CONFIRMED",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9004,
      name: "Meena Bai",
      mobile: "9009988776",
      village: "Mhow",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 12,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 504,
        slotId: 103,
        tokenNumber: 140212,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "14:00",
        endTime: "16:00",
        originalStartTime: "14:00",
        originalEndTime: "16:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: null,
        weight: null,
        qualityStatus: null,
        procurementStatus: "SLOT_CONFIRMED",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9005,
      name: "Abdul Karim",
      mobile: "8883311220",
      village: "Hatod",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 22,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 505,
        slotId: 103,
        tokenNumber: 140213,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "14:00",
        endTime: "16:00",
        originalStartTime: "14:00",
        originalEndTime: "16:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: null,
        weight: null,
        qualityStatus: null,
        procurementStatus: "SLOT_CONFIRMED",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9006,
      name: "Kavita Joshi",
      mobile: "9425090909",
      village: "Barlai",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 16,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 506,
        slotId: 102,
        tokenNumber: 118902,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "11:00",
        endTime: "13:00",
        originalStartTime: "11:00",
        originalEndTime: "13:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: null,
        weight: 15.8,
        qualityStatus: "ACCEPTED",
        procurementStatus: "ACCEPTED",
        paymentStatus: "PENDING",
        recentlyChanged: false
      }
    },
    {
      farmerId: 9007,
      name: "Gopal Verma",
      mobile: "9617012345",
      village: "Dewas Khurd",
      district: "Dewas",
      state: "Madhya Pradesh",
      cropName: "Paddy",
      season: "Kharif",
      estimatedQuantity: 30,
      centreName: "District Mandi Yard",
      verificationStatus: "PENDING",
      source: "mock",
      booking: {
        bookingId: 507,
        slotId: 201,
        tokenNumber: 220110,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "10:00",
        endTime: "12:00",
        originalStartTime: "10:00",
        originalEndTime: "12:00",
        centreName: "District Mandi Yard",
        cropName: "Paddy",
        arrivalTime: null,
        weight: null,
        qualityStatus: null,
        procurementStatus: "SLOT_CONFIRMED",
        paymentStatus: null,
        recentlyChanged: false
      }
    },
    {
      farmerId: 9008,
      name: "Lata Sharma",
      mobile: "8319900112",
      village: "Rau",
      district: "Indore",
      state: "Madhya Pradesh",
      cropName: "Wheat",
      season: "Rabi",
      estimatedQuantity: 9,
      centreName: "Central Procurement Centre",
      verificationStatus: "VERIFIED",
      source: "mock",
      booking: {
        bookingId: 508,
        slotId: 101,
        tokenNumber: 102343,
        status: "CONFIRMED",
        date: DEMO_DATE,
        startTime: "09:00",
        endTime: "11:00",
        originalStartTime: "09:00",
        originalEndTime: "11:00",
        centreName: "Central Procurement Centre",
        cropName: "Wheat",
        arrivalTime: "2026-09-15T09:10:00",
        weight: 8.6,
        qualityStatus: "ACCEPTED",
        procurementStatus: "ACCEPTED",
        paymentStatus: "COMPLETED",
        recentlyChanged: false
      }
    }
  ];
}

export function createInitialMandiState() {
  return {
    capacity: 100,
    occupied: 78,
    available: 22,
    processingCapacity: 100,
    originalProcessingCapacity: 100,
    mandiStatus: "OPERATIONAL",
    bookingsPaused: false,
    pauseReason: "",
    currentSlotId: 101,
    equipment: {
      weighingMachine: { name: "Electronic weighing machine", available: true },
      moistureMeter: { name: "Moisture meter", available: true },
      baggingUnit: { name: "Bagging unit", available: true }
    },
    slots: INITIAL_SLOTS.map((item) => ({ ...item })),
    farmers: createInitialFarmers(),
    incidents: [],
    notifications: [],
    latestNotification: null,
    lastAutomation: null,
    affectedFarmerIds: [],
    flashKey: 0
  };
}
