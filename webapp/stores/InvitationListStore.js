var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;
var EventEmitter = require('events').EventEmitter;
var request = require('superagent');
var LoginStore = require('./LoginStore');


var _invitationLists = [];
var CHANGE_EVENT = 'change';

var InvitationListStore = Object.assign({}, EventEmitter.prototype, {

    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },

    getInvitationLists: function () {
        return _invitationLists;
    }
});


Dispatcher.register(function (action) {

    switch (action.type) {

        case ActionTypes.RECEIVE_INVITATION_LISTS: {
            _invitationLists = action.invitationLists;
            InvitationListStore.emitChange();
            break;
        }
    }
});

module.exports = InvitationListStore;
