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

    'waterline_wrapper': function (req, res) {

        var table_name = req.params[0].split('/')[0],
            query      = req.body;

        if (!tables[table_name]) {
            res.send(500);
            return;
        }

        global[table_name].find(query)
                          .exec(function (error, data) {
                                    if (error) { res.send(500, error); }

                                    res.json(data);
                                });

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

    'employment_for_state_by_county_by_naics': function (req, res) {

        var query = {
            sum     : 'emp',
            where   : {
                        sex       : '0',
                        education : 'E0',
                        firmage   : '0',
                        industry  : {'!': '00' },
                        geography : {'startsWith': req.params.geography },
                      },
            groupBy : ['geography', 'industry'],
        };

        se_fa_gc_ns_op_u.find(query)
                        .exec(function (error, data) {
                            if (error) {
                                console.log(error);
                                res.send(500, error);
                            }

                            res.json(data);
                        });
    },
};
