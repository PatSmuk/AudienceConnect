var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;


var _isLoggingIn = false;
var _isLoggedIn = false;
var _error = null;
var _email = null;
var _password = null;

var CHANGE_EVENT = 'change';

var LoginStore = Object.assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    isLoggingIn: function () {
        return _isLoggingIn;
    },

    isLoggedIn: function () {
        return _isLoggedIn;
    },

    getError: function () {
        return _error;
    },

    getEmail: function () {
        return _email;
    },

    getPassword: function () {
        return _password;
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.LOGIN: {
            _isLoggingIn = true;
            _isLoggedIn = false;
            _error = null;
            LoginStore.emitChange();
            break;
        }

        case ActionTypes.RECEIVE_LOGIN_RESPONSE: {
            var error = action.error;
            _isLoggingIn = false;
            _isLoggedIn = !error;

            if (!error) {
                _isLoggedIn = true;
                _error = null;
            }
            else {
                _isLoggingIn = false;

                 if (error.status == 401) {
                    _error = 'Invalid email or password.';
                }
                else if (error.status >= 500 && error.status < 600) {
                    _error = 'Internal server error.';
                }
                else {
                    _error = 'Unknown error: ' + error.message;
                }
            }

            LoginStore.emitChange();
            break;
        }
    }
});


module.exports = LoginStore;
