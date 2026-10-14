const express = require('express')
const router = express.Router()
const { validateSessionTimes } = require('./session-times-handlers')
const {
  buildSessionSlots,
  clearTagsHandler,
  nonBookableHandler,
  holdHandler,
  specialAppointmentHandler,
  combineSlotsHandler,
  divideSlotsHandler
} = require('./slot-structure-handlers')
const { saveSessionMapImage, sessionMapImageExists } = require('../lib/session-map-svg')
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

router.post('/sessions/03-slot-structure', function (req, res) {
  if (!req.session.data.createSessionTemplate) {
    req.session.data.createSessionTemplate = {}
  }

  // Refreshes the stored slot counts for the check page
  buildSessionSlots(req.session.data.createSessionTemplate)

  res.redirect('/sessions/04-check-template')
})

router.post('/sessions/save-template', function (req, res) {
  const template = req.session.data.createSessionTemplate || {}
  const sessionSlots = buildSessionSlots(template)
  const { bookableSlotCount, nonBookableSlotCount, sessionStartLabel, sessionEndLabel } = sessionSlots
  const standard = (template.bookableBreakdown || []).find((item) => item.label === 'Standard')
  const openSlotCount = standard ? standard.count : 0

  if (!Array.isArray(req.session.data.sessionTemplates)) {
    req.session.data.sessionTemplates = []
  }

  req.session.data.sessionTemplates.push({
    name: template.sessionTemplateName,
    note: template.sessionTemplateNote,
    sessionStartLabel,
    sessionEndLabel,
    duration: template.duration,
    totalSlotCount: bookableSlotCount + nonBookableSlotCount,
    openSlotCount,
    heldSlotCount: bookableSlotCount - openSlotCount,
    unavailableSlotCount: nonBookableSlotCount,
    ...saveSessionMapImage(sessionSlots)
  })

  req.session.data.createSessionTemplate = {}
  req.session.data.sessionTemplateCreated = true

  res.redirect('/sessions/00-template-listing')
})

// Shows the success banner once, straight after a template is saved
router.get('/sessions/00-template-listing', function (req, res) {
  const templateCreated = Boolean(req.session.data.sessionTemplateCreated)
  delete req.session.data.sessionTemplateCreated

  // Images can be pruned or lost on restart while a template still references them
  const templates = req.session.data.sessionTemplates || []
  templates.forEach((template) => {
    if (template.imagePath && !sessionMapImageExists(template.imagePath)) {
      delete template.imagePath
      delete template.imageAlt
    }
  })

  res.render('sessions/00-template-listing', { templateCreated })
})

const sessionsSlotStructure = { dataKey: 'createSessionTemplate', view: 'sessions/03-slot-structure' }
router.post('/sessions/mark-staff-break', nonBookableHandler({ reason: 'staff break', ...sessionsSlotStructure }))
router.post('/sessions/clear-slot-type', clearTagsHandler(sessionsSlotStructure))
router.post('/sessions/mark-hold-rebooking', holdHandler({ reason: 'rebooking', ...sessionsSlotStructure }))
router.post('/sessions/mark-hold-web-rebooking', holdHandler({ reason: 'web rebooking', ...sessionsSlotStructure }))
router.post('/sessions/mark-hold-technical-recall', holdHandler({ reason: 'technical recall', ...sessionsSlotStructure }))
router.post('/sessions/mark-hold-generic', holdHandler(sessionsSlotStructure))
router.post('/sessions/mark-special-appointment', specialAppointmentHandler(sessionsSlotStructure))
router.post('/sessions/mark-non-bookable-generic', nonBookableHandler(sessionsSlotStructure))
router.post('/sessions/combine-slots', combineSlotsHandler(sessionsSlotStructure))
router.post('/sessions/divide-slots', divideSlotsHandler(sessionsSlotStructure))

module.exports = router