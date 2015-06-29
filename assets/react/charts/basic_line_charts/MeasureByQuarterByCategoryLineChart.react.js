/*jshint strict:false , unused:false */
/*globals $ */



var React                 = require('react'),
    d3                    = require('d3'),
    saveSvgAsPng          = require('save-svg-as-png').saveSvgAsPng,
    linechartUtils        = require('../../../d3/linecharts/utils'),
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
            .style('font-size', '10px')
            .style('fill', function(d) { return color(d.category); });


        theG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (props.height - props.margin.bottom - props.margin.top) + ')')
            .style('font-size', '10px')
            .call(this._xAxis);

        theG.append('g')
            .attr('class', 'y axis')
            .style('font-size', '10px')
            .call(this._yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
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


    '_getChartTitle': function () {
        var props = this.props;

        return  ( props.measure ? props.measure_labels[props.measure] : '<QWI Measure>' ) + 
                ' by quarter by ' +
                ( props.category ? category_descriptions[props.category] : '<QWI Category>' ) +
                ' for ' +
                ( props.geography ? geography_labels[props.geography] : '<Geo Area>' );
    },


    '_savePng': function () {
        var theSVG   = React.findDOMNode(this.refs.theSVG),
            theClone = theSVG.cloneNode(true),
            fileName = this._getChartTitle().replace(/\s+/g, '_');

        // FIXME: There has to be a better way...
        // Gets the rightmost element in the svg tree to determine width.
        var width = Math.max.apply(null, 
                                    $('#foobar').find('*')
                                                .map(function() { 
                                                        return this.getBoundingClientRect().right; 
                                                     })
                                                .toArray());

        //Makes sure the exported image is complete, not cropped.
        theClone.setAttribute('width', width);
        saveSvgAsPng(theClone, fileName);
    },


    'render' : function () {

        var props = this.props;

        return (
            <div>
                <h3 className='chart-title' >
                        { this._getChartTitle() }
                </h3>

				<button className={'btn btn-default ' + 
                                    ( props.data ? '' : ' disabled')} 
                        style={{position:'absolute', bottom:'5px',right:'15px'}} 
                        onClick={this._savePng}>
                            'Export'
                </button>

                <svg id = {'foobar' }
                     width     = '100%'
                     height    = { props.height }
                     ref       = 'theSVG'
                     className = 'chart' >
                </svg>
            </div>
        );
    },
});

module.exports = MeasureByQuarterLineChart;
