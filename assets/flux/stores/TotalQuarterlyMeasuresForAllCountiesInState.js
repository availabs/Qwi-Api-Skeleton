"use strict";



var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants     = require('../constants/Constants.js'),
    EventEmitter  = require('events').EventEmitter,
    SailsWebApi   = require('../utils/api/SailsWebApi.js'),
    assign        = require('object-assign');



var ActionTypes = Constants.ActionTypes;

var QUERY_REPONSE_READY = Constants.EventTypes.QUERY_REPONSE_READY;



var _data = {};



function _stringifyQueryObject (qObj) {
    return qObj.geography + '_' + qObj.measure;
}



var thisStore = assign({}, EventEmitter.prototype, {
    
    'emitQueryReponseReadyEvent': function(queryResult) {
        this.emit(QUERY_REPONSE_READY, queryResult);
    },

    'registerQueryResultReadyListener': function(callback) {
        this.on(QUERY_REPONSE_READY, callback);
    },

    'removeQueryResultReadyListener': function(callback) {
        this.removeListener(QUERY_REPONSE_READY, callback);
    },


    'query': function (query) {
        var stringifiedQuery = _stringifyQueryObject(query);

        console.log("==> theStore.query()");

        if (_data[stringifiedQuery]) {
            return _data[stringifiedQuery];
        } else {
            SailsWebApi.getTotalQuarterlyMeasureForAllCountiesInState(query);
            return null;
        }
    },

    'handleQueryResult': function (queryResult) {
        var stringifiedQuery = _stringifyQueryObject(queryResult.query);

        _data[stringifiedQuery] = queryResult.data;

        this.emitQueryReponseReadyEvent(queryResult);
    },

});



thisStore.dispatchToken = AppDispatcher.register(function(payload) {

  switch(payload.type) {

    case ActionTypes.HANDLE_SERVER_QUERY_RESPONSE:
        thisStore.handleQueryResult(payload.queryResult);
        break;

    default:
  }
});



module.exports = thisStore;
