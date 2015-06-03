/*======================================================
 *
 * Base Class for the Selector UI Component
 *
 * All props/state should be passed in from the parent.
 *
 * ===================================================*/


'use strict';


var React = require('react'),
    SelectorList = require('./SelectorList.react.js');


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
var Selector = React.createClass ( {

    _toggleList: function () { this.setState({ active: !this.state.active }); },

    getInitialState: function () {
        return { active: true } ;
    },

    render: function () {
        return ( 
            <div className='selector'>

                <h4 className='selectorButton' 
                    onClick={ this._toggleList } >

                        { this.props.title }
                </h4>


                <SelectorList 
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


module.exports = Selector;

