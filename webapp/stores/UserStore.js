var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var LoginStore = require('./LoginStore');

var request = require('superagent');


var _users = {};

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
        request
        .get('/users/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) {
                console.error(err);
                return;
            }

            res.body.forEach(function (user_id) {
                if (!_users.hasOwnProperty(user_id)) {
                    request
                    .get('/users/' + user_id + '/')
                    .auth(LoginStore.getEmail(), LoginStore.getPassword())
                    .end(function (err, res) {
                        if (err) {
                            console.error(err);
                            console.dir(res);
                            return;
                        }
                        _users[user_id] = res.body;
                        UserStore.emitChange();
                    });
                }
            });
        });

        return Object.keys(_users);
    },

    getUser: function (user_id) {

        if (_users.hasOwnProperty(user_id)) {
            return _users[user_id];
        }
        else {
            request
            .get('/users/' + user_id + '/')
            .auth(LoginStore.getEmail(), LoginStore.getPassword())
            .end(function (err, res) {
                if (err) {
                    console.error(err);
                    console.dir(res);
                    return;
                }
                _users[user_id] = res.body;
                UserStore.emitChange();
            });

            return null;
        }
    }
});

Dispatcher.register(function (action) {
    switch (action.type) {
    }
});

module.exports = UserStore;
