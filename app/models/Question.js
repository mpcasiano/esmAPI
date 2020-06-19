const Sequelize = require('sequelize');
const db = require('../config/db');
const ClientAnswer = require('./ClientAnswer');
const AnonymousAnswer = require('./AnonymousAnswer');

const Question = db.define('survey_question', {
    section_id: {
        type: Sequelize.INTEGER
    },
    type: {
        type: Sequelize.STRING
    },
    question: {
        type: Sequelize.STRING
    },
    desc: {
        type: Sequelize.STRING
    },
    choices: {
        type: Sequelize.STRING
    },
    order_id: {
        type: Sequelize.INTEGER
    },
    is_required: {
        type: Sequelize.BOOLEAN
    },
    desc_media: {
        type: Sequelize.BLOB
    }

}, {
    freezeTableName: true,
    timestamps: false
});

Question.hasMany(ClientAnswer, {
    foreignKey: 'question_id'
})

Question.hasMany(AnonymousAnswer, {
    foreignKey: 'question_id'
})

module.exports = Question;