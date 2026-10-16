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

const appointmentUnits = ['West Sussex Breast Care Centre', 'Alpha Van', 'Beta Van', 'Gamma Van', 'Delta Van']
const appointmentLocations = [
  'Bognor Regis', 'Burgess Hill', 'Chichester', 'Crawley', 'Haywards Heath',
  'Horsham', 'Littlehampton', 'Shoreham-by-Sea', 'Storrington'
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const pad = (value, width = 2) => String(value).padStart(width, '0')
const formatDate = (date) => `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`
const postcodeFor = (index, postcode) => {
  const outwardCode = postcode.split(' ')[0]
  const letters = 'ABCDEFGHJKLMNPRSTUWXYZ'
  const suffixIndex = Math.floor(index / 9)
  const firstLetter = letters[Math.floor(suffixIndex / letters.length)]
  const secondLetter = letters[suffixIndex % letters.length]
  return `${outwardCode} ${(index % 9) + 1}${firstLetter}${secondLetter}`
}

const gpPractices = [
  { practice_code: 'DEMO001', name: 'Ash Grove Medical Centre', phone: '01632 960101', address: { houseNumber: '12', street: 'Ash Grove', town: 'Brightmere', postcode: 'BM1 4AC' } },
  { practice_code: 'DEMO002', name: 'Cedarford Family Practice', phone: '01632 960102', address: { houseNumber: '24', street: 'Cedar Road', town: 'Cedarford', postcode: 'CF2 7CE' } },
  { practice_code: 'DEMO003', name: 'Fairview Health Centre', phone: '01632 960103', address: { houseNumber: '8', street: 'Fairview Drive', town: 'Fairwick', postcode: 'FW3 5EG' } },
  { practice_code: 'DEMO004', name: 'Greystone Medical Practice', phone: '01632 960104', address: { houseNumber: '31', street: 'Church Street', town: 'Greystone', postcode: 'GS4 8GJ' } },
  { practice_code: 'DEMO005', name: 'Oakminster Surgery', phone: '01632 960105', address: { houseNumber: '5', street: 'Oak Street', town: 'Oakminster', postcode: 'OM5 2JL' } },
  { practice_code: 'DEMO006', name: 'Westcombe Medical Centre', phone: '01632 960106', address: { houseNumber: '17', street: 'Station Road', town: 'Westcombe', postcode: 'WC6 9LN' } },
  { practice_code: 'DEMO007', name: 'Meadow Lane Health Centre', phone: '01632 960107', address: { houseNumber: '42', street: 'Meadow Lane', town: 'Brightmere', postcode: 'BM1 4AD' } },
  { practice_code: 'DEMO008', name: 'Willow Drive Family Practice', phone: '01632 960108', address: { houseNumber: '3', street: 'Willow Drive', town: 'Cedarford', postcode: 'CF2 7CF' } }
]

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const formatRelativeDate = (date, today, daysThreshold = 7) => {
  const days = Math.max(0, Math.round((date - today) / 86400000))

  if (days < daysThreshold) {
    return `In ${days} day${days === 1 ? '' : 's'}`
  }

  const weeks = Math.round(days / 7)
  if (weeks < 8) {
    return `In ${weeks} week${weeks === 1 ? '' : 's'}`
  }

  const months = Math.max(1, Math.round(days / 30))
  return `In ${months} month${months === 1 ? '' : 's'}`
}

const lastScreenedDaysAgoFor = (index) => {
  if (index % 30 === 0) return null
  if (index % 20 < 4) return 365 + ((index * 37) % 1095)
  if (index % 37 === 0) return 1826 + ((index * 11) % 1095)
  return 1095 + ((index * 13) % 181)
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
  const lastScreenedDaysAgo = lastScreenedDaysAgoFor(index)
  const lastScreenedDate = lastScreenedDaysAgo === null ? null : addDays(today, -lastScreenedDaysAgo)
  const isBreaching = index === 7 || index === 83
  const hasScheduledAppointment = isBreaching || (index % 4 === 0 && index !== 4 && index !== 8)
  const nextAppointmentDays = !hasScheduledAppointment
    ? null
    : isBreaching
    ? nextTestDueDays + 5 + (index % 4)
    : 3 + ((index * 9) % Math.max(4, nextTestDueDays - 2))
  const appointmentDate = nextAppointmentDays === null ? null : addDays(today, nextAppointmentDays)
  const appointmentUnit = nextAppointmentDays === null
    ? null
    : appointmentUnits[Math.floor(Math.random() * appointmentUnits.length)]
  const appointmentLocation = nextAppointmentDays === null
    ? null
    : appointmentUnit === 'West Sussex Breast Care Centre'
      ? 'Worthing Hospital'
      : appointmentLocations[Math.floor(Math.random() * appointmentLocations.length)]
  const specialAppointmentRequired = index % 17 === 0
  const mobile = `07700 9${pad(index % 100)}${pad((index * 13) % 1000, 3)}`
  const home = `01632 960${pad((index * 17) % 1000, 3)}`

  return {
    participantId: `p${pad(index + 1)}`,
    full_name: `${firstName} ${middleName} ${surname}`,
    display_name: `${surname.toUpperCase()}, ${firstName}`,
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
      postcode: postcodeFor(index, town.postcode)
    },
    gp_practice: gpPractices[index % gpPractices.length],
    phone_numbers: { mobile, home: index % 4 === 0 ? home : '' },
    email: `${firstName.toLowerCase()}.${surname.toLowerCase()}${index + 1}@example.com`,
    sx_number: `ECX${String((index * 7919 + 104729) % 1000000).padStart(6, '0')}`,
    last_screened_days_ago: lastScreenedDaysAgo,
    last_screened_date: lastScreenedDate ? formatDate(lastScreenedDate) : 'Never screened',
    next_test_due_days: nextTestDueDays,
    next_test_due_date: formatDate(dueDate),
    next_test_due_date_value: dueDate.getTime(),
    next_test_due_date_relative: formatRelativeDate(dueDate, today, 28),
    episode_stage: 'scheduled',
    next_appointment_days: nextAppointmentDays,
    next_appointment_date: appointmentDate ? formatDate(appointmentDate) : 'Not known',
    next_appointment_date_value: appointmentDate ? appointmentDate.getTime() : null,
    next_appointment_date_relative: appointmentDate ? formatRelativeDate(appointmentDate, today) : 'Not known',
    next_appointment_unit: appointmentUnit,
    next_appointment_location: appointmentLocation,
    special_appointment_required: specialAppointmentRequired ? 'Yes' : 'No',
    special_appointment_information: '',
    further_information: '',
    status: 'unstaged',
    is_breaching: isBreaching
  }
}

const today = new Date()

export default Array.from({ length: 150 }, (_, index) => createParticipant(index, today))
