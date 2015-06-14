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
        var theSVG = React.findDOMNode(this.refs.theSVG),
            that   = this;
    
        var width  = theSVG.offsetWidth  - this.props.margin.right - this.props.margin.left,
            height = this.props.height - this.props.margin.top   - this.props.margin.bottom;

        console.log('MeasureByQuarterLineChart _init called.');
        //console.log(theSVG);
        //console.log(width);
        //console.log(height);

        this._x = d3.time.scale().range([0, width]);

        this._y = d3.scale.linear().range([height, 0]);


        this._xAxis = d3.svg.axis().scale(this._x).orient("bottom");


        this._yAxis = d3.svg.axis().scale(this._y).orient("left");


        this._line  = d3.svg.line()
                    .x(function(d) { return that._x(d.date); })
                    .y(function(d) { return that._y(d[that.props.measure]); });
    },

    '_parseDate' : d3.time.format("%m-%Y").parse,


    '_update' : function (nextProps) {

        var data    = nextProps.data || [],
            measure = nextProps.measure,
            theSVG  = d3.select(React.findDOMNode(this.refs.theSVG)),
            that    = this,
            theG;

        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };


        data.forEach(function(d) {
            d.date = that._parseDate(quarterToMonth[d.quarter] +'-'+ d.year.toString());
            d[measure] = +d[measure];
        });


        // Clear the Visualization.
        theSVG.selectAll("*").remove();

        this._x.domain(d3.extent(data, function(d) { return d.date; }));
        this._y.domain(d3.extent(data, function(d) { return d[measure]; }));

        theG = theSVG.append('g')
                     .style('width',  theSVG.offsetWidth)
                     .style('height', nextProps.height - nextProps.margin.top - nextProps.margin.bottom);

        theG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + nextProps.height + ")")
            .call(this._xAxis);

        theG.append("g")
            .attr("class", "y axis")
            .call(this._yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(nextProps.measure_label);

        theG.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", this._line);
    },


    'componentDidMount' : function () { 
        console.log('MeasureByQuarterLineChart didMount.'); 
        this._init(); 
    },


    'shouldComponentUpdate' : function (nextProps, nextState) {
        var heightChanged = (this.props.height !== nextProps.height);

        if (heightChanged) {
            this._init(); 
        }

        if (heightChanged || (this.props.data !== nextProps.data)) {
            this._update(nextProps); 
        }

        return heightChanged;
    },


    'render' : function () {

        return (
            <svg width     = '100%'
                 height    = { this.props.height }
                 ref       = 'theSVG'
                 className = 'chart' >
            </svg>
        );
    },

});

module.exports = MeasureByQuarterLineChart;
