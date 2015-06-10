module.exports.routes = {

    //------------------------------
    // Home Controller
    //------------------------------

    'get /':
        'HomeController.index',


    //------------------------------
    // Data Controller
    //------------------------------

    'post /qwi/waterline':
        'DataController.waterline',

    'get  /measure/:measure/geography/:geography':
        'DataController.measure_by_quarter_for_geography',

    'get  /employment/total/measure/:measure/all_counties/state/:geography':
        'DataController.total_measure_for_counties_in_state',

    'get  /employment-change-individual/total/measure/:measure/all_counties/state/:geography':
        'DataController.total_measure_for_counties_in_state',

    'get  /employment-change-firm/total/measure/:measure/all_counties/state/:geography':
        'DataController.total_measure_for_counties_in_state',
};
