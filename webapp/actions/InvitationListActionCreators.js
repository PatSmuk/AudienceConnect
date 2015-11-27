var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/Constants').ActionTypes;

var request = require('superagent');

var InvitationListActionCreators = {

    fetchInvitationLists: function (email, password) {
        request
        .get('/invitationLists/')
        .auth(email, password)
        .end(function (err, res) {
            if (err) {
                console.error(err);
                return;
            }
            InvitationListActionCreators.receiveInvitationLists(res.body);
        });
    },

    receiveInvitationLists: function (invitationLists) {
        Dispatcher.dispatch({
            type: ActionTypes.RECEIVE_INVITATION_LISTS,
            invitationLists: invitationLists
        });
    }
};

module.exports = InvitationListActionCreators;
