var express = require('express');
var router = express.Router();

/*
 * POST /polls/:poll_id/vote
 * 
 * Submits a vote in the poll identified with :poll_id.
 *
 * Parameters:
 *  - answer: the ID of the answer you wish to vote for
 */
router.post('/:poll_id/vote', function (req, res, next) {
    var poll_id = req.params.poll_id;
    res.send('Not yet implemented');
});

/*
 * POST /polls/:poll_id/close
 * 
 * Close the poll identified with :poll_id.
 */
router.post('/:poll_id/close', function (req, res, next) {
    var poll_id = req.params.poll_id;
    res.send('Not yet implemented');
});

module.exports = router;
