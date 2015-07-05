/*jshint strict:false , unused:false */
/*globals $ */


// TODO: This code is in the early phase of a major refactoring.
//          Lots more needed.
// TODO: Generalize this. Make it reusable.
//          Get rid of the single use case assumptions.
//

// The parsing of data must be done before handing it to this module.
// That would make it generally applicable.
// No longer bind to the component. Give it its own `this`.

var React                 = require('react'),
    d3                    = require('d3'),
    lodash                = require('lodash'),
    utils                 = require('./utils'),
    geography_labels      = require('../../data/labels/geography'),
    category_descriptions = require('../../data/labels/categories');



function newChart () {

    var theComponent   = this,
        color          = d3.scale.category20(),
        parseDate      = utils.parseDate;


    var theChart = {};

    theChart.init   = utils.initByQuarterBasics.bind(theComponent);

    theChart.render = function () {

        var props    = theComponent.props,
            theData  = props.data || [],
            measure  = props.measure,
            category = props.category,

            svgNode  = React.findDOMNode(theComponent.refs.theSVG),
            theSVG   = d3.select(svgNode),
            theG,
            categoriesG,

            height   = props.height,
            width    = svgNode.offsetWidth,
            margin   = props.margin,

            categoriesVoronoiObj,
            categoriesArr,

            i, ii;


        var voronoi = d3.geom.voronoi()
                             .x(function(d) { return theComponent._x(d.key); })
                             .y(function(d) { return theComponent._y(d.value); })
                             .clipExtent([[ -margin.left, -margin.top], 
                                          [ width + margin.right, height + margin.bottom]]);


        // Clear the Visualization.
        // TODO: Try to just remove the axes, then use `exit` on the chart.
        theSVG.selectAll('*').remove();

        color.domain(Object.keys(theData.map(function(d) { return d.key; })));


        function getNestedExtents (fieldName) {
            return d3.extent(theData.map(function(d) { return d3.extent(d.values, function(d) { return d[fieldName]; }); }) 
                                    .reduce(function(agg, cur) { return agg.concat(cur); }, [])
                            );
        } 

        theComponent._x.domain(getNestedExtents('key'));
        theComponent._y.domain(getNestedExtents('value'));


        for (i = 0; i < theData.length; ++i) {
            for (ii = 0; ii < theData[i].values.length; ++ii) {
                theData[i].values[ii].circularRef = theData[i]; 
            } 
        }

        // For stacking the labels.
        theData.sort(function(a,b) { 
            return a.values[a.values.length -1].value - b.values[b.values.length -1].value;
        });



        theG = theSVG.append('g')
                     .style('width'   , width)
                     .style('height'  , height - margin.top - margin.bottom)
                     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        categoriesG = theG.selectAll('.category')
                          .data(theData)
                        .enter().append('g')
                          .attr('class', 'category exportable');

        categoriesG.append('path')
            .attr('class', 'line exportable')
            .attr('d', function (d) {
                           d.line = this;
                           return theComponent._line(d.values); })
            .style('stroke', function(d) { return color(d.key); });


        // Add the labels to the lines. 
        // The labels are stacked so that they do not obscure each other.
        //
        (function() {
            var maxY_translation = Number.POSITIVE_INFINITY,
                xTranslation     = d3.max(theData, function(d) { 
                                        return theComponent._x(d.values[d.values.length -1].key); 
                                   }),
                lineLabelHeight;

            categoriesG.append('text')
                       .datum(function (d) { return { key   : d.key,
                                                      value : d.values[d.values.length -1].value }; })
                       .attr('x', 3)
                       .attr('dy', '0.35em')
                       .text(function (d) { return d.key; })
                       .style('font-size', '10px')
                       .style('fill', function(d) { return color(d.key); })
                       .style('opacity', 0) // Hide the label. Reveal in PNG export.
                       .attr('class', 'exportable line_label')
                       .attr('transform', function(d, i) { 
                           var yTranslation;

                           if (!lineLabelHeight) { 
                               lineLabelHeight = this.getBoundingClientRect().height; 
                           }
                           
                           yTranslation = Math.min(theComponent._y(d.value) + lineLabelHeight, 
                                                   maxY_translation);

                           maxY_translation = yTranslation - Math.ceil(lineLabelHeight/2.0) - 2;

                           return 'translate(' + xTranslation + ',' + maxY_translation + ')'; 
                        });
        }());


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
                                    .key(function (d) { return theComponent._x(d.key) + 
                                                                "," + 
                                                                theComponent._y(d.value); })
                                    .rollup(function (v) { return v[0]; })
                                    .entries(d3.merge(theData.map(function (d) { return d.values; })))
                                    .map(function(d) { return d.values; })))
                    .enter().append("path")
                            .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                            .datum(function(d) { return d.point; })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);


        function mouseover(d) {
            var textNode       = focus.select('text'),
                textNodeHeight = textNode.node().getBBox().height,
                pointYCoord    = theComponent._y(d.value),

                // Make sure the text node is within the chart.
                textNodeYCoord = ((pointYCoord - textNodeHeight) > 0) ? 
                                    (pointYCoord - textNodeHeight)    : 
                                    pointYCoord;

            d3.select(d.circularRef.line)
              .classed("line--hover", true);

            d.circularRef.line.parentNode.appendChild(d.circularRef.line);

            focus.attr("transform", "translate(" + 
                                     theComponent._x(d.key) + "," + textNodeYCoord + ")");

            textNode.selectAll('*').remove();

            textNode.style('text-shadow', '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black'  )
                    .style('font-size', '20px')
                    .style('stroke', color(d.circularRef.key) )
                    .style('fill', 'white');

            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(d.circularRef.key);
                
            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(d.key);

            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(measure + ': ' + d.value);
        }

        function mouseout(d) {
            d3.select(d.circularRef.line)
              .classed("line--hover", false);

            focus.attr("transform", "translate(-100,-100)");
        }

        theG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + 
                                (props.height - props.margin.bottom - props.margin.top) + ')')
            .style('font-size', '10px')
            .call(theComponent._xAxis);

        theG.append('g')
            .attr('class', 'y axis')
            .style('font-size', '10px')
            .call(theComponent._yAxis)
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
    };


    return theChart;
}

module.exports = { newChart : newChart };
