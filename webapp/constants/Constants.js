var keyMirror = require('keymirror');

module.exports = {
    ActionTypes: keyMirror({
        LOGIN: null,
        RECEIVE_LOGIN_SUCCESS: null,
        RECEIVE_LOGIN_ERROR: null,
        RECEIVE_CHAT_ROOMS: null,
        RECEIVE_INVITATION_LISTS: null,
        RECEIVE_INVITATION_LIST: null,
        RECEIVE_CHAT_MESSAGES: null,
        RECEIVE_POLLS: null,
        RECEIVE_REGISTRATION_SUCCESS: null,
        RECEIVE_REGISTRATION_ERROR: null
    })
};
