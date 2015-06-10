'use strict';



var React        = require('react'),
    Router       = require('react-router'),
    Route        = Router.Route,
    DefaultRoute = Router.DefaultRoute,

    App          = require('./pages/layout.react'),

    AVAILHome                    = require('./pages/AVAILHome.react'),
    MeasureByQuarterForGeography = require('./pages/MeasureByQuarterForGeography.react'),
    NewHiresByCountyForState     = require('./pages/NewHiresByCountyForState.react');



//TODO: Try this...  http://stackoverflow.com/a/29319612
var vizualizationRoutes = {
    'Measure By Quarter For Geometry' : 'measure_by_quarter_for_geometry',
    'New Hires By County For State'   : 'new_hires_by_county_for_state', 
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

        <Route  name='New Hires By County For State' 
                path='new_hires_by_county_for_state'  
                handler={ NewHiresByCountyForState } />

        <Route  name='Measure By Quarter For Geometry' 
                path='measure_by_quarter_for_geometry'  
                handler={ MeasureByQuarterForGeography } />

        <DefaultRoute handler={ AVAILHome }/>
    </Route>
);



Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.body);
});

