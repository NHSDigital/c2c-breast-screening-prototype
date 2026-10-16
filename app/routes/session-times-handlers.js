const isWholeNumber = str => /^\d+$/.test(str)

// Validates the `newSession` body shared by the session times forms
const validateSessionTimes = (newSession = {}) => {
  const startTime = newSession.startTime || {}
  const endTime = newSession.endTime || {}

  const startHourStr = (startTime.hour || '').trim()
  const startMinuteStr = (startTime.minute || '').trim()
  const endHourStr = (endTime.hour || '').trim()
  const endMinuteStr = (endTime.minute || '').trim()
  const durationStr = (newSession.duration || '').trim()

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

  if (!isWholeNumber(durationStr) || duration <= 0) {
    errors.duration = 'Slot length must be entered, in minutes'
  }

  if (!errors.startTime && !errors.endTime) {
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    if (endTotalMinutes <= startTotalMinutes) {
      errors.startTime = 'Start time must be earlier than end time'
      errors.endTime = 'End time must be later than start time'
    }
  }

  return { startTime, endTime, duration: durationStr, errors }
}

module.exports = { validateSessionTimes }
