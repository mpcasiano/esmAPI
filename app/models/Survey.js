const Sequelize = require('sequelize');
const db = require('../config/db');
const Section = require('./Section');
const AnonymousRecord = require("./AnonymousRecord");
const ClientRecord = require("./ClientRecord");

const Survey = db.define('survey', {
    creator_id: {
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING
    },
    desc: {
        type: Sequelize.STRING
    },
    frequency: {
        type: Sequelize.INTEGER
    },
    is_test: {
        type: Sequelize.INTEGER
    },
    start: {
        type: Sequelize.STRING
    },
    end: {
        type: Sequelize.STRING
    },
    is_shared: {
        type: Sequelize.INTEGER
    },
    access_code: {
        type: Sequelize.STRING
    },
    anonymity: {
        type: Sequelize.INTEGER
    },
    desc_media: {
        type: Sequelize.BLOB("long")
    }
}, {
    freezeTableName: true,
    timestamps: true
});

Survey.hasMany(Section, {
    foreignKey: 'survey_id'
})

Survey.hasMany(AnonymousRecord, {
    foreignKey: 'survey_id'
})

Survey.hasMany(ClientRecord, {
    foreignKey: 'survey_id'
})

module.exports = Survey;