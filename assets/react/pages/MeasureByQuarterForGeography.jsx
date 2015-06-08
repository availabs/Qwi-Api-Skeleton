/* jshint unused: true */

'use strict';


var React                = require('react'),
    SingleButtonDropdown = require('../components/SingleButtonDropdown.react.jsx'),
    geography_labels     = require('../../data/labels/geography.js'),
    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),
    LineChart            = require('../d3/basic_line_charts/MeasureByQuarterLineChart.react.jsx'),
    _                    = require('lodash');



var noOp = function(){};



var MeasureByQuarterForGeography = React.createClass ({

    'getInitialState': function () {
        var state_labels = _.pick(geography_labels, function(v, k) { return k.length === 2; });

        return { selection: state_labels, selected:[], pendingQuery: null, data: null };
    },

    'componentDidMount': function () {
        theStore.registerQueryResultReadyListener(this._handleResultReadyEvent);
    },

    'componentWillUnmount': function () {
        theStore.removeQueryResultReadyListener(this._handleResultReadyEvent);
    },

    'shouldComponentUpdate' : function (nextProps, nextState) {
        console.log('==> shouldComponentUpdate');
        return !nextState.pendingQuery; 
    },

    '_queryDataStore' : function (stateGeoCode) {
        var query = { geography: stateGeoCode, measure: 'hira' },
            data  = theStore.getMeasureByQuarterForGeography(query);

        if (data) { 
            console.log(data); 
            this.setState({ selected: [stateGeoCode], pendingQuery: null, data: data });
        }
        else { 
            console.log('Waiting on data'); 
            console.log(data);
            this.setState({ select: [stateGeoCode], pendingQuery: query, data:  null });
        }
    },

    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload === this.state.pendingQuery) {
            this.setState({ pendingQuery: null, data: eventPayload.data });
            console.log(eventPayload.data);
        }
    },

/*========================================================================
 *
 * Props:
 *          width
 *          height
 *          margin.top, margin.right, margin.bottom, margin.left
 *          data
 *          measure
 *          measure_label
 *
 *========================================================================*/
    render : function () {
        var chartMargins = { top: 50, right: 50, bottom: 30, left: 75 };

        console.log("=== Render ===");

        return (<div className="page" >

                    <SingleButtonDropdown // State SingleButtonDropdown
                        select    = { this.state.pendingQuery ? noOp : this._queryDataStore }
                        deselect  = { noOp }
                        selection = { this.state.selection }
                        selected  = { this.state.selected }
                        title     = { "States" }
                    />

                    <LineChart
                        width         = { 960 - chartMargins.left - chartMargins.right }
                        height        = { 500 - chartMargins.top - chartMargins.bottom }
                        margin        = { chartMargins }
                        data          = { this.state.data }
                        measure       = { 'hira' }
                        measure_label = { 'Hires, All' }
                    />
                        
                </div>);
    }
});

React.render (<MeasureByQuarterForGeography/>, document.getElementById('container'));

