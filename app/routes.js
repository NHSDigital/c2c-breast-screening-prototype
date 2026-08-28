// External dependencies
const express = require('express')

const router = express.Router()

//======= September test specific for now

// Utility function to generate calendar month data
const generateCalendarMonth = (year, month) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  
  // Convert to Mon-Sun week (Mon = 0, Sun = 6)
  const weekStartOffset = (startingDayOfWeek === 0) ? 6 : startingDayOfWeek - 1
  
  const days = []
  
  // Add empty slots for days before month starts
  for (let i = 0; i < weekStartOffset; i++) {
    days.push(null)
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: day,
      fullDate: new Date(year, month - 1, day)
    })
  }
  
  return {
    year,
    month,
    monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
    days
  }
}

// Utility function to generate calendar data for a date range
const generateCalendarRange = (startDate, endDate) => {
  const calendars = []
  
  let currentYear = startDate.getFullYear()
  let currentMonth = startDate.getMonth() + 1
  
  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth() + 1
  
  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const calendar = generateCalendarMonth(currentYear, currentMonth)
    
    // Filter days to only show those within the date range
    calendar.days = calendar.days.map(day => {
      if (!day) return null
      if (day.fullDate < startDate || day.fullDate > endDate) return null
      return day
    })

    // Build calendar weeks and trim fully empty rows for partial months.
    const weeks = []
    for (let i = 0; i < calendar.days.length; i += 7) {
      const week = calendar.days.slice(i, i + 7)
      while (week.length < 7) {
        week.push(null)
      }
      if (week.some(day => day)) {
        weeks.push(week)
      }
    }
    calendar.weeks = weeks
    
    calendars.push(calendar)
    
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }
  
  return calendars
}

// Utility function to parse date object
const parseDate = (dateObj) => {
  if (!dateObj || !dateObj.day || !dateObj.month || !dateObj.year) {
    return null
  }
  const day = parseInt(dateObj.day, 10)
  const month = parseInt(dateObj.month, 10)
  const year = parseInt(dateObj.year, 10)
  return new Date(year, month - 1, day)
}

const formatClock = (hour, minute) => {
  const h = String(hour).padStart(2, '0')
  const m = String(minute).padStart(2, '0')
  return `${h}:${m}`
}

const formatDateLabel = (dateObj) => {
  if (!dateObj || !dateObj.day || !dateObj.month || !dateObj.year) {
    return '-'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const day = parseInt(dateObj.day, 10)
  const month = parseInt(dateObj.month, 10)
  const year = parseInt(dateObj.year, 10)

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) {
    return '-'
  }

  return `${day} ${monthNames[month - 1]} ${year}`
}

const parseIsoDateOnly = (value) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) {
    return null
  }

  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const day = parseInt(match[3], 10)
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

