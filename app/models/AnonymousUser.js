const Sequelize = require('sequelize');
const db = require('../config/db');
const AnonymousRecord = require('./AnonymousRecord');

const AnonymousUser = db.define('anonymous_users', {
    user_id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
}, {
    freezeTableName: true,
    timestamps: false
});

AnonymousUser.hasMany(AnonymousRecord, {
    foreignKey: "respondent_id"
});

module.exports = AnonymousUser;