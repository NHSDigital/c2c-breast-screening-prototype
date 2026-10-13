// Formats a total minutes-from-midnight value as e.g. "10:08"
const formatClock = (totalMinutes) => {
  const hour = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// Builds the slot checkbox data for a session, flagging any slots marked as staff breaks
const buildSessionSlots = (sessionData) => {
  const startTime = sessionData.startTime || {}
  const endTime = sessionData.endTime || {}

  const startMinutes = (parseInt(startTime.hour, 10) || 0) * 60 + (parseInt(startTime.minute, 10) || 0)
  const endMinutes = (parseInt(endTime.hour, 10) || 0) * 60 + (parseInt(endTime.minute, 10) || 0)
  const duration = parseInt(sessionData.duration, 10) || 0
  const staffBreakSlots = (sessionData.staffBreakSlots || []).map(Number).filter(Number.isInteger)
  const heldSlots = sessionData.heldSlots || {}
  const specialAppointmentSlots = (sessionData.specialAppointmentSlots || []).map(Number).filter(Number.isInteger)
  const combinedSlots = sessionData.combinedSlots || []

  const slots = []

  if (duration > 0 && endMinutes > startMinutes) {
    const slotCount = Math.floor((endMinutes - startMinutes) / duration)

    // Combined slots are stored as inclusive { start, end } ranges of base slot indices and render as one slot keyed by `start`
    for (let i = 0; i < slotCount;) {
      const range = combinedSlots.find((r) => r.start === i && r.end < slotCount)
      const lastIndex = range ? range.end : i
      slots.push({
        index: i,
        startLabel: formatClock(startMinutes + (i * duration)),
        endLabel: formatClock(startMinutes + ((lastIndex + 1) * duration)),
        isCombined: Boolean(range),
        span: lastIndex - i + 1,
        isStaffBreak: staffBreakSlots.includes(i),
        isHold: Boolean(heldSlots[i]),
        holdReason: heldSlots[i],
        isSpecialAppointment: specialAppointmentSlots.includes(i)
      })
      i = lastIndex + 1
    }
  }

  // Counts are in base slots, so combining never changes them
  const sumSpans = (list) => list.reduce((total, slot) => total + slot.span, 0)
  const bookableSlotCount = sumSpans(slots.filter((slot) => !slot.isStaffBreak))
  const staffBreakSlotCount = sumSpans(slots.filter((slot) => slot.isStaffBreak))
  sessionData.bookableSlotCount = bookableSlotCount
  sessionData.staffBreakSlotCount = staffBreakSlotCount

  const slotTypeLabel = (slot) => {
    if (slot.isStaffBreak) return 'Staff break'
    if (slot.isHold) return `Held for ${slot.holdReason}`
    if (slot.isSpecialAppointment) return 'Special appointment'
    return 'Standard'
  }
  // Returns [{ label, count }] in first-seen order, counted in base slots
  const breakdown = (list) => list.reduce((items, slot) => {
    const label = slotTypeLabel(slot)
    const item = items.find((existing) => existing.label === label)
    if (item) {
      item.count += slot.span
    } else {
      items.push({ label, count: slot.span })
    }
    return items
  }, [])
  sessionData.bookableBreakdown = breakdown(slots.filter((slot) => !slot.isStaffBreak))
  sessionData.nonBookableBreakdown = breakdown(slots.filter((slot) => slot.isStaffBreak))

  return {
    slots,
    bookableSlotCount,
    staffBreakSlotCount,
    sessionStartLabel: formatClock(startMinutes),
    sessionEndLabel: formatClock(endMinutes)
  }
}

// Builds a POST handler that validates the selected slots, applies `update` to them, then returns to the slot structure view
const slotUpdateHandler = ({ dataKey, view, update }) => function (req, res) {
  if (typeof req.session.data[dataKey] !== 'object') {
    req.session.data[dataKey] = {}
  }
  const sessionData = req.session.data[dataKey]
  // nhsuk-frontend's checkboxes component submits an "_unchecked" sentinel for every untoggled box, so filter down to real indices
  const selectedSlots = [].concat(req.body.computedSlots || []).map(Number).filter(Number.isInteger)

  if (selectedSlots.length === 0) {
    const errors = { slots: 'Select at least one slot' }
    return res.render(view, Object.assign({ errors }, buildSessionSlots(sessionData)))
  }

  const tags = {
    staffBreakSlots: new Set((sessionData.staffBreakSlots || []).map(Number).filter(Number.isInteger)),
    heldSlots: Object.assign({}, sessionData.heldSlots),
    specialAppointmentSlots: new Set((sessionData.specialAppointmentSlots || []).map(Number).filter(Number.isInteger))
  }
  selectedSlots.forEach((index) => {
    clearTags(index, tags)
    update(index, tags)
  })
  sessionData.staffBreakSlots = Array.from(tags.staffBreakSlots)
  sessionData.heldSlots = tags.heldSlots
  sessionData.specialAppointmentSlots = Array.from(tags.specialAppointmentSlots)

  res.redirect('/' + view)
}

// A slot carries at most one tag, so every update starts by clearing existing ones
const clearTags = (index, tags) => {
  tags.staffBreakSlots.delete(index)
  delete tags.heldSlots[index]
  tags.specialAppointmentSlots.delete(index)
}

// 'mark' tags the selected slots as staff breaks; 'clear' removes all tags from them
const staffBreakHandler = ({ action, dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: (index, tags) => {
    if (action === 'mark') {
      tags.staffBreakSlots.add(index)
    }
  }
})

// Holds the selected slots for `reason`
const holdHandler = ({ reason, dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: (index, tags) => {
    tags.heldSlots[index] = reason
  }
})

const specialAppointmentHandler = ({ dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: (index, tags) => {
    tags.specialAppointmentSlots.add(index)
  }
})

const getSessionData = (req, dataKey) => {
  if (typeof req.session.data[dataKey] !== 'object') {
    req.session.data[dataKey] = {}
  }
  return req.session.data[dataKey]
}

// nhsuk-frontend's checkboxes component submits an "_unchecked" sentinel for every untoggled box, so filter down to real indices
const getSelectedSlots = (req) =>
  Array.from(new Set([].concat(req.body.computedSlots || []).map(Number).filter(Number.isInteger))).sort((a, b) => a - b)

const renderWithError = (res, view, sessionData, message) =>
  res.render(view, Object.assign({ errors: { slots: message } }, buildSessionSlots(sessionData)))

// Merges adjacent selected slots into one; the combined slot keeps the first selected slot's tag
const combineSlotsHandler = ({ dataKey, view }) => function (req, res) {
  const sessionData = getSessionData(req, dataKey)
  const selectedSlots = getSelectedSlots(req)

  if (selectedSlots.length < 2) {
    return renderWithError(res, view, sessionData, 'Select at least 2 adjacent slots to combine')
  }

  const displayedSlots = buildSessionSlots(sessionData).slots
  const positions = selectedSlots.map((index) => displayedSlots.findIndex((slot) => slot.index === index))
  const isAdjacent = positions.every((position, i) => position !== -1 && (i === 0 || position === positions[i - 1] + 1))

  if (!isAdjacent) {
    return renderWithError(res, view, sessionData, 'Slots to combine must be next to each other')
  }

  const existingRanges = sessionData.combinedSlots || []
  const start = selectedSlots[0]
  const lastSelected = selectedSlots[selectedSlots.length - 1]
  const lastRange = existingRanges.find((r) => r.start === lastSelected)
  const end = lastRange ? lastRange.end : lastSelected

  sessionData.combinedSlots = existingRanges
    .filter((r) => r.start < start || r.start > end)
    .concat({ start, end })
    .sort((a, b) => a.start - b.start)

  const isAbsorbed = (index) => index > start && index <= end
  sessionData.staffBreakSlots = (sessionData.staffBreakSlots || []).map(Number).filter((index) => !isAbsorbed(index))
  sessionData.specialAppointmentSlots = (sessionData.specialAppointmentSlots || []).map(Number).filter((index) => !isAbsorbed(index))
  sessionData.heldSlots = Object.fromEntries(Object.entries(sessionData.heldSlots || {}).filter(([index]) => !isAbsorbed(Number(index))))

  res.redirect('/' + view)
}

// Splits selected combined slots back into their original slots; any tag stays on the first slot
const divideSlotsHandler = ({ dataKey, view }) => function (req, res) {
  const sessionData = getSessionData(req, dataKey)
  const selectedSlots = getSelectedSlots(req)

  if (selectedSlots.length === 0) {
    return renderWithError(res, view, sessionData, 'Select at least one slot')
  }

  const existingRanges = sessionData.combinedSlots || []
  const remainingRanges = existingRanges.filter((r) => !selectedSlots.includes(r.start))

  if (remainingRanges.length === existingRanges.length) {
    return renderWithError(res, view, sessionData, 'Select at least one combined slot to divide')
  }

  sessionData.combinedSlots = remainingRanges

  res.redirect('/' + view)
}

module.exports = {
  formatClock,
  buildSessionSlots,
  staffBreakHandler,
  holdHandler,
  specialAppointmentHandler,
  combineSlotsHandler,
  divideSlotsHandler
}
