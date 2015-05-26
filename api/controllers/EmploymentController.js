var util = require('util');

var charTypeColumns = {
    'periodicity' : true,
    'seasonadj'   : true,
    'geo_level'   : true,
    'geography'   : true,
    'ind_level'   : true,
    'industry'    : true,
    'ownercode'   : true,
    'sex'         : true,
    'agegrp'      : true,
    'race'        : true,
    'ethnicity'   : true,
    'education'   : true,
    'firmage'     : true,
    'firmsize'    : true
};


function asArray (data) {
    return ( data.constructor === Array ) ? data : [data];
}

function wrap(columnName, value) {
    return (columnName in charTypeColumns) ? "'" + value + "'" : value;
}

function arrayToSQLInList (columnName, arr) {
    var inListString = '( ',
        i;

    for (i=0; i < arr.length; ++i) {
        inListString  += (i ? ', ' : '') + wrap(columnName, arr[i]);
    }

    inListString += ' )';
    return inListString;
}

function generateWhereSubclause(columnName, values) {

    if (values.constructor === Array) {
        return columnName + ' IN ' + arrayToSQLInList(columnName, values);
    } 

    return columnName + ' = ' + wrap(columnName, values);
}

module.exports = {

    'test': function (req, res) {

        var routeParams,
            bodyParams;

        var table,
            query,
            whereClause,
            whereColumns;

        var i, c;

        routeParams = req.params[0].split('/');

        table = routeParams.shift();

        bodyParams   = req.body;
        whereColumns = Object.keys(bodyParams);

        query = "SELECT " + routeParams.join(', ') + '\nFROM ' + table;

        if (whereColumns.length) {
            whereClause = "\nWHERE";

            for (i=0; i < whereColumns.length; ++i) {
                c = whereColumns[i];

                whereClause += (i ? '\nAND' : '') + '\n\t'+ generateWhereSubclause(c, bodyParams[c]);
            } 

            query += whereClause;
        }
       
        query += ';';

        ApiSkeleton.query(query, {}, function (error, data) {
            if (error) {
                res.send("{ status: 'error:' + error + ''}", 500);
                return;
            } 
            res.json(data);
        });
    },

    //var obj    = {},
        //nester = obj;

    //for (i=0; i < routeParams.length; ++i) {
        //nester[routeParams[i]] = {};
        //nester = nester[routeParams[i]];
    //}
    //nester = null;


    //console.log(obj)
        
    'info': function (req, res) {
        res.send( { 
            'latest_total': 'Latest total employment figure.'
        });
        return;
    },

    // This one was just to refresh my SQL skills.
    'latest_total':  function (req, res) {
        var query  = '  SELECT o.year, o.quarter, SUM(emp)                     ' +
                     '  FROM   qwi o                                           ' +
                     '  INNER JOIN (                                           ' +
                     '      SELECT year, MAX(quarter) as quarter               ' +
                     '      FROM   qwi                                         ' +
                     '      WHERE  year = ( SELECT MAX(year)                   ' +
                     '                      FROM qwi )                         ' +
                     '      GROUP BY year) i                                   ' +
                     '  ON o.year = i.year AND o.quarter = i.quarter           ' +
                     '  /* Next line just to get year and quarter in output. */' +
                     '  GROUP BY o.year, o.quarter;                            ';

        ApiSkeleton.query(query, {}, function (error, data) {
            if (error) {
                res.send("{ status: 'error:' + error + ''}", 500);
                return;
            } 
            res.json(data);
        });
    },

    // This one was just to refresh my SQL skills.
    'counties':  function (req, res) {
        var query  = '  SELECT o.year, o.quarter, SUM(emp)                     ' +
                     '  FROM   qwi o                                           ' +
                     '  INNER JOIN (                                           ' +
                     '      SELECT year, MAX(quarter) as quarter               ' +
                     '      FROM   qwi                                         ' +
                     '      WHERE  year = ( SELECT MAX(year)                   ' +
                     '                      FROM qwi )                         ' +
                     '      GROUP BY year) i                                   ' +
                     '  ON o.year = i.year AND o.quarter = i.quarter           ' +
                     '  /* Next line just to get year and quarter in output. */' +
                     '  GROUP BY o.year, o.quarter;                            ';

        ApiSkeleton.query(query, {}, function (error, data) {
            if (error) {
                res.send("{ status: 'error:' + error + ''}", 500);
                return;
            } 
            res.json(data);
        });
    }
};
