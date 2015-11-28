var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;


var _isLoggedIn = false;
var _error = null;
var _email = null;
var _password = null;
var _user = null;
var _registrationSuccessful = false;

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
    },

    getUser: function () {
        return _user;
    },
    
    isRegistrationSuccessful: function () {
        return _registrationSuccessful;
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_LOGIN_SUCCESS: {
            _isLoggedIn = true;
            _error = null;
            _email = action.email;
            _password = action.password;
            _user = action.user;
            _registrationSuccessful = false;

            LoginStore.emitChange();
            break;
        }

        case ActionTypes.RECEIVE_LOGIN_ERROR: {
            var error = action.error;
            _isLoggedIn = false;
            _email = null;
            _password = null;
            _user = null;
            _registrationSuccessful = false;

            if (error.status == 401) {
                _error = 'Invalid email or password.';
            }
            else if (error.status >= 500 && error.status < 600) {
                _error = 'Internal server error.';
            }
            else {
                _error = 'Unknown error: ' + error.message;
            }

            LoginStore.emitChange();
            break;
        }
        
        case ActionTypes.RECEIVE_REGISTRATION_SUCCESS: {
            _registrationSuccessful = true;
            LoginStore.emitChange();
            break;
        }
        
        case ActionTypes.RECEIVE_REGISTRATION_ERROR: {
            _registrationSuccessful = false;
            error = action.error;
            if (error.status == 400) {
                _error = 'Email is invalid or in use.';
            }
            else if (error.status >= 500 && error.status < 600) {
                _error = 'Internal server error.';
            }
            else {
                _error = error.message;
            }
            
            LoginStore.emitChange();
            break;
        }
    }
});


module.exports = LoginStore;
