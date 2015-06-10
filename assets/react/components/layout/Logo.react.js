'use strict';


var React = require('react');



var Logo = React.createClass({

	render: function() {
	    return (
	    	<div className="logo">
	    		<img src="/images/logo.png" style={{width:'120px'}} />
	    	</div>
	    );
	}
});

module.exports = Logo;
