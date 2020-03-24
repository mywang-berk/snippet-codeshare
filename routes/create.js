/* Route module for /create (creating a new codesnip) */

const express = require('express');
const router = express.Router();
const snipController = require('../controllers/snipController');

/* GET the form for creating a codesnip */
router.get('/', snipController.snip_create_get);

/* POST request to create a snip */
router.post('/', snipController.snip_create_post);

module.exports = router;