'use strict';


var React            = require('react'),
    SelectorListItem = require('./SelectorListItem.react.js');


/*=====================================================
*
* Props: 
*       select    : Function to select item
*       deselect  : Function to deselect item
*       selection : The set of selectable items. ({item: label})
*       selected  : Array of selected items. (The keys from 'selection'.)
*
*=====================================================*/
var SelectorList = React.createClass ({

    _generateListItems: function () {
        var props = this.props;

        return Object.keys(props.selection).map(function (item, i) {

            var isSelected = props.selected.indexOf(item) !== -1;

            return (<SelectorListItem
                        key        = { i }
                        toggle     = { isSelected ? props.deselect : props.select }
                        item       = { item }
                        label      = { props.selection[item] }
                        isSelected = { isSelected }
                    />);
        });
    },

    render: function () {
        var classes = 'selectorList ' +  (this.props.active ? 'active' : 'inactive');

        return ( <ul className={ classes }> { this._generateListItems() } </ul> );
    },
});


module.exports = SelectorList;
