/* jshint unused: true */

'use strict';


var React                = require('react'),
    SimpleSideBar        = require('../components/layout/SimpleSideBar.react'),
    SingleButtonDropdown = require('../components/ui/SingleButtonDropdown.react'),
    geography_labels     = require('../../data/labels/geography.js'),
    measure_labels       = require('../../data/labels/measures.js'),
    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),
    LineChart            = require('../d3/basic_line_charts/MeasureByQuarterLineChart.react'),
    _                    = require('lodash');



// We need to see if there have been any changes in the window size or layout.
// We need the reactivator to be a Singleton. We can't have tangled async code.
// 
//  Params:
//      callback -- function that receives the spareHeight in the window.
//
function newReactivator (callback) {

    var COUNTER_DEFAULT  = 10,
        INTERVAL_DEFAULT = 100,
        CLASSNAME        = 'container';

    return (function () { 

        // Variables available across calls to the reactivator.
        var counter,
            intervalID,
            innerHeight,
            lowest;

        // Function returned to the caller of newReactivator...
        return function (debugMsg) {

            counter = COUNTER_DEFAULT;


            if (intervalID) { return; } // Keep on keeping on, with your refreshed counter.


            intervalID = window.setInterval(function() {

                innerHeight = window.innerHeight;
                lowest      = document.getElementsByClassName(CLASSNAME)[0]
                                      .getBoundingClientRect().bottom;

                if(debugMsg) { console.log(debugMsg + ': ' + lowest + '~' + innerHeight); }

                if(lowest !== innerHeight) {
                    callback(innerHeight - lowest);
                    
                    // This could cause problems. Maybe just use counter???
                    window.clearInterval(intervalID); 
                    intervalID = null;
                }

                if(!(--counter)) { 
                    window.clearInterval(intervalID); 
                    intervalID = null;
                }

            }, INTERVAL_DEFAULT);
        };
    }());
}


var MeasureByQuarterForGeography = React.createClass ({


    '_init': function() {
        this._reactivator = newReactivator((function(spareHeight) { 
                                    this.setState({ vizHeight: (this.state.vizHeight + spareHeight) }); 
                                }).bind(this) // jshint ignore:line
                            );
    },
    

    'getInitialState': function () {
        var state_labels = _.pick(geography_labels, function(v, k) { return k.length === 2; });


        return { 
                 geographiesSelection : state_labels,
                 geographiesSelected  : [],

                 measureSelection     : measure_labels,
                 measuresSelected     : [],

                 pendingQuery         : null,
                 data                 : null,

                 vizHeight            : 1,
        };
    },


    'componentDidMount': function () {
        this._init();

        window.addEventListener('resize', this._reactivator);

        theStore.registerQueryResultReadyListener(this._handleResultReadyEvent);

        this._reactivator('didMount');
    },

    
    'componentDidUpdate': function () {
        this._reactivator('didUpdate');
    },


    'componentWillUnmount': function () {
        theStore.removeQueryResultReadyListener(this._handleResultReadyEvent);
        window.removeEventListener('resize', this._reactivator);
    },



    '_selectState' : function (stateGeoCode) {
        if (this.state.measuresSelected.length) {
            this._queryDataStore({
                geography : stateGeoCode,
                measure   : this.state.measuresSelected[0],
            });
        } else { this.setState({ geographiesSelected: [stateGeoCode] }) ; }
    },


    '_selectMeasure' : function (measure) {
        if (this.state.geographiesSelected.length) {
            this._queryDataStore({
                geography : this.state.geographiesSelected[0],
                measure   : measure,
            });
        } else { this.setState({ measuresSelected: [measure] }) ; }
    },



    '_queryDataStore' : function (query) {
        var data = theStore.getMeasureByQuarterForGeography(query);

        console.log(query);

        this.setState ({
            geographiesSelected : [query.geography], 
            measuresSelected    : [query.measure],
            pendingQuery        : data ? null : query,
            data                : data 
        });
    },


    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload === this.state.pendingQuery) {
            this.setState({ pendingQuery: null, data: eventPayload.data });
            console.log(eventPayload.data);
        }
    },




    render : function () {

        var chartMargins = { top: 50, right: 50, bottom: 30, left: 75, },

            statesSelector = (
                <SingleButtonDropdown 
                    select    = { this.state.pendingQuery ?  void(0) : this._selectState }
                    deselect  = { void(0) }
                    selection = { this.state.geographiesSelection }
                    selected  = { this.state.geographiesSelected  }
                    title     = { 'States' }
                />
            ),

            measureSelector = (
                <SingleButtonDropdown 
                    select    = { this.state.pendingQuery ?  void(0) : this._selectMeasure }
                    deselect  = { void(0) }
                    selection = { this.state.measureSelection }
                    selected  = { this.state.measuresSelected }
                    title     = { 'QWI Measures' }
                />
                    
            );

        return (
                <div className='container' style={{'background-color':'maroon'}}>
                    <div className='row top-buffer'>
                        <div ref='vizArea' className='col-md-11'>
                            <LineChart
                                height        = { this.state.vizHeight }
                                margin        = { chartMargins }
                                data          = { this.state.data }
                                measure       = { this.state.measuresSelected.length ? this.state.measuresSelected[0] : null }
                                measure_label = { this.state.measuresSelected.length ? measure_labels[this.state.measuresSelected[0]] : null }
                            />
                        </div>
                        
                        <div className='col-md-1'>
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

