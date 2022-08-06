const express = require('express');
const router = express.Router();
const room = require('../controllers/room');

router.get('/:id', hasName, room.view);

router.post('/:id', room.joinRoom);

// checks if the user has a name registered in the session
function hasName (req, res, next) {
  const { id } = req.params;
  if (req.session.username && req.session.roomId == id) return next();
  return res.render('index', { isJoining: true, roomId: id });
}

module.exports = router;
