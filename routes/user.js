var express = require('express');
var router = express.Router();

/*
 * GET /users/:user_id/
 * 
 * Returns all information for the user identified by :user_id.
 */
router.get('/:user_id/', function (req, res, next) {
    var user_id = req.params.user_id;
    res.send('Not yet implemented');
});

module.exports = router;
