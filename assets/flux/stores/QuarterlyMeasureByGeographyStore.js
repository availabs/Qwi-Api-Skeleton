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
    return  qObj.description + '_' + 
            qObj.geography   + '_' + 
            qObj.measure     + 
            (qObj.category ? ('_' + qObj.category) : '');
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


    'getMeasureForAllCountiesInState': function (query) {
        query.description = 'getMeasureForAllCountiesInState';

        return this._handleQuery(query);
    },

    'getMeasureByQuarterForGeography': function (query) {
        query.description = 'getMeasureByQuarterForGeography';

        return this._handleQuery(query);
    },


    'getMeasureByQuarterByCategoryForGeography': function (query) {
        query.description = 'getMeasureByQuarterByCategoryForGeography';

        return this._handleQuery(query);
    },



    '_handleQuery': function (query) {
    
        var stringifiedQuery = _stringifyQueryObject(query);
        
        //TODO: This should just do one thing.
        //      Hand-off to handleQueryResult if cached.
        if (_data[stringifiedQuery]) {
            return _data[stringifiedQuery];
        } else {
            SailsWebApi[query.description](query);
            return null;
        }
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
