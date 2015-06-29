'use strict';



var React = require('react'),
	Link =	 require('react-router').Link;



var DataTable = React.createClass({
 	
 	getInitialState:function(){
 		return {
 			currentPage : 0,
            pageLength  : 15,
 		};
 	},


	getDefaultProps:function(){
		return {
			data    : [],
			columns : []
		};
	},


	render: function() {
		var scope  = this,
		    cursor = this.state.pageLength * this.state.currentPage,
            header,
            headerRow,
            rows;

		headerRow = scope.props.columns.map(function(col){
			return (
				<th style={(col.type === 'link') ? {textAlign:'center'} : {}} >
					{col.name}
				</th>
			);
		});

        header = (<tr> { headerRow } </tr>);

		rows = scope.props.data.map(function(row,index){
			if(index >= cursor && index < (cursor + scope.state.pageLength) ){
				
				var rowValue = row[scope.props.rowValue] || '',
				    dataRow  = scope.props.columns.map(function(col){

					if(col.type === 'modalButton'){

						return (
							<td data-key = { rowValue } >
								<button data-key      = { rowValue }
                                        className     = 'btn btn-default'
                                        data-toggle   = "modal"
                                        data-target   = { col.target }
                                        data-backdrop = "false">
                                            
                                            {col.name}
                                </button>
							</td>
						);
					}

					if(col.type === 'link'){
						var params = {};

						for(var key in col.params){
							params[key] = row[col.params[key]];
						}

						return (
							<td data-key = {rowValue}
                                style    = {{textAlign:'center'}}>
								
                                <Link data-key = {rowValue}
                                      to       = {col.target}
                                      params   = {params}>

                                        {col.content}
								</Link>
							</td>
						);
					}

					return (
						<td data-key = { rowValue } >

							{row[col.key]}
						</td>
					);
				});
				
				return(
					<tr data-key = { rowValue } 
                        onClick  = { scope.props.rowClick } >

                            { dataRow }
					</tr>
				);
			}

			return;
		});


		return (
			<div>
				{ scope.renderPagination() }
				<table className="table table-hover">
					<thead>
					    {header}
					</thead>

					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	},


	_clickPage : function(e){
        var pageNum = e.target.getAttribute('value');

        if(!isNaN(parseInt(pageNum))){
            this.setState({ currentPage:pageNum });
        }

    },


	renderPagination:function(){
        var scope = this;
        
        var pages = scope.props.data.map(function(d,i){

            if(i % scope.state.pageLength === 0 ){
                var pageNum = (i/scope.state.pageLength),
                    activeClass = (+pageNum === +scope.state.currentPage ) ? 
                                    'active'                               :
                                    '';

                return (
                    <li className={activeClass} 
                        onClick={scope._clickPage} 
                        value={pageNum}>
                        
                            <a  value={pageNum} 
                                title={"Page "+pageNum}>
                                
                                    { pageNum + 1 }
                            </a>
                    </li>
                );

            } else { return; }

        }).filter(function(d){
            return typeof d !== 'undefined';
        });
        
        return (
            <div className="table-editable">
	            <div className="backgrid-paginator">
	                <ul>
	                    {pages}
	                </ul>
	            </div>
	        </div>
        );
    }
});

module.exports = DataTable;
