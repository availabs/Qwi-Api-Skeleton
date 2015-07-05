/* global $ */

'use strict';


var React                = require('react'),

    SimpleSideBar        = require('../components/layout/SimpleSideBar.react'),
    SingleButtonDropdown = require('../components/ui/SingleButtonDropdown.react'),
    SavePNGButton        = require('../components/ui/SaveAsPNG_Button.react'),

    geography_labels     = require('../../data/labels/geography'),
    measure_labels       = require('../../data/labels/measures'),
    category_labels      = require('../../data/labels/categories'),

    aggregationDefaults  = require('../../data/aggregation_categories/defaults'),

    theStore             = require('../../flux/stores/QuarterlyMeasureByGeographyStore'),

    LineChart            = require('../charts/basic_line_charts/MeasureByQuarterByCategoryVoronoiLineChart.react.js'),

    pageUtils            = require('./utils'),
    d3Utils              = require('../../d3/linecharts/utils'),
    lodash               = require('lodash');


var categoryLabelsTable  = {
    
    industry  : require('../../data/labels/industry')  ,
    sex       : require('../../data/labels/sex')       ,
    agegrp    : require('../../data/labels/agegrp')    ,
    race      : require('../../data/labels/race')      ,
    ethnicity : require('../../data/labels/ethnicity') ,
    education : require('../../data/labels/education') ,
    firmage   : require('../../data/labels/firmage')   ,
    firmsize  : require('../../data/labels/firmsize')  ,
};


function preprocessChartSVGForExport (theClone) {
    $(theClone).find('.line_label')
               .each(function() { 
                         $(this).css('opacity', 1);
                     });
}



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
             state_labels         : state_labels        ,
             subgeography_labels  : subgeography_labels ,
             measure_labels       : measure_labels      ,
             category_labels      : category_labels     ,

             stateSelected        : null                ,
             subgeographySelected : null                ,
             measureSelected      : null                ,
             categorySelected     : null                ,

             pendingQuery         : null                ,
             data                 : []                  ,

             chartHeight          : 1                   ,
             isStacked            : undefined           ,
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



    //FIXME: Possible Async Problem!!!
    '_queryDataStore' : function (query) {
        
        var data     = theStore.getMeasureByQuarterByCategoryForGeography(query),
            newState = {
                stateSelected        : query.geography.substring(0, 2)                       ,
                subgeographySelected : (query.geography.length > 2) ? query.geography : null ,
                measureSelected      : query.measure                                         ,
                categorySelected     : query.category                                        ,
                pendingQuery         : data ? null : query                                   ,
                data                 : data                                                  ,
            };
            
        this.setState(newState);
    },

