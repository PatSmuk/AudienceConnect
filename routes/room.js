var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require("../database");
var Promise = require('bluebird');

/*
 * GET /rooms/
 *
 * Returns an array of all rooms you have access to.
 */
router.get('/', auth.requireLevel('logged_in'), function (req, res, next) {
    var id = req.user.id;

    database().then(function (client) {
        return client[0].query(
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
            client[1]();
            return res.send(results.rows);
        })
        .catch(function (err) { client[1](); throw err; });
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

    //check the body for the values
    req.checkBody('roomName', 'Roomname is missing').notEmpty();
    req.checkBody('invitationList', 'Invitation list ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    var roomName = req.body.roomName;
    var invitationList = req.body.invitationList;

    database().then(function (client) {
        return client[0].query(
            'SELECT id FROM invitation_lists WHERE id = $1',
            [invitationList]
        )
        .then(function (results) {
            //no invitation list
            if (results.rowCount == 0) {
                client[1]();
                return res.status(400).json({
                    errors: [{
                        param: 'invitationList',
                        msg: 'Invitation list does not exist',
                        value: invitationList
                    }]
                });
            }

            //if the invitation list exists, then add the room
            client[0].query(
                'INSERT INTO chat_rooms (room_name, invitation_list) VALUES ($1, $2)',
                [roomName, invitationList]
            )
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
 * DELETE /rooms/:room_id/
 *
 * Deletes the chat room identified by :room_id.
 */
router.delete('/:room_id/', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    var room_id = req.params.room_id;
    var id = req.user.id;

    //check if the room exists
    database().then(function (client) {
        return client[0].query(
            'SELECT id FROM chat_rooms WHERE id = $1',
            [room_id]
        )
        .then(function (results) {
            if (results.rowCount != 1) {
                client[1]();
                return res.status(400).json({ errors: [{ param: 'room_id', msg: 'Chat room does not exist', value: room_id }] });
            }
            //check if the user that holds the room is trying to delete it
            return client[0].query(
                ' SELECT id FROM chat_rooms             ' +
                ' WHERE invitation_list                 ' +
                ' IN (                                  ' +
                '     SELECT id FROM invitation_lists   ' +
                '     WHERE presenter = $1              ' +
                ' )                                     ' +
                ' AND id = $2                           ',
                [id, room_id]
            )
            .then(function (results) {
                //if the presenter does not own it, throw an error
                if (results.rowCount < 1) {
                    client[1]();
                    return res.status(400).json({ errors: [{ param: 'presenter_id', msg: 'The presenter id does not own this room', value: room_id }] });
                }
                client[0].query('DELETE FROM chat_rooms WHERE id = $1', [room_id])
                .then(function () {
                    client[1]();
                    return res.json({});
                });
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * GET /rooms/:room_id/messages/
 *
 * Gets an array of all messages sent in the room identified by :room_id.
 */
router.get('/:room_id/messages/', auth.requireLevel('logged_in'), function (req, res, next) {
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    var room_id = parseInt(req.params.room_id, 10);
    var user_id = req.user.id;

    //check if the room exists
    database().then(function (client) {
        return client[0].query(
            ' SELECT id                         ' +
            ' FROM chat_rooms                   ' +
            ' WHERE id = $1                     ' +
            ' AND invitation_list IN (          ' +
            '     SELECT id                     ' +
            '     FROM invitation_lists         ' +
            '     WHERE presenter = $2          ' +
            '     UNION                         ' +
            '     SELECT invitation_list        ' +
            '     FROM invitation_list_members  ' +
            '     WHERE audience_member = $2    ' +
            ' )                                 ',
            [room_id, user_id]
        )
        .then(function (results) {
            if (results.rowCount != 1) {
                client[1]();
                return res.status(404).json({ error: 'Room '+room_id+' not found' });
            }

            //get the message
            return client[0].query(
                ' SELECT id, sender, message_timestamp, message_text '+
                ' FROM messages ' +
                ' WHERE room = $1',
                [room_id]
            )
            .then(function (results) {
                client[1]();
                return res.send(results.rows); //send the results of the query
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * POST /rooms/:room_id/messages/
 *
 * Sends a chat message to the room identified by :room_id.
 */
router.post('/:room_id/messages/', auth.requireLevel('logged_in'), function (req, res, next) {
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    var room = req.params.room_id;
    var message = req.body.message;
    var user_id = req.user.id;

    req.checkBody('message', 'Message is missing').notEmpty();

    errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    database().then(function (client) {
        return client[0].query(
            'SELECT * FROM chat_rooms           ' +
            'WHERE id = $1                      ' +
            'AND invitation_list IN (           ' +
            '     SELECT id                     ' +
            '     FROM invitation_lists         ' +
            '     WHERE presenter = $2          ' +
            '     UNION                         ' +
            '     SELECT invitation_list        ' +
            '     FROM invitation_list_members  ' +
            '     WHERE audience_member = $2    ' +
            ' )                                 ',
            [room, user_id]
        )
        .then(function (results) {
            if (results.rowCount < 1) {
                client[1]();
                return res.status(404).json({ errors: [{ param: 'room', msg: 'Chat room does not exist', value: room }] });
            }
            return client[0].query(
                'INSERT INTO messages (sender, room, message_text) VALUES ($1, $2, $3)',
                [user_id, room, message]
            )
            .then(function () {
                client[1]();
                return res.send({});
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * DELETE /rooms/:room_id/messages/:message_id/
 *
 * Censors the message identified by :message_id.
 */
router.delete('/:room_id/messages/:message_id/', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkParams('room_id', 'A valid room ID is required').isInt();
    req.checkParams('message_id', 'A valid message ID is required').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({errors: errors});
    }

    var room_id = req.params.room_id;
    var message_id = req.params.message_id;
    var user_id = req.user.id;

    // Ensure that the room exists and the user has access to it.
    database().then(function (client) {
        return client[0].query(
            'SELECT * FROM chat_rooms           ' +
            'WHERE id = $1                      ' +
            'AND invitation_list IN (           ' +
            '     SELECT id                     ' +
            '     FROM invitation_lists         ' +
            '     WHERE presenter = $2          ' +
            '     UNION                         ' +
            '     SELECT invitation_list        ' +
            '     FROM invitation_list_members  ' +
            '     WHERE audience_member = $2    ' +
            ' )                                 ',
            [room_id, user_id]
        )
        .then(function (results) {
            if (results.rowCount == 0) {
                client[1]();
                return res.status(404).json({ errors: [{ param: 'room_id', msg: 'Chat room does not exist', value: room_id }] });
            }

            // Ensure that the user is the presenter of this room.
            return client[0].query('SELECT presenter FROM invitation_lists WHERE id = (SELECT invitation_list FROM chat_rooms WHERE id = $1)', [room_id])
            .then(function (results) {
                if (results.rows[0].presenter != user_id) {
                    client[1]();
                    return res.status(403).json({ error: 'You must be the presenter of the room' });
                }

                // Ensure that the message exists.
                return client[0].query('SELECT * FROM messages WHERE id = $1 AND room = $2', [message_id, room_id])
                .then(function (results) {
                    if (results.rowCount == 0) {
                        client[1]();
                        return res.status(404).json({ errors: [{ param: 'message_id', msg: 'Message does not exist', value: message_id }] });
                    }

                    return client[0].query('UPDATE messages SET censored = true WHERE id = $1', [message_id])
                    .then(function () {
                        client[1]();
                        res.json({});
                    });
                });
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * GET /rooms/:room_id/polls
 *
 * Gets a list of all polls in the chat room identified by :room_id.
 */
router.get('/:room_id/polls', auth.requireLevel('logged_in'), function (req, res, next) {
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

    var room_id = req.params.room_id;
    var id = req.user.id;
    var total = 0;

    database().then(function (client) {
        return client[0].query(
            'SELECT id FROM chat_rooms WHERE id = $1',
            [room_id]
        )
        .then(function (results) {
            if (results.rowCount < 1) {
                client[1]();
                return res.status(404).json({ errors: [{ param: 'room_id', msg: 'Chat room does not exist', value: room_id }] });
            }
            return client[0].query(
                'SELECT id FROM chat_rooms ' +
                'WHERE invitation_list ' +
                'IN (SELECT id FROM invitation_lists ' +
                'WHERE presenter = $1) AND id = $2',
                [id, room_id]
            )
            .then(function (results) {
                if (results.rowCount >= 1) {
                    total = 1;
                }
                return client[0].query(
                    'SELECT id ' +
                    'FROM chat_rooms ' +
                    'WHERE invitation_list ' +
                    'IN (' +
                    '    SELECT invitation_list ' +
                    '    FROM invitation_list_members ' +
                    '    WHERE audience_member = $1) ' +
                    'AND id = $2',
                    [id, room_id]
                )
                .then(function (results) {
                    if (results.rowCount + total < 1) {
                        client[1]();
                        return res.status(404).json({ errors: [{ param: 'room_id', msg: 'Chat room does not exist', value: room_id }] });
                    }

                    return client[0].query(
                        'SELECT id, start_timestamp, end_timestamp, room, question ' +
                        'FROM polls ' +
                        'WHERE room = $1',
                        [room_id]
                    )
                    .then(function (results) {
                        return Promise.all(results.rows.map(function (row) {
                            return client[0].query(
                                'SELECT poll_answers.id, poll_answers.answer, COUNT(poll_votes.user_id) AS votes ' +
                                'FROM poll_answers '+
                                'LEFT JOIN poll_votes ON poll_votes.answer = poll_answers.id '+
                                'WHERE poll_answers.poll = $1 '+
                                'GROUP BY poll_answers.id',
                                [row.id])
                        }))
                        .then(function (answer_results) {
                            var polls = results.rows.map(function (row, i) {
                                return {
                                    id: row.id,
                                    startTime: row.start_timestamp,
                                    endTime: row.end_timestamp,
                                    question: row.question,
                                    answers: answer_results[i].rows
                                };
                            })
                            client[1]();
                            return res.json(polls);
                        });
                    });
                });
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

/*
 * POST /rooms/:room_id/polls
 *
 * Adds a new poll to the chat room identified by :room_id.
 */
router.post('/:room_id/polls', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkBody('question', 'Question is missing').notEmpty();
    req.checkBody('answers', 'Answers are missing').notEmpty();
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var room_id = req.params.room_id;
    var question = req.body.question;
    var answers = req.body.answers;

    database().then(function (client) {
        return client[0].query("SELECT * FROM chat_rooms WHERE id = $1", [room_id]).then(function (results) {
            if (results.rowCount != 1) {
                client[1]();
                return res.status(400).json({ errors: "That room does not exist" });
            }
            return client[0].query("INSERT INTO polls (room, question) VALUES ($1, $2) RETURNING id", [room_id, question])
            .then(function (results) {
                var poll_id = results.rows[0].id;
                return Promise.all(answers.map(function (answer) {
                    return client[0].query("INSERT INTO poll_answers (poll, answer) VALUES ($1, $2)", [poll_id, answer]);
                }));
            })
            .then(function () {
                client[1]();
                return res.json({});
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});


router.post('/:room_id/close', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkParams('room_id', 'Room ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors }); //oh no! something must be missing!
    }

     var room_id = req.params.room_id;
     var user_id = req.user.id;

    //check if the room exists
    database().then(function (client) {
        return client[0].query(
            'SELECT * FROM chat_rooms WHERE id = $1',
            [room_id]
        )
        .then(function (results) {
            if (results.rowCount != 1) {
                client[1]();
                return res.status(404).json({errors: [{param: 'room_id', msg: 'Chat room not found', value: room_id}]});
            }
            //check if the user that holds the room is trying to delete it
            return client[0].query(
                'SELECT end_timestamp FROM chat_rooms '+
                'WHERE invitation_list '+
                'IN (SELECT id FROM invitation_lists '+
                'WHERE presenter = $1) AND id = $2',
                [user_id, room_id]
            )
            .then(function (results) {
                //if the presenter does not own it, throw an error
                if (results.rowCount < 1) {
                    client[1]();
                    return res.status(400).json({errors: [{param: 'room_id', msg: "You don't own that room", value: room_id}]});
                }

                // If the room is already closed, return an error.
                if (results.rows[0].end_timestamp !== null) {
                    client[1]();
                    return res.status(400).json({errors: [{param: 'room_id', msg: 'Chat room already closed', value: room_id}]})
                }

                return client[0].query('UPDATE chat_rooms SET end_timestamp = $1 WHERE id = $2', [new Date(), room_id])
                .then(function () {
                    client[1]();
                    return res.json({});
                });
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

module.exports = router;
