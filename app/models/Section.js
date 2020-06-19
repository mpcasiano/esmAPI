const Sequelize = require('sequelize');
const db = require('../config/db');
const Question = require('./Question');

const Section = db.define('survey_section', {
    survey_id: {
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING
    },
    desc: {
        type: Sequelize.STRING
    },
    is_random: {
        type: Sequelize.INTEGER
    },
    order_id: {
        type: Sequelize.INTEGER
    },
}, {
    freezeTableName: true,
    timestamps: false
});

Section.hasMany(Question, {
    foreignKey: 'section_id'
});

module.exports = Section;