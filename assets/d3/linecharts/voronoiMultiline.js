/*jshint strict:false , unused:false */
/*globals $ */


// FIXME: STATEFUL!!!
//          Only place where state matters is remembering layout to determine whether to reinit axes. 
//          Unnecessary, minor optimization.

var React  = require('react'),
    d3     = require('d3'),
    lodash = require('lodash'),
    utils  = require('./utils');


const MARGIN_DEFAULTS = { top:0, right:0, bottom:0, left:0 };

function prepareData (leChart) {
    addCircularRefToDataValues(leChart);
    sortDataForLabelStacking(leChart);
}

function noData (leChart) {
    return !(leChart.data && leChart.data.length);
}

function newChart () {

    var theChart  = {},
        leChart   = {};  //Internal to newChart

    theChart.render = function (config) {

        updateLeChart(leChart, config);

        if (noData(leChart)) { return leChart.chartSVG; }


        updateDomains(leChart);

        prepareData(leChart);

        leChart.categoriesG = newCategoriesG(leChart);

        appendLinesToCategoriesG(leChart);
        appendTransparentLabelsToLines(leChart);


        leChart.focus = leChart.theVizG.append("g")
                    .attr("transform", "translate(-100,-100)")
                    .attr("class", "focus");

        leChart.focus.append("circle")
            .attr("r", 3.5)
            .each(pulse);

        leChart.focus.append("text")
             .attr("y", -10);

		function pulse() {
			var circle = leChart.focus.select("circle");
			(function repeat() {
				circle = circle.transition()
					.duration(500)
					.attr("stroke-width", 0.2)
                    .attr('fill', 'white')
                    .attr('fill-opacity', 0.9)
					.attr("r", 2)
					.transition()
					.duration(500)
					.attr('stroke-width', 1)
                    .attr('fill-opacity', 0.75)
					.attr("r", 3)
					.ease('elastic')
					.each("end", repeat);
			})();
        }


        var voronoi = d3.geom.voronoi()
                             .x(function(d) { return leChart._x(d.key); })
                             .y(function(d) { return leChart._y(d.value); })
                             .clipExtent([[ -leChart.margin.left, -leChart.margin.top], 
                                          [ leChart.width + leChart.margin.right, leChart.height + leChart.margin.bottom]]);

        var voronoiGroup = leChart.theVizG.append("g")
                               .attr("class", "voronoi");

        voronoiGroup.selectAll("path")
                    .data(voronoi(d3.nest()
                                    .key(function (d) { 
                                        return leChart._x(d.key) + "," + leChart._y(d.value); })
                                    .rollup(function (v) { return v[0]; })
                                    .entries(d3.merge(leChart.data.map(function (d) {return d.values;})))
                                    .map(function(d) { return d.values; })))
                    .enter().append("path")
                            .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
                            .datum(function(d) { return d.point; })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);


        function mouseover(d) {
            var textNode    = leChart.focus.select('text'),
                pointXCoord = leChart._x(d.key),
                pointYCoord = leChart._y(d.value),

                realWidth   = leChart.width  - leChart.margin.left - leChart.margin.right,
                realHeight  = leChart.height - leChart.margin.top  - leChart.margin.bottom,

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
              .classed("line-hover", true);

            d.circularRef.line.parentNode.appendChild(d.circularRef.line);

            textNode.selectAll('*').remove();

            textNode.style('text-shadow', '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black,' +
                                          '5px 5px 5px black'  )
                    .style('font-size', '20px')
                    .style('stroke', leChart.color(d.circularRef.key) )
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

            leChart.focus.attr("transform", "translate(" + pointXCoord + "," + pointYCoord + ")");


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

            leChart.focus.attr("transform", "translate(-100,-100)");
        }

        leChart.theVizG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + 
                                (leChart.height - leChart.margin.bottom - leChart.margin.top) + ')')
            .style('font-size', '10px')
            .call(leChart._xAxis);

        leChart.theVizG.append('g')
            .attr('class', 'y axis')
            .style('font-size', '10px')
            .call(leChart._yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .text(leChart.yAxisLabel);

        leChart.theVizG.selectAll('g.tick')
            .select('line') 
            .attr('class', 'grid-line');


        return leChart.chartSVG;
    };


    return theChart;
}


