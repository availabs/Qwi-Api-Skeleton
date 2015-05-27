module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/
  'post /qwi/waterline':
            'EmploymentController.waterline',

  'get  /employment':
            'EmploymentController.employment_by_geography',

  'get  /employment/geography/:geography':
            'EmploymentController.employment_by_geography',

  'get  /employment_for_counties/state/:geography':
            'EmploymentController.employment_for_counties_in_state',

  'get  /employment_for_counties/state/:geography/industry/:industry':
            'EmploymentController.employment_for_counties_in_state',

  'get  /employment_for_counties/state/:geography/industry/:industry/education/:education':
            'EmploymentController.employment_for_counties_in_state',

  'get  /employment_for_counties/state/:geography/industry/:industry/firmage/:firmage':
            'EmploymentController.employment_for_counties_in_state',

  'get  /new_hires_by_sector/county/:geography':
            'EmploymentController.new_hires_by_sector',


  '/'     : 'ApiSkeletonController.info',
  '/info' : 'ApiSkeletonController.info',
};
