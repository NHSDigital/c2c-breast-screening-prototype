const express = require('express')
const router = express.Router()

// Routes and functions specific to Mission 1 prototypes
/*

/app/views/mission-1/current-iteration/

*/

const isWholeNumber = str => /^\d+$/.test(str)

// Checks a { day, month, year } object has numeric values for each field, regardless of whether they form a real date
const hasDateFields = (dateObj) =>
  Boolean(dateObj) && isWholeNumber(dateObj.day) && isWholeNumber(dateObj.month) && isWholeNumber(dateObj.year)

// Parses a { day, month, year } object into a Date, or null if invalid
const parseDateFields = (dateObj) => {
  if (!hasDateFields(dateObj)) {
    return null
  }

  const day = parseInt(dateObj.day, 10)
  const month = parseInt(dateObj.month, 10)
  // Treat 2-digit years as shorthand for the 2000s, eg "26" becomes 2026
  const year = dateObj.year.length === 2 ? parseInt(`20${dateObj.year}`, 10) : parseInt(dateObj.year, 10)
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

// simple search
router.get('/mission-1/current-iteration/clickthru/04a-example-search-result', function (req, res) {
  const query = (req.query['search-params'] || '').trim()
  const allParticipants = (req.session.data.participants && req.session.data.participants.default) || []
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, ' ')
  const nhsQuery = normalizedQuery.replace(/\s+/g, '')

  const searchResults = (normalizedQuery ? allParticipants.map((participant, index) => {
    const nhs = participant.nhs_number.toLowerCase().replace(/\s+/g, '')
    const name = participant.full_name.toLowerCase()
    const dob = participant.date_of_birth.toLowerCase()

    if (
      nhs.includes(nhsQuery) ||
      name.includes(normalizedQuery) ||
      dob.includes(normalizedQuery)
    ) {
      return Object.assign({}, participant, { participantIndex: index })
    }

    return null
  }).filter(Boolean) : allParticipants.map((participant, index) => Object.assign({}, participant, { participantIndex: index })))

  res.render('mission-1/current-iteration/clickthru/04a-example-search-result', {
    participants: searchResults,
    searchQuery: query
  })
})

// adding and removing participants from the "group"
router.get('/action/stage/:participantId', function (req, res) {
  const participants = (req.session.data.participants && req.session.data.participants.default) || []
  const participantIndex = participants.findIndex((participant) => participant.participantId === req.params.participantId)

  if (participantIndex !== -1) {
    participants[participantIndex].status = 'staged'
    req.session.data.stagedCount++
  }

  res.redirect(req.get('referer') || '/mission-1/current-iteration/clickthru/04-choose-participants')
});
router.get('/action/unstage/:participantId', function (req, res) {
  const participants = (req.session.data.participants && req.session.data.participants.default) || []
  const participantIndex = participants.findIndex((participant) => participant.participantId === req.params.participantId)

  if (participantIndex !== -1) {
    participants[participantIndex].status = 'unstaged'
    req.session.data.stagedCount--
  }

  res.redirect(req.get('referer') || '/mission-1/current-iteration/clickthru/04-choose-participants')
});

// validating clinic name for 1 day clinic creation
router.post('/mission-1/current-iteration/create-clinic-rev-1-name', function (req, res) {
  const clinicName = (req.body.clinicName || '').trim()

  if (!req.session.data.missionOne || typeof req.session.data.missionOne !== 'object') {
    req.session.data.missionOne = {}
  }
  req.session.data.missionOne.clinicName = clinicName

  const errors = {}

  if (!clinicName) {
    errors.clinicName = 'Clinic must be given a name'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-name', {
      errors
    })
  }

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-schedule')
})

