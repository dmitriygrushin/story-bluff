const express = require('express');
const router = express.Router();
const index = require('../controllers/index');

router.get('/', index.view);
router.post('/', index.createRoom);

module.exports = router;
