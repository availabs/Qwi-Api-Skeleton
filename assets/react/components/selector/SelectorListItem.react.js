'use strict';


var React = require('react');


/*=====================================================
*
* Props: 
*       toggle : Function to toggle item selectedness.
*       item   : The item
*       label  : The label for the item.
*
*=====================================================*/
var SelectorListItem = React.createClass ({

    toggleItem: function () { this.props.toggle(this.props.item); },

    render: function () {
        return (
            <li className = { (this.props.selected ? 'selected' : 'unselected') + 'SelectorListItem' }
                onClick   = { this.toggleItem } 
                key       = { this.props.key } > 

                    { this.props.label }
            </li>
        );
    }
});


module.exports = SelectorListItem;

