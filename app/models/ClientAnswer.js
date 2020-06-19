const Sequelize = require('sequelize');
const db = require('../config/db');

const ClientAnswer = db.define('client_answer', {
    record_id: {
        type: Sequelize.INTEGER
    },
    question_id: {
        type: Sequelize.INTEGER
    },
    answer: {
        type: Sequelize.STRING
    },
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = ClientAnswer;