// validating the scheduled date for 1 day clinic creation
router.post('/mission-1/current-iteration/create-clinic-rev-1-schedule', function (req, res) {
  const clinicDate = req.body.clinicDate || {}

  if (typeof clinicDate.year === 'string' && /^\d{2}$/.test(clinicDate.year)) {
    clinicDate.year = `20${clinicDate.year}`
  }

  if (!req.session.data.missionOne || typeof req.session.data.missionOne !== 'object') {
    req.session.data.missionOne = {}
  }
  req.session.data.missionOne.clinicDate = clinicDate

  const errors = {}

  if (!hasDateFields(clinicDate)) {
    errors.clinicDate = 'Date of clinic must be given a day, month, and year'
  } else {
    const parsedDate = parseDateFields(clinicDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!parsedDate || parsedDate <= today) {
      errors.clinicDate = 'Date of clinic must be in the future'
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-schedule', {
      errors
    })
  }

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-set-timings')
})

// validating clinic session times for 1 day clinic creation
router.post('/mission-1/current-iteration/create-clinic-rev-1-set-timings', function (req, res) {
  const newSession = req.body.newSession || {}
  const startTime = newSession.startTime || {}
  const endTime = newSession.endTime || {}

  const startHourStr = (startTime.hour || '').trim()
  const startMinuteStr = (startTime.minute || '').trim()
  const endHourStr = (endTime.hour || '').trim()
  const endMinuteStr = (endTime.minute || '').trim()
  const durationStr = (newSession.duration || '').trim()

  const startHour = parseInt(startHourStr, 10)
  const startMinute = parseInt(startMinuteStr, 10)
  const endHour = parseInt(endHourStr, 10)
  const endMinute = parseInt(endMinuteStr, 10)
  const duration = parseInt(durationStr, 10)

  const validStartHour = isWholeNumber(startHourStr) && startHour >= 0 && startHour <= 23
  const validStartMinute = isWholeNumber(startMinuteStr) && startMinute >= 0 && startMinute <= 59
  const validEndHour = isWholeNumber(endHourStr) && endHour >= 0 && endHour <= 23
  const validEndMinute = isWholeNumber(endMinuteStr) && endMinute >= 0 && endMinute <= 59

  const errors = {}

  if (!validStartHour || !validStartMinute) {
    errors.startTime = 'Start time must be entered, in 24 hour format'
  }

  if (!validEndHour || !validEndMinute) {
    errors.endTime = 'End time must be entered, in 24 hour format'
  }

  if (!isWholeNumber(durationStr) || duration <= 0) {
    errors.duration = 'Slot length must be entered, in minutes'
  }

  if (!errors.startTime && !errors.endTime) {
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    if (endTotalMinutes <= startTotalMinutes) {
      errors.startTime = 'Start time must be earlier than end time'
      errors.endTime = 'End time must be later than start time'
    }
  }

  if (typeof req.session.data.missionOne !== 'object') {
    req.session.data.missionOne = {}
  }
  req.session.data.missionOne.startTime = startTime
  req.session.data.missionOne.endTime = endTime
  req.session.data.missionOne.duration = durationStr

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-set-timings', {
      errors
    })
  }

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-slot-structure')
})

