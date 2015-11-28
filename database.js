var pg = require('pg');
var util = require('util');
var Promise = require('bluebird');

var info = require('./database_info');

var infoString = util.format(
	'postgres://%s:%s@%s/%s',
	info.username,
	info.password,
	info.host,
	info.database);

pg.Client.prototype.query = Promise.promisify(pg.Client.prototype.query);

module.exports = Promise.promisify(pg.connect, { multiArgs: true }).bind(pg, infoString);
