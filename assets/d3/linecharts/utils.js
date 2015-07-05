'use strict';

var React  = require('react'),
    d3     = require('d3'),
    lodash = require('lodash');



var parseDate      = d3.time.format("%m-%Y").parse,

    quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' },

    monthToQuarter = lodash.invert(quarterToMonth);


function parseQuarterToDate (quarter, year) {
    return parseDate(quarterToMonth[quarter] + '-' + year);
}

function parseDateToQuarterYear (date) {
    return 'Q' + monthToQuarter[('0' + (date.getMonth() + 1)).slice(-2)] + '-' +  (date.getYear() + 1900);
}



module.exports = {

    parseDate              : parseDate,

    quarterToMonth         : quarterToMonth,

    monthToQuarter         : monthToQuarter,

    parseQuarterToDate     : parseQuarterToDate,

    parseDateToQuarterYear : parseDateToQuarterYear,


    // Must bind React component's `this` to the following function.
    'initByQuarterBasics' : function () {

        var theSVG = React.findDOMNode(this.refs.theSVG),
            margin = this.props.margin,
            that   = this;

    
        var width  = theSVG.offsetWidth -
                     margin.right       -
                     margin.left,

            height = this.props.height  -
                     margin.top         -
                     margin.bottom;


        this._x = d3.time.scale().range([0, width]);

        this._y = d3.scale.linear().range([height, 0]);


        this._xAxis = d3.svg.axis()
                            .scale(this._x)
                            .orient("bottom")
                            .innerTickSize(-height)
                            .tickPadding(margin.bottom / 2.0);


        this._yAxis = d3.svg.axis()
                            .scale(this._y)
                            .orient("left")
                            .innerTickSize(-width);

        this._line  = d3.svg.line()
                            .x(function(d) { return that._x(d.key); })
                            .y(function(d) { return that._y(d.value); });
    },
};
