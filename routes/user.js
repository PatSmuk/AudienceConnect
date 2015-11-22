var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');

/*
 * GET /users/:user_id/
 *
 * Returns all information for the user identified by :user_id.
 */
router.get('/:user_id/', auth.requireLevel('logged_in'), function (req, res, next) {
    req.checkParams('user_id', 'User ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var user_id = req.params.user_id;

    //return 404 if the user doesn't exist
    database.query("SELECT id FROM users WHERE id = $1", [user_id])
    .then(function (results) {
        if (results.length == 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return database.query("SELECT id, verified, presenter, email, password_hash, student_id FROM users WHERE id = $1", [user_id])
        .then(function (results) {
            return res.send({});
        });
    })
    .catch(next);
});

module.exports = router;
