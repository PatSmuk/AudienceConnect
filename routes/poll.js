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
    var poll_id = req.params.poll_id;
    var userid = req.user.id;
    var answer = parseInt(req.body.answer, 10);

    req.checkBody('answer', 'answer is missing').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({ errors: errors });
    }

    // Check that the poll exists and is open.
    database.query("SELECT end_timestamp FROM polls WHERE id = $1", [poll_id])
    .then(function (results) {
        if (results.length == 0)
            return res.status(404).json({ error: "Poll "+poll_id+" not found" });

        if (results[0].end_timestamp != null)
            return res.status(400).json({ error: "Poll "+poll_id+" has been closed" });

        // Check that they have access to the poll.
        return database.query(
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
            results.forEach(function (row) {
                if (row.user === userid)
                    allowed = true;
            });
            if (!allowed) {
                return res.status(404).json({ error: "Poll "+poll_id+" not found" });
            }

            // Make sure they haven't voted yet.
            return database.query("SELECT user_id FROM poll_votes WHERE user_id = $1 AND poll = $2", [userid, poll_id])
            .then(function (results) {
                if (results.length > 0) {
                    return res.status(400).json({ error: "You've already voted" });
                }

                // Make sure the answer is valid.
                return database.query("SELECT id FROM poll_answers WHERE poll = $1", [poll_id])
                .then(function (results) {
                    var validAnswer = false;
                    results.forEach(function (row) {
                        if (row.id === answer)
                            validAnswer = true;
                    });

                    if (!validAnswer) {
                        return res.status(400).json({ error: "The answer given is not one of the poll's answers" });
                    }

                    return database.query("INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)", [poll_id, userid, answer])
                    .then(function () {
                        return res.send({});
                    });
                });
            });
        });
    })
    .catch(next);
});

/*
 * POST /polls/:poll_id/close
 *
 * Close the poll identified with :poll_id.
 */
router.post('/:poll_id/close', auth.requireLevel('presenter'), function (req, res, next) {
    var poll_id = parseInt(req.params.poll_id, 10);
    var userid = req.user.id;

    // Check that the poll exists hasn't already been closed.
    database.query("SELECT end_timestamp FROM polls WHERE id = $1", [poll_id])
    .then(function (results) {
        if (results.length == 0)
            return res.status(404).json({ error: "Poll "+poll_id+" not found" });

        if (results[0].end_timestamp != null)
            return res.status(400).json({ error: "Poll "+poll_id+" has already been closed" })

        // Check that they have access to the poll.
        return database.query(
            " SELECT presenter FROM invitation_lists WHERE id = (       " +
            "     SELECT invitation_list FROM chat_rooms WHERE id = (   " +
            "         SELECT room FROM polls WHERE id = $1              " +
            "     )                                                     " +
            " )                                                         ",
            [poll_id]
        )
        .then(function (results) {
            if (results[0].presenter != userid) {
                return res.status(404).json({ error: "Poll "+poll_id+" not found" });
            }

            return database.query("UPDATE polls SET end_timestamp = $1 WHERE id = $2", [new Date(), poll_id])
            .then(function () {
                return res.send({});
            });
        });
    })
    .catch(next);
});

module.exports = router;
