var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');
var assert = require('assert');


function handle_list_id(req, res, next) {
    req.checkParams('list_id', 'List ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var list_id = parseInt(req.params.list_id);
    var user_id = req.user.id;

    database().then(function (client) {
        return client[0].query(
            'SELECT * FROM invitation_lists WHERE id = $1 AND presenter = $2',
            [list_id, user_id])
        .then(function (results) {
            client[1]();

            if (results.rowCount == 0) {
                return res.status(404).json({ error: 'Invitation list '+list_id+' not found' })
            }

            req.invitationList = results.rows[0];
            next();
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
}

/*
 * GET /invitationLists/
 *
 * Returns a list of all invitation lists you own.
 */
router.get('/', auth.requireLevel('presenter'), function (req, res, next) {
    database().then(function (client) {
        return client[0].query(
            'SELECT id, subject FROM invitation_lists WHERE presenter = $1',
            [req.user.id]
        )
        .then(function (results) {
            client[1]();
            res.json(results.rows);
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * POST /invitationLists/
 *
 * Creates a new invitation list.
 *
 * Parameters:
 *  - subject: the subject of the list
 */
router.post('/', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkBody('subject', 'Email address is missing').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    database().then(function (client) {
        client[0].query(
            'INSERT INTO invitation_lists (presenter, subject) VALUES ($1, $2)',
            [req.user.id, req.body.subject]
        )
        .then(function () {
            client[1]();
            res.json({});
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * GET /invitationLists/:list_id/
 *
 * Returns a list of all the users who are part of the
 * invitation list idenfitied by :list_id.
 */
router.get('/:list_id/', [auth.requireLevel('presenter'), handle_list_id], function (req, res, next) {
    var list = req.invitationList;

    database().then(function (client) {
        client[0].query(
            ' SELECT id                         '+
            ' FROM users                        '+
            ' WHERE id IN (                     '+
            '     SELECT audience_member        '+
            '     FROM invitation_list_members  '+
            '     WHERE invitation_list = $1    '+
            ' )                                 ',
            [list.id]
        )
        .then(function (results) {
            client[1]();

            res.json(results.rows.map(function (row) {
                return row.id;
            }));
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * POST /invitationLists/:list_id/
 *
 * Adds a user to the invitation list identified by :list_id.
 *
 * Parameters:
 *  - user: the ID of the user that should be added to the list
 */
router.post('/:list_id/', [auth.requireLevel('presenter'), handle_list_id], function (req, res, next) {
    var list = req.invitationList;

    req.checkBody('user_id', 'User ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var user_id = req.body.user_id;

    // Ensure that they aren't already on the list.
    database().then(function (client) {
        return client[0].query('SELECT * FROM invitation_list_members WHERE invitation_list = $1 AND audience_member = $2', [list.id, user_id])
        .then(function (results) {
            if (results.rowCount > 0) {
                client[1]();
                return res.status(400).json({ errors: [{ param: 'user_id', msg: 'User is already on the invitation list', value: user_id }] })
            }

            return client[0].query('INSERT INTO invitation_list_members (invitation_list, audience_member) VALUES ($1, $2)', [list.id, user_id])
            .then(function () {
                client[1]();
                return res.json({});
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * DELETE /invitationLists/:list_id/:user_id/
 *
 * Remove the user identified by :user_id from the
 * invitation list identified by :list_id.
 */
router.delete('/:list_id/:user_id/', [auth.requireLevel('presenter'), handle_list_id], function (req, res, next) {
    var list = req.invitationList;

    req.checkParams('user_id', 'User ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var user_id = req.params.user_id;

    // Ensure that they are on the list.
    database().then(function (client) {
        return client[0].query('SELECT * FROM invitation_list_members WHERE invitation_list = $1 AND audience_member = $2', [list.id, user_id])
        .then(function (results) {
            if (results.rowCount == 0) {
                client[1]();
                return res.status(404).json({ errors: [{ param: 'user_id', msg: 'User not found in invitation list', value: user_id }] })
            }

            return client[0].query('DELETE FROM invitation_list_members WHERE invitation_list = $1 AND audience_member = $2', [list.id, user_id])
            .then(function () {
                client[1]();
                return res.json({});
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});


module.exports = router;
