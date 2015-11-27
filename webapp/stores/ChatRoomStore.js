var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var LoginStore = require('./LoginStore');


var _chatRooms = [];
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
        return _chatRooms;
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_CHAT_ROOMS: {
            _chatRooms = action.chatRooms;
            ChatRoomStore.emitChange();
            break;
        }
    }
});

module.exports = ChatRoomStore;
