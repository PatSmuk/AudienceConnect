var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');


router.get('/', auth.requireLevel('presenter'), function (req, res, next) {
    database().then(function (client) {
        return client[0].query('SELECT id FROM users')
        .then(function (results) {
            client[1]();
            return res.json(results.rows.map(function (row) { return row.id; }));
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

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

    database().then(function (client) {
        return client[0].query("SELECT full_name, avatar FROM users WHERE id = $1", [user_id])
        .then(function (results) {
            client[1]();
            if (results.rowCount == 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.send({
                fullName: results.rows[0].full_name,
                avatar: results.rows[0].avatar
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

module.exports = router;