const summarizeAppliedDates = (isoDateStrings) => {
  if (!Array.isArray(isoDateStrings) || !isoDateStrings.length) {
    return '-'
  }

  const validDates = isoDateStrings
    .map(parseIsoDateOnly)
    .filter(Boolean)

  if (!validDates.length) {
    return '-'
  }

  const uniqueSortedDates = Array.from(new Set(validDates.map(d => d.getTime())))
    .sort((a, b) => a - b)
    .map(ms => new Date(ms))

  const dayMs = 24 * 60 * 60 * 1000
  const ranges = []
  let rangeStart = uniqueSortedDates[0]
  let previous = uniqueSortedDates[0]

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const current = uniqueSortedDates[i]
    if (current.getTime() - previous.getTime() === dayMs) {
      previous = current
      continue
    }

    ranges.push({ start: rangeStart, end: previous })
    rangeStart = current
    previous = current
  }
  ranges.push({ start: rangeStart, end: previous })

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return ranges.map((range) => {
    const start = range.start
    const end = range.end

    const sameDay = start.getTime() === end.getTime()
    const sameMonth = start.getMonth() === end.getMonth()
    const sameYear = start.getFullYear() === end.getFullYear()

    if (sameDay) {
      return `${start.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
    }

    if (sameMonth && sameYear) {
      return `${start.getDate()}-${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`
    }

    if (sameYear) {
      return `${start.getDate()} ${monthNames[start.getMonth()]}-${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`
    }

    return `${start.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}-${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`
  }).join(', ')
}

const sanitizeOrganisedSlots = (slotData) => {
  if (!Array.isArray(slotData)) {
    return []
  }

  return slotData
    .filter(slot => slot && typeof slot === 'object')
    .map(slot => ({
      idx: Number.isInteger(slot.idx) ? slot.idx : undefined,
      start: Number.isFinite(slot.start) ? slot.start : undefined,
      end: Number.isFinite(slot.end) ? slot.end : undefined,
      key: typeof slot.key === 'string' ? slot.key : '',
      type: ['hold', 'staff-break', 'special-appointment', null].includes(slot.type) ? slot.type : null,
      merged: Boolean(slot.merged),
      span: Number.isInteger(slot.span) && slot.span > 0 ? slot.span : 1,
      isMergedInto: Number.isInteger(slot.isMergedInto) ? slot.isMergedInto : undefined,
      mergedEnd: typeof slot.mergedEnd === 'string' ? slot.mergedEnd : null
    }))
    .filter(slot => slot.key)
}

// Lets the "create a clinic" workflow pages also work when duplicated under z-older-versions/,
// keeping session-driven rendering (e.g. calendars) and redirects on the same copy of the pages.
const OLDER_VERSIONS_PREFIX = '/clinics-schedules/z-older-versions/'

const isOlderVersionsRequest = (req) => req.path.startsWith(OLDER_VERSIONS_PREFIX)

const clinicsScheduleView = (req, name) =>
  isOlderVersionsRequest(req) ? `clinics-schedules/z-older-versions/${name}` : `clinics-schedules/${name}`

const clinicsScheduleRedirect = (req, name) =>
  isOlderVersionsRequest(req) ? `${OLDER_VERSIONS_PREFIX}${name}` : `/clinics-schedules/${name}`

router.post(['/clinics-schedules/01-create-schedule', OLDER_VERSIONS_PREFIX + '01-create-schedule'], function (req, res) {
  const hasScheduleFields = req.body && (req.body.scheduleStartDate || req.body.scheduleEndDate)

  // Step 00 posts to this route and should move to step 01.
  if (!hasScheduleFields) {
    req.session.data.clinicName = (req.body && req.body.clinicName) || ''
    req.session.data.clinicId = (req.body && req.body.clinicId) || req.session.data.clinicId || 'HWO-NNN-standard-20260501'
    req.session.data.unit = (req.body && req.body.unit) || ''
    req.session.data.location = (req.body && req.body.location) || ''

    return res.redirect(clinicsScheduleRedirect(req, '01-create-schedule'))
  }

  const scheduleStartDateObj = (req.body && req.body.scheduleStartDate) || {}
  const scheduleEndDateObj = (req.body && req.body.scheduleEndDate) || {}
  
  const startDate = parseDate(scheduleStartDateObj)
  const endDate = parseDate(scheduleEndDateObj)
  
  // Store the date objects in session for later use
  req.session.data.scheduleStartDate = scheduleStartDateObj
  req.session.data.scheduleEndDate = scheduleEndDateObj
  
  // Generate calendars for the date range if both dates are valid
  if (startDate && endDate && startDate <= endDate) {
    const calendars = generateCalendarRange(startDate, endDate)
    req.session.data.calendars = calendars
  } else {
    req.session.data.calendars = []
  }
  
  res.redirect(clinicsScheduleRedirect(req, '02-choose-session-options'))
})

router.post(['/clinics-schedules/03-create-session', OLDER_VERSIONS_PREFIX + '03-create-session'], function (req, res) {
  const createSessionHints = (req.body && req.body.createSessionHints) || ''
  req.session.data.createSessionHints = createSessionHints

  res.redirect(clinicsScheduleRedirect(req, '03-create-session'))
})

router.get(['/clinics-schedules/06-apply-session', OLDER_VERSIONS_PREFIX + '06-apply-session'], function (req, res) {
  const scheduleStartDateObj = (req.session.data && req.session.data.scheduleStartDate) || {}
  const scheduleEndDateObj = (req.session.data && req.session.data.scheduleEndDate) || {}

  let startDate = parseDate(scheduleStartDateObj)
  let endDate = parseDate(scheduleEndDateObj)

  // Test-friendly fallback when schedule dates have not been entered.
  if (!startDate || !endDate || startDate > endDate) {
    startDate = new Date(2026, 7, 24) // 24 August 2026
    endDate = new Date(2026, 9, 7) // 7 October 2026

    req.session.data.scheduleStartDate = { day: '24', month: '8', year: '2026' }
    req.session.data.scheduleEndDate = { day: '7', month: '10', year: '2026' }
  }

  // Rebuild calendars on load if dates exist but calendars are missing/stale.
  if (startDate && endDate && startDate <= endDate) {
    req.session.data.calendars = generateCalendarRange(startDate, endDate)
  }

  const slotsSummary = (req.session.data && req.session.data.slotsSummary) || {}
  const totalSlots = parseInt((req.session.data && req.session.data.newSession && req.session.data.newSession.totalSlots) || '0', 10)
  const available = parseInt(slotsSummary.available, 10)
  const special = parseInt(slotsSummary.special, 10)
  const held = parseInt(slotsSummary.held, 10)

  req.session.data.slotsSummary = {
    available: Number.isInteger(available) ? available : (Number.isInteger(totalSlots) ? totalSlots : 0),
    special: Number.isInteger(special) ? special : 0,
    held: Number.isInteger(held) ? held : 0
  }

  const sessionSummaryRows = Array.isArray(req.session.data.sessionSummaryRows)
    ? req.session.data.sessionSummaryRows
    : []

  if (!sessionSummaryRows.length) {
    const newSession = (req.session.data && req.session.data.newSession) || {}
    const startTime = newSession.startTime || {}
    const endTime = newSession.endTime || {}
    const startHour = parseInt(startTime.hour, 10)
    const startMinute = parseInt(startTime.minute, 10)
    const endHour = parseInt(endTime.hour, 10)
    const endMinute = parseInt(endTime.minute, 10)

    if (
      Number.isInteger(startHour) && Number.isInteger(startMinute) &&
      Number.isInteger(endHour) && Number.isInteger(endMinute)
    ) {
      req.session.data.sessionSummaryRows = [{
        start: formatClock(startHour, startMinute),
        end: formatClock(endHour, endMinute),
        details: 'Available'
      }]
    }
  }

  res.render(clinicsScheduleView(req, '06-apply-session'))
})

// ====== session setup handlers

const isWholeNumber = str => /^\d+$/.test(str)

router.post('/sessions/01-set-timings', function (req, res) {
  const session = (req.body && req.body.newSession) || {}
  const startTime = session.startTime || {}
  const endTime = session.endTime || {}

  const startHourStr = (startTime.hour || '').trim()
  const startMinuteStr = (startTime.minute || '').trim()
  const endHourStr = (endTime.hour || '').trim()
  const endMinuteStr = (endTime.minute || '').trim()
  const durationStr = (session.duration || '').trim()

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

  const validDuration = isWholeNumber(durationStr) && duration > 0
  if (!validDuration) {
    errors.duration = 'Slot length must be entered, in minutes, as a whole number'
  }

  if (!errors.startTime && !errors.endTime) {
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    if (endTotalMinutes <= startTotalMinutes) {
      errors.startTime = 'Start time must be earlier than end time'
      errors.endTime = 'End time must be later than start time'
    } else if (!errors.duration && duration > endTotalMinutes - startTotalMinutes) {
      errors.duration = 'Slot length must be shorter than the total session duration'
    }
  }

  req.session.data.newSession = session

  if (Object.keys(errors).length > 0) {
    return res.render('sessions/01-set-timings', {
      errors
    })
  }
  res.redirect('/sessions/02-organise-slots')
})

router.post(['/clinics-schedules/04-organise-slots', OLDER_VERSIONS_PREFIX + '04-organise-slots'], function (req, res) {
  const session = (req.body && req.body.newSession) || {}
  const sessionName = (req.body && req.body.sessionName && req.body.sessionName.trim()) || ''
  const startTime = session.startTime || {}
  const endTime = session.endTime || {}

  const startHourStr = (startTime.hour || '').trim()
  const startMinuteStr = (startTime.minute || '').trim()
  const endHourStr = (endTime.hour || '').trim()
  const endMinuteStr = (endTime.minute || '').trim()
  const durationStr = (session.duration || '').trim()

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

  if (!sessionName) {
    errors.sessionName = 'Session needs a name'
  }

  if (!validStartHour || !validStartMinute) {
    errors.startTime = 'Start time must be entered, in 24 hour format'
  }

  if (!validEndHour || !validEndMinute) {
    errors.endTime = 'End time must be entered, in 24 hour format'
  }

  const validDuration = isWholeNumber(durationStr) && duration > 0
  if (!validDuration) {
    errors.duration = 'Slot length must be entered, in minutes, as a whole number'
  }

  if (!errors.startTime && !errors.endTime) {
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    if (endTotalMinutes <= startTotalMinutes) {
      errors.startTime = 'Start time must be earlier than end time'
      errors.endTime = 'End time must be later than start time'
    } else if (!errors.duration && duration > endTotalMinutes - startTotalMinutes) {
      errors.duration = 'Slot length must be shorter than the total session duration'
    }
  }

  req.session.data.newSession = session
  req.session.data.sessionName = sessionName

  if (Object.keys(errors).length > 0) {
    return res.render(clinicsScheduleView(req, '03-create-session'), {
      errors
    })
  }
  res.redirect(clinicsScheduleRedirect(req, '04-organise-slots'))
})

router.get(['/clinics-schedules/05-save-as-template', OLDER_VERSIONS_PREFIX + '05-save-as-template'], function (req, res) {
  res.render(clinicsScheduleView(req, '05-save-as-template'))
})

router.post(['/clinics-schedules/05-save-as-template', OLDER_VERSIONS_PREFIX + '05-save-as-template'], function (req, res) {
  const saveSessionHints = req.body && req.body.saveSessionHints

  const slotsAvailableCount = req.body && req.body.slotsAvailableCount
  const slotsSpecialAvailableCount = req.body && req.body.slotsSpecialAvailableCount
  const slotsHeldCount = req.body && req.body.slotsHeldCount
  const slotSummaryRowsJson = req.body && req.body.slotSummaryRowsJson
  const slotDataJson = req.body && req.body.slotDataJson

  req.session.data.saveSessionHints = saveSessionHints || ''

  if (
    slotsAvailableCount !== undefined ||
    slotsSpecialAvailableCount !== undefined ||
    slotsHeldCount !== undefined
  ) {
    req.session.data.slotsSummary = {
      available: parseInt(slotsAvailableCount || '0', 10) || 0,
      special: parseInt(slotsSpecialAvailableCount || '0', 10) || 0,
      held: parseInt(slotsHeldCount || '0', 10) || 0
    }
  }

  if (slotSummaryRowsJson) {
    try {
      const parsed = JSON.parse(slotSummaryRowsJson)
      if (Array.isArray(parsed)) {
        req.session.data.sessionSummaryRows = parsed
          .filter(row => row && typeof row === 'object')
          .map(row => ({
            start: String(row.start || '').trim(),
            end: String(row.end || '').trim(),
            details: String(row.details || '').trim()
          }))
          .filter(row => row.start && row.end && row.details)
      }
    } catch (err) {
      req.session.data.sessionSummaryRows = []
    }
  }

  if (slotDataJson) {
    try {
      const parsedSlots = JSON.parse(slotDataJson)
      req.session.data.organisedSlotData = sanitizeOrganisedSlots(parsedSlots)
    } catch (err) {
      req.session.data.organisedSlotData = []
    }
  }

  // Step 4 posts slot data here first; if no choice has been made yet,
  // send user to step 5 question page instead of skipping to step 6.
  if (!saveSessionHints) {
    return res.redirect(clinicsScheduleRedirect(req, '05-save-as-template'))
  }

  if (saveSessionHints === 'yes') {
    return res.redirect(clinicsScheduleRedirect(req, '05a-template-details'))
  }

  res.redirect(clinicsScheduleRedirect(req, '06-apply-session'))
})

router.post(['/clinics-schedules/06-apply-session', OLDER_VERSIONS_PREFIX + '06-apply-session'], function (req, res) {
  req.session.data.templateName = (req.body && req.body.templateName) || ''
  req.session.data.templateDescription = (req.body && req.body.templateDescription) || ''

  res.redirect(clinicsScheduleRedirect(req, '06-apply-session'))
})

router.post(['/clinics-schedules/07-schedule-details', OLDER_VERSIONS_PREFIX + '07-schedule-details'], function (req, res) {
  const selectedSessionDatesJson = req.body && req.body.selectedSessionDatesJson

  if (selectedSessionDatesJson) {
    try {
      const parsed = JSON.parse(selectedSessionDatesJson)
      req.session.data.selectedSessionDates = Array.isArray(parsed)
        ? parsed.filter(value => typeof value === 'string')
        : []
    } catch (err) {
      req.session.data.selectedSessionDates = []
    }
  } else {
    req.session.data.selectedSessionDates = []
  }

  res.redirect(clinicsScheduleRedirect(req, '07-schedule-details'))
})

router.get('/clinics-schedules/add-another-session', function (req, res) {
  // Keep schedule-level context and previously added sessions, but clear in-progress session state.
  req.session.data.createSessionHints = ''
  req.session.data.sessionName = ''
  req.session.data.newSession = {}
  req.session.data.slotsSummary = {}
  req.session.data.sessionSummaryRows = []
  req.session.data.organisedSlotData = []
  req.session.data.selectedSessionDates = []
  req.session.data.saveSessionHints = ''
  req.session.data.templateName = ''
  req.session.data.templateDescription = ''

  res.redirect('/clinics-schedules/03-create-session')
})

router.get('/clinics-schedules/add-another-schedule', function (req, res) {
  // Keep clinic-level context and created schedules, but clear schedule/session state.
  req.session.data.scheduleStartDate = {}
  req.session.data.scheduleEndDate = {}
  req.session.data.calendars = []
  req.session.data.createSessionHints = ''
  req.session.data.sessionName = ''
  req.session.data.newSession = {}
  req.session.data.slotsSummary = {}
  req.session.data.sessionSummaryRows = []
  req.session.data.organisedSlotData = []
  req.session.data.selectedSessionDates = []
  req.session.data.saveSessionHints = ''
  req.session.data.templateName = ''
  req.session.data.templateDescription = ''
  req.session.data.scheduleSessions = []

  res.redirect('/clinics-schedules/01-create-schedule')
})

router.get(['/clinics-schedules/07-schedule-details', OLDER_VERSIONS_PREFIX + '07-schedule-details'], function (req, res) {
  const scheduleStartDateObj = (req.session.data && req.session.data.scheduleStartDate) || {}
  const scheduleEndDateObj = (req.session.data && req.session.data.scheduleEndDate) || {}

  const scheduleStartDateLabel = formatDateLabel(scheduleStartDateObj)
  const scheduleEndDateLabel = formatDateLabel(scheduleEndDateObj)

  const sessionName = (req.session.data && req.session.data.sessionName) || ''
  const newSession = (req.session.data && req.session.data.newSession) || {}
  const startTime = newSession.startTime || {}
  const endTime = newSession.endTime || {}

  const startHour = parseInt(startTime.hour, 10)
  const startMinute = parseInt(startTime.minute, 10)
  const endHour = parseInt(endTime.hour, 10)
  const endMinute = parseInt(endTime.minute, 10)
  const duration = parseInt(newSession.duration, 10)
  const totalSlots = parseInt(newSession.totalSlots, 10)

  const startTimeLabel = Number.isInteger(startHour) && Number.isInteger(startMinute)
    ? formatClock(startHour, startMinute)
    : '-'
  const endTimeLabel = Number.isInteger(endHour) && Number.isInteger(endMinute)
    ? formatClock(endHour, endMinute)
    : '-'

  const currentSession = {
    sessionName: sessionName || 'Unnamed session',
    startTime: startTimeLabel,
    endTime: endTimeLabel,
    slotLength: Number.isInteger(duration) ? duration : '-',
    totalSlots: Number.isInteger(totalSlots) ? totalSlots : '-'
  }

  const sessionKey = [
    currentSession.sessionName,
    currentSession.startTime,
    currentSession.endTime,
    currentSession.slotLength,
    currentSession.totalSlots
  ].join('|')

  const scheduleSessions = Array.isArray(req.session.data.scheduleSessions)
    ? req.session.data.scheduleSessions
    : []

  const hasMeaningfulSession = currentSession.startTime !== '-' || currentSession.endTime !== '-'
  if (hasMeaningfulSession && !scheduleSessions.some(session => session.sessionKey === sessionKey)) {
    scheduleSessions.push(Object.assign({ sessionKey }, currentSession))
  }

  req.session.data.scheduleSessions = scheduleSessions

  res.render(clinicsScheduleView(req, '07-schedule-details'), {
    scheduleStartDateLabel,
    scheduleEndDateLabel,
    scheduleSessions
  })
})

router.get(['/clinics-schedules/08-publish-clinic', OLDER_VERSIONS_PREFIX + '08-publish-clinic'], function (req, res) {
  const scheduleStartDateObj = (req.session.data && req.session.data.scheduleStartDate) || {}
  const scheduleEndDateObj = (req.session.data && req.session.data.scheduleEndDate) || {}

  const scheduleStartDateLabel = formatDateLabel(scheduleStartDateObj)
  const scheduleEndDateLabel = formatDateLabel(scheduleEndDateObj)

  const scheduleSessions = Array.isArray(req.session.data.scheduleSessions)
    ? req.session.data.scheduleSessions
    : []

  const sessionCount = scheduleSessions.length
  const currentSchedule = {
    scheduleStartDateLabel,
    scheduleEndDateLabel,
    sessionCount
  }

  const currentScheduleKey = [
    currentSchedule.scheduleStartDateLabel,
    currentSchedule.scheduleEndDateLabel
  ].join('|')

  const createdSchedules = Array.isArray(req.session.data.createdSchedules)
    ? req.session.data.createdSchedules
    : []

  const hasMeaningfulSchedule = scheduleStartDateLabel !== '-' || scheduleEndDateLabel !== '-'
  if (hasMeaningfulSchedule) {
    const existingIndex = createdSchedules.findIndex(schedule => schedule.scheduleKey === currentScheduleKey)

    if (existingIndex >= 0) {
      createdSchedules[existingIndex] = Object.assign({}, createdSchedules[existingIndex], currentSchedule)
    } else {
      createdSchedules.push(Object.assign({ scheduleKey: currentScheduleKey }, currentSchedule))
    }
  }

  req.session.data.createdSchedules = createdSchedules

  res.render(clinicsScheduleView(req, '08-publish-clinic'), {
    clinicName: (req.session.data && req.session.data.clinicName) || '-',
    clinicId: (req.session.data && req.session.data.clinicId) || 'HWO-NNN-standard-20260501',
    unit: (req.session.data && req.session.data.unit) || '-',
    location: (req.session.data && req.session.data.location) || '-',
    createdSchedules
  })
})

router.get(['/clinics-schedules/09-prototype-end', OLDER_VERSIONS_PREFIX + '09-prototype-end'], function (req, res) {
  res.render(clinicsScheduleView(req, '09-prototype-end'))
})

router.post('/sessions/02-organise-slots', function (req, res) {
  if (req.session.data.sessionCreationType === 'new session template') {
    res.redirect('/sessions/templating-03-name-and-description')
  } else {
    res.redirect('/sessions/03-prototype-end')
  }
})


// Isolated September Test (Mission 1) routes
router.use(require('./routes/mission-1'));

// Isolated create capacity from zero routes
router.use(require('./routes/create-capacity-from-zero'));

module.exports = router
