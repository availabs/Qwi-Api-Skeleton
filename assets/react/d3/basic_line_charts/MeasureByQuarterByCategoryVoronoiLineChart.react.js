/*jshint strict:false , unused:false */
/*globals $ */

/* This file needs a major refactor, but the heavy use of closures
 * means that breaking the code into smaller functions may result
 * in even less readable code. 
 */                                   


var React                 = require('react'),
    d3                    = require('d3'),
    saveSvgAsPng          = require('save-svg-as-png').saveSvgAsPng,
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
var MeasureByQuarterByGeographyVoronoiLineChart = React.createClass({


    '_update' : function () {

        var that     = this,

            props    = this.props,
            data     = props.data || [],
            measure  = props.measure,
            category = props.category,

            svgNode  = React.findDOMNode(this.refs.theSVG),
            theSVG   = d3.select(svgNode),
            theG,
            categoriesG,

            height   = props.height,
            width    = svgNode.offsetWidth,
            margin   = props.margin,

            subcategoriesDataObj,
            categoriesVoronoiObj,
            categoriesArr;


        var quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };

        
        var voronoi = d3.geom.voronoi()
                             .x(function(d) { return that._x(d.date); })
                             .y(function(d) { return that._y(d[measure]); })
                             .clipExtent([[ -margin.left, -margin.top], 
                                          [ width + margin.right, height + margin.bottom]]);

        var color = d3.scale.category20();

        
        // Clear the Visualization.
        // TODO: Try to just remove the axes, then use `exit` on the chart.
        theSVG.selectAll('*').remove();


        // Parse the data.
        subcategoriesDataObj = {};
        data.forEach(function(d) {

            if (d[measure] === null || d[measure] === undefined) { return; }

            var subcategory = d[category].trim(),
                dataArr     = subcategoriesDataObj[subcategory],
                dateString  = quarterToMonth[d.quarter] +'-'+ d.year.toString(),
                datum       = {};

            d[category] = subcategory;

            if (!dataArr) {
                dataArr = subcategoriesDataObj[subcategory] = [];
            } 

            datum.year     = d.year.toString().trim();
            datum.quarter  = d.quarter.toString().trim();
            datum.date     = d.date     = that._parseDate(dateString);
            datum[measure] = d[measure] = +d[measure];

            dataArr[dataArr.length] = datum;
        });


        color.domain(Object.keys(subcategoriesDataObj));

        this._x.domain(d3.extent(data, function(d) { return d.date;     }));
        this._y.domain(d3.extent(data, function(d) { return d[measure]; }));


        // Turn the parsed data into an array of data
        // structured for the voronoi algorithm.
        categoriesArr = Object.keys(subcategoriesDataObj).map(function (subcategory) {
            var data = { 
                subcategory : subcategory ,
                values      : null        ,
            };

            data.values = subcategoriesDataObj[subcategory].map(function(datumForQuarter) {
                datumForQuarter.circularRef = data;

                return datumForQuarter;
            });

            return data;
        });



        theG = theSVG.append('g')
                     .style('width',    width)
                     .style('height',   height - margin.top - margin.bottom)
                     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        categoriesG = theG.selectAll('.category')
                          .data(categoriesArr)
                        .enter().append('g')
                          .attr('class', 'category exportable');

        categoriesG.append('path')
            .attr('class', 'line exportable')
            .attr('d', function (d) {
                           d.line = this;
                           return that._line(d.values); })
            .style('stroke', function(d) { return color(d.subcategory); });

        categoriesG.append('text')
                   .datum(function (d) { return { subcategory : d.subcategory,
                                                  label       : props.category_labels[d.subcategory],
                                                  value       : d.values[d.values.length -1] }; })

                   .attr('transform', function(d) { return 'translate('                +
                                                           that._x(d.value.date)       +
                                                           ','                         +
                                                           that._y(d.value[measure]) +
                                                           ')'; })
                   .attr('x', 3)
                   .attr('dy', '0.35em')
                   .attr('class', 'exportable')
                   .text(function (d) { return d.label; })
                   .style('font-size', '10px')
                   .style('fill', function(d) { return color(d.subcategory); });



        var focus = theG.append("g")
                    .attr("transform", "translate(-100,-100)")
                    .attr("class", "focus");

        focus.append("circle")
            .attr("r", 3.5);

        focus.append("text")
             .attr("y", -10);


        var voronoiGroup = theG.append("g")
                               .attr("class", "voronoi");

        voronoiGroup.selectAll("path")
                    .data(voronoi(d3.nest()
                                    .key(function (d) { return that._x(d.date) + "," + that._y(d[measure]); })
                                    .rollup(function (v) { return v[0]; })
                                    .entries(d3.merge(categoriesArr.map(function (d) { return d.values; })))
                                    .map(function(d) { return d.values; })))
                    .enter().append("path")
                            .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                            .datum(function(d) { return d.point; })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);

        d3.select("#show-voronoi")
          .property("disabled", false)
          .on("change", function() { console.log('Sup'); voronoiGroup.classed("voronoi--show", this.checked); });


        function mouseover(d) {
            var textNode       = focus.select('text'),
                textNodeHeight = textNode.node().getBBox().height,
                pointYCoord    = that._y(d[measure]),

                // Make sure the text node is within the chart.
                textNodeYCoord = ((pointYCoord - textNodeHeight) > 0) ? 
                                    (pointYCoord - textNodeHeight)    : 
                                    pointYCoord;

            d3.select(d.circularRef.line)
              .classed("line--hover", true);

            d.circularRef.line.parentNode.appendChild(d.circularRef.line);

            focus.attr("transform", "translate(" + that._x(d.date) + "," + textNodeYCoord + ")");

            textNode.selectAll('*').remove();

            textNode.style('text-shadow', '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black'  )
                    .style('font-size', '20px')
                    .style('stroke', color(d.circularRef.subcategory) )
                    .style('fill', 'white');

            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(props.category_labels[d.circularRef.subcategory]);
                
            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(d.year + ' Q' + d.quarter);

            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(measure + ': ' + d[measure]);
        }

        function mouseout(d) {
            d3.select(d.circularRef.line)
              .classed("line--hover", false);

            focus.attr("transform", "translate(-100,-100)");
        }

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
        var theSVG       = React.findDOMNode(this.refs.theSVG),
            theClone     = theSVG.cloneNode(true),
            fileName     = this._getChartTitle().replace(/\s+/g, '_'),
            rightPadding = 5;

        // FIXME: There has to be a better way...
        // Gets the rightmost element in the svg tree to determine width.
        var width = Math.max.apply(null, 
                                    $('#foobar').find('.exportable')
                                                .map(function() { 
                                                        return this.getBoundingClientRect().right; 
                                                     })
                                                .toArray());

        //Makes sure the exported image is complete, not cropped.
        theClone.setAttribute('width', width + rightPadding);
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

module.exports = MeasureByQuarterByGeographyVoronoiLineChart;