//FIXME: Lines only render the first time. After that error.

    '_parseTheData' : function (theData) {
    
        var measure              = this.state.measureSelected,
            category             = this.state.categorySelected,
            categoryLabels       = categoryLabelsTable[category],
            subcategoriesDataObj = {};

        if (!theData) { return []; } //FIXME: hack

        theData.forEach(function(d) {

            if (d[measure] === null || d[measure] === undefined) { return; }

            if (d[category].trim() === aggregationDefaults[category]) { return; }

            var subcategory = categoryLabels[d[category].trim()],
                dataArr     = subcategoriesDataObj[subcategory],
                datum       = {};

            if (!dataArr) {
                dataArr = subcategoriesDataObj[subcategory] = [];
            } 

            datum.key   = d3Utils.parseQuarterToDate(d.quarter, d.year);
            datum.value = +d[measure];

            dataArr[dataArr.length] = datum;
        });


        return Object.keys(subcategoriesDataObj)
                     .reduce(function(accumulator, key) { 
                                 accumulator[accumulator.length] = { key   : key, 
                                                                     values: subcategoriesDataObj[key] }; 
                                 return accumulator; 
                     }, []);
    },




    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload === this.state.pendingQuery) {
            this.setState({ 
                pendingQuery : null              ,
                data         : eventPayload.data ,
            });
        }
    },


    '_getChartTitle': function () {
        var state = this.state,
            geography;
            
            if (state.subgeographySelected) {
                geography = geography_labels[state.subgeographySelected];
            } else {
                geography = (state.stateSelected)                          ?
                                geography_labels[this.state.stateSelected] :
                                '<Geo Area>'                               ;
            }

        return  ( measure_labels[state.measureSelected]     || '<QWI Measure>'  )  +
                ' by quarter by '                                                  +
                ( category_labels[state.categorySelected]   || '<QWI Category>' )  +
                ' for '                                                            +
                geography;
    },




    'render' : function () {

        var chartID    = 'measureByQuarterByCategoryVoronoiLineChart',
            chartTitle = this._getChartTitle(),
            
            chartMargins = { 
                top    : 15,
                right  : 15,
                bottom : 30,
                left   : 100, //FIXME: Reserve space for axis in chart, not here.
            },

            data = this._parseTheData(this.state.data),

            state = this.state,

            statesSelector = (
                <SingleButtonDropdown 
                    select     = { state.pendingQuery ?
                                        void(0)       :
                                        this._selectState                                  }
                    deselect   = { void(0)                                                 }
                    selection  = { state.state_labels                                      }
                    selected   = { state.subgeographySelected ? null : state.stateSelected }
                    title      = { 'States'                                                }
                    dropUp     = { state.isStacked                                         }
                    alignRight = { !state.isStacked                                        }
                />
            ),

            subgeographySelector = (
                <SingleButtonDropdown 
                    select     = { (state.pendingQuery || !state.stateSelected) ?
                                        void(0)                                 :
                                        this._selectSubgeography                        }
                    deselect   = { void(0)                                              }
                    selection  = { state.subgeography_labels[state.stateSelected] || [] }
                    selected   = { state.subgeographySelected                           }
                    title      = { 'Sub-Geographies'                                    }
                    dropUp     = { state.isStacked                                      }
                    alignRight = { !state.isStacked                                     }
                />
            ),


            measureSelector = (
                <SingleButtonDropdown
                    select     = { state.pendingQuery ?
                                        void(0)       :
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
            ),
            


            saveSvgAsPngButton = (
                <SavePNGButton 
                    svgID           = { chartID                     }
                    enabled         = { !!(data && data.length)     }
                    padding         = { { right: 5 }                }
                    pre_process     = { preprocessChartSVGForExport }
                    defaultFileName = { chartTitle                  }
                    text            = { 'Export as PNG'             }
                />
            ),

            
            linechart = (this.state.chartHeight > 100) ?
                        (   <LineChart
                                height          = { this.state.chartHeight             }
                                margin          = { chartMargins                       }

                                data            = { data                               }

                                geography       = { this.state.subgeographySelected ||
                                                    this.state.stateSelected           }
                                measure         = { this.state.measureSelected         }
                                category        = { this.state.categorySelected        }

                                chartID         = { chartID                            }
                                chartTitle      = { chartTitle                         }

                                measure_labels  = { measure_labels                                   }
                                category_labels = { categoryLabelsTable[this.state.categorySelected] }

                                keyParser       = { d3Utils.parseDateToQuarterYear }
                            />
                        ) :
                        (<h5>{'Not enough screen space to render the line chart.'}</h5>);
                            


        return (
                <div className='container' >
                    <div className='row top-buffer'>
                        <div ref='vizArea' className='col-md-10'>
                            { linechart } 
                        </div>
                        <div ref='sideBar' className='col-md-2 noWrap'>
                            <SimpleSideBar
                                selectors = {[  statesSelector, 
                                                subgeographySelector,
                                                measureSelector, 
                                                categorySelector,
                                                saveSvgAsPngButton  ]}
                            />
                        </div>
                    </div>
                </div>
        );
    }
});

module.exports = MeasureByQuarterByCategoryForGeography;

