"use strict";


var AppDispatcher = require('../dispatcher/AppDispatcher'),
    ActionTypes   = require('../constants/Constants').ActionTypes;


module.exports = {

    'voronoiMeasureByQuarterByCategegoryForGeographyMouseover' : function (mousedOverPoint) {
        AppDispatcher.dispatch( { 
            'type'  : ActionTypes.VORONOI_MQCG_MOUSEOVER,
            'point' : mousedOverPoint,
        });
    },

    'handleServerQueryResponse' : function (queryResult) {
        AppDispatcher.dispatch( { 
            'type'        : ActionTypes.HANDLE_SERVER_QUERY_RESPONSE,
            'queryResult' : queryResult,
        });
    },

};
