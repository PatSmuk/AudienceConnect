var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require("../database.js");

/*
 * GET /rooms/
 *
 * Returns an array of all rooms you have access to.
 */
router.get('/', auth.requireLevel('logged_in'), function (req, res, next) {
    var id = req.user.id;

    database.query(
        " SELECT id, room_name, start_timestamp, end_timestamp, invitation_list " +
        " FROM chat_rooms                                                       " +
        " WHERE invitation_list IN (                                            " +
        "     SELECT invitation_list                                            " +
        "     FROM invitation_list_members                                      " +
        "     WHERE audience_member = $1                                        " +
        "     UNION                                                             " +
        "     SELECT id                                                         " +
        "     FROM invitation_lists                                             " +
        "     WHERE presenter = $1                                              " +
        " )                                                                     ",
        [id]
        )
        .then(function (results) {
            return res.send(results);
        })
        .catch(next);
});

/*
 * POST /rooms/
 *
 * Add a new chat room.
 *
 * Parameters:
 *  - roomName: the name of the new room
 *  - invitationList: the ID of the list of users that will be allowed access to the room
 */
router.post('/', auth.requireLevel('presenter'), function (req, res, next) {
    res.send('Not yet implemented');
});

/*
 * DELETE /rooms/:room_id/
 *
 * Deletes the chat room identified by :room_id.
 */
router.delete('/:room_id/', auth.requireLevel('logged_in'), function (req, res, next) {
    var room_id = req.params.room_id;
    res.send('Not yet implemented');
});

/*
 * GET /rooms/:room_id/messages/
 *
 * Gets an array of all messages sent in the room identified by :room_id.
 */
router.get('/:room_id/messages/', auth.requireLevel('logged_in'), function (req, res, next) {
    var room_id = req.params.room_id;
    res.send('Not yet implemented');
});

/*
 * POST /rooms/:room_id/messages/
 *
 * Sends a chat message to the room identified by :room_id.
 */
router.post('/:room_id/messages/', auth.requireLevel('logged_in'), function (req, res, next) {

    var room = req.params.room_id;
    var message = req.body.message;
    var user_id = req.user.id;

    req.checkBody('message', 'Message is missing').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    database.query(
        'SELECT * FROM chat_rooms ' +
        'WHERE id = $1',
        [room]
        )
        .then(function (results) {
            if (results.length < 1) {
                return res.status(404).json({ errors: [{ param: 'room', msg: 'Chat room does not exist', value: room }] });
            }
            database.query(
                'INSERT INTO messages (sender, room, message_text) VALUES ($1, $2, $3)',
                [user_id, room, message]
                )
                .then(function () {
                    return res.send();
                });
        })

        .catch(next);
});





/*
 * DELETE /rooms/:room_id/messages/:message_id/
 *
 * Censors the message identified by :message_id.
 */
router.delete('/:room_id/messages/:message_id/', auth.requireLevel('presenter'), function (req, res, next) {
    var room_id = req.params.room_id;
    var message_id = req.params.message_id;
    res.send('Not yet implemented');
});

/*
 * GET /rooms/:room_id/polls
 *
 * Gets a list of all polls in the chat room identified by :room_id.
 */
router.get('/:room_id/polls', auth.requireLevel('logged_in'), function (req, res, next) {
    var room_id = req.params.room_id;
    res.send('Not yet implemented');
});

/*
 * POST /rooms/:room_id/polls
 *
 * Adds a new poll to the chat room identified by :room_id.
 */
router.post('/:room_id/polls', auth.requireLevel('presenter'), function (req, res, next) {
    var room_id = req.params.room_id;
    res.send('Not yet implemented');
});

module.exports = router;
