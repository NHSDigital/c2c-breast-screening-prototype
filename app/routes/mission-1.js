const express = require('express')
const router = express.Router()
const { validateSessionTimes } = require('./session-times-handlers')
const { buildSessionSlots, nonBookableHandler, clearTagsHandler } = require('./slot-structure-handlers')

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
router.get('/mission-1/current-iteration/04a-example-search-result', function (req, res) {
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

  res.render('mission-1/current-iteration/04a-example-search-result', {
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

  res.redirect(req.get('referer') || '/mission-1/current-iteration/04-choose-participants')
});
router.get('/action/unstage/:participantId', function (req, res) {
  const participants = (req.session.data.participants && req.session.data.participants.default) || []
  const participantIndex = participants.findIndex((participant) => participant.participantId === req.params.participantId)

  if (participantIndex !== -1) {
    participants[participantIndex].status = 'unstaged'
    req.session.data.stagedCount--
  }

  res.redirect(req.get('referer') || '/mission-1/current-iteration/04-choose-participants')
});

// Allowlist of pages the create clinic flow can return to, keyed by the returnTo query value
const createClinicReturnPaths = {
  'clinics': '/mission-1/current-iteration/00-clinics',
  'select-clinic': '/mission-1/current-iteration/03-select-clinic'
}

// recording where the 1 day clinic creation flow was started from
router.get('/mission-1/current-iteration/create-clinic-rev-1-name', function (req, res) {
  const returnTo = req.query.returnTo

  if (Object.prototype.hasOwnProperty.call(createClinicReturnPaths, returnTo)) {
    if (!req.session.data.missionOne || typeof req.session.data.missionOne !== 'object') {
      req.session.data.missionOne = {}
    }
    req.session.data.missionOne.returnTo = returnTo
  }

  res.render('mission-1/current-iteration/create-clinic-rev-1-name')
})

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
  const { startTime, endTime, duration, errors } = validateSessionTimes(req.body.newSession)

  if (typeof req.session.data.missionOne !== 'object') {
    req.session.data.missionOne = {}
  }
  req.session.data.missionOne.startTime = startTime
  req.session.data.missionOne.endTime = endTime
  req.session.data.missionOne.duration = duration

  if (Object.keys(errors).length > 0) {
    return res.render('mission-1/current-iteration/create-clinic-rev-1-set-timings', {
      errors
    })
  }

  res.redirect('/mission-1/current-iteration/create-clinic-rev-1-slot-structure')
})

// computing the real slot structure from the submitted session times for 1 day clinic creation
router.get('/mission-1/current-iteration/create-clinic-rev-1-slot-structure', function (req, res) {
  const missionOne = req.session.data.missionOne || {}

  res.render('mission-1/current-iteration/create-clinic-rev-1-slot-structure', buildSessionSlots(missionOne))
})

const missionOneSlotStructure = { dataKey: 'missionOne', view: 'mission-1/current-iteration/create-clinic-rev-1-slot-structure' }
router.post('/mission-1/current-iteration/mark-staff-break', nonBookableHandler({ reason: 'staff break', ...missionOneSlotStructure }))
router.post('/mission-1/current-iteration/clear-slot-type', clearTagsHandler(missionOneSlotStructure))

// refreshing slot counts before the check and confirm step for 1 day clinic creation
router.post('/mission-1/current-iteration/create-clinic-rev-1-publish-check', function (req, res) {
  const missionOne = req.session.data.missionOne || {}
  buildSessionSlots(missionOne)
  req.session.data.missionOne = missionOne

  res.render('mission-1/current-iteration/create-clinic-rev-1-publish-check')
})

// saving the clinic and returning to where the 1 day clinic creation flow was started from
router.post('/mission-1/current-iteration/create-clinic-rev-1-save', function (req, res) {
  const missionOne = req.session.data.missionOne || {}
  missionOne.saved = true
  req.session.data.missionOne = missionOne

  const returnPath = createClinicReturnPaths[missionOne.returnTo] || createClinicReturnPaths['select-clinic']
  res.redirect(returnPath)
})

module.exports = router