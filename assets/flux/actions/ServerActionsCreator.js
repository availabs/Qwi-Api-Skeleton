"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    ActionTypes   = require('../constants/Constants').ActionTypes;


module.exports = {

    'handleQueryResult' : function (queryResult) {

        AppDispatcher.dispatch( { 
            'type'        : ActionTypes.HANDLE_SERVER_QUERY_RESPONSE,
            'queryResult' : queryResult,
        });
    },

};
