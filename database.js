var pg = require('pg');
var util = require('util');

var info = require('./database_info');

var infoString = util.format(
	'postgres://%s:%s@%s/%s', 
	info.username, 
	info.password, 
	info.host, 
	info.database);

module.exports.getClient = function (callback) {
	pg.connect(infoString, callback);
}
