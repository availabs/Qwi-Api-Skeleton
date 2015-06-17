'use strict';

var React = require('react'),
    d3    = require('d3');

module.exports = {

    'parseDate': d3.time.format("%m-%Y").parse,

    // Must bind React component's `this` to the following function.
    'initByQuarterBasics' : function () {

        var theSVG = React.findDOMNode(this.refs.theSVG),
            that   = this;
    
        var width  = theSVG.offsetWidth - this.props.margin.right - this.props.margin.left,
            height = this.props.height  - this.props.margin.top   - this.props.margin.bottom;


        this._x = d3.time.scale().range([0, width]);

        this._y = d3.scale.linear().range([height, 0]);


        this._xAxis = d3.svg.axis()
                            .scale(this._x)
                            .orient("bottom")
                            .innerTickSize(-height)
                            .tickPadding(this.props.margin.bottom / 2.0);


        this._yAxis = d3.svg.axis().scale(this._y).orient("left").innerTickSize(-width);


        this._line  = d3.svg.line()
                    .x(function(d) { return that._x(d.date); })
                    .y(function(d) { return that._y(d[that.props.measure]); });
    },
};
