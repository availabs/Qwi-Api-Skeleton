'use strict';



var React        = require('react'),
    Router       = require('react-router'),
    Route        = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    App          = require('./pages/layout.react'),

    AVAILHome                              = require('./pages/AVAILHome.react'),
    MeasureByQuarterForGeography           = require('./pages/MeasureByQuarterForGeography.react'),
    MeasureByQuarterForGeographyTable      = require('./pages/MeasureByQuarterForGeographyTable.react'),
    MeasureByQuarterByCategoryForGeography = require('./pages/MeasureByQuarterByCategoryForGeography.react');



//TODO: Try this...  http://stackoverflow.com/a/29319612
var vizualizationRoutes = {
    'Measure By Quarter For Geometry'             : 'measure_by_quarter_for_geometry',
    'Measure By Quarter For Geometry Table'       : 'measure_by_quarter_for_geometryi_table',
    'Measure By Quarter By Category For Geometry' : 'measure_by_quarter_by_category_for_geography',
};

var AppWrapper = React.createClass({

    'render': function () {
        return (
            <App routes={ vizualizationRoutes } />
        );
    },
});



var routes = (
    <Route name='app' path='/' handler={ AppWrapper }>

        <Route  name='AVAILHome' 
                path='home'  
                handler={ AVAILHome } />

        <Route  name='Measure By Quarter For Geometry' 
                path='measure_by_quarter_for_geometry'  
                handler={ MeasureByQuarterForGeography } />

        <Route  name='Measure By Quarter For Geometry Table' 
                path='measure_by_quarter_for_geometry_table'  
                handler={ MeasureByQuarterForGeographyTable } />

        <Route  name='Measure By Quarter By Category For Geometry' 
                path='measure_by_quarter_by_category_for_geography'  
                handler={ MeasureByQuarterByCategoryForGeography } />

        <DefaultRoute handler={ AVAILHome }/>
    </Route>
);



Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.body);
});

