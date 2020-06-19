const Sequelize = require("sequelize");
const db = require("../config/db");
const AnonymousAnswer = require("./AnonymousAnswer");

const AnonymousRecord = db.define('anonymous_record', {
    respondent_id: {
        type: Sequelize.STRING
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

AnonymousRecord.hasMany(AnonymousAnswer, {
  foreignKey: "record_id"
});

module.exports = AnonymousRecord;
