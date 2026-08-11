// External dependencies
const express = require('express')

const router = express.Router()

//======= September test specific for now

router.get('/september-iteration-2/clickthru/04a-example-search-result', function (req, res) {
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

  res.render('september-iteration-2/clickthru/04a-example-search-result', {
    participants: searchResults,
    searchQuery: query
  })
})

router.get('/action/stage/:participantId', function (req, res) {
  const participants = (req.session.data.participants && req.session.data.participants.default) || []
  const participantIndex = participants.findIndex((participant) => participant.participantId === req.params.participantId)

  if (participantIndex !== -1) {
    participants[participantIndex].status = 'staged'
    req.session.data.stagedCount++
  }

  res.redirect(req.get('referer') || '/september-iteration-2/clickthru/04-choose-participants')
});

router.get('/action/unstage/:participantId', function (req, res) {
  const participants = (req.session.data.participants && req.session.data.participants.default) || []
  const participantIndex = participants.findIndex((participant) => participant.participantId === req.params.participantId)

  if (participantIndex !== -1) {
    participants[participantIndex].status = 'unstaged'
    req.session.data.stagedCount--
  }

  res.redirect(req.get('referer') || '/september-iteration-2/clickthru/04-choose-participants')
});

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

router.post('/sessions/02-organise-slots', function (req, res) {
  if (req.session.data.sessionCreationType === 'new session template') {
    res.redirect('/sessions/templating-03-name-and-description')
  } else {
    res.redirect('/sessions/03-prototype-end')
  }
})

module.exports = router
