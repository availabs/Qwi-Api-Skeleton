'use strict';



var React   = require('react'),

    Logo    = require('./Logo.react'),
    VizMenu = require('./VizMenu.react');



var Header = React.createClass({

    render: function() {
        return (
            <div className='page-header'>
                <Logo />
                <h1>Quarterly Workforce Indicators</h1>
                <VizMenu routes={ this.props.routes } />
            </div>
        );
    }
});

module.exports = Header;
