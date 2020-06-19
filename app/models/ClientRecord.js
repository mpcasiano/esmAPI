const Sequelize = require('sequelize');
const db = require('../config/db');
const ClientAnswer = require('./ClientAnswer');

const ClientRecord = db.define('client_record', {
    respondent_id: {
        type: Sequelize.INTEGER
    },
    survey_id: {
        type: Sequelize.INTEGER
    },
    timestamp: {
        type: Sequelize.STRING
    },
}, {
    freezeTableName: true,
    timestamps: false
});

ClientRecord.hasMany(ClientAnswer, {
    foreignKey: 'record_id'
});

module.exports = ClientRecord;