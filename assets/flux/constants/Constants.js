"use strict";

var keyMirror = require('keymirror');

module.exports = {

    ActionTypes: keyMirror({
        HANDLE_SERVER_QUERY_RESPONSE : null,
    }),

    EventTypes: keyMirror({
        QUERY_RESPONSE_READY : null,
    }),

};
