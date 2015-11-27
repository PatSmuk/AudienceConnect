var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');

/*
 * GET /users/me
 *
 * Returns all information about the current user.
 */
router.get('/me', auth.requireLevel('logged_in'), function (req, res, next) {
    res.json(req.user);
});

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

    database.query("SELECT full_name, avatar FROM users WHERE id = $1", [user_id])
    .then(function (results) {
        if (results.length == 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.send({
            fullName: results[0].full_name,
            avatar: results[0].avatar
        });
    })
    .catch(next);
});

module.exports = router;
