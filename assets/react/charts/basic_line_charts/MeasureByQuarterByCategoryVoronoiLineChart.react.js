/*jshint strict:false , unused:false */
/*globals $ */

/* This file is in the process of a major refactoring.
 * Similar React components will also need refactoring.
 */                                   


var React                 = require('react'),
    voronoiMultilineChart = require('../../../d3/linecharts/voronoiMultiline');



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

    '_voronoiChart' : voronoiMultilineChart.newChart(),


    '_createVoronoiConfig' : function () {
        var theSVG = React.findDOMNode(this.refs.theSVG),
            props  = this.props;

        return {
            data            : props.data,
            height          : props.height,
            width           : theSVG.offsetWidth,
            margin          : props.margin,
            keyParser       : props.keyParser,
            mouseoverAction : props.mouseoverAction,
            yAxisLabel      : props.yAxisLabel,
        };
    },


    'shouldComponentUpdate': function (nextProps, nextState) {
        return  ( this.props.height !== nextProps.height ) ||
                ( this.props.data   !== nextProps.data   )  ;
    },


    'componentDidUpdate': function (prevProps, prevState) {
        var theSVG   = React.findDOMNode(this.refs.theSVG),
            theChart = this._voronoiChart.render(this._createVoronoiConfig());

        while (theSVG.firstChild) {
            theSVG.removeChild(theSVG.firstChild);
        }

        theSVG.appendChild(theChart.node());
    },


    'render' : function () {

        var props = this.props;

        return (
            <div>
                <h3 className='chart-title' >
                        { props.chartTitle }
                </h3>

                <svg id        = { props.chartID }
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
