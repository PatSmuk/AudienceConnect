var express = require('express');
var router = express.Router();
var auth = require('../auth');
var database = require('../database');

/* albert was here 
 * GET /users/:user_id/
 * 
 * Returns all information for the user identified by :user_id.
 */
router.get('/:user_id/', auth.requireLevel('logged_in'), function (req, res, next) {
    var user_id = req.params.user_id;
    
    //return 404 if the user doesn't exist
    database.query("SELECT id FROM users WHERE id = $1", [user_id]).then(function (results) {
        if (results.length == 0) {
            console.log("LOLOOLOLOLOOLLOLO");
            return res.status(404).json({ error: 'FUCK UR SHIT NIGGA' });
        }}).then(function () {
        database.query("SELECT id, verified, presenter, email, password_hash, student_id FROM users WHERE id = $1", [user_id]).then(function (results) {
            return res.send({});
        })
    }).catch(next);
    
    //res.send('Not yet implemented');
});

module.exports = router;