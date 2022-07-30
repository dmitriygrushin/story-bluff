const express = require('express');
const router = express.Router();
const room = require('../controllers/room');

router.get('/', room.view);

module.exports = router;
