var express = require('express');
var router = express.Router();
var auth = require('../auth');

/* albert was here 
 * GET /users/:user_id/
 * 
 * Returns all information for the user identified by :user_id.
 */
router.get('/:user_id/', auth.requireLevel('logged_in'), function (req, res, next) {
    var user_id = req.params.user_id;
    res.send('Not yet implemented');
});

module.exports = router;
