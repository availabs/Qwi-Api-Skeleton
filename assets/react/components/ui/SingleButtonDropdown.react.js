'use strict';


var React        = require('react'),
    DropdownMenu = require('./DropdownMenu.react');


/*=====================================================
*
* Props: 
*       select    : Function to select item
*       deselect  : Function to deselect item
*       selection : The set of selectable items. ({item: label})
*       selected  : Array of selected items. (The keys from 'selection'.)
*       title     : The title of the selector.
*
*=====================================================*/
var SingleButtonDropdown = React.createClass ( {

    'getInitialState': function () {
        return { active: true };
    },

    'render': function () {
        console.log(this.props.select);

        return ( 
            <div className = 'btn-group'>

                <button type          = 'button'
                        className     = { 'btn btn-default dropdown-toggle' + (this.props.select ? '' : ' disabled') }
                        data-toggle   = 'dropdown'
                        aria-expanded = 'false' >

                            { this.props.title } 
                            <span className='caret'></span>

                </button>

                <DropdownMenu 
                    select    = { this.props.select }    
                    deselect  = { this.props.deselect }  

                    active    = { this.state.active }    

                    selection = { this.props.selection } 
                    selected  = { this.props.selected }  
                />
            </div>
        );
    }
});


module.exports = SingleButtonDropdown;
