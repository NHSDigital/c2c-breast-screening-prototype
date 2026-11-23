const slotFilters = document.getElementById('slot-filters')
const slots = document.querySelectorAll('#slots-container [data-slot-type]')
const slotResultsCount = document.getElementById('slot-results-count')
const noMatchingSlots = document.getElementById('no-matching-slots')
const slotsContainer = document.getElementById('slots-container')
const newAppointment = document.getElementById('new-appointment')
const newAppointmentDate = document.getElementById('new-appointment-date')

function renderAppointmentDate(element, date, time) {
  const appointmentDate = new Date(`${date}T12:00:00`)
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(appointmentDate)
  const formattedDate = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .formatToParts(appointmentDate)
    .map(part => part.type === 'month' ? part.value.slice(0, 3) : part.value)
    .join('')
  element.replaceChildren(
    document.createTextNode(`${weekday}, ${formattedDate}`),
    document.createElement('br'),
    document.createTextNode(time)
  )
}

function updateNewAppointment() {
  const selectedSlot = slotsContainer.querySelector('input:checked')
  newAppointment.hidden = !selectedSlot
  if (selectedSlot) {
    const slot = selectedSlot.closest('[data-slot-type]')
    renderAppointmentDate(newAppointmentDate, slotsContainer.dataset.appointmentDate, `${slot.dataset.slotStart} to ${slot.dataset.slotEnd}`)
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
