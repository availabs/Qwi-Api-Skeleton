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

    '_voronoiChart' : undefined, // Initialized in componentDidMount


    'componentDidMount': function () {
        this._voronoiChart = voronoiMultilineChart.newChart.call(this);
    },


    'shouldComponentUpdate': function (nextProps, nextState) {
        // TODO: Figure out why width resizing is free.
        return  ( this.props.height !== nextProps.height ) ||
                ( this.props.data   !== nextProps.data   )  ;
    },



    'componentDidUpdate': function (prevProps, prevState) {
        if (this.props.height !== prevProps.height) {
            this._voronoiChart.init();
        }

        this._voronoiChart.update();
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
