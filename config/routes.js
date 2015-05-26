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
  'post /qwi/*'    : 'EmploymentController.test',

  //'/'                        : 'ApiSkeletonController.info',
  //'/info'                    : 'ApiSkeletonController.info',
  //'/employment'              : 'EmploymentController.info',
  //'/employment/info'         : 'EmploymentController.info',
  //'/employment/latest_total' : 'EmploymentController.latest_total'

};
