// app/lib/utils/strings.js

const padStart = (value, length = 2, char = '0') => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).padStart(length, char)
}

const zeroPad = (value, length = 2) => padStart(value, length, '0')

const toJSON = (value) => {
  try {
    return JSON.stringify(value)
  } catch (err) {
    return 'null'
  }
}

module.exports = {
  padStart,
  zeroPad,
  toJSON
}
