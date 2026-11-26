import { initRebookingCalendar } from './rebooking-date-calendar.js'

const slotFilters = document.getElementById('slot-filters')
const slots = document.querySelectorAll('#slots-container [data-slot-type]')
const slotResultsCount = document.getElementById('slot-results-count')
const noMatchingSlots = document.getElementById('no-matching-slots')
const slotsContainer = document.getElementById('slots-container')
const newAppointment = document.getElementById('new-appointment')
const newAppointmentDate = document.getElementById('new-appointment-date')

function formatAppointmentTime(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d) to ([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  if (!match) {
    console.error('Invalid appointment time:', time)
    return time
  }

  const start = Number(match[1]) * 60 + Number(match[2])
  const end = Number(match[3]) * 60 + Number(match[4])
  const duration = (end - start + 24 * 60) % (24 * 60)
  if (duration === 0) {
    console.error('Invalid appointment duration:', time)
    return time
  }

  return `${match[1]}:${match[2]} (${duration} ${duration === 1 ? 'minute' : 'minutes'})`
}

function renderAppointmentDate(element, date, time, inline = false) {
  const appointmentDate = new Date(`${date}T12:00:00`)
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(appointmentDate)
  const formattedDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .formatToParts(appointmentDate)
    .map(part => part.type === 'month' ? part.value.slice(0, 3) : part.value)
    .join('')
  element.replaceChildren(
    document.createTextNode(`${weekday} ${formattedDate}`),
    inline ? document.createTextNode(', ') : document.createElement('br'),
    document.createTextNode(time)
  )
}

function updateNewAppointment() {
  const selectedSlot = slotsContainer.querySelector('input:checked')
  newAppointment.hidden = !selectedSlot
  if (selectedSlot) {
    const slot = selectedSlot.closest('[data-slot-type]')
    const time = `${slot.dataset.slotStart} to ${slot.dataset.slotEnd}`
    renderAppointmentDate(newAppointmentDate, slotsContainer.dataset.appointmentDate, formatAppointmentTime(time))
  } else {
    newAppointmentDate.replaceChildren()
  }
}

function filterSlots() {
  const selectedTypes = Array.from(slotFilters.querySelectorAll('input[name="slotType"]:checked'), input => input.value)
  const selectedAvailability = Array.from(slotFilters.querySelectorAll('input[name="slotAvailability"]:checked'), input => input.value)
  const selectedHold = Array.from(slotFilters.querySelectorAll('input[name="slotHold"]:checked'), input => input.value)
  let visibleCount = 0

  slots.forEach(slot => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(slot.dataset.slotType)
    const matchesAvailability = selectedAvailability.length === 0 || selectedAvailability.includes(slot.dataset.slotAvailability)
    const matchesHold = selectedHold.length === 0 || selectedHold.includes(slot.dataset.slotHold)
    slot.hidden = !(matchesType && matchesAvailability && matchesHold)

    if (slot.hidden) {
      slot.querySelector('input').checked = false
    } else {
      visibleCount++
    }
  })

  slotResultsCount.textContent = `${visibleCount} matching slot${visibleCount === 1 ? '' : 's'}`
  noMatchingSlots.hidden = visibleCount > 0
  updateNewAppointment()
}

slotsContainer.addEventListener('change', event => {
  if (event.target.matches('input[name="computedSlots[]"]')) {
    if (event.target.checked) {
      slots.forEach(slot => {
        const input = slot.querySelector('input')
        if (input !== event.target) input.checked = false
      })
    }
    updateNewAppointment()
  }
})

slotFilters.addEventListener('change', filterSlots)
filterSlots()

document.addEventListener('DOMContentLoaded', function () {
  const participantName = sessionStorage.getItem('rebookParticipantName')
  if (participantName) {
    document.querySelectorAll('#participant-name').forEach(el => {
      el.textContent = participantName
    })
    sessionStorage.removeItem('rebookParticipantName')
  }
  const isSpecialAppointment = sessionStorage.getItem('rebookParticipantSlotType') === 'special'
  sessionStorage.removeItem('rebookParticipantSlotType')
  document.getElementById('participant-special-appointment').hidden = !isSpecialAppointment
  const currentAppointmentDate = sessionStorage.getItem('rebookParticipantAppointmentDate')
  const currentAppointmentTime = sessionStorage.getItem('rebookParticipantAppointmentTime')
  if (currentAppointmentDate && currentAppointmentTime) {
    renderAppointmentDate(document.getElementById('current-appointment-date'), currentAppointmentDate, formatAppointmentTime(currentAppointmentTime), true)
  }
  const dateCalendar = document.getElementById('change-date-calendar')
  if (dateCalendar) {
    dateCalendar.dataset.selectedDate = currentAppointmentDate || slotsContainer.dataset.appointmentDate
    initRebookingCalendar(dateCalendar, slotsContainer, updateNewAppointment)
  }
  sessionStorage.removeItem('rebookParticipantAppointmentDate')
  sessionStorage.removeItem('rebookParticipantAppointmentTime')
  if (isSpecialAppointment) {
    document.getElementById('standard-appt').checked = false
    document.getElementById('special-appt').checked = true
    document.getElementById('available-appt').checked = true
    document.getElementById('unavailable-appt').checked = false
    slotFilters.dispatchEvent(new Event('change'))
  }
})
