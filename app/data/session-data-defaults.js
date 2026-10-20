const participants = require('./participants')

module.exports = {
  participants,
  stagedCount: 0,
  clinicName: 'Worthing - test day September 2026',
  clinicId: 'HWO-NNN-standard-20260501',
  unitName: 'West Sussex Breast Screening Centre',
  unitId: 'HWO-static-1',
  locationName: 'Worthing',
  locationAddressLine1: "Worthing Hospital",
  clinicTimespan: "1 September 2026",
  clinicLength: "1 day",
  clinicCapacityPercentBooked: "0",
  clinicCapacityAvailable: "10",
  clinicCapacityTotal: "10",
  missionOne: {},
  createCapacityFromZero: {
    schedules: [],
    selectedDays: [],
    dayTemplates: {}
  },
  createSessionTemplate: {
    
  },
  // Listings reverse this array, so the last entry shows first
  sessionTemplates: [
    {
      id: 'example-special-appointments',
      example: true,
      slug: 'special-appointments',
      name: "Special appointments",
      note: "This is where a short note would go is where a short note would go is where a short note would go",
      imagePath: "/assets/images/session-template-map-specials-day.svg",
      sessionStartLabel: "09:00",
      sessionEndLabel: "17:00",
      duration: 10,
      totalSlotCount: 42,
      totalLabel: "Total slots"
    },
    {
      id: 'example-standard',
      example: true,
      slug: 'standard',
      name: "Standard day with a ludicrous name that's probably really long",
      note: "Pattern for our static site",
      imagePath: "/assets/images/session-template-map-standard-day.svg",
      sessionStartLabel: "09:00",
      sessionEndLabel: "17:00",
      duration: 10,
      totalSlotCount: 42,
      totalLabel: "Total slots"
    }
  ]
}