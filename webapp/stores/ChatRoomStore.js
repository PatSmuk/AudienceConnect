var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var LoginStore = require('./LoginStore');


var _chatRooms = null;
var CHANGE_EVENT = 'change';

var ChatRoomStore = Object.assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getChatRooms: function () {
        if (_chatRooms) {
            return _chatRooms;
        }

        if (!LoginStore.getEmail() || !LoginStore.getPassword()) {
            console.log('Tried to fetch chat rooms before login. Possible bug.');
            return [];
        }

        request
        .get('/rooms/')
        .auth(LoginStore.getEmail(), LoginStore.getPassword())
        .end(function (err, res) {
            if (err) return;
            _chatRooms = res.body;
            ChatRoomStore.emitChange();
        });

        return [];
    }
});

Dispatcher.register(function (action) {
});

module.exports = ChatRoomStore;
