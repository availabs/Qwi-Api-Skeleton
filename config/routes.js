module.exports.routes = {

    'post /qwi/waterline':
        'EmploymentController.waterline',



    'get  /visualizations/new_hires_by_county_for_state':
        'VisualizationsController.new_hires_by_county_for_state',

    'get  /visualizations/measure_by_quarter_for_geography':
        'VisualizationsController.measure_by_quarter_for_geography',



    'get  /measure/:measure/geography/:geography':
        'EmploymentController.measure_by_quarter_for_geography',


    'get  /employment/total/measure/:measure/all_counties/state/:geography':
        'EmploymentController.total_measure_for_counties_in_state',

    'get  /employment-change-individual/total/measure/:measure/all_counties/state/:geography':
        'EmploymentController.total_measure_for_counties_in_state',

    'get  /employment-change-firm/total/measure/:measure/all_counties/state/:geography':
        'EmploymentController.total_measure_for_counties_in_state',


    'get /params_test/foo/:foo/bar/:bar':
        'ApiSkeletonController.test',

    //'/'     : 'ApiSkeletonController.info',
    //'/info' : 'ApiSkeletonController.info',

};
