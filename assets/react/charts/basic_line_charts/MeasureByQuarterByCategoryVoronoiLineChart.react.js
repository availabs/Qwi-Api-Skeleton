/*jshint strict:false , unused:false */
/*globals $ */

/* This file is in the process of a major refactoring.
 * Similar React components will also need refactoring.
 */                                   


var React                 = require('react'),
    d3                    = require('d3'),
    saveSvgAsPng          = require('save-svg-as-png').saveSvgAsPng,
    geography_labels      = require('../../../data/labels/geography'),
    category_descriptions = require('../../../data/labels/categories'),
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
            rightPadding = 5,

            // FIXME: There has to be a better way...
            exportablesRightBounds = $('#foobar').find('.exportable')
                                                 .map(function() { return this.getBoundingClientRect().right; })
                                                 .toArray(),

            width = Math.max.apply(null, exportablesRightBounds);

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
