/*jshint strict:false , unused:false */



var React                 = require('react'),
    d3                    = require('d3'),
    linechartUtils        = require('../utils/linechart_utils'),
    geography_labels      = require('../../../data/labels/geography'),
    category_descriptions = require('../../../data/labels/categories');



/*========================================================================
 *
 * Props:
 *          height
 *          margin.top, margin.right, margin.bottom, margin.left
 *          data
 *          geography
 *          measure
 *          measure_labels
 *          category
 *          category_labels
 *
 *========================================================================*/
var MeasureByQuarterLineChart = React.createClass({


    '_update' : function () {

        var props    = this.props,
            data     = props.data || [],
            measure  = props.measure,
            category = props.category,
            theSVG   = d3.select(React.findDOMNode(this.refs.theSVG)),
            that     = this,
            theG,
            categoriesG,
            categoriesObj,
            categoriesArr;

        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };
        
        var color = d3.scale.category20();

        // Clear the Visualization.
        // TODO: Try to just remove the axes, then use `exit` on the chart.
        theSVG.selectAll('*').remove();

        
        // Parse the data
        categoriesObj = {};
        data.forEach(function(d) {

            if (d[measure] === null || d[measure] === undefined) { return; }

            var categoryData = categoriesObj[d[category]],
                dateString   = quarterToMonth[d.quarter] +'-'+ d.year.toString(),
                datum        = {};

            datum.date       = d.date     = that._parseDate(dateString);
            datum[measure]   = d[measure] = +d[measure];

            d[category]      = d[category].trim();

            if (!categoryData) {
                categoriesObj[d[category]] = categoryData = [];
            } 

            categoryData[categoryData.length] = datum;
        });

        color.domain(Object.keys(categoriesObj));

        categoriesArr = Object.keys(categoriesObj).map(function (cat) {
            return { 
                category : cat,
                values   : categoriesObj[cat],
            };
        });


        this._x.domain(d3.extent(data, function(d) { return d.date;     }));
        this._y.domain(d3.extent(data, function(d) { return d[measure]; }));

        theG = theSVG.append('g')
                     .style('width',  theSVG.offsetWidth)
                     .style('height', props.height - props.margin.top - props.margin.bottom)
                     .attr('transform', 'translate(' + props.margin.left + ',' + props.margin.top + ')');

        categoriesG = theG.selectAll('.category')
                          .data(categoriesArr)
                        .enter().append('g')
                          .attr('class', 'category');

        categoriesG.append('path')
            .attr('class', 'line')
            .attr('d', function(d) { return that._line(d.values); })
            .style('stroke', function(d) { return color(d.category); });

        categoriesG.append('text')
            .datum(function (d) { return { category: d.category,
                                           label   : props.category_labels[d.category],
                                           value   : d.values[d.values.length -1] }; })

            .attr('transform', function(d) { return 'translate('                +
                                                    that._x(d.value.date)       +
                                                    ','                         +
                                                    that._y(d.value[measure]) +
                                                    ')'; })
            .attr('x', 3)
            .attr('dy', '0.35em')
            .text(function (d) { return d.label; })
            .style('fill', function(d) { return color(d.category); });


        theG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (props.height - props.margin.bottom - props.margin.top) + ')')
            .call(this._xAxis);

        theG.append('g')
            .attr('class', 'y axis')
            .call(this._yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text(props.measure_labels[props.measure]);

        d3.selectAll('g.tick')
            .select('line') //grab the tick line
            .attr('class', 'grid-line');
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
                    ' by quarter by ' +
                    ( props.category ? category_descriptions[props.category] : '<QWI Category>' ) +
                    ' for ' +
                    ( props.geography ? geography_labels[props.geography] : '<State>' );

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
