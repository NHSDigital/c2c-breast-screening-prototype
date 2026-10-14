const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const imageDir = path.join(__dirname, '../assets/images/session-templates')
const imageUrlBase = '/assets/images/session-templates'

// Matches the kit's session cookie maxAge, after which no session can still reference the image
const maxImageAge = 1000 * 60 * 60 * 4

const fills = {
  'non-bookable': '#aeb7bd',
  held: '#f6c580',
  special: '#fff9c4',
  standard: '#ffffff'
}

const typeLabels = {
  'non-bookable': 'Non-bookable',
  held: 'Held',
  special: 'Special appointments'
}

// Precedence matches slotTypeLabel in slot-structure-handlers
const slotType = (slot) => {
  if (slot.isNonBookable) return 'non-bookable'
  if (slot.isHold) return 'held'
  if (slot.isSpecialAppointment) return 'special'
  return 'standard'
}

const buildSegments = (slots) => slots.reduce((segments, slot) => {
  const type = slotType(slot)
  const last = segments[segments.length - 1]
  if (last && last.type === type) {
    last.span += slot.span
    last.endLabel = slot.endLabel
  } else {
    segments.push({ type, startIndex: slot.index, span: slot.span, startLabel: slot.startLabel, endLabel: slot.endLabel })
  }
  return segments
}, [])

// Takes the output of buildSessionSlots and returns { svg, description }
const buildSessionMapSvg = ({ slots, sessionStartLabel, sessionEndLabel }) => {
  const segments = buildSegments(slots)
  const totalSlots = segments.reduce((total, segment) => total + segment.span, 0) || 1

  const description = [`${totalSlots} slots from ${sessionStartLabel} to ${sessionEndLabel}.`]
    .concat(segments
      .filter((segment) => segment.type !== 'standard')
      .map((segment) => `${typeLabels[segment.type]} ${segment.startLabel} to ${segment.endLabel}.`))
    .join(' ')

  const shapes = segments.map((segment, i) => [
    segment.type === 'standard' ? '' : `<rect x="0" y="${segment.startIndex}" width="100" height="${segment.span}" fill="${fills[segment.type]}"/>`,
    i === 0 ? '' : `<line x1="0" x2="100" y1="${segment.startIndex}" y2="${segment.startIndex}" stroke="#768692" stroke-width="1" vector-effect="non-scaling-stroke"/>`
  ].join(''))

  // width/height give <img> a portrait intrinsic ratio; the viewBox stretches to fill it
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="68" height="96" viewBox="0 0 100 ${totalSlots}" preserveAspectRatio="none">` +
    `<title>${description}</title>` +
    `<rect x="0" y="0" width="100" height="${totalSlots}" fill="${fills.standard}"/>` +
    shapes.join('') +
    '</svg>\n'

  return { svg, description }
}

const listImages = () => {
  if (!fs.existsSync(imageDir)) return []
  return fs.readdirSync(imageDir)
    .filter((file) => path.extname(file) === '.svg')
    .map((file) => path.join(imageDir, file))
}

// Sessions live in memory, so none survive a restart and every existing image is orphaned
const clearSessionMapImages = () => {
  listImages().forEach((file) => fs.rmSync(file, { force: true }))
}

const pruneOldImages = () => {
  const cutoff = Date.now() - maxImageAge
  listImages()
    .filter((file) => fs.statSync(file).mtimeMs < cutoff)
    .forEach((file) => fs.rmSync(file, { force: true }))
}

// Writes the map for a session and returns { imagePath, imageAlt }, or {} if the write fails
const saveSessionMapImage = (sessionSlots) => {
  const { svg, description } = buildSessionMapSvg(sessionSlots)
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.svg`

  try {
    fs.mkdirSync(imageDir, { recursive: true })
    pruneOldImages()
    fs.writeFileSync(path.join(imageDir, fileName), svg)
    return { imagePath: `${imageUrlBase}/${fileName}`, imageAlt: description }
  } catch (error) {
    console.error('Could not save session map image:', error)
    return {}
  }
}

const sessionMapImageExists = (imagePath) =>
  typeof imagePath === 'string' && fs.existsSync(path.join(imageDir, path.basename(imagePath)))

const deleteSessionMapImage = (imagePath) => {
  if (typeof imagePath !== 'string') return
  fs.rmSync(path.join(imageDir, path.basename(imagePath)), { force: true })
}

module.exports = { buildSessionMapSvg, clearSessionMapImages, deleteSessionMapImage, saveSessionMapImage, sessionMapImageExists }
