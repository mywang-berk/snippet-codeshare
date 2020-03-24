/*
    Methods for getting forms and handling the creation, access, and deletion
    of code snips.
*/

const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const crypto = require('crypto');
const db = require('../database/db');
const AWS = require('aws-sdk');
const uuid = require('node-uuid');

const s3 = new AWS.S3();
const MIN_KEYLEN = 5;
const MAX_KEYLEN = 32;
const TABLE_NAME = 'Snip';
const COL_NAMES = '(contentKey, expiration, URIKey)';
const service_url = 'https://localhost:3001'
const BUCKET_NAME = 'snippet-objstore';

/* surround a string with single quotes */
function enquote(mywords) {
    return '\'' + mywords + '\'';
}

/* Assumes that snip_id is a unique, valid string less than 1024 bytes */
function upload_to_bucket(code, commentary, snip_id, callback) {
    const codesnip = {
        'code': code,
        'commentary': commentary
    };
    const params = {
        Bucket: BUCKET_NAME,
        Key: snip_id,
        Body: new Buffer.from(JSON.stringify(codesnip)),
        ContentType: 'application/json'
    };
    
    s3.putObject(params, function(err, data) {
        if (err) {
            console.log(err);
            callback (err, data);
        } else {
            callback (null, data);
        }
    });
}

function delete_from_bucket(snip_id, callback) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: snip_id
    };

    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(null, data);
        }
    });
}

function download_from_bucket(snip_id, callback) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: snip_id
    };

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err);
            callback(err, data);
        } else {
            callback(null, data);
        }
    });
}

/* Encapsulates the functionality of uploading a new snip to DB and object store */
function create_new_snip(snip_id, code, commentary, expire, res) {
    snip_id = snip_id.toLowerCase();

    /* Generate an appropriate database and object store entry */
    db.query(`INSERT INTO ${TABLE_NAME} ${COL_NAMES} VALUES (${enquote(uuid.v4())}, ${expire}, ${enquote(snip_id)});`,
                function(err, rows, fields) {
                    if (err) {
                        res.send('DATABASE ERROR: Your codesnip was not created.');
                        throw err;
                    } else {
                        upload_to_bucket(code, commentary, snip_id, function (err, data) {
                            if (err) { /* NOTE: Modify this and other stuff later to sanitize data and prevent SQl injections */
                                db.query(`DELETE FROM ${TABLE_NAME} WHERE URIKey=\'${snip_id}\';`,
                                        function (err, rows, fields) {
                                            const cleared = err? false: true;
                                            res.send(`OBJECT STORE ERROR: Your codesnip was not created. DB entry cleared: ${cleared}`);
                                            if (!cleared) throw err;
                                            return;
                                        });
                            } else {
                                res.send(`SUCCESS: Your codesnip is now up at ${service_url}/${snip_id}`);
                            }
                        });
                    }
                });
}

function try_until_unique(trials, callback) {
    if (trials > 5) throw Error('Too many duplicate keys');
    
    const snip_id = crypto.randomBytes(3).toString('hex');
    db.query('SELECT URIKey FROM Snip WHERE URIKey=\'' + snip_id + '\';', 
    function (err, rows, fields) {
        let duplicate = (rows[0] != undefined && rows[0].URIKey == snip_id) ? true : false;
        if (duplicate) {
            try_until_unique(trials + 1, callback);
        } else {
            callback(err, snip_id);
        }
    });
}

/* Get the form for creating a new code snip */
exports.snip_create_get = function (req, res, next) {
    var snip_id = crypto.randomBytes(3).toString('hex');
    res.send(snip_id);
    // NOT YET IMPLEMENTED

};

/* Handle the creation of a new code snip */
exports.snip_create_post = function (req, res, next) {
    /* Check that code and commentary have been provided */
    /* req.body should include code, commentary, expire, and custom_id (last two optional) */
    let code = req.body.code;
    let commentary = req.body.commentary;
    let expire = (req.body.expire != undefined)? req.body.expire : 'NULL';
    if (!code && !commentary) {
        res.send("Error: No Code or Commentary Provided.");
        return;
    } else {
        if (!code) code = "";
        if (!commentary) commentary = "";
    }
    
    /* Verify that the custom id is unique */
    let trials = 0
    let snip_id = req.body.custom_id;

    if (snip_id && snip_id.length > MAX_KEYLEN) {
        res.send('Your chosen custom key \'' + snip_id + '\' is too long.');
        return;
    } else if (snip_id && snip_id.length >= MIN_KEYLEN) {
        db.query('SELECT URIKey FROM Snip WHERE URIKey=\'' + snip_id + '\';', 
                    function (err, rows, fields) {
                        if (rows[0] != undefined && rows[0].URIKey == snip_id) {
                            res.send('Your chosen custom key \'' + snip_id + '\' is already in use.' + rows[0].URIKey);
                            return;     
                        } else {
                            create_new_snip(snip_id, code, commentary, expire, res);
                        }
                    });
    } else { /* Generate a random ID if no custom one is supplied */
        try_until_unique(trials=0, function(err, snip_id) {
            if (err) {
                console.log(err);
                res.send("FAILURE: COULD NOT FIND UNIQUE KEY");
            } else {
                create_new_snip(snip_id, code, commentary, expire, res);
            }
        });    
    }
}

/* Handle the deletion of a code snip */
exports.snip_delete_post = function (req, res, next) {
    /* req.body should include passcode and snip_id to delete */
    if (req.body.passcode != 'command_override_VULCAN') {
        res.send ("ERROR: DELETION NOT AUTHORIZED");
        return;
    }

    let exists = true;
    db.query(`SELECT URIKey FROM ${TABLE_NAME} WHERE URIKey=${enquote(req.body.snip_id)};`,
                function (err, rows, fields) {
                    if (err) {
                        throw err;
                    } else if (!rows[0] || rows[0].URIKey != req.body.snip_id) {
                        res.send(`The provided Snip ID ${enquote(req.body.snip_id)} does not exist.`);
                    } else {
                        delete_from_bucket(req.body.snip_id, function (err, data) {
                            if (err) {
                                res.send('OBJECT STORE ERROR: entry could not be deleted.');
                                return;
                            } else {
                                db.query(`DELETE FROM ${TABLE_NAME} WHERE URIKey=${enquote(req.body.snip_id)};`,
                                            function (err, rows, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    res.send(`DATABASE ERROR: entry deleted from object store but not db.`);
                                                } else {
                                                    res.send(`Entry ${enquote(req.body.snip_id)} successfully deleted.`);
                                                }
                                            });
                                
                            }
                        });
                    }
                });
};

/* Handle a request for an existing snip */
exports.snip_view_get = function (req, res, next) {
    /* req should have req.params.snip_id */
    const snip_id = req.params.snip_id;
    db.query(`SELECT URIKey FROM ${TABLE_NAME} WHERE URIKey=${enquote(snip_id)};`, 
                function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        res.send(`Error: the snip with id ${enquote(snip_id)} does not exist.`);        
                    } else if (!rows[0] || rows[0].URIKey != snip_id) {
                        res.send(`Error: the snip with id ${enquote(snip_id)} does not exist.`);
                    } else {
                        download_from_bucket(snip_id, function(err, my_object) {
                            if (err) {
                                res.send(`Error: the snip with id ${enquote(snip_id)} does not exist.`);
                            } else {
                                const recovered = JSON.parse(my_object.Body);
                                res.send("My object:" + JSON.stringify(recovered));
                            }
                        })
                    }
                });
    // NOT YET IMPLEMENTED
};