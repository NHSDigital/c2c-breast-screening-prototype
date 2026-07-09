// External dependencies
const express = require('express')

const router = express.Router()

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

module.exports = router
