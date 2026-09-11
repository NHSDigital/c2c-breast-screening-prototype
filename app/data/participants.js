const firstNames = [
  'Amelia', 'Aisha', 'Alice', 'Angela', 'Anita', 'Charlotte', 'Claire',
  'Diane', 'Elizabeth', 'Emma', 'Fiona', 'Grace', 'Hannah', 'Helen',
  'Imogen', 'Janet', 'Joanne', 'Julia', 'Karen', 'Laura', 'Linda',
  'Louise', 'Maria', 'Megan', 'Michelle', 'Natalie', 'Nicola', 'Olivia',
  'Patricia', 'Rachel', 'Rebecca', 'Ruth', 'Sarah', 'Sharon', 'Sophie',
  'Susan', 'Teresa', 'Tracey', 'Victoria', 'Wendy', 'Yasmin'
]

const middleNames = [
  'Anne', 'Beatrice', 'Catherine', 'Dawn', 'Elaine', 'Jane', 'Jean',
  'Louise', 'Marie', 'May', 'Rose', 'Victoria'
]

const surnames = [
  'Adams', 'Baker', 'Bennett', 'Bishop', 'Brown', 'Campbell', 'Carter',
  'Chapman', 'Clarke', 'Collins', 'Cooper', 'Davies', 'Dawson', 'Dixon',
  'Edwards', 'Ellis', 'Evans', 'Fisher', 'Foster', 'Fox', 'Graham',
  'Grant', 'Green', 'Griffiths', 'Hall', 'Harris', 'Harrison', 'Hart',
  'Harvey', 'Henderson', 'Hill', 'Hughes', 'Jackson', 'James', 'Jenkins',
  'Johnson', 'Jones', 'Kelly', 'King', 'Knight', 'Lane', 'Lawrence',
  'Lee', 'Lewis', 'Lloyd', 'Marshall', 'Martin', 'Mason', 'Matthews',
  'Miller', 'Mills', 'Mitchell', 'Moore', 'Morgan', 'Morris', 'Moss',
  'Murphy', 'Murray', 'Nash', 'Nelson', 'Nicholson', 'Parker', 'Patel',
  'Pearson', 'Perry', 'Phillips', 'Price', 'Reed', 'Rees', 'Reid',
  'Richards', 'Roberts', 'Robinson', 'Rogers', 'Rose', 'Russell', 'Scott',
  'Shaw', 'Simpson', 'Smith', 'Stevens', 'Stewart', 'Stone', 'Taylor',
  'Thomas', 'Thompson', 'Turner', 'Walker', 'Wallace', 'Walsh', 'Ward',
  'Watson', 'Webb', 'West', 'White', 'Wilkinson', 'Williams', 'Wilson',
  'Wood', 'Wright', 'Young'
]

const internationalNames = [
  { firstName: 'Amina', surname: 'Rahman' },
  { firstName: 'Ananya', surname: 'Sharma' },
  { firstName: 'Beatriz', surname: 'Gomes' },
  { firstName: 'Chiamaka', surname: 'Okafor' },
  { firstName: 'Fatima', surname: 'Khan' },
  { firstName: 'Hana', surname: 'Sato' },
  { firstName: 'Leila', surname: 'Haddad' },
  { firstName: 'Mei', surname: 'Wong' },
  { firstName: 'Nadia', surname: 'Petrova' },
  { firstName: 'Priyanka', surname: 'Patel' },
  { firstName: 'Samira', surname: 'Hassan' },
  { firstName: 'Thandiwe', surname: 'Ndlovu' },
  { firstName: 'Valentina', surname: 'Rossi' },
  { firstName: 'Wei', surname: 'Chen' },
  { firstName: 'Zeinab', surname: 'Ali' }
]

const streets = [
  'Ash Grove', 'Beech Avenue', 'Brook Lane', 'Cedar Road', 'Church Street',
  'Elm Close', 'Fairview Drive', 'Garden Way', 'Hawthorn Road',
  'Highfield Avenue', 'Meadow Lane', 'Oak Street', 'Orchard Close',
  'Park View', 'Station Road', 'The Crescent', 'Willow Drive'
]

