/*jshint strict:false , unused:false */
/*globals $ */


//FIXME: Move init inside render.
//       Output SVG rather than append to one passed in via config.

var React  = require('react'),
    d3     = require('d3'),
    lodash = require('lodash'),
    utils  = require('./utils');

var MARGIN_DEFAULTS = { top:0, right:0, bottom:0, left:0 };

function newChart () {

    var theChart  = {},
        color     = d3.scale.category20(),
        parseDate = utils.parseDate;



    theChart.render = function (config) {

        //var theSVG = d3.select(config.parentNode),
        var categoriesG,
            i, ii,

            margin     = lodash.defaults(config.margin, MARGIN_DEFAULTS),
            width      = config.width,
            height     = config.height,

            mustReinit = (theChart.width  !== width)  ||
                         (theChart.height !== height) ||
                         !lodash.isEqual(theChart.margin, margin),

        
            chartSVG   = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
                           .style('width'   , width)
                           .style('height'  , height),

            theG       = chartSVG.append('g')
                                 .style('width'   , width)
                                 .style('height'  , height - margin.top - margin.bottom)
                                 .attr('transform', 'translate('+margin.left + ',' + margin.top +')');
                           

        theChart.width  = width;
        theChart.height = height;
        theChart.margin = margin;

        if (mustReinit) { utils.initByQuarterLineChartBasics(theChart); }


        console.log(config);


        if (!(config.data && config.data.length)) { return chartSVG; }

        color.domain(config.data.map(function(d) { return d.key; }));


        function getNestedExtents (fieldName) {
            return d3.extent(config.data.map(function(d) { 
                                                return d3.extent(d.values, function(d) { 
                                                    return d[fieldName]; }); }) 
                                    .reduce(function(agg, cur) { return agg.concat(cur); }, []));
        } 


        theChart._x.domain(getNestedExtents('key'));
        theChart._y.domain(getNestedExtents('value'));


        for (i = 0; i < config.data.length; ++i) {
            for (ii = 0; ii < config.data[i].values.length; ++ii) {
                config.data[i].values[ii].circularRef = config.data[i]; 
            } 
        }

        
        // For stacking the labels.
        config.data.sort(function(a,b) { 
            return a.values[a.values.length -1].value - b.values[b.values.length -1].value;
        });


        categoriesG = theG.selectAll('.category')
                          .data(config.data)
                        .enter().append('g')
                          .attr('class', 'category exportable');

        categoriesG.append('path')
            .attr('class', 'line exportable')
            .attr('d', function (d) {
                           d.line = this;
                           return theChart._line(d.values); })
            .style('stroke', function(d) { return color(d.key); });


        // Add the labels to the lines. 
        // The labels are stacked so that they do not obscure each other.
        // They are also transparent and outside of the chartSVG.
        // They are made visible and the chartSVG widened during export to PNG.
        (function() {
            var FONT_SIZE = 10;

            var maxY_translation = Number.POSITIVE_INFINITY,
                xTranslation     = d3.max(config.data, function(d) { 
                                        return theChart._x(d.values[d.values.length -1].key); 
                                   }),

                lineLabelHeight = FONT_SIZE + 2;

            categoriesG.append('text')
                       .datum(function (d) { return { key   : d.key,
                                                      value : d.values[d.values.length -1].value }; })
                       .attr('x', 3)
                       .attr('dy', '0.35em')
                       .text(function (d) { return d.key; })
                       .style('font-size', FONT_SIZE + 'px')
                       .style('fill', function(d) { return color(d.key); })
                       .style('opacity', 0) // Hide the label. Reveal in PNG export.
                       .attr('class', 'exportable line_label')
                       .attr('transform', function(d, i) { 
                           var yTranslation;

                           yTranslation = Math.min(theChart._y(d.value) + lineLabelHeight, 
                                                   maxY_translation);

                           maxY_translation = yTranslation - Math.ceil(lineLabelHeight/2.0) - 2;

                           return 'translate(' + xTranslation + ',' + maxY_translation + ')'; 
                        });
        }());


        var focus = theG.append("g")
                    .attr("transform", "translate(-100,-100)")
                    .attr("class", "focus");

        focus.append("circle")
            .attr("r", 3.5)
            .style('fill', 'white');

        focus.append("text")
             .attr("y", -10);



        var voronoi = d3.geom.voronoi()
                             .x(function(d) { return theChart._x(d.key); })
                             .y(function(d) { return theChart._y(d.value); })
                             .clipExtent([[ -margin.left, -margin.top], 
                                          [ width + margin.right, height + margin.bottom]]);

        var voronoiGroup = theG.append("g")
                               .attr("class", "voronoi");

        voronoiGroup.selectAll("path")
                    .data(voronoi(d3.nest()
                                    .key(function (d) { 
                                        return theChart._x(d.key) + "," + theChart._y(d.value); })
                                    .rollup(function (v) { return v[0]; })
                                    .entries(d3.merge(config.data.map(function (d) {return d.values;})))
                                    .map(function(d) { return d.values; })))
                    .enter().append("path")
                            .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                            .datum(function(d) { return d.point; })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);


        function mouseover(d) {
            var textNode    = focus.select('text'),
                pointXCoord = theChart._x(d.key),
                pointYCoord = theChart._y(d.value),

                realWidth   = width  - margin.left - margin.right,
                realHeight  = height - margin.top  - margin.bottom,

                textNodeBBox,
                halfTextNodeWidth,
                halfTextNodeHeight,

                textNode_X_Translate = 0,
                textNode_Y_Translate = 0,

                tmp;


            if(config.mouseoverAction) {
                config.mouseoverAction({ key   : d.circularRef.key, 
                                         value : { key:d.key, 
                                                   value:d.value, } });
            }

            d3.select(d.circularRef.line)
              .classed("line--hover", true);

            d.circularRef.line.parentNode.appendChild(d.circularRef.line);

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
                .text((config.keyParser) ? config.keyParser(d.key) : d.key);

            textNode.append('tspan')
                .attr('x', 0)
                .attr('dy', '1.2em')
                .text(d.value);

            focus.attr("transform", "translate(" + pointXCoord + "," + pointYCoord + ")");



            // Keep the textBoxes on the chart.
            textNodeBBox = textNode.node().getBBox();

            halfTextNodeWidth  = textNodeBBox.width / 2.0;
            halfTextNodeHeight = textNodeBBox.height / 2.0;

            if ((tmp = (pointXCoord - halfTextNodeWidth)) < 0) {
                textNode_X_Translate = -tmp;
            } else if ((tmp = (pointXCoord + halfTextNodeWidth)) > realWidth) {
                textNode_X_Translate = realWidth - tmp; 
            } 

            if ((tmp = (pointYCoord + halfTextNodeHeight)) > realHeight) {
                textNode_Y_Translate = realHeight - tmp; 
            } 

            textNode.attr("transform", "translate(" + 
                            textNode_X_Translate + "," + 
                            textNode_Y_Translate + ")");
        }

        function mouseout(d) {
            d3.select(d.circularRef.line)
              .classed("line--hover", false);

            focus.attr("transform", "translate(-100,-100)");
        }

        theG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + 
                                (height - margin.bottom - margin.top) + ')')
            .style('font-size', '10px')
            .call(theChart._xAxis);

        theG.append('g')
            .attr('class', 'y axis')
            .style('font-size', '10px')
            .call(theChart._yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .text(config.yAxisLabel);

        theG.selectAll('g.tick')
            .select('line') 
            .attr('class', 'grid-line');

        return chartSVG;
    };


    return theChart;
}

module.exports = { newChart : newChart };
