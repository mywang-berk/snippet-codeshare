/*
    Methods for getting forms and handling the creation, access, and deletion
    of code snips.
*/

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Get the form for creating a new code snip */
exports.snip_create_get = function (req, res, next) {
    // NOT YET IMPLEMENTED
};

/* Handle the creation of a new code snip */
exports.snip_create_post = function (req, res, next) {
    // NOT YET IMPLEMENTED
};

/* Get the form for the deletion of a snip */
exports.snip_delete_get = function (req, res, next) {
    // NOT YET IMPLEMENTED
};

/* Handle the deletion of a code snip */
exports.snip_delete_post = function (req, res, next) {
    // NOT YET IMPLEMENTED
};

/* Handle a request for an existing snip */
exports.snip_view_get = function (req, res, next) {
    // NOT YET IMPLEMENTED
};