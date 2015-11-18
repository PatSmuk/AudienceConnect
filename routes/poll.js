var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');

/* albert was here #2
 * POST /polls/:poll_id/vote
 * 
 * Submits a vote in the poll identified with :poll_id.
 *
 * Parameters:
 *  - answer: the ID of the answer you wish to vote for
 */
router.post('/:poll_id/vote', auth.requireLevel('logged_in'), function (req, res, next) {

    //var poll_id = req.body.poll_id;
    var poll_id = req.params.poll_id;
    var userid = req.user.id;
    var answer = req.body.answer;
    
    /*
    database.query("INSERT INTO poll_votes (poll, user_id, answer) VALUES (3000, 4, 12312321)").then(function (results) {
        return res.send(results);
    }).catch(next);     
    */
    
    //res.send("$1, $2, $3", [poll_id, userid, answer]);
    

    database.query("INSERT INTO poll_votes (poll, user_id, answer) VALUES ($1, $2, $3)", [poll_id, userid, answer]).then(function () {
        return res.send({});
    }).catch(next);   
    
    //res.send('Not yet implemented');
});

/*
 * POST /polls/:poll_id/close
 * 
 * Close the poll identified with :poll_id.
 */
router.post('/:poll_id/close', auth.requireLevel('presenter'), function (req, res, next) {
    var poll_id = req.body.poll_id;
   
  
    database.query("DELETE FROM polls WHERE id=($1)", [poll_id]).then(function () {
        return res.send({});
    }).catch(next);   
    //res.send('Not yet implemented'); 
});

module.exports = router;
