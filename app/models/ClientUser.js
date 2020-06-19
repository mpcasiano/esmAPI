const Sequelize = require('sequelize');
const db = require('../config/db');
const ClientRecord = require('./ClientRecord');

const ClientUser = db.define('client_users', {
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
    therapist_id: {
        type: Sequelize.INTEGER
    }

}, {
    freezeTableName: true,
    timestamps: false
})

ClientUser.hasMany(ClientRecord, {
  foreignKey: "respondent_id"
});

module.exports = ClientUser;