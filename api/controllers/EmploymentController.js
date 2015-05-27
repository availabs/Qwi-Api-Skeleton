var _ = require('lodash');


var tables = {
    se_fa_gc_ns_op_u: true
};

module.exports = {
      
    'info': function (req, res) {
        res.send( { 
            'latest_total': 'Latest total employment figure.'
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
                                    if (error) res.send(500, error);
                                    else res.json(data); });
    },

    'employment_by_geography': function (req, res) {

        var query = {
            sum           : 'emp',
            where         : {
                year      : 2014,
                quarter   : 1,
                sex       : '0',
                education : 'E0',
                industry  : '00',
                firmage   : '0',
            },
        };

        if (req.params.geography) {
            query.where.geography = req.params.geography;
            query.groupBy         = ['geography'];
        } else {
            query.where.geo_level = 'S';
            query.groupBy         = ['geo_level'];
        }

        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            if (error) {
                                console.log(error);
                                res.send(500, error);
                            }

                            res.json(data);
                        });
    },



    'employment_for_counties_in_state': function (req, res) {

        console.log("++> employment_by_geography");

        var validParams = ['sex', 'education', 'geography', 'firmage', 'industry'],

            query       = { sum    : 'emp',
                            where  : {},
                            groupBy: _.intersection(Object.keys(req.params), validParams), };


        if (!req.params.geography) {
            res.send(500, {'ERROR': "Must specify the 2-digit state FIPS code."});
            return;
        } 

        query.where.geography = {'startsWith': req.params.geography },
        query.where.geo_level = 'C';

        query.where.year      = req.params.year       || 2014  ;
        query.where.quarter   = req.params.quarter    ||   1   ;
        query.where.sex       = req.params.sex        ||  '0'  ;
        query.where.education = query.where.education ||  'E0' ;
        query.where.industry  = req.params.industry   ||  '00' ;
        query.where.firmage   = req.params.firmage    ||  '0'  ;
        
        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            if (error) res.send(500, error);
                            else res.json(data);
                        });
    },



    'new_hires_by_sector': function (req, res) {

        console.log("++> new_hires_by_sector");

        var county,
            query;
        
        county = req.params.geography && req.params.geography.replace(/ /g,'');

        if (!county || county.length != 5) {
            res.send(500, {'ERROR': "Must specify a 5-digit county FIPS code."});
            return;
        } 

        query = { select : ['year', 'quarter', 'industry', 'hira'],
                  where  : { 'sex'       : '0' ,
                             'education' : 'E0',
                             'firmage'   : '0' ,
                             'ind_level' : 'S' , 
                             'geography' : county, }, };


        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            if (error) res.send(500, error);
                            else res.json(data);
                        });
    },
};
