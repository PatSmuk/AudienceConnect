var express = require('express');
var router = express.Router();
var auth = require('../auth');

/*
 * GET /invitationLists/
 *
 * Returns a list of all invitation lists you own.
 */
router.get('/', auth.requireLevel('presenter'), function (req, res, next) {
    res.send('Not yet implemented');
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
    res.send('Not yet implemented');
});

/*
 * GET /invitationLists/:list_id/
 *
 * Returns a list of all the users who are part of the
 * invitation list idenfitied by :list_id.
 */
router.get('/:list_id/', auth.requireLevel('presenter'), function (req, res, next) {
    var list_id = req.params.list_id;
    res.send('Not yet implemented');
});

/*
 * POST /invitationLists/:list_id/
 *
 * Adds a user to the invitation list identified by :list_id.
 *
 * Parameters:
 *  - user: the ID of the user that should be added to the list
 */
router.post('/:list_id/', auth.requireLevel('presenter'), function (req, res, next) {
    var list_id = req.params.list_id;
    var user_id = req.params.user_id;
    res.send('Not yet implemented');
});

/*
 * DELETE /invitationLists/:list_id/:user_id/
 *
 * Remove the user identified by :user_id from the
 * invitation list identified by :list_id.
 */
router.delete('/:list_id/:user_id/', auth.requireLevel('presenter'), function (req, res, next) {
    var list_id = req.params.list_id;
    var user_id = req.params.user_id;
    res.send('Not yet implemented');
});


module.exports = router;
