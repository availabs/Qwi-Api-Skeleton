/*jshint strict:false , unused:false */



var React           = require('react'),
    d3              = require('d3'),
    industry_labels = require('../../../data/labels/industry.js');



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


    '_parseDate': d3.time.format("%m-%Y").parse,


    '_init' : function () {

        var theSVG = React.findDOMNode(this.refs.theSVG),
            that   = this;
    
        var width  = theSVG.offsetWidth - this.props.margin.right - this.props.margin.left,
            height = this.props.height - this.props.margin.top   - this.props.margin.bottom;


        this._x = d3.time.scale().range([0, width]);

        this._y = d3.scale.linear().range([height, 0]);


        this._xAxis = d3.svg.axis().scale(this._x).orient("bottom");


        this._yAxis = d3.svg.axis().scale(this._y).orient("left");


        this._line  = d3.svg.line()
                    .x(function(d) { return that._x(d.date); })
                    .y(function(d) { return that._y(d[that.props.measure]); });
    },


    '_update' : function (props) {

        var data    = props.data || [],
            measure = props.measure,
            theSVG  = d3.select(React.findDOMNode(this.refs.theSVG)),
            that    = this,
            theG,
            sector,
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

            if (industryData) {
                industryData[industryData.length] = datum;
            } else {
                sectorsObj[d.industry] = [datum];
            }
        });

        console.log('===================');
        console.log(industry_labels);
        console.log('-------------------');
        console.log(Object.keys(sectorsObj));
        console.log('===================');

        color.domain(Object.keys(sectorsObj));

        sectorsArr = Object.keys(sectorsObj).map(function (sec) {
            return { 
                sector: sec,
                values: sectorsObj[sec],
            };
        });


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

        sector = theG.selectAll('.sector')
                     .data(sectorsArr)
                   .enter().append('g')
                     .attr('class', 'sector');

        sector.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return that._line(d.values); })
            .style('stroke', function(d) { return color(d.sector); });

        sector.append('text')
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


    'shouldComponentUpdate': function (nextProps, nextState) {
        // TODO: Figure out why width resizing is free.
        return  ( this.props.height !== nextProps.height ) ||
                ( this.props.data   !== nextProps.data   )  ;
    },


    'componentDidUpdate': function (prevProps, prevState) {
        if (this.props.height !== prevProps.height) {
            this._init(); 
        }

        this._update(this.props);
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
