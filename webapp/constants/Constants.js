var keyMirror = require('keymirror');

module.exports = {
    ActionTypes: keyMirror({
        LOGIN: null,
        RECEIVE_LOGIN_SUCCESS: null,
        RECEIVE_LOGIN_ERROR: null,
        RECEIVE_CHAT_ROOMS: null,
        RECEIVE_INVITATION_LISTS: null,
        RECEIVE_INVITATION_LIST: null,
        RECEIVE_CHAT_MESSAGES: null
    })
};
