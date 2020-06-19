const Sequelize = require('sequelize');
const db = require('../config/db');

const Log = db.define('change_log', {
    user_id: {
        type: Sequelize.INTEGER
    },
    change_type: {
        type: Sequelize.STRING
    },
    table_name: {
        type: Sequelize.STRING
    },
    table_id: {
        type: Sequelize.INTEGER
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = Log;