// Formats a total minutes-from-midnight value as e.g. "10:08"
const formatClock = (totalMinutes) => {
  const hour = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// Builds the slot checkbox data for a clinic session, flagging any slots marked as staff breaks
const buildSessionSlots = (missionOne) => {
  const startTime = missionOne.startTime || {}
  const endTime = missionOne.endTime || {}

  const startMinutes = (parseInt(startTime.hour, 10) || 0) * 60 + (parseInt(startTime.minute, 10) || 0)
  const endMinutes = (parseInt(endTime.hour, 10) || 0) * 60 + (parseInt(endTime.minute, 10) || 0)
  const duration = parseInt(missionOne.duration, 10) || 0
  const staffBreakSlots = (missionOne.staffBreakSlots || []).map(Number).filter(Number.isInteger)

  const slots = []

  if (duration > 0 && endMinutes > startMinutes) {
    const slotCount = Math.floor((endMinutes - startMinutes) / duration)

    for (let i = 0; i < slotCount; i++) {
      const slotStartMinutes = startMinutes + (i * duration)
      slots.push({
        index: i,
        startLabel: formatClock(slotStartMinutes),
        endLabel: formatClock(slotStartMinutes + duration),
        isStaffBreak: staffBreakSlots.includes(i)
      })
    }
  }

  const bookableSlotCount = slots.filter((slot) => !slot.isStaffBreak).length
  const staffBreakSlotCount = slots.filter((slot) => slot.isStaffBreak).length
  missionOne.bookableSlotCount = bookableSlotCount
  missionOne.staffBreakSlotCount = staffBreakSlotCount

  return {
    slots,
    bookableSlotCount,
    staffBreakSlotCount,
    sessionStartLabel: formatClock(startMinutes),
    sessionEndLabel: formatClock(endMinutes)
  }
}

// computing the real slot structure from the submitted session times for 1 day clinic creation
router.get('/mission-1/current-iteration/create-clinic-rev-1-slot-structure', function (req, res) {
  const missionOne = req.session.data.missionOne || {}

  res.render('mission-1/current-iteration/create-clinic-rev-1-slot-structure', buildSessionSlots(missionOne))
})

// marking the selected slots as staff breaks for 1 day clinic creation
router.post('/mission-1/current-iteration/mark-staff-break', function (req, res) {
  const missionOne = req.session.data.missionOne || {}
  // nhsuk-frontend's checkboxes component submits an "_unchecked" sentinel for every untoggled box, so filter down to real indices
  const selectedSlots = [].concat(req.body.computedSlots || []).map(Number).filter(Number.isInteger)

  const errors = {}
  if (selectedSlots.length === 0) {
    errors.slots = 'you need to select some slots'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-slot-structure', Object.assign({ errors }, buildSessionSlots(missionOne)))
  }

  const staffBreakSlots = new Set((missionOne.staffBreakSlots || []).map(Number).filter(Number.isInteger))
  selectedSlots.forEach((index) => staffBreakSlots.add(index))
  missionOne.staffBreakSlots = Array.from(staffBreakSlots)
  req.session.data.missionOne = missionOne

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-slot-structure')
})

// clearing staff break status from the selected slots for 1 day clinic creation
router.post('/mission-1/current-iteration/clear-slot-type', function (req, res) {
  const missionOne = req.session.data.missionOne || {}
  // nhsuk-frontend's checkboxes component submits an "_unchecked" sentinel for every untoggled box, so filter down to real indices
  const selectedSlots = [].concat(req.body.computedSlots || []).map(Number).filter(Number.isInteger)

  const errors = {}
  if (selectedSlots.length === 0) {
    errors.slots = 'you need to select some slots'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-slot-structure', Object.assign({ errors }, buildSessionSlots(missionOne)))
  }

  const selectedSet = new Set(selectedSlots)
  missionOne.staffBreakSlots = (missionOne.staffBreakSlots || []).map(Number).filter(Number.isInteger).filter((index) => !selectedSet.has(index))
  req.session.data.missionOne = missionOne

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-slot-structure')
})

// creating and passing Total Slots through for 1 day clinic creation
router.post('/mission-1/current-iteration/create-clinic-rev-1-publish-check', function (req, res) {
  const newSession = req.session.data.newSession || {}
  const startTime = newSession.startTime || {}
  const endTime = newSession.endTime || {}

  const startMinutes = (parseInt(startTime.hour, 10) || 0) * 60 + (parseInt(startTime.minute, 10) || 0)
  const endMinutes = (parseInt(endTime.hour, 10) || 0) * 60 + (parseInt(endTime.minute, 10) || 0)
  const duration = parseInt(newSession.duration, 10) || 0

  newSession.totalSlots = duration > 0 ? Math.floor((endMinutes - startMinutes) / duration) : 0

  res.render('mission-1/current-iteration/create-clinic-rev-1-publish-check')
})

module.exports = router