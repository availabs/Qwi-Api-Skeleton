/*jshint strict:false , unused:false */



var React = require('react'),
    d3    = require('d3');


/*========================================================================
 *
 * Props:
 *          width
 *          height
 *          margin.top, margin.right, margin.bottom, margin.left
 *          data
 *          measure
 *          measure_label
 *
 *========================================================================*/
var MeasureByQuarterLineChart = React.createClass({


    '_init' : function () {
        var that = this;
    
        this._x = d3.time.scale().range([0, this.props.width]);

        this._y = d3.scale.linear().range([this.props.height, 0]);


        this._xAxis = d3.svg.axis().scale(this._x).orient("bottom");


        this._yAxis = d3.svg.axis().scale(this._y).orient("left");


        this._line  = d3.svg.line()
                    .x(function(d) { return that._x(d.date); })
                    .y(function(d) { return that._y(d[that.props.measure]); });
    },

    '_parseDate' : d3.time.format("%m-%Y").parse,


    '_update' : function (nextProps) {

        var data    = nextProps.data,
            measure = nextProps.measure,
            svg     = d3.select(React.findDOMNode(this.refs.theG)),
            that    = this;

        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };


        data.forEach(function(d) {
            d.date = that._parseDate(quarterToMonth[d.quarter] +'-'+ d.year.toString());
            d[measure] = +d[measure];
        });


        // Clear the Visualization.
        svg.selectAll("*").remove();

        this._x.domain(d3.extent(data, function(d) { return d.date; }));
        this._y.domain(d3.extent(data, function(d) { return d[measure]; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + nextProps.height + ")")
            .call(this._xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(this._yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(nextProps.measure_label);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", this._line);
    },


    'componentDidMount' : function () { this._init(); },

    'shouldComponentUpdate' : function (nextProps, nextState) {
        if (this.props.data !== nextProps.data) {
            this._update(nextProps); 
        }

        return false;
    },

    'render' : function () {
        return (
            <svg width  = { this.props.width +
                            this.props.margin.left +
                            this.props.margin.right }
                 height = { this.props.height +
                            this.props.margin.top +
                            this.props.margin.bottom } 
                className = 'chart' >

                 <g ref       = 'theG'
                    transform = { 'translate(' +
                                    this.props.margin.left +
                                    "," +
                                    this.props.margin.top +
                                    ")"} />
            </svg>
        );
    },

});

module.exports = MeasureByQuarterLineChart;
