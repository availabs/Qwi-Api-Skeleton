var QWI_Attributes = require('./QWI_Attributes');

module.exports = {
    tableName : 'se_fa_gw_ns_op_u',
    connection: 'localhost_qwi_pqsl',

    migrate: 'safe',

    autoPK        : false,
    autoCreatedAt : false,
    autoUpdatedAt : false,

    attributes: QWI_Attributes,
};