function getNestedExtents (leChart, fieldName) {
    return d3.extent(leChart.data.map(function(d) { 
                                        return d3.extent(d.values, function(d) { 
                                            return d[fieldName]; }); }) 
                            .reduce(function(agg, cur) { return agg.concat(cur); }, []));
} 

// FIXME: Side-effects.
function addCircularRefToDataValues (leChart) {
    var i, ii;

    for (i = 0; i < leChart.data.length; ++i) {
        for (ii = 0; ii < leChart.data[i].values.length; ++ii) {
            leChart.data[i].values[ii].circularRef = leChart.data[i]; 
        } 
    }
}

// FIXME: Side-effects.
function sortDataForLabelStacking (leChart) {
    leChart.data.sort(function(a,b) { 
        return a.values[a.values.length -1].value - b.values[b.values.length -1].value;
    });
}

// Add the labels to the lines. 
// The labels are stacked so that they do not obscure each other.
// They are also transparent and outside of leChart.chartSVG.
// They are made visible and leChart.chartSVG widened during export to PNG.
function appendTransparentLabelsToLines (leChart) {
    var FONT_SIZE = 10;

    var maxY_translation = Number.POSITIVE_INFINITY,
        xTranslation     = d3.max(leChart.data, function(d) { 
                                return leChart._x(d.values[d.values.length -1].key); 
                           }),

        lineLabelHeight = FONT_SIZE + 2;

    leChart.categoriesG.append('text')
               .datum(function (d) { return { key   : d.key,
                                              value : d.values[d.values.length -1].value }; })
               .attr('x', 3)
               .attr('dy', '0.35em')
               .text(function (d) { return d.key; })
               .style('font-size', FONT_SIZE + 'px')
               .style('fill', function(d) { return leChart.color(d.key); })
               .style('opacity', 0) // Hide the label. Reveal in PNG export.
               .attr('class', 'line_label')
               .attr('transform', function(d, i) { 
                   var yTranslation;

                   yTranslation = Math.min(leChart._y(d.value) + lineLabelHeight, 
                                           maxY_translation);

                   maxY_translation = yTranslation - Math.ceil(lineLabelHeight/2.0) - 2;

                   return 'translate(' + xTranslation + ',' + maxY_translation + ')'; 
                });
}

function didLayoutChange (leChart, newLayout) {
    return (leChart.width  !== newLayout.width)  ||
           (leChart.height !== newLayout.height) ||
           !lodash.isEqual(leChart.margin, newLayout.margin);
}

function newChartSVG (leChart) { 
    return d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
                   .style('width' , leChart.width)
                   .style('height', leChart.height);
}

function newVizG (leChart) {
    return leChart.chartSVG.append('g')
                           .style('width' , leChart.width)
                           .style('height', leChart.height - leChart.margin.top - leChart.margin.bottom)
                           .attr('transform', 'translate('          +
                                                leChart.margin.left +
                                                ','                 +
                                                leChart.margin.top  +
                                                ')'
                                );
}

function newCategoriesG (leChart) {
    return leChart.theVizG.selectAll('.category')
                     .data(leChart.data)
                  .enter().append('g')
                     .attr('class', 'category');
}

function appendLinesToCategoriesG (leChart) {
    leChart.categoriesG.append('path')
        .attr('class', 'line')
        .attr('d', function (d) {
                       d.line = this;
                       return leChart._line(d.values); })
        .style('stroke', function(d) { return leChart.color(d.key); });
}

function updateDomains (leChart) {
    leChart.color.domain(leChart.data.map(function(d) { return d.key; }));
    leChart._x.domain(getNestedExtents(leChart, 'key'));
    leChart._y.domain(getNestedExtents(leChart, 'value'));
}

function updateLeChart (leChart, config) {

    var newLayout  = {
            margin : lodash.defaults(config.margin, MARGIN_DEFAULTS),
            width  : config.width,
            height : config.height,
        },

        mustReinit = didLayoutChange(leChart, newLayout);

    lodash.assign(leChart, newLayout);

    leChart.data  = config.data;
    leChart.color = d3.scale.category20();

    leChart.chartSVG = newChartSVG(leChart);
    leChart.theVizG  = newVizG(leChart);

    if (mustReinit) { utils.initByQuarterLineChartBasics(leChart); }
}



module.exports = { newChart : newChart };



