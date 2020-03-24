const express = require('express');
const router = express.Router();
const snipController = require('../controllers/snipController');

/* GET home page. */
router.post('/', snipController.snip_delete_post);

module.exports = router;
