const Sequelize = require('sequelize');
const db = require('../config/db');

const SurveyCreator = db.define('survey_creator', {
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    username: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
  
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = SurveyCreator;