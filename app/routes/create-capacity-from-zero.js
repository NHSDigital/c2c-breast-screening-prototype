const express = require('express')
const router = express.Router()

// Routes and functions specific to Create Capacity From Zero
/*

/app/views/create-capacity-from-zero/

*/

const isWholeNumber = str => /^\d+$/.test(str)

// Parses a { day, month, year } object into a Date, or null if invalid
const parseDateFields = (dateObj) => {
  if (!dateObj || !isWholeNumber(dateObj.day) || !isWholeNumber(dateObj.month) || !isWholeNumber(dateObj.year)) {
    return null
  }

  const day = parseInt(dateObj.day, 10)
  const month = parseInt(dateObj.month, 10)
  const year = parseInt(dateObj.year, 10)
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

// Builds a { year, month, monthName, days } calendar, days is Mon-Sun padded with nulls
const generateCalendarMonth = (year, month) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  const weekStartOffset = (startingDayOfWeek === 0) ? 6 : startingDayOfWeek - 1

  const days = []

  for (let i = 0; i < weekStartOffset; i++) {
    days.push(null)
  }

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

const findScheduleStartingOn = (date, schedules) =>
  schedules.find(schedule => date.getTime() === schedule.startDate.getTime())

const findScheduleEndingOn = (date, schedules) =>
  schedules.find(schedule => date.getTime() === schedule.endDate.getTime())

// Generates one calendar per month spanning all schedules, including any gap dates between them
const generateScheduleCalendars = (schedules) => {
  if (!schedules.length) {
    return []
  }

  const overallStart = new Date(Math.min(...schedules.map(schedule => schedule.startDate)))
  const overallEnd = new Date(Math.max(...schedules.map(schedule => schedule.endDate)))

  const calendars = []
  let currentYear = overallStart.getFullYear()
  let currentMonth = overallStart.getMonth() + 1
  const endYear = overallEnd.getFullYear()
  const endMonth = overallEnd.getMonth() + 1

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const calendar = generateCalendarMonth(currentYear, currentMonth)

    calendar.days = calendar.days.map(day => {
      if (!day || day.fullDate < overallStart || day.fullDate > overallEnd) {
        return null
      }

      const startingSchedule = findScheduleStartingOn(day.fullDate, schedules)
      const endingSchedule = findScheduleEndingOn(day.fullDate, schedules)

      return Object.assign({}, day, {
        scheduleName: startingSchedule ? startingSchedule.scheduleName : null,
        isScheduleStart: Boolean(startingSchedule),
        isScheduleEnd: Boolean(endingSchedule)
      })
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

    if (weeks.length > 0) {
      calendars.push(calendar)
    }

    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return calendars
}

router.get('/create-capacity-from-zero/clinic-summary', function (req, res) {
  const schedules = (req.session.data.createCapacityFromZero.schedules || [])
    .map(schedule => ({
      scheduleName: schedule.scheduleName,
      startDate: parseDateFields(schedule.scheduleStartDate),
      endDate: parseDateFields(schedule.scheduleEndDate)
    }))
    .filter(schedule => schedule.startDate && schedule.endDate)

  res.render('create-capacity-from-zero/clinic-summary', {
    calendars: generateScheduleCalendars(schedules)
  })
})

router.post('/create-capacity-from-zero/create-clinic', function (req, res) {
  const clinicName = (req.body.clinicName || '').trim()
  const unit = req.body.unit || ''
  const location = req.body.location || ''

  req.session.data.createCapacityFromZero['clinicName'] = clinicName
  req.session.data.createCapacityFromZero['unit'] = unit
  req.session.data.createCapacityFromZero['location'] = location

  const errors = {}

  if (!clinicName) {
    errors.clinicName = 'Clinic must be given a name'
  }

  if (!unit) {
    errors.unit = 'A unit must be chosen'
  }

  if (!location) {
    errors.location = 'A location must be chosen'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('create-capacity-from-zero/create-clinic', {
      errors
    })
  }

  res.redirect('/create-capacity-from-zero/clinic-summary')
})


router.post('/create-capacity-from-zero/create-schedule', function (req, res) {
  const scheduleName = (req.body.scheduleName || '').trim()
  const scheduleStartDate = req.body.scheduleStartDate || {}
  const scheduleEndDate = req.body.scheduleEndDate || {}

  req.session.data.createCapacityFromZero['scheduleName'] = scheduleName
  req.session.data.createCapacityFromZero['scheduleStartDate'] = scheduleStartDate
  req.session.data.createCapacityFromZero['scheduleEndDate'] = scheduleEndDate

  const errors = {}

  if (!scheduleName) {
    errors.scheduleName = 'Schedule must be given a name'
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = parseDateFields(scheduleStartDate)
  if (!startDate) {
    errors.scheduleStartDate = 'Schedule start date must be given a day, month, and year'
  } else if (startDate <= today) {
    errors.scheduleStartDate = 'Schedule start date must be in the future'
  }

  const endDate = parseDateFields(scheduleEndDate)
  if (!endDate) {
    errors.scheduleEndDate = 'Schedule end date must be given a day, month, and year'
  } else if (endDate <= today) {
    errors.scheduleEndDate = 'Schedule end date must be in the future'
  } else if (startDate && endDate < startDate) {
    errors.scheduleEndDate = 'Schedule end date must be the same as or after the schedule start date'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('create-capacity-from-zero/create-schedule', {
      errors
    })
  }

  if (!Array.isArray(req.session.data.createCapacityFromZero.schedules)) {
    req.session.data.createCapacityFromZero.schedules = []
  }

  req.session.data.createCapacityFromZero.schedules.push({
    scheduleName,
    scheduleStartDate,
    scheduleEndDate
  })

  // Clear the draft fields now this schedule has been saved, ready for the next one
  req.session.data.createCapacityFromZero.scheduleName = ''
  req.session.data.createCapacityFromZero.scheduleStartDate = {}
  req.session.data.createCapacityFromZero.scheduleEndDate = {}

  res.redirect('/create-capacity-from-zero/clinic-summary')
})


module.exports = router