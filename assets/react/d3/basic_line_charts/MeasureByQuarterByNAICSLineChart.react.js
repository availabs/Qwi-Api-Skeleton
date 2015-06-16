/*jshint strict:false , unused:false */



var React           = require('react'),
    d3              = require('d3'),
    industry_labels = require('../../../data/labels/industry.js'),
    linechartUtils  = require('../utils/linechart_utils.js');



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
            theG,
            sectorG,
            sectorsObj,
            sectorsArr;

        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };
        
        var color = d3.scale.category20();

        // Parse the data
        sectorsObj = {};
        data.forEach(function(d) {
            var industryData = sectorsObj[d.industry],
                dateString   = quarterToMonth[d.quarter] +'-'+ d.year.toString(),
                datum        = {};

            d.industry     = d.industry.trim();
            datum.date     = d.date     = that._parseDate(dateString);
            datum[measure] = d[measure] = +d[measure];

            if (!industryData) {
                sectorsObj[d.industry] = industryData = [];
            } 

            industryData[industryData.length] = datum;
        });

        color.domain(Object.keys(sectorsObj));

        sectorsArr = Object.keys(sectorsObj).map(function (sec) {
            return { 
                sector: sec,
                values: sectorsObj[sec],
            };
        });


        // Clear the Visualization.
        // TODO: Try to just remove the axes, then use `exit` on the chart.
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

        sectorG = theG.selectAll('.sector')
                     .data(sectorsArr)
                   .enter().append('g')
                     .attr('class', 'sector');

        sectorG.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return that._line(d.values); })
            .style('stroke', function(d) { return color(d.sector); });

        sectorG.append('text')
            .datum(function (d) { return { label: industry_labels[d.sector],
                                           value: d.values[d.values.length -1] }; })

            .attr('transform', function(d) { return 'translate('                +
                                                    that._x(d.value.date)       +
                                                    ','                         +
                                                    that._y(d.value[measure]) +
                                                    ')'; })
            .attr('x', 3)
            .attr('dy', '0.35em')
            .text(function (d) { return d.label; });
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
                    ' by quarter by NAICS sector for ' +  
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
