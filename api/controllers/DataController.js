/* globals se_fa_gc_ns_op_u */

'use strict';



var aggregationDefaults = require('../../assets/data/aggregation_categories/defaults'),
    qwiCategoryUtils    = require('../../assets/data/utils/CategoryUtils'), 
    lodash              = require('lodash');



var tables = {
    rh_fa_gc_ns_op_u : true ,
    rh_fs_gc_ns_op_u : true ,

    sa_fa_gc_ns_op_u : true ,
    sa_fs_gc_ns_op_u : true ,

    se_fa_gc_ns_op_u : true ,
    se_fs_gc_ns_op_u : true ,
};


module.exports = {
      
    'info': function (req, res) {
        res.send( { 
            'TODO': 'This.',
        });
        return;
    },

    'waterline': function (req, res) {

        var table_name = req.params[0].split('/')[0],
            query      = req.body;

        if (!tables[table_name]) {
            res.send(500);
            return;
        }

        global[table_name].find(query)
                          .exec(function (error, data) {
                                    if (error) { res.send(500, error); }
                                    else { res.json(data); }
                          }); 
    },



    'total_measure_for_counties_in_state': function (req, res) {

        console.log('++> total_measure_for_counties_in_state');

        var stateGeoCode = req.params.geography && req.params.geography.trim(),
            measure      = req.params.measure,
            query;


        if (!(stateGeoCode && measure) || (stateGeoCode.length !== 2)) {
            res.send(500, {'ERROR': 'Must specify the QWI measure and the 2-digit state geography code.'});
            return;
        } 

        query = { select : [ 'geography', 'year', 'quarter', req.params.measure ],
                  where  : aggregationDefaults,
                };

        query.where.geo_level = 'C';
        query.where.geography = { 'startsWith' : stateGeoCode };

        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            console.log('+++> Responding.');

                            if (error) { res.send(500, error); }
                            else { res.json(data); }
                        });
    },



    'measure_by_quarter_for_geography': function (req, res) {

        console.log('++> measure_by_quarter_for_geography');

        var geography = req.params.geography && req.params.geography.trim(),
            measure   = req.params.measure,
            query;


        if (!geography || !measure) {
            res.send(500, {'ERROR': 'Must specify the QWI measure and the 2-digit state geography code.'});
            return;
        } 

        query = { select : [ 'geography', 'year', 'quarter', measure ],
                  where  : aggregationDefaults,
                };

        query.where.geography = geography;


        console.log(query);


        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            console.log('+++> Responding.');

                            if (error) { res.send(500, error); }
                            else { res.json(data); }
                        });
    },



    'measure_by_quarter_by_category_for_geography': function (req, res) {

        console.log('++> measure_by_quarter_by_category_for_geography');

        var params               = req.params,
            measure              = params.measure,
            geography            = params.geography.trim(), //TODO: Verify won't crash the server.
            categories           = params.category.split(','),

            geoLevel             = (params.geography.length <= 5) ? 'gc' :
                                        (params.geography.length < 8) ? 'gm' : 'gw',

            tableName,
            aggregated,
            selectClause,
            whereClause,
            query;


        if (!(geography && measure && categories.length)) {
            res.send(500, {'ERROR': 'Must specify the QWI measure and the 2-digit state geo code.'});
            return;
        } 


        tableName = qwiCategoryUtils.getRequiredTablePrefix(categories);

        if (!tableName) {
            res.send(500, {'ERROR': 'Invalid combination of categories.'});
            return;
        }

        tableName += '_' + geoLevel + '_ns_op_u';    



        categories   = categories.map(function(c) { return c.trim(); });

        selectClause = lodash.union([measure, 'geography', 'year', 'quarter'], categories);

        aggregated   = lodash.difference(Object.keys(aggregationDefaults), categories);

        whereClause  = lodash.pick(aggregationDefaults, aggregated);
        whereClause.geography = geography;

        query = { select : selectClause,
                  where  : whereClause,
                };


        console.log();
        console.log(tableName);
        console.log(query);
        console.log();

        global[tableName].find(query)
                         .sort('year')
                         .sort('quarter')
                         .exec(function (error, data) {
                             console.log('+++> Responding.');

                             if (error) { res.send(500, error); }
                             else { res.json(data); }
                         });
    },
};
