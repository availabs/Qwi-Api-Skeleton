/*jshint strict:false , unused:false */



var React          = require('react'),
    d3             = require('d3'),
    linechartUtils = require('../utils/linechart_utils.js');



/*========================================================================
 *
 * Props:
 *          height
 *          margin.top, margin.right, margin.bottom, margin.left
 *          data
 *          entity_id
 *          measure
 *          entity_labels
 *          measure_labels
 *
 *========================================================================*/
var MeasureByQuarterLineChart = React.createClass({


    '_update' : function () {

        var props   = this.props,
            data    = props.data || [],
            measure = props.measure,
            theSVG  = d3.select(React.findDOMNode(this.refs.theSVG)),
            that    = this,
            theG;

        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };


        data.forEach(function(d) {
            d.date = that._parseDate(quarterToMonth[d.quarter] +'-'+ d.year.toString());
            d[measure] = +d[measure];
        });

        console.log(data);

        // Clear the Visualization.
        theSVG.selectAll("*").remove();

        this._x.domain(d3.extent(data, function(d) { return d.date; }));
        this._y.domain(d3.extent(data, function(d) { return d[measure]; }));

        theG = theSVG.append('g')
                     .style('width',  theSVG.offsetWidth)
                     .style('height', props.height - props.margin.top - props.margin.bottom)
                     .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");

        theG.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (props.height - props.margin.bottom - props.margin.top) + ")")
            .call(this._xAxis);

        theG.append("g")
            .attr("class", "y axis")
            .call(this._yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(props.measure_labels[props.measure]);

        theG.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", this._line);
    },


    'componentDidMount': function () {
        this._parseDate = linechartUtils.parseDate;
    },


    'shouldComponentUpdate': function (nextProps, nextState) {
        // TODO: Figure out why width resizing is free.
        return  ( this.props.height !== nextProps.height ) ||
                ( this.props.data   !== nextProps.data   )  ;
    },


    'componentDidUpdate': function (prevProps, prevState) {
        if (this.props.height !== prevProps.height) {
            linechartUtils.initByQuarterBasics.call(this);
        }

        this._update();
    },


    'render' : function () {

        var props = this.props,
            title = ( props.measure ? props.measure_labels[props.measure] : '<QWI Measure>' ) + 
                    ' by quarter for ' +  
                    ( props.entity_id ? props.entity_labels[props.entity_id] : '<State>' );

        return (
            <div>
                <h3 className='chart-title' >
                        { title }
                </h3>
                <svg width     = '100%'
                     height    = { props.height }
                     ref       = 'theSVG'
                     className = 'chart' >
                </svg>
            </div>
        );
    },

});

module.exports = MeasureByQuarterLineChart;
