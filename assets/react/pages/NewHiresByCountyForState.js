'use strict';

/* jshint unused: true */



var React            = require('react'),
    Selector         = require('../components/selector/Selector.react.js'),
    geography_labels = require('../../data/labels/geography.js'),
    theStore  = require('../../flux/stores/TotalQuarterlyMeasuresForAllCountiesInState'),
    _                = require('lodash');


var noOp = function(){};



var NewHiresByCountyForState = React.createClass ({

    'getInitialState': function () {
        var state_labels = _.pick(geography_labels, function(v, k) { return k.length === 2; });

        return { selection: state_labels, selected:[], pendingQuery: null, data: null };
    },

    'componentDidMount': function () {
        theStore.registerQueryResultReadyListener(this._handleResultReadyEvent);
    },

    'componentWillUnmount': function () {
        theStore.removeQueryResultReadyListener(this._handleResultReadyEvent);
    },

    'shouldComponentUpdate' : function (nextProps, nextState) {
        console.log('==> shouldComponentUpdate');
        return !nextState.pendingQuery; 
    },

    '_queryStateData' : function (state) {
        var query = { geography: state, measure: 'hira' },
            data  = theStore.query(query);

        if (data) { 
            console.log(data); 
            this.setState({ selected: [state], pendingQuery: null, data: data });
        }
        else { 
            console.log('Waiting on data'); 
            this.setState({ select: [state], pendingQuery: query, data:  null });
        }
    },

    '_handleResultReadyEvent' : function (eventPayload) {
        if (eventPayload.query === this.state.pendingQuery) {
            this.setState({ pendingQuery: null, data: eventPayload.data });
            console.log(eventPayload.data);
        }
    },

    render : function () {
        return (<div>
                    <Selector
                        select    = { this._queryStateData }
                        deselect  = { noOp }
                        selection = { this.state.selection }
                        selected  = { this.state.selected }
                        title     = { "States" }
                    />
                </div>);
    }
});

React.render (<NewHiresByCountyForState/>, document.getElementById('container'));

