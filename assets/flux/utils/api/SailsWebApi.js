'use strict';

var ServerActionCreators = require('../../actions/ServerActionsCreator');


var d3 = require('d3');
    

module.exports = {

    'getTotalQuarterlyMeasureForAllCountiesInState' : function (query) {

        console.log('Server query result requested.');

        var url = '/employment/total/measure/' +
                  query.measure          +
                  '/all_counties/state/'       +
                  query.geography;

        d3.json(url, function(err,data) {

            console.log('Server query result obtained.');

            if (err) { throw err; }
            
            ServerActionCreators.handleQueryResult({ query: query, data: data });
        });

    },

};