const towns = [
  { name: 'Brightmere', postcode: 'BM1 4AB' },
  { name: 'Cedarford', postcode: 'CF2 7CD' },
  { name: 'Fairwick', postcode: 'FW3 5EF' },
  { name: 'Greystone', postcode: 'GS4 8GH' },
  { name: 'Oakminster', postcode: 'OM5 2JK' },
  { name: 'Westcombe', postcode: 'WC6 9LM' }
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const pad = (value, width = 2) => String(value).padStart(width, '0')
const formatDate = (date) => `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`
const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const formatRelativeDate = (date, today) => {
  const days = Math.max(0, Math.round((date - today) / 86400000))

  if (days < 7) {
    return `In ${days} day${days === 1 ? '' : 's'}`
  }

  const weeks = Math.round(days / 7)
  if (weeks < 8) {
    return `In ${weeks} week${weeks === 1 ? '' : 's'}`
  }

  const months = Math.max(1, Math.round(days / 30))
  return `In ${months} month${months === 1 ? '' : 's'}`
}

const calculateAge = (dateOfBirth, today) => {
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const birthdayThisYear = new Date(today.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate())

  if (today < birthdayThisYear) {
    age -= 1
  }

  return age
}

const dateOfBirthFor = (index, today) => {
  const age = 50 + (index % 22)
  const date = new Date(today.getFullYear() - age, (index * 5) % 12, 1 + ((index * 7) % 27))

  if (date > new Date(today.getFullYear() - 50, today.getMonth(), today.getDate())) {
    date.setFullYear(date.getFullYear() - 1)
  }
  return date
}

const createParticipant = (index, today) => {
  const internationalName = index % 10 === 0 ? internationalNames[Math.floor(index / 10) % internationalNames.length] : null
  const firstName = internationalName ? internationalName.firstName : firstNames[index % firstNames.length]
  const surname = internationalName ? internationalName.surname : surnames[(index * 7) % surnames.length]
  const middleName = index % 3 === 0 ? ` ${middleNames[(index * 3) % middleNames.length]}` : ''
  const town = towns[index % towns.length]
  const dateOfBirth = dateOfBirthFor(index, today)
  const nextTestDueDays = 7 + ((index * 11) % 84)
  const dueDate = addDays(today, nextTestDueDays)
  const isBreaching = index === 7 || index === 83
  const hasScheduledAppointment = isBreaching || (index % 4 === 0 && index !== 4 && index !== 8)
  const nextAppointmentDays = !hasScheduledAppointment
    ? null
    : isBreaching
    ? nextTestDueDays + 5 + (index % 4)
    : 3 + ((index * 9) % Math.max(4, nextTestDueDays - 2))
  const appointmentDate = nextAppointmentDays === null ? null : addDays(today, nextAppointmentDays)
  const specialAppointmentRequired = index % 17 === 0
  const episodeStages = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'mammograms', 'reading', 'assessment', 'closed']
  const mobile = `07700 9${pad(index % 100)}${pad((index * 13) % 1000, 3)}`
  const home = `01632 960${pad((index * 17) % 1000, 3)}`

  return {
    participantId: `p${pad(index + 1)}`,
    full_name: `${surname.toUpperCase()}, ${firstName}${middleName}`,
    surname_sort_value: surname.toUpperCase(),
    nhs_number: `999 ${pad((index * 37) % 1000, 3)} ${pad((index * 97 + 1) % 10000, 4)}`,
    date_of_birth: formatDate(dateOfBirth),
    age: calculateAge(dateOfBirth, today),
    gender: 'Female',
    ethnicity: 'Not recorded',
    address: {
      houseNumber: String(1 + ((index * 13) % 98)),
      street: streets[index % streets.length],
      town: town.name,
      postcode: town.postcode
    },
    phone_numbers: { mobile, home: index % 4 === 0 ? home : '' },
    email: `${firstName.toLowerCase()}.${surname.toLowerCase()}${index + 1}@example.com`,
    sx_number: `ECX${String((index * 7919 + 104729) % 1000000).padStart(6, '0')}`,
    next_test_due_days: nextTestDueDays,
    next_test_due_date: formatDate(dueDate),
    next_test_due_date_value: dueDate.getTime(),
    next_test_due_date_relative: formatRelativeDate(dueDate, today),
    episode_stage: episodeStages[index % episodeStages.length],
    next_appointment_days: nextAppointmentDays,
    next_appointment_date: appointmentDate ? formatDate(appointmentDate) : 'Not known',
    next_appointment_date_value: appointmentDate ? appointmentDate.getTime() : null,
    next_appointment_date_relative: appointmentDate ? formatRelativeDate(appointmentDate, today) : 'Not known',
    special_appointment_required: specialAppointmentRequired ? 'Yes' : 'No',
    special_appointment_information: '',
    further_information: '',
    status: 'unstaged',
    is_breaching: isBreaching
  }
}

const today = new Date()

export default Array.from({ length: 150 }, (_, index) => createParticipant(index, today))
