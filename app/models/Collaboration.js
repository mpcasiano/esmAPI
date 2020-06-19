const Sequelize = require('sequelize');
const db = require('../config/db');

const Collaboration = db.define('collaboration', {
    user_id: {
        type: Sequelize.INTEGER
    },
    survey_id: {
        type: Sequelize.INTEGER
    }
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = Collaboration;