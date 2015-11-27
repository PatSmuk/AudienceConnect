var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;

var users = {};

var UserStore = Object.assign({}, EventEmitter.prototype, {
    getUser: function (user_id) {
        if (users.hasOwnProperty(user_id)) {
            return users[user_id];
        }
        // Do the API fetch here.
        return { loading: true };
    }
});

Dispatcher.register(function (action) {
});

module.exports = UserStore;
