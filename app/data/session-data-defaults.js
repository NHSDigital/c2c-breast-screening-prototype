const participants = require('./participants')

const formatTime = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

// 10:00 to 17:00 in ten-minute base slots: pairs are combined into 20-minute special appointments, with a staff break 13:00 to 14:00
const specialsDayCombinedRanges = [
  ...Array.from({ length: 9 }, (_, n) => ({ start: n * 2, end: n * 2 + 1 })),
  ...Array.from({ length: 9 }, (_, n) => ({ start: 24 + n * 2, end: 24 + n * 2 + 1 }))
]
const specialsDaySlots = [
  ...specialsDayCombinedRanges.filter(range => range.start < 18),
  ...Array.from({ length: 6 }, (_, n) => ({ start: 18 + n, end: 18 + n, isBreak: true })),
  ...specialsDayCombinedRanges.filter(range => range.start >= 24)
].map(({ start, end, isBreak }) => ({
  index: start,
  startLabel: formatTime(600 + start * 10),
  endLabel: formatTime(610 + end * 10),
  isCombined: !isBreak,
  span: end - start + 1,
  mergedChildren: isBreak ? [] : [1],
  isNonBookable: Boolean(isBreak),
  nonBookableReason: isBreak ? 'staff break' : null,
  isHold: false,
  holdReason: null,
  isSpecialAppointment: !isBreak
}))

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
      note: "Day long session consisting of double length specials",
      imagePath: "/assets/images/session-template-map-specials-day.svg",
      sessionStartLabel: "10:00",
      sessionEndLabel: "17:00",
      duration: 10,
      totalSlotCount: 42,
      slots: specialsDaySlots,
      source: {
        sessionTemplateName: 'Special appointments',
        sessionTemplateNote: 'Day long session consisting of double length specials',
        startTime: {
          hour: '10',
          minute: '00'
        },
        endTime: {
          hour: '17',
          minute: '00'
        },
        duration: '10',
        bookableSlotCount: 36,
        nonBookableSlotCount: 6,
        bookableBreakdown: [
          {
            label: 'Special appointment',
            count: 36
          }
        ],
        nonBookableBreakdown: [
          {
            label: 'Staff break',
            count: 6
          }
        ],
        heldSlots: {},
        nonBookableSlots: {
          '18': 'staff break',
          '19': 'staff break',
          '20': 'staff break',
          '21': 'staff break',
          '22': 'staff break',
          '23': 'staff break'
        },
        specialAppointmentSlots: [
          0, 2, 4, 6, 8, 10, 12, 14, 16,
          24, 26, 28, 30, 32, 34, 36, 38, 40
        ],
        combinedSlots: specialsDayCombinedRanges
      }
    },
    {
      id: 'example-standard',
      example: true,
      slug: 'standard',
      name: "Standard day",
      note: "Pattern for our static site",
      imagePath: "/assets/images/session-template-map-standard-day.svg",
      imageAlt: "42 slots from 10:00 to 17:00. Special appointments 10:00 to 10:40. Non-bookable 13:00 to 14:00. Held 16:20 to 17:00.",
      sessionStartLabel: "10:00",
      sessionEndLabel: "17:00",
      duration: 10,
      totalSlotCount: 42,
      slots: [
        {index: 0, startLabel: '10:00', endLabel: '10:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: true},
        {index: 1, startLabel: '10:10', endLabel: '10:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: true},
        {index: 2, startLabel: '10:20', endLabel: '10:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: true},
        {index: 3, startLabel: '10:30', endLabel: '10:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: true},
        {index: 4, startLabel: '10:40', endLabel: '10:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 5, startLabel: '10:50', endLabel: '11:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 6, startLabel: '11:00', endLabel: '11:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 7, startLabel: '11:10', endLabel: '11:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 8, startLabel: '11:20', endLabel: '11:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 9, startLabel: '11:30', endLabel: '11:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 10, startLabel: '11:40', endLabel: '11:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 11, startLabel: '11:50', endLabel: '12:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 12, startLabel: '12:00', endLabel: '12:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 13, startLabel: '12:10', endLabel: '12:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 14, startLabel: '12:20', endLabel: '12:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 15, startLabel: '12:30', endLabel: '12:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 16, startLabel: '12:40', endLabel: '12:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 17, startLabel: '12:50', endLabel: '13:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 18, startLabel: '13:00', endLabel: '13:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 19, startLabel: '13:10', endLabel: '13:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 20, startLabel: '13:20', endLabel: '13:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 21, startLabel: '13:30', endLabel: '13:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 22, startLabel: '13:40', endLabel: '13:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 23, startLabel: '13:50', endLabel: '14:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: true, nonBookableReason: 'staff break', isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 24, startLabel: '14:00', endLabel: '14:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 25, startLabel: '14:10', endLabel: '14:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 26, startLabel: '14:20', endLabel: '14:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 27, startLabel: '14:30', endLabel: '14:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 28, startLabel: '14:40', endLabel: '14:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 29, startLabel: '14:50', endLabel: '15:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 30, startLabel: '15:00', endLabel: '15:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 31, startLabel: '15:10', endLabel: '15:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 32, startLabel: '15:20', endLabel: '15:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 33, startLabel: '15:30', endLabel: '15:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 34, startLabel: '15:40', endLabel: '15:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 35, startLabel: '15:50', endLabel: '16:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 36, startLabel: '16:00', endLabel: '16:10', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 37, startLabel: '16:10', endLabel: '16:20', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: false, holdReason: null, isSpecialAppointment: false},
        {index: 38, startLabel: '16:20', endLabel: '16:30', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: true, holdReason: 'rebooking', isSpecialAppointment: false},
        {index: 39, startLabel: '16:30', endLabel: '16:40', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: true, holdReason: 'rebooking', isSpecialAppointment: false},
        {index: 40, startLabel: '16:40', endLabel: '16:50', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: true, holdReason: 'rebooking', isSpecialAppointment: false},
        {index: 41, startLabel: '16:50', endLabel: '17:00', isCombined: false, span: 1, mergedChildren: [], isNonBookable: false, nonBookableReason: null, isHold: true, holdReason: 'rebooking', isSpecialAppointment: false}
      ],
      source: {
        sessionTemplateName: 'Standard day',
        sessionTemplateNote: 'Pattern for our static site',
        startTime: {
          hour: '10',
          minute: '00'
        },
        endTime: {
          hour: '17',
          minute: '00'
        },
        duration: '10',
        bookableSlotCount: 36,
        nonBookableSlotCount: 6,
        bookableBreakdown: [
          {
            label: 'Held for rebooking',
            count: 4
          },
          {
            label: 'Special appointment',
            count: 4
          },
          {
            label: 'Standard',
            count: 28
          }
        ],
        nonBookableBreakdown: [
          {
            label: 'Staff break',
            count: 6
          }
        ],
        heldSlots: {
          '38': 'rebooking',
          '39': 'rebooking',
          '40': 'rebooking',
          '41': 'rebooking'
        },
        nonBookableSlots: {
          '18': 'staff break',
          '19': 'staff break',
          '20': 'staff break',
          '21': 'staff break',
          '22': 'staff break',
          '23': 'staff break'
        },
        specialAppointmentSlots: [
          0,
          1,
          2,
          3
        ]
      }
    }
  ]
}