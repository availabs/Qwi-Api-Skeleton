'use strict';



var React   = require('react');



var SimpleSideBar = React.createClass({

    render: function() {

        var selectors = this.props.selectors.map(function(s) {
            return (
                <div className='row'>
                    <div className='col-md-12'>
                        { s }
                    </div>
                </div>
            );
        });


        return (
            <div>
                { selectors }
            </div>
        );
    }
});


module.exports = SimpleSideBar;
