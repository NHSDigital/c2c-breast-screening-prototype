function renderRebookingCalendar(selectedDate) {
  const date = new Date(`${selectedDate}T12:00:00`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) || Number.isNaN(date.getTime()) ||
      date.getFullYear() !== Number(selectedDate.slice(0, 4)) ||
      date.getMonth() + 1 !== Number(selectedDate.slice(5, 7)) ||
      date.getDate() !== Number(selectedDate.slice(8, 10))) {
    throw new Error(`Invalid rebooking calendar date: ${selectedDate}`)
  }

  const calendar = document.getElementById('change-date-calendar')
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1, 12)
  const offset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0, 12).getDate()
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const availabilityOptions = [
    { value: 'good', label: 'Good availability', colour: 'green' },
    { value: 'low', label: 'Low availability', colour: 'orange' },
    { value: 'none', label: 'No availability', colour: 'red' }
  ]

  calendar.querySelector('caption').textContent = new Intl.DateTimeFormat('en-GB', {
    month: 'long', year: 'numeric'
  }).format(date)
  document.getElementById('slot-search-date').textContent = dateFormatter.format(date)

  const body = calendar.querySelector('tbody')
  body.replaceChildren()
  for (let index = 0; index < Math.ceil((offset + daysInMonth) / 7) * 7; index++) {
    if (index % 7 === 0) {
      const row = document.createElement('tr')
      row.className = 'nhsuk-table__row'
      body.append(row)
    }

    const cell = document.createElement('td')
    cell.className = 'nhsuk-table__cell'
    body.lastElementChild.append(cell)
    const day = index - offset + 1
    if (day < 1 || day > daysInMonth) {
      cell.classList.add('calendar-table-no-data')
      continue
    }

    cell.dataset.date = `${selectedDate.slice(0, 7)}-${String(day).padStart(2, '0')}`
    const header = document.createElement('div')
    header.className = 'calendar-table-td-header'
    const number = document.createElement('span')
    number.className = 'calendar-table-date'
    number.textContent = day
    const label = document.createElement('span')
    label.className = 'nhsuk-u-visually-hidden'
    const calendarDate = new Date(year, month, day, 12)
    const weekday = calendarDate.getDay()
    const isWeekend = weekday === 0 || weekday === 6
    const availability = isWeekend || weekday === 3
      ? availabilityOptions[2]
      : availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)]
    cell.dataset.availability = availability.value
    label.textContent = dateFormatter.format(calendarDate)
    number.setAttribute('aria-hidden', 'true')

    if (day < date.getDate()) {
      cell.classList.add('calendar-table-cell--past')
      label.append(', unavailable')
    }
    if (isWeekend) {
      cell.classList.add('calendar-table-cell--weekend')
      label.append(', weekend')
    }
    if (day < date.getDate() || isWeekend || availability.value === 'none') {
      cell.setAttribute('aria-disabled', 'true')
    }
    if (day === date.getDate()) {
      cell.classList.add('calendar-table-cell--current')
      cell.setAttribute('aria-current', 'true')
    }

    header.append(number, label)
    cell.append(header)
    if (!isWeekend) {
      const tag = document.createElement('strong')
      tag.className = `nhsuk-tag nhsuk-tag--${availability.colour}`
      tag.textContent = availability.label
      cell.append(tag)
    }
    if (!cell.hasAttribute('aria-disabled')) {
      const link = document.createElement('a')
      link.className = 'nhsuk-link app-rebooking-calendar-date-link'
      link.href = '#slot-search-date'
      link.dataset.calendarDate = cell.dataset.date
      link.append(...cell.childNodes)
      cell.append(link)
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const calendar = document.getElementById('change-date-calendar')
  renderRebookingCalendar(calendar.dataset.selectedDate)

  calendar.addEventListener('click', event => {
    const link = event.target.closest('a[data-calendar-date]')
    if (!link) return
    event.preventDefault()

    const selectedDate = link.dataset.calendarDate
    const previousDate = calendar.querySelector('.calendar-table-cell--current')
    previousDate.classList.remove('calendar-table-cell--current')
    previousDate.removeAttribute('aria-current')
    const cell = link.closest('td')
    cell.classList.add('calendar-table-cell--current')
    cell.setAttribute('aria-current', 'true')
    calendar.dataset.selectedDate = selectedDate

    document.getElementById('slot-search-date').textContent = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(`${selectedDate}T12:00:00`))
    slotsContainer.dataset.appointmentDate = selectedDate
    updateNewAppointment()
    document.getElementById('change-date-dialog').hidePopover()
    document.querySelector('#slot-filters [popovertarget="change-date-dialog"]').focus()
  })
})
