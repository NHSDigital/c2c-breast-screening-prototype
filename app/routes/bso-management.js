const express = require('express')
const router = express.Router()
/*

/app/views/bso-objects/

*/

const OS_VTS_BASE = 'https://api.os.uk/maps/vector/v1/vts'

// Proxies OS Vector Tile API requests so the API key never reaches the browser
router.get(['/os-maps', '/os-maps/*path'], async function (req, res) {
  const apiKey = process.env.MAPS_API
  if (!apiKey) return res.status(500).send('MAPS_API is not set')

  const path = (req.params.path || []).join('/')
  if (path.includes('..')) return res.sendStatus(400)

  const upstream = new URL(path ? `${OS_VTS_BASE}/${path}` : OS_VTS_BASE)
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'key') upstream.searchParams.set(k, String(v))
  }
  upstream.searchParams.set('key', apiKey)

  const response = await fetch(upstream)
  const contentType = response.headers.get('content-type') || 'application/octet-stream'
  res.status(response.status)
  res.set('Content-Type', contentType)

  // OS embeds the key in URLs inside style/TileJSON responses, so strip it out
  if (/json|xml|text/.test(contentType)) {
    return res.send((await response.text()).replaceAll(`key=${apiKey}`, 'key='))
  }
  res.send(Buffer.from(await response.arrayBuffer()))
})

module.exports = router