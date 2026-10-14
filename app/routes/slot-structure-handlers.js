// Formats a total minutes-from-midnight value as e.g. "10:08"
const formatClock = (totalMinutes) => {
  const hour = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// Reason-tagged slots are stored as { [index]: reason }, with `true` for no reason; ignores data saved in older shapes
const asTagMap = (value) => (value && typeof value === 'object' && !Array.isArray(value)) ? value : {}

const tagReason = (value) => typeof value === 'string' ? value : null

// Builds the slot checkbox data for a session, flagging each slot's tag
const buildSessionSlots = (sessionData) => {
  const startTime = sessionData.startTime || {}
  const endTime = sessionData.endTime || {}

  const startMinutes = (parseInt(startTime.hour, 10) || 0) * 60 + (parseInt(startTime.minute, 10) || 0)
  const endMinutes = (parseInt(endTime.hour, 10) || 0) * 60 + (parseInt(endTime.minute, 10) || 0)
  const duration = parseInt(sessionData.duration, 10) || 0
  const heldSlots = asTagMap(sessionData.heldSlots)
  const nonBookableSlots = asTagMap(sessionData.nonBookableSlots)
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
        isNonBookable: Boolean(nonBookableSlots[i]),
        nonBookableReason: tagReason(nonBookableSlots[i]),
        isHold: Boolean(heldSlots[i]),
        holdReason: tagReason(heldSlots[i]),
        isSpecialAppointment: specialAppointmentSlots.includes(i)
      })
      i = lastIndex + 1
    }
  }

  // Counts are in base slots, so combining never changes them
  const sumSpans = (list) => list.reduce((total, slot) => total + slot.span, 0)
  const bookableSlotCount = sumSpans(slots.filter((slot) => !slot.isNonBookable))
  const nonBookableSlotCount = sumSpans(slots.filter((slot) => slot.isNonBookable))
  sessionData.bookableSlotCount = bookableSlotCount
  sessionData.nonBookableSlotCount = nonBookableSlotCount

  const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1)
  const slotTypeLabel = (slot) => {
    if (slot.isNonBookable) return slot.nonBookableReason ? capitalise(slot.nonBookableReason) : 'Non-bookable'
    if (slot.isHold) return slot.holdReason ? `Held for ${slot.holdReason}` : 'Held'
    if (slot.isSpecialAppointment) return 'Special appointment'
    return 'Standard'
  }
  const breakdown = (list, order) => list.reduce((items, slot) => {
    const label = slotTypeLabel(slot)
    const item = items.find((existing) => existing.label === label)
    if (item) {
      item.count += slot.span
    } else {
      items.push({ label, count: slot.span })
    }
    return items
  }, []).sort((first, second) => {
    const firstIndex = order.indexOf(first.label)
    const secondIndex = order.indexOf(second.label)
    return (firstIndex === -1 ? order.length : firstIndex) - (secondIndex === -1 ? order.length : secondIndex)
  })
  sessionData.bookableBreakdown = breakdown(slots.filter((slot) => !slot.isNonBookable), [
    'Held for rebooking', 'Held for web rebooking', 'Held for technical recall',
    'Special appointment', 'Held', 'Standard'
  ])
  sessionData.nonBookableBreakdown = breakdown(slots.filter((slot) => slot.isNonBookable), [
    'Staff break', 'Non-bookable'
  ])

  return {
    slots,
    bookableSlotCount,
    nonBookableSlotCount,
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
    heldSlots: Object.assign({}, asTagMap(sessionData.heldSlots)),
    nonBookableSlots: Object.assign({}, asTagMap(sessionData.nonBookableSlots)),
    specialAppointmentSlots: new Set((sessionData.specialAppointmentSlots || []).map(Number).filter(Number.isInteger))
  }
  selectedSlots.forEach((index) => {
    clearTags(index, tags)
    update(index, tags)
  })
  sessionData.heldSlots = tags.heldSlots
  sessionData.nonBookableSlots = tags.nonBookableSlots
  sessionData.specialAppointmentSlots = Array.from(tags.specialAppointmentSlots)

  res.redirect('/' + view)
}

// A slot carries at most one tag, so every update starts by clearing existing ones
const clearTags = (index, tags) => {
  delete tags.heldSlots[index]
  delete tags.nonBookableSlots[index]
  tags.specialAppointmentSlots.delete(index)
}

// Removes all tags from the selected slots
const clearTagsHandler = ({ dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: () => {}
})

// Makes the selected slots non-bookable for `reason`
const nonBookableHandler = ({ reason, dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: (index, tags) => {
    tags.nonBookableSlots[index] = reason || true
  }
})

// Holds the selected slots for `reason`
const holdHandler = ({ reason, dataKey, view }) => slotUpdateHandler({
  dataKey,
  view,
  update: (index, tags) => {
    // Holds without a reason are stored as `true`
    tags.heldSlots[index] = reason || true
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
  const withoutAbsorbed = (tagMap) => Object.fromEntries(Object.entries(asTagMap(tagMap)).filter(([index]) => !isAbsorbed(Number(index))))
  sessionData.specialAppointmentSlots = (sessionData.specialAppointmentSlots || []).map(Number).filter((index) => !isAbsorbed(index))
  sessionData.heldSlots = withoutAbsorbed(sessionData.heldSlots)
  sessionData.nonBookableSlots = withoutAbsorbed(sessionData.nonBookableSlots)

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
  clearTagsHandler,
  nonBookableHandler,
  holdHandler,
  specialAppointmentHandler,
  combineSlotsHandler,
  divideSlotsHandler
}
