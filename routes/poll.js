var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');
/* updated 11 20 2015
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
    var answer = req.body.answer;
    req.checkBody('answer', 'answer is missing').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).json({errors: errors});
    }
    //duplicate vote
    database.query("SELECT user_id FROM poll_votes WHERE user_id = $1",[userid]).then(function (results) {
        if (results.length > 0) {
            return res.status(404).json({});
         }}).then(function () {
            database.query("INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)", [poll_id, userid, answer]).then(function () {
            return res.send({});
         })
    }).catch(next); 
});

/* updated 11 20 2015
 * POST /polls/:poll_id/close
 * 
 * Close the poll identified with :poll_id.
 */
router.post('/:poll_id/close', auth.requireLevel('presenter'), function (req, res, next) {
    var poll_id = req.params.poll_id;
    if (isNaN(poll_id)) {
        console.log('This is not number');
        return res.status(400).json({error: 'not a number motherfucker'});
    }
    //check if this is a poll that exists, if not, 404
     database.query("SELECT id FROM polls WHERE id = $1", [poll_id]).then(function (results) {
        if (results.length == 0) {
            return res.status(404).json({});
        }}).then(function () {
            var endtimestamp = new Date();
            database.query("UPDATE polls SET end_timestamp = $1 WHERE id = $2", [endtimestamp, poll_id]).then(function () {
            return res.send({});
         })   
        }).catch(next);
});

module.exports = router;
