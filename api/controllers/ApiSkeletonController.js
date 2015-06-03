'use strict';


module.exports = {
    
    'info':  function (req, res) {
        res.send({ 
            '_comment'                  : 'This object describes the API endpoints.',
            '/info'                     : 'API info.',
            '/employment/info/'         : 'Information specific for the employment endpoints.',
        });
    },

};

