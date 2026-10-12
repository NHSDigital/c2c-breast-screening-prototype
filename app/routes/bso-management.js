const express = require('express')
const router = express.Router()
/*

/app/views/bso-objects/

*/

require('dotenv').config()

router.get('/bso-objects/bso/bso-internal-details', function (req, res) {
  res.render('bso-objects/bso/bso-internal-details.html', {
    mapsAPI: process.env.MAPS_API
  })
})

module.exports = router