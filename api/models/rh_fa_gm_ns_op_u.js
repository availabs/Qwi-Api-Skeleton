var QWI_Attributes = require('./QWI_Attributes');

module.exports = {
    tableName : 'rh_fa_gm_ns_op_u',
    connection: 'localhost_qwi_pqsl',

    migrate: 'safe',

    autoPK        : false,
    autoCreatedAt : false,
    autoUpdatedAt : false,

    attributes: QWI_Attributes,
};

