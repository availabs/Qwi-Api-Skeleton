var Waterline      = require('waterline'),
    QWI_Attributes = require('./QWI_Attributes');

//var model = Waterline.Collection.extend({
    //identity : 'se_fa_gc_ns_op_u',
    //connection: 'localhost_qwi_pqsl',

    //autoPK        : false,
    //autoCreatedAt : false,
    //autoUpdatedAt : false,

    //attributes: QWI_Attributes,
//});

//module.exports = model;
module.exports = {
    tableName : 'se_fa_gc_ns_op_u',
    connection: 'localhost_qwi_pqsl',

    migrate: 'safe',

    autoPK        : false,
    autoCreatedAt : false,
    autoUpdatedAt : false,

    attributes: QWI_Attributes,
};

