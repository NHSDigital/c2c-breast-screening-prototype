// External dependencies
const express = require('express')

const router = express.Router()

router.get('/action/stage/:participantIndex', function (req, res) {
  req.session.data.participants.default[req.params.participantIndex].status = 'staged';
  res.redirect('/september-iteration-2/clickthru/04-choose-participants');
});

router.get('/action/unstage/:participantIndex', function (req, res) {
  req.session.data.participants.default[req.params.participantIndex].status = 'unstaged';
  res.redirect('/september-iteration-2/clickthru/04-choose-participants');
});

module.exports = router
