'use strict';



var d3 = require('d3');

    

var ActionCreators = require('../../actions/ActionsCreator');



// TODO: Try this instead...
// https://github.com/mbostock/d3/wiki/Requests#on

function queryTheServer (query, url) {
    d3.json(url, function(err,data) {

        if (err) { throw err; }
        
        query.data = data;
        ActionCreators.handleServerQueryResponse(query);
    });
}


module.exports = {

    'getMeasureForAllCountiesInState' : function (query) {

        var url = '/employment/total/measure/' +
                  query.measure          +
                  '/all_counties/state/'       +
                  query.geography;

        queryTheServer(query, url);
    },


    'getMeasureByQuarterForGeography' : function (query) {

        var url = '/measure/'      +
                  query.measure    +
                  '/geography/'    +
                  query.geography;

        queryTheServer(query, url);
    },


    'getMeasureByQuarterByCategoryForGeography' : function (query) {

        var url = '/measure/'      +
                  query.measure    +
                  '/byCategory/'   +
                  query.category   +
                  '/geography/'     +
                  query.geography;

        queryTheServer(query, url);
    },
};
