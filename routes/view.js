/* Route module for /view (retrieving and displaying a codesnip) */

const express = require('express');
const router = express.Router();
const snipController = require('../controllers/snipController');

/* GET the form for creating a codesnip */
router.get('/:snip_id', snipController.snip_view_get);

module.exports = router;