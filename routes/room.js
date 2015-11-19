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
    var room_id = req.params.room_id;
    res.send('Not yet implemented');
});

/*
 * DELETE /rooms/:room_id/messages/:message_id/
 *
 * Censors the message identified by :message_id.
 */
router.delete('/:room_id/messages/:message_id/', auth.requireLevel('presenter'), function (req, res, next) {
    var room = req.params.room_id;
    var id = req.params.message_id;

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    database.query("SELECT * FROM messages WHERE id = $1", [id]).then(function (results) {
        if (results.length <= 0)
            return res.status(400).json({ errors:"Message ID does not exist" });
    })
    
    database.query("SELECT * FROM messages WHERE room = $1", [room]).then(function (results){
        if (results.length <=0)
            return res.status(400).json({errors:"That room does not exist"});
    })

    database.query("DELETE FROM messages WHERE room = $1 AND id = $2", [room, id]).then(function () {
        return res.send();
    }).catch(next);
    //res.send('$1, $2',[room,id]);
    
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
