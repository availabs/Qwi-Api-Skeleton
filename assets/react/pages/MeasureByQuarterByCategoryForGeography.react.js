'use strict';


var React                = require('react'),

    SimpleSideBar        = require('../components/layout/SimpleSideBar.react'),
    SingleButtonDropdown = require('../components/ui/SingleButtonDropdown.react'),

    geography_labels     = require('../../data/labels/geography'),
    measure_labels       = require('../../data/labels/measures'),
    category_labels      = require('../../data/labels/categories'),

    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),

    LineChart            = require('../d3/basic_line_charts/MeasureByQuarterByCategoryLineChart.react'),

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

        var state_labels = lodash.pick(geography_labels, function(v, k) { return k.length === 2; });

        return { 
             state_labels     : state_labels,
             measure_labels   : measure_labels,
             category_labels  : category_labels,

             stateSelected    : null,
             measureSelected  : null,
             categorySelected : null,

             pendingQuery     : null,
             data             : null,

             chartHeight      : 1,
             isStacked        : undefined,
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


    // TODO: Refactor these `_select*` functions to use Actions.
    '_selectState' : function (stateGeoCode) {
        if (this.state.measureSelected && this.state.categorySelected) {
            this._queryDataStore({
                geography : stateGeoCode,
                measure   : this.state.measureSelected,
                category  : this.state.categorySelected,
            });
        } else { this.setState({ stateSelected: stateGeoCode }); }
    },


    '_selectMeasure' : function (measure) {
        if (this.state.stateSelected && this.state.categorySelected) {
            this._queryDataStore({
                geography : this.state.stateSelected,
                measure   : measure,
                category  : this.state.categorySelected,
            });
        } else { this.setState({ measureSelected : measure }); }
    },


    '_selectCategory' : function (category) {
        if (this.state.stateSelected && this.state.measureSelected) {
            this._queryDataStore({
                geography : this.state.stateSelected,
                measure   : this.state.measureSelected,
                category  : category,
            });
        } else { this.setState({ categorySelected: category }); }
    },



    '_queryDataStore' : function (query) {
        var data = theStore.getMeasureByQuarterByCategoryForGeography(query);

        this.setState ({
            stateSelected    : query.geography     ,
            measureSelected  : query.measure       ,
            categorySelected : query.category      ,
            pendingQuery     : data ? null : query ,
            data             : data                ,
        });
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

            statesSelector = (
                <SingleButtonDropdown 
                    select     = { this.state.pendingQuery ?
                                        void(0)            :
                                        this._selectState      }
                    deselect   = { void(0)                     }
                    selection  = { this.state.state_labels     }
                    selected   = { this.state.stateSelected    }
                    title      = { 'States'                    }
                    dropUp     = { this.state.isStacked        }
                    alignRight = { !this.state.isStacked       }
                />
            ),

            measureSelector = (
                <SingleButtonDropdown
                    select     = { this.state.pendingQuery ?
                                        void(0)            :
                                        this._selectMeasure    }
                    deselect   = { void(0)                     }
                    selection  = { this.state.measure_labels   }
                    selected   = { this.state.measureSelected  }
                    title      = { 'QWI Measures'              }
                    dropUp     = { this.state.isStacked        }
                    alignRight = { !this.state.isStacked       }
                />
            ),

            categorySelector = (
                <SingleButtonDropdown
                    select     = { this.state.pendingQuery ?
                                        void(0)            :
                                        this._selectCategory   }
                    deselect   = { void(0)                     }
                    selection  = { this.state.category_labels  }
                    selected   = { this.state.categorySelected }
                    title      = { 'QWI Categories'            }
                    dropUp     = { this.state.isStacked        }
                    alignRight = { !this.state.isStacked       }
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

                                geography       = { this.state.stateSelected    }
                                measure         = { this.state.measureSelected  }
                                category        = { this.state.categorySelected }

                                measure_labels  = { measure_labels              }
                                category_labels = { categoryLabelsTable[this.state.categorySelected] }

                            />
                        </div>
                        
                        <div ref='sideBar' className='col-md-1 noWrap'>
                            <SimpleSideBar
                                selectors = {[  statesSelector, 
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

