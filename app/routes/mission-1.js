const express = require('express')
const router = express.Router()

// Routes and functions specific to Mission 1 prototypes
/*

/appviews/september-iteration-2/

*/

// simple search
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

// adding and removing participants from the "group"
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

// creating and passing Total Slots through for 1 day clinic creation
router.post('/september-iteration-2/create-clinic-rev-1-publish-check', function (req, res) {
  const newSession = req.session.data.newSession || {}
  const startTime = newSession.startTime || {}
  const endTime = newSession.endTime || {}

  const startMinutes = (parseInt(startTime.hour, 10) || 0) * 60 + (parseInt(startTime.minute, 10) || 0)
  const endMinutes = (parseInt(endTime.hour, 10) || 0) * 60 + (parseInt(endTime.minute, 10) || 0)
  const duration = parseInt(newSession.duration, 10) || 0

  newSession.totalSlots = duration > 0 ? Math.floor((endMinutes - startMinutes) / duration) : 0

  res.render('september-iteration-2/create-clinic-rev-1-publish-check')
})

module.exports = router