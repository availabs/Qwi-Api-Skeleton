'use strict';



var React        = require('react'),
    RouteHandler = require('react-router').RouteHandler,

    Header       = require('../components/layout/Header.react');



var App = React.createClass({

    render: function() {
        return (
            <div>
                <Header routes={ this.props.routes }/>
                <div className='container-fluid'>
                    <RouteHandler />
                </div>
            </div>
        );
    },

});

module.exports = App;
