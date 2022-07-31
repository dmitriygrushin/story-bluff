const express = require('express');
const router = express.Router();
const index = require('../controllers/index');

router.get('/', index.view);

module.exports = router;
