'use strict';


var React                = require('react'),

    SimpleSideBar        = require('../components/layout/SimpleSideBar.react'),
    SingleButtonDropdown = require('../components/ui/SingleButtonDropdown.react'),

    geography_labels     = require('../../data/labels/geography'),
    measure_labels       = require('../../data/labels/measures'),
    category_labels      = require('../../data/labels/categories'),

    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),

    LineChart            = require('../charts/basic_line_charts/MeasureByQuarterByCategoryVoronoiLineChart.react.js'),

    pageUtils            = require('./utils'),
    lodash               = require('lodash');


var categoryLabelsTable  = {
    
    industry  : require('../../data/labels/industry'),
    sex       : require('../../data/labels/sex'),
    agegrp    : require('../../data/labels/agegrp'),
    race      : require('../../data/labels/race'),
    ethnicity : require('../../data/labels/ethnicity'),
    education : require('../../data/labels/education'),
    firmage   : require('../../data/labels/firmage'),
    firmsize  : require('../../data/labels/firmsize'),

};



var MeasureByQuarterByCategoryForGeography = React.createClass ({


    '_init': function() {

        this._reactivator = pageUtils.newReactivator(function(spareHeight) { 

                var vizAreaBottom = React.findDOMNode(this.refs.vizArea)
                                         .getBoundingClientRect().bottom - 1, 

                    sideBarTop    = React.findDOMNode(this.refs.sideBar)
                                         .getBoundingClientRect().top;

                this.setState({ 
                    chartHeight : (this.state.chartHeight + spareHeight),
                    isStacked   : (vizAreaBottom <= sideBarTop),
                }); 

            }.bind(this) // jshint ignore:line
        );
    },
    

    'getInitialState': function () {

        var state_labels  = lodash.pick(geography_labels, 
                                        function(v, k) { 
                                            return k.length === 2; 
                                        }),
                            
                            // Partition the subgeography labels by state.
                            // Would make sense to have this already done on the server.
            subgeography_labels = Object.keys(geography_labels)
                                        .reduce(function (accumulator, geocode) {
                                              var state,
                                                  subgeos;

                                              if (geocode.length > 2) { 
                                              
                                                  state   = geocode.substring(0,2);
                                                  subgeos = accumulator[state] || {};

                                                  subgeos[geocode] = geography_labels[geocode];

                                                  accumulator[state] = subgeos;
                                              }

                                              return accumulator;
                                        }, {});

        return { 
             state_labels         : state_labels,
             subgeography_labels  : subgeography_labels,
             measure_labels       : measure_labels,
             category_labels      : category_labels,

             stateSelected        : null,
             subgeographySelected : null,
             measureSelected      : null,
             categorySelected     : null,

             pendingQuery         : null,
             data                 : null,

             chartHeight          : 1,
             isStacked            : undefined,
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


    //
    // TODO: Refactor these `_select*` functions to use Actions.
    //       Logical time to do this is after Voronoi, when using the 
    //          actions generated in the chart to drill down into
    //          the selected line's entity.
    //
    '_selectState' : function (stateGeoCode) {
        if (this.state.measureSelected && this.state.categorySelected) {
            this._queryDataStore({
                geography : stateGeoCode,
                measure   : this.state.measureSelected,
                category  : this.state.categorySelected,
            });
        } else { this.setState({ stateSelected: stateGeoCode, subgeographySelected: null }); }
    },


    '_selectSubgeography' : function (subgeography) {
        if (this.state.measureSelected && this.state.categorySelected) {
            this._queryDataStore({
                geography : subgeography,
                measure   : this.state.measureSelected,
                category  : this.state.categorySelected,
            });
        } else { this.setState({ subgeographySelected : subgeography }); }
    },


    '_selectMeasure' : function (measure) {
        if (this.state.stateSelected && this.state.categorySelected) {
            this._queryDataStore({
                geography : this.state.subgeographySelected || this.state.stateSelected,
                measure   : measure,
                category  : this.state.categorySelected,
            });
        } else { this.setState({ measureSelected : measure }); }
    },


    '_selectCategory' : function (category) {
        if (this.state.stateSelected && this.state.measureSelected) {
            this._queryDataStore({
                geography : this.state.subgeographySelected || this.state.stateSelected,
                measure   : this.state.measureSelected,
                category  : category,
            });
        } else { this.setState({ categorySelected: category }); }
    },



    '_queryDataStore' : function (query) {
        var data     = theStore.getMeasureByQuarterByCategoryForGeography(query),
            newState = {
                stateSelected        : query.geography.substring(0, 2)      ,
                subgeographySelected : (query.geography.length > 2) ? query.geography : null ,
                measureSelected      : query.measure                        ,
                categorySelected     : query.category                       ,
                pendingQuery         : data ? null : query                  ,
                data                 : data                                 ,
            };
            
        this.setState(newState);
    },


    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload === this.state.pendingQuery) {
            this.setState({ 
                pendingQuery : null,
                data         : eventPayload.data,
            });
        }
    },


    render : function () {

        var chartMargins = { 
                top    : 20,
                right  : 150 + (this.state.categorySelected === 'industry' ? 150 : 0), //FIXME
                bottom : 30,
                left   : 100,
            },

            state = this.state,

            statesSelector = (
                <SingleButtonDropdown 
                    select     = { state.pendingQuery ?
                                        void(0)       :
                                        this._selectState }
                    deselect   = { void(0)                   }
                    selection  = { state.state_labels        }
                    selected   = { state.subgeographySelected ? null : state.stateSelected }
                    title      = { 'States'                  }
                    dropUp     = { state.isStacked           }
                    alignRight = { !state.isStacked          }
                />
            ),

            subgeographySelector = (
                <SingleButtonDropdown 
                    select     = { (state.pendingQuery || !state.stateSelected) ?
                                        void(0)                                 :
                                        this._selectSubgeography                  }
                    deselect   = { void(0)                                        }
                    selection  = { state.subgeography_labels[state.stateSelected] || [] }
                    selected   = { state.subgeographySelected                     }
                    title      = { 'Sub-Geographies'                              }
                    dropUp     = { state.isStacked                                }
                    alignRight = { !state.isStacked                               }
                />
            ),


            measureSelector = (
                <SingleButtonDropdown
                    select     = { state.pendingQuery ?
                                        void(0)            :
                                        this._selectMeasure }
                    deselect   = { void(0)                  }
                    selection  = { state.measure_labels     }
                    selected   = { state.measureSelected    }
                    title      = { 'QWI Measures'           }
                    dropUp     = { state.isStacked          }
                    alignRight = { !state.isStacked         }
                />
            ),

            categorySelector = (
                <SingleButtonDropdown
                    select     = { state.pendingQuery ?
                                        void(0)            :
                                        this._selectCategory }
                    deselect   = { void(0)                   }
                    selection  = { state.category_labels     }
                    selected   = { state.categorySelected    }
                    title      = { 'QWI Categories'          }
                    dropUp     = { state.isStacked           }
                    alignRight = { !state.isStacked          }
                />
            );


        return (
                <div className='container' >
                    <div className='row top-buffer'>
                        <div ref='vizArea' className='col-md-11'>
                            <LineChart
                                height          = { this.state.chartHeight      }
                                margin          = { chartMargins                }

                                data            = { this.state.data             }

                                geography       = { this.state.subgeographySelected || this.state.stateSelected }
                                measure         = { this.state.measureSelected  }
                                category        = { this.state.categorySelected }

                                measure_labels  = { measure_labels              }
                                category_labels = { categoryLabelsTable[this.state.categorySelected] }

                            />
                        </div>
                        
                        <div ref='sideBar' className='col-md-1 noWrap'>
                            <SimpleSideBar
                                selectors = {[  statesSelector, 
                                                subgeographySelector,
                                                measureSelector, 
                                                categorySelector  ]}
                            />
                        </div>
                    </div>
                </div>
        );
    }
});

module.exports = MeasureByQuarterByCategoryForGeography;

