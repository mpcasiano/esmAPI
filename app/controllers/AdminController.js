const Survey = require('../models/Survey');
const Section = require('../models/Section');
const Question = require('../models/Question');
const ClientUser = require('../models/ClientUser');
const SurveyCreator = require('../models/SurveyCreator');
const Log = require('../models/Log');

//view all surveys
exports.view_all_survey = (req, res) => {
    Survey.findAll({
        include: [{
            model: Section,
            include: [{
                model: Question,
            }]
        }], order: [
            [Section, Question, 'order_id', 'ASC'],
        ]
    }).then(tempSurveys => {
        if (!tempSurveys || tempSurveys.length < 1) {
            return res.status(404).send('Surveys not found')
        }
        var surveys = tempSurveys
        //parsing questions.choices
        surveys.forEach(survey => {
            survey.survey_sections.forEach(sec => {
                sec.survey_questions.forEach(q => {
                    if (q.choices != null)
                        q.choices = JSON.parse(q.choices)
                })
            })
        })
        return res.send(surveys)
    }).catch(err => {
        return res.status(500).send(err);
    });
}

//view all survey builders
//to check all the active users of the web app
exports.view_survey_builders = (req, res) => {
    SurveyCreator.findAll({
        attributes: ['id', 'first_name', 'last_name', 'email', 'username']
    }).then(users => {
        users = JSON.stringify(users);
        return res.send(JSON.parse(users));
    }).catch(err => {
        return res.status(500).send(err);
    });
}


//view all clients
//to check all the clients who are using the mobile app
exports.view_all_clients = (req, res) => {
    ClientUser.findAll({
        attributes: ['id', 'first_name', 'last_name', 'email', 'username']
    }).then(users => {
        if (!users || users.length < 1) {
            return res.status(404).send('Users not found');
        }
        users = JSON.stringify(users);
        return res.send(JSON.parse(users));
    }).catch(err => {
        return res.status(500).send(err);
    });
}

//view log of database changes
exports.view_all_log = (req, res) => {
    Log.findAll({
        order: [
            ['createdAt'],
        ]
    }).then(logs => {
        return res.send(logs)
    })
    .catch(err => {
        return res.status(500).send(err);
    });
}