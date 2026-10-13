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

  const slots = []

  if (duration > 0 && endMinutes > startMinutes) {
    const slotCount = Math.floor((endMinutes - startMinutes) / duration)

    for (let i = 0; i < slotCount; i++) {
      const slotStartMinutes = startMinutes + (i * duration)
      slots.push({
        index: i,
        startLabel: formatClock(slotStartMinutes),
        endLabel: formatClock(slotStartMinutes + duration),
        isStaffBreak: staffBreakSlots.includes(i)
      })
    }
  }

  const bookableSlotCount = slots.filter((slot) => !slot.isStaffBreak).length
  const staffBreakSlotCount = slots.filter((slot) => slot.isStaffBreak).length
  sessionData.bookableSlotCount = bookableSlotCount
  sessionData.staffBreakSlotCount = staffBreakSlotCount

  return {
    slots,
    bookableSlotCount,
    staffBreakSlotCount,
    sessionStartLabel: formatClock(startMinutes),
    sessionEndLabel: formatClock(endMinutes)
  }
}

module.exports = { formatClock, buildSessionSlots }
