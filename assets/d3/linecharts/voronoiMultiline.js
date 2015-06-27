/*jshint strict:false , unused:false */
/*globals $ */


// TODO: This code is in the early phase of a major refactoring.
//          Lots more needed.
//

var React                 = require('react'),
    d3                    = require('d3'),
    saveSvgAsPng          = require('save-svg-as-png').saveSvgAsPng,
    linechartUtils        = require('../../react/charts/utils/linechart_utils'),
    geography_labels      = require('../../data/labels/geography'),
    category_descriptions = require('../../data/labels/categories');



function newChart () {

    var theComponent = this,
        color        = d3.scale.category20(),
        quarterToMonth = { '1': '02', '2': '05', '3': '08', '4': '11' };


    var theChart = {};

    theChart.update = function () {

        var props    = theComponent.props,
            data     = props.data || [],
            measure  = props.measure,
            category = props.category,

            svgNode  = React.findDOMNode(theComponent.refs.theSVG),
            theSVG   = d3.select(svgNode),
            theG,
            categoriesG,

            height   = props.height,
            width    = svgNode.offsetWidth,
            margin   = props.margin,

            subcategoriesDataObj,
            categoriesVoronoiObj,
            categoriesArr;

        var voronoi = d3.geom.voronoi()
                             .x(function(d) { return theComponent._x(d.date); })
                             .y(function(d) { return theComponent._y(d[measure]); })
                             .clipExtent([[ -margin.left, -margin.top], 
                                          [ width + margin.right, height + margin.bottom]]);


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
            datum.date     = d.date     = theComponent._parseDate(dateString);
            datum[measure] = d[measure] = +d[measure];

            dataArr[dataArr.length] = datum;
        });


        color.domain(Object.keys(subcategoriesDataObj));

        theComponent._x.domain(d3.extent(data, function(d) { return d.date;     }));
        theComponent._y.domain(d3.extent(data, function(d) { return d[measure]; }));


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


        categoriesArr.sort(function(b,a) { 
            return b.values[b.values.length -1][measure] - a.values[a.values.length -1][measure];
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
                           return theComponent._line(d.values); })
            .style('stroke', function(d) { return color(d.subcategory); });


        (function() {
            var maxY_translation = Number.POSITIVE_INFINITY,
                xTranslation     = d3.max(categoriesArr, function(d) { 
                                            return theComponent._x(d.values[d.values.length -1].date); }),
                lineLabelHeight;

            categoriesG.append('text')
                       .datum(function (d) { return { subcategory : d.subcategory,
                                                      label       : props.category_labels[d.subcategory],
                                                      value       : d.values[d.values.length -1] }; })
                       .attr('x', 3)
                       .attr('dy', '0.35em')
                       .attr('class', 'exportable')
                       .text(function (d) { return d.label; })
                       .style('font-size', '10px')
                       .style('fill', function(d) { return color(d.subcategory); })
                       .attr('transform', function(d, i) { 
                           var yTranslation;

                           if (!lineLabelHeight) { 
                               lineLabelHeight = this.getBoundingClientRect().height; 
                           }
                           
                           yTranslation = Math.min(theComponent._y(d.value[measure]) + lineLabelHeight, 
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
                                    .key(function (d) { return theComponent._x(d.date) + 
                                                                "," + 
                                                                theComponent._y(d[measure]); })
                                    .rollup(function (v) { return v[0]; })
                                    .entries(d3.merge(categoriesArr.map(function (d) { 
                                                                            return d.values; })))
                                    .map(function(d) { return d.values; })))
                    .enter().append("path")
                            .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                            .datum(function(d) { return d.point; })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);

        d3.select("#show-voronoi")
          .property("disabled", false)
          .on("change", function() { voronoiGroup.classed("voronoi--show", theComponent.checked); });


        function mouseover(d) {
            var textNode       = focus.select('text'),
                textNodeHeight = textNode.node().getBBox().height,
                pointYCoord    = theComponent._y(d[measure]),

                // Make sure the text node is within the chart.
                textNodeYCoord = ((pointYCoord - textNodeHeight) > 0) ? 
                                    (pointYCoord - textNodeHeight)    : 
                                    pointYCoord;

            d3.select(d.circularRef.line)
              .classed("line--hover", true);

            d.circularRef.line.parentNode.appendChild(d.circularRef.line);

            focus.attr("transform", "translate(" + 
                                     theComponent._x(d.date) + "," + textNodeYCoord + ")");

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
