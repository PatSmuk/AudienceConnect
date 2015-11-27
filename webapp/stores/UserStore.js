var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var LoginStore = require('./LoginStore');

var request = require('superagent');


var _users = null;

var CHANGE_EVENT = 'change';

var UserStore = Object.assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getAll: function () {
        if (_users) {
            return Object.keys(_users);
        }

        request
        .get('/users/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                return;
            }

            _users = {};
            res.body.forEach(function (user_id) {
                request
                .get('/users/' + user_id + '/')
                .auth(LoginStore.getEmail(), LoginStore.getPassword())
                .end(function (err, res) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    _users[user_id] = res.body;
                    UserStore.emitChange();
                });
            });
        });

        return null;
    },

    getUser: function (user_id) {
        if (!_users) {
            UserStore.getAll();
            return null;
        }

        if (_users.hasOwnProperty(user_id)) {
            return _users[user_id];
        }

        return null;
    }
});

Dispatcher.register(function (action) {
    switch (action.type) {
    }
});

module.exports = UserStore;
