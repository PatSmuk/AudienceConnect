var keyMirror = require('keymirror');

module.exports = {
    ActionTypes: keyMirror({
        LOGIN: null,
        RECEIVE_LOGIN_SUCCESS: null,
        RECEIVE_LOGIN_ERROR: null
    })
};
