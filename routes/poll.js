var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');

/*
 * POST /polls/:poll_id/vote
 *
 * Submits a vote in the poll identified with :poll_id.
 *
 * Parameters:
 *  - answer: the ID of the answer you wish to vote for
 */
router.post('/:poll_id/vote', auth.requireLevel('logged_in'), function (req, res, next) {
    req.checkBody('answer', 'Answer is required and must be an ID').isInt();
    req.checkParams('poll_id', 'Poll ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var poll_id = req.params.poll_id;
    var userid = req.user.id;
    var answer = req.body.answer;

    // Check that the poll exists and is open.
    database().then(function (client) {
        return client[0].query("SELECT end_timestamp FROM polls WHERE id = $1", [poll_id])
        .then(function (results) {
            if (results.rowCount == 0) {
                client[1]();
                return res.status(404).json({ error: "Poll "+poll_id+" not found" });
            }

            if (results.rows[0].end_timestamp != null) {
                client[1]();
                return res.status(400).json({ error: "Poll "+poll_id+" has been closed" });
            }

            // Check that they have access to the poll.
            return client[0].query(
                " WITH list AS (                                                " +
                "     SELECT id, presenter FROM invitation_lists WHERE id = (   " +
                "         SELECT invitation_list FROM chat_rooms WHERE id = (   " +
                "             SELECT room FROM polls WHERE id = $1              " +
                "         )                                                     " +
                "     )                                                         " +
                " )                                                             " +
                " SELECT audience_member AS user                                " +
                " FROM invitation_list_members                                  " +
                " WHERE invitation_list = (SELECT id FROM list)                 " +
                " UNION                                                         " +
                " SELECT presenter FROM list                                    ",
                [poll_id]
            )
            .then(function (results) {
                var allowed = false;
                results.rows.forEach(function (row) {
                    if (row.user === userid)
                        allowed = true;
                });
                if (!allowed) {
                    client[1]();
                    return res.status(404).json({ error: "Poll "+poll_id+" not found" });
                }

                // Make sure they haven't voted yet.
                return client[0].query("SELECT user_id FROM poll_votes WHERE user_id = $1 AND poll = $2", [userid, poll_id])
                .then(function (results) {
                    if (results.rowCount > 0) {
                        client[1]();
                        return res.status(400).json({ error: "You've already voted" });
                    }

                    // Make sure the answer is valid.
                    return client[0].query("SELECT id FROM poll_answers WHERE poll = $1", [poll_id])
                    .then(function (results) {
                        var validAnswer = false;
                        results.rows.forEach(function (row) {
                            if (row.id === answer)
                                validAnswer = true;
                        });

                        if (!validAnswer) {
                            client[1]();
                            return res.status(400).json({ error: "The answer given is not one of the poll's answers" });
                        }

                        return client[0].query("INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)", [poll_id, userid, answer])
                        .then(function () {
                            client[1]();
                            return res.send({});
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
 * POST /polls/:poll_id/close
 *
 * Close the poll identified with :poll_id.
 */
router.post('/:poll_id/close', auth.requireLevel('presenter'), function (req, res, next) {
    req.checkParams('poll_id', 'Poll ID is required and must be an ID').isInt();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    var poll_id = req.params.poll_id;
    var userid = req.user.id;

    // Check that the poll exists hasn't already been closed.
    database().then(function (client) {
        return client[0].query("SELECT end_timestamp FROM polls WHERE id = $1", [poll_id])
        .then(function (results) {
            if (results.rowCount == 0) {
                client[1]();
                return res.status(404).json({ error: "Poll "+poll_id+" not found" });
            }

            if (results.rows[0].end_timestamp != null) {
                client[1]();
                return res.status(400).json({ error: "Poll "+poll_id+" has already been closed" })
            }

            // Check that they have access to the poll.
            return client[0].query(
                " SELECT presenter FROM invitation_lists WHERE id = (       " +
                "     SELECT invitation_list FROM chat_rooms WHERE id = (   " +
                "         SELECT room FROM polls WHERE id = $1              " +
                "     )                                                     " +
                " )                                                         ",
                [poll_id]
            )
            .then(function (results) {
                if (results.rows[0].presenter != userid) {
                    client[1]();
                    return res.status(404).json({ error: "Poll "+poll_id+" not found" });
                }

                return client[0].query("UPDATE polls SET end_timestamp = $1 WHERE id = $2", [new Date(), poll_id])
                .then(function () {
                    client[1]();
                    return res.send({});
                });
            });
        })
        .catch(function (err) { client[1](); throw err; });
    })
    .catch(next);
});

module.exports = router;
