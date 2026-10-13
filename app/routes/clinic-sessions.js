const express = require('express')
const router = express.Router()
const { validateSessionTimes } = require('./session-times-handlers')
const { buildSessionSlots } = require('./slot-structure-handlers')
/*

/app/views/sessions/

*/

router.post('/sessions/01-template-name', function (req, res) {
  const sessionTemplateName = (req.body.sessionTemplateName || '').trim()
  const sessionTemplateNote = (req.body.sessionTemplateNote || '').trim()

  if (!req.session.data.createSessionTemplate) {
    req.session.data.createSessionTemplate = {}
  }

  req.session.data.createSessionTemplate.sessionTemplateName = sessionTemplateName
  req.session.data.createSessionTemplate.sessionTemplateNote = sessionTemplateNote

  const errors = {}

  if (!sessionTemplateName) {
    errors.sessionTemplateName = 'Template must be given a name'
  }

  if (Object.keys(errors).length > 0) {
    return res.render('sessions/01-template-name', {
      errors
    })
  }

  res.redirect('/sessions/02-session-times')
})

router.post('/sessions/02-session-times', function (req, res) {
  const { startTime, endTime, duration, errors } = validateSessionTimes(req.body.newSession)

  if (!req.session.data.createSessionTemplate) {
    req.session.data.createSessionTemplate = {}
  }

  req.session.data.createSessionTemplate.startTime = startTime
  req.session.data.createSessionTemplate.endTime = endTime
  req.session.data.createSessionTemplate.duration = duration

  if (Object.keys(errors).length > 0) {
    return res.render('sessions/02-session-times', {
      errors
    })
  }

  res.redirect('/sessions/03-slot-structure')
})

router.get('/sessions/03-slot-structure', function (req, res) {
  if (!req.session.data.createSessionTemplate) {
    req.session.data.createSessionTemplate = {}
  }

  res.render('sessions/03-slot-structure', buildSessionSlots(req.session.data.createSessionTemplate))
})

module.exports = router