'use strict';

var ServerActionCreators = require('../../actions/ServerActionsCreator');


var d3 = require('d3');
    

module.exports = {

    'getMeasureForAllCountiesInState' : function (query) {

        var url = '/employment/total/measure/' +
                  query.measure          +
                  '/all_counties/state/'       +
                  query.geography;

        d3.json(url, function(err,data) {

            console.log('Server query result obtained.');

            if (err) { throw err; }
            
            query.data = data;
            ServerActionCreators.handleQueryResult(query);
        });

    },

    'getMeasureByQuarterForGeography' : function (query) {

        var url = '/measure/'      +
                  query.measure    +
                  '/geography/'    +
                  query.geography;

        console.log(query);

        d3.json(url, function (error, data) {

            console.log('Server query result obtained.');

            if (error) { console.error(error); }
            
            query.data = data;
            ServerActionCreators.handleQueryResult(query);
        });

    },

    'getMeasureByQuarterByCategoryForGeography' : function (query) {

        var url = '/measure/'      +
                  query.measure    +
                  '/byCategory/'   +
                  query.category   +
                  '/geography/'     +
                  query.geography;

        console.log('getMeasureByQuarterByCategoryForGeography');

        d3.json(url, function (error, data) {

            console.log('Server query result obtained.');

            if (error) { console.error(error); }
            
            query.data = data;
            ServerActionCreators.handleQueryResult(query);
        });

    },

};
