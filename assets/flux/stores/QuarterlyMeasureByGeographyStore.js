"use strict";



var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants     = require('../constants/Constants.js'),
    EventEmitter  = require('events').EventEmitter,
    SailsWebApi   = require('../utils/api/SailsWebApi.js'),
    assign        = require('object-assign');



var ActionTypes = Constants.ActionTypes;

var QUERY_RESPONSE_READY = Constants.EventTypes.QUERY_RESPONSE_READY;



var _data = {};



function _stringifyQueryObject (qObj) {
    return qObj.description + '_' + qObj.geography + '_' + qObj.measure;
}



var thisStore = assign({}, EventEmitter.prototype, {
    
    'emitQueryResponseReadyEvent': function(queryResult) {
        this.emit(QUERY_RESPONSE_READY, queryResult);
    },

    'registerQueryResultReadyListener': function(callback) {
        this.on(QUERY_RESPONSE_READY, callback);
    },

    'removeQueryResultReadyListener': function(callback) {
        this.removeListener(QUERY_RESPONSE_READY, callback);
    },

    '_handleQuery': function (query) {
    
        var stringifiedQuery = _stringifyQueryObject(query);
        
        if (_data[stringifiedQuery]) {
            console.log('Using stored data.');
            return _data[stringifiedQuery];
        } else {
            console.log('Retrieving data from the server.');
            SailsWebApi[query.description](query);
            return null;
        }
    },

    'getMeasureForAllCountiesInState': function (query) {
        query.description = 'getMeasureForAllCountiesInState';

        return this._handleQuery(query);
    },

    'getMeasureByQuarterForGeography': function (query) {
        query.description = 'getMeasureByQuarterForGeography';

        return this._handleQuery(query);
    },


    'handleQueryResult': function (query) {
        var stringifiedQuery = _stringifyQueryObject(query);

        _data[stringifiedQuery] = query.data;

        this.emitQueryResponseReadyEvent(query);
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
