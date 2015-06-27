'use strict';


var React                = require('react'),
    SimpleSideBar        = require('../components/layout/SimpleSideBar.react'),
    SingleButtonDropdown = require('../components/ui/SingleButtonDropdown.react'),
    geography_labels     = require('../../data/labels/geography.js'),
    measure_labels       = require('../../data/labels/measures.js'),
    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),
    LineChart            = require('../charts/basic_line_charts/MeasureByQuarterLineChart.react'),
    pageUtils            = require('./utils'),
    lodash               = require('lodash');



var MeasureByQuarterForGeography = React.createClass ({


    '_init': function() {

        this._reactivator = pageUtils.newReactivator(function(spareHeight) { 

                var vizAreaBottom = React.findDOMNode(this.refs.vizArea)
                                         .getBoundingClientRect().bottom - 1, 

                    sideBarTop    = React.findDOMNode(this.refs.sideBar)
                                         .getBoundingClientRect().top;

                this.setState({ 
                    vizHeight: (this.state.vizHeight + spareHeight),
                    isStacked: (vizAreaBottom <= sideBarTop),
                }); 

            }.bind(this) // jshint ignore:line
        );
    },
    

    'getInitialState': function () {

        var state_labels = lodash.pick(geography_labels, function(v, k) { return k.length === 2; });

        return { 
             state_labels    : state_labels,
             measure_labels  : measure_labels,

             stateSelected   : null,
             measureSelected : null,

             pendingQuery    : null,
             data            : null,

             vizHeight       : 1,
             isStacked       : undefined,
        };
    },


    'componentDidMount': function () {
        this._init();

        window.addEventListener('resize', this._reactivator);
        this._reactivator();

        theStore.registerQueryResultReadyListener(this._handleResultReadyEvent);
    },

    
    'componentDidUpdate': function () {
        this._reactivator();
    },


    'componentWillUnmount': function () {
        theStore.removeQueryResultReadyListener(this._handleResultReadyEvent);
        window.removeEventListener('resize', this._reactivator);
    },



    '_selectState' : function (stateGeoCode) {
        if (this.state.measureSelected) {
            this._queryDataStore({
                geography : stateGeoCode,
                measure   : this.state.measureSelected,
            });
        } else { this.setState({ stateSelected: stateGeoCode }); }
    },


    '_selectMeasure' : function (measure) {
        if (this.state.stateSelected) {
            this._queryDataStore({
                geography : this.state.stateSelected,
                measure   : measure,
            });
        } else { this.setState({ measureSelected: measure }); }
    },



    '_queryDataStore' : function (query) {
        var data = theStore.getMeasureByQuarterForGeography(query);

        this.setState ({
            stateSelected   : query.geography,
            measureSelected : query.measure,
            pendingQuery    : data ? null : query,
            data            : data
        });
    },


    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload === this.state.pendingQuery) {
            console.log(eventPayload.data);

            this.setState({ 
                pendingQuery: null, 
                data: eventPayload.data 
            });
        }
    },


    render : function () {

        var chartMargins = { 
                top: 50, 
                right: 50, 
                bottom: 30, 
                left: 75, 
            },

            statesSelector = (
                <SingleButtonDropdown 
                    select     = { this.state.pendingQuery ?  void(0) : this._selectState }
                    deselect   = { void(0) }
                    selection  = { this.state.state_labels }
                    selected   = { this.state.stateSelected }
                    title      = { 'States' }
                    dropUp     = { this.state.isStacked }
                    alignRight = { !this.state.isStacked }
                />
            ),

            measureSelector = (
                <SingleButtonDropdown 
                    select     = { this.state.pendingQuery ?  void(0) : this._selectMeasure }
                    deselect   = { void(0) }
                    selection  = { this.state.measure_labels }
                    selected   = { this.state.measureSelected }
                    title      = { 'QWI Measures' }
                    dropUp     = { this.state.isStacked }
                    alignRight = { !this.state.isStacked }
                />
                    
            );



        return (
                <div className='container' >
                    <div className='row top-buffer'>
                        <div ref='vizArea' className='col-md-11'>
                            <LineChart
                                height         = { this.state.vizHeight }
                                margin         = { chartMargins }

                                data           = { this.state.data }

                                entity_id      = { this.state.stateSelected }
                                measure        = { this.state.measureSelected }

                                entity_labels  = { geography_labels}
                                measure_labels = { measure_labels }
                            />
                        </div>
                        
                        <div ref='sideBar' className='col-md-1'>
                            <SimpleSideBar
                                selectors = { [statesSelector, measureSelector] }
                            />
                        </div>
                    </div>
                </div>
        );
    }
});

module.exports = MeasureByQuarterForGeography;

