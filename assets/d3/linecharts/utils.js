'use strict';

var d3     = require('d3'),
    lodash = require('lodash');



var parseDate      = d3.time.format("%m-%Y").parse,
    quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' },
    monthToQuarter = lodash.invert(quarterToMonth);


function parseQuarterToDate (quarter, year) {
    return parseDate(quarterToMonth[quarter] + '-' + year);
}


function parseDateToQuarterYear (date) {
    return 'Q' + monthToQuarter[('0' + (date.getMonth()+1)).slice(-2)] +'-'+  (date.getYear() + 1900);
}


function initByQuarterLineChartBasics (theChart) {

    var margin = lodash.assign( { top:0, right:0, bottom:0, left:0 }, theChart.margin ),
        width  = (theChart.width || 1600) - margin.right - margin.left,
        height = (theChart.height || 900) - margin.top   - margin.bottom;


    theChart._x = d3.time.scale().range([0, width]);

    theChart._y = d3.scale.linear().range([height, 0]);


    theChart._xAxis = d3.svg.axis()
                        .scale(theChart._x)
                        .orient("bottom")
                        .innerTickSize(-height)
                        .tickPadding(margin.bottom / 2.0);

    theChart._yAxis = d3.svg.axis()
                        .scale(theChart._y)
                        .orient("left")
                        .innerTickSize(-width);

    theChart._line  = d3.svg.line()
                        .x(function(d) { return theChart._x(d.key); })
                        .y(function(d) { return theChart._y(d.value); });
}



module.exports = {
    parseDate                    : parseDate,
    quarterToMonth               : quarterToMonth,
    monthToQuarter               : monthToQuarter,
    parseQuarterToDate           : parseQuarterToDate,
    parseDateToQuarterYear       : parseDateToQuarterYear,
    initByQuarterLineChartBasics : initByQuarterLineChartBasics,
};
