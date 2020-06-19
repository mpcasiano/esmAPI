const Sequelize = require('sequelize');
const Survey = require('../models/Survey');
const Section = require('../models/Section');
const Question = require('../models/Question');
const SurveyCreator = require('../models/SurveyCreator');
const Collaboration = require('../models/Collaboration');
const Log = require('../models/Log');
const ClientRecord = require("../models/ClientRecord");
const AnonymousRecord = require("../models/AnonymousRecord");
const shortid = require('shortid');
const { Op } = require("sequelize");
const fs = require("fs");
/*
    Web application functionalities:
    1. create a survey
    2. edit survey details
    3. delete a survey
    4. view a survey
    5. view ALL anonymous surveys (overview version)
    6. view ALL client surveys (overview version)
    7. view ALL anonymous surveys (w/ sections & questions)
    8. add collaboration in the survey
*/

//create a survey
exports.create_survey = (req, res) => {
    var data = JSON.parse(req.body.survey)
    if (data.title == "") data.title = null
    if (data.desc == "") data.desc = null
    var desc_media = null
    if (req.file) {
        desc_media = fs.readFileSync(
            'uploads/' + req.file.filename
        )
    } 
    Survey.create({
        creator_id: req.currentUser.id,
        title: data.title,
        desc: data.desc,
        desc_media: desc_media,
        frequency: data.frequency,
        is_test: data.is_test,
        start: data.start,
        end: data.end,
        is_shared: data.is_shared,
        anonymity: data.anonymity,
        access_code: shortid.generate()
    }).then(survey => {
        var id = survey.id
        Collaboration.create({
            user_id: req.currentUser.id,
            survey_id: id
        })
        if (desc_media) {
            fs.unlinkSync('uploads/' + req.file.filename);
        }
        data.sections.forEach((section, i) => {
            if (section.title == "") section.title = null
            if (section.desc == "") section.desc = null
            Section.create({
                survey_id: survey.id,
                title: section.title,
                desc: section.desc,
                is_random: section.is_random,
                order_id: section.order_id,
            }).then(sec => {
                data.sections[i].questions.forEach(question => {
                    if (question.type == 0 || question.type == 3) {
                        var choices = {
                            "min": question.min,
                            "max": question.max,
                            "marks": question.marks,
                        }
                        choices = JSON.stringify(choices)
                    } else {
                        if (question.choices.length >= 1) {
                            choices = JSON.stringify(question.choices.map(choice => choice.value));
                        } else {
                            choices = null
                        }
                    }
                    if (question.description == "") question.description = null
                    Question.create({
                        section_id: sec.id,
                        type: question.type,
                        question: question.question,
                        desc: question.description,
                        desc_media: question.desc_media,
                        order_id: question.order_id,
                        is_required: question.is_required,
                        choices: choices,
                    })
                })
            })
        })
        Log.create({
            user_id: req.currentUser.id,
            change_type: "add",
            table_name: "survey",
            table_id: id
        })
        return res.send("Successfully created the survey!")
    })
        .catch(err => {
            return res.status(500).send(err);
        })
}

//edit survey details
exports.edit_survey = (req, res) => {
    const data = req.body
    Survey.findOne({
        where: {
            id: req.params.survey_id,
        }
    }).then(survey => {
        survey.update({
            title: data.title,
            desc: data.desc,
            frequency: data.frequency,
            is_test: data.is_test,
            start: data.start,
            end: data.end,
            is_shared: data.is_shared,
            anonymity: data.anonymity
        }).then(survey => {
            Log.create({
                user_id: req.currentUser.id,
                change_type: "edit",
                table_name: "survey",
                table_id: survey.id
            })
        })
            .then(res.send("Successfully edited the survey!"))
            .catch(err => {
                res.status(500).send(err);
            })
    })
}

//delete survey
exports.delete_survey = (req, res) => {
    var survey_id = req.params.survey_id;
    Survey.findOne({
        where: { id: survey_id }
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found');
        } 
        //survey can only be deleted by its owner
        if (survey.creator_id != req.currentUser.id) {
            return res.status(403).send('Forbidden');
        }

        Survey.destroy({
          where: { id: survey_id },
        })
        
        Log.create({
          user_id: req.currentUser.id,
          change_type: "delete",
          table_name: "survey",
          table_id: survey_id,
        })
        return res.send("Successfully deleted the survey!");

    })
    .catch(err => {
        return res.status(500).send(err);
    })
}

//viewing of 1 survey
exports.view_survey = (req, res) => {
    var hasAccess = false
    var collaborators = []
    //survey can only be viewed by users that are part of the collaboration
    Collaboration.findAll({
        where: {
            survey_id: req.params.survey_id
        }
    }).then(collab => {
        if (!collab || collab.length < 1) {
            return res.status(404).send('Survey not found')
        }
        var collabIDs = []
        collab.forEach(c => {
            collabIDs.push(c.user_id)
            if (req.currentUser.id == c.user_id) {
                hasAccess = true
            }
        })
        
        if (!hasAccess) {
            return res.status(403).send('Forbidden')   
        }

        if (collabIDs.length == 1) { //means not shared
            collaborators = null
        }
        else {
            SurveyCreator.findAll({
                where: { id: collabIDs },
                attributes: ['id', 'first_name', 'last_name', 'username', 'email']
            }).then(users => {
                collaborators = users
            })
        }
    
        Survey.findOne({
            where: { id: req.params.survey_id },
            include: [{
                model: Section,
                include: [{
                    model: Question
                }],
            }], order: [
                [Section, Question, 'order_id', 'ASC'],
            ]
        }).then(tempSurvey => {
            if (!tempSurvey) {
                return res.status(404).send('Survey not found')
            }
            var survey = tempSurvey.toJSON()
            survey.collaborators = collaborators
            survey.survey_sections.forEach((sec, i) => {
                sec.survey_questions.forEach((q, j) => {
                    if (q.choices != null)
                        q.choices = JSON.parse(q.choices)
                })
            })
            
            return res.send(survey)
        })
    })
    .catch(err => {
        return res.status(500).send(err);
    })  
}

//overview of anonymous surveys (for Dashboard)
exports.view_anonymous_surveys_overview = (req, res) => {
    /*Collaboration.findAll({
        where: { user_id: req.currentUser.id }
    }).then(collab => {
        var surveyIDs = []
        collab.forEach(c => {
            surveyIDs.push(c.survey_id)
        })*/
    Survey.findAll({
        where: {
            [Op.and]: [
                { anonymity: 1 }, { //anonymous surveys
                    [Op.or]: [
                        { creator_id: req.currentUser.id }, //own surveys
                        { is_shared: 1 } // public surveys
                    ]}
            ]}
    }).then(result => {
        var surveyIDs = []
        result.forEach(r => {
            surveyIDs.push(r.id)
        })
        if (surveyIDs.length < 1) {
            return res.status(404).send('Surveys not found')
        }

        Survey.findAll({
            where: { id: surveyIDs },
            attributes: ['id', 'title', 'is_shared',
                [Sequelize.fn('date_format', Sequelize.col('updatedAt'), '%d %b %Y'), 'updatedAt'],
                [Sequelize.fn("COUNT", Sequelize.col("anonymous_records.id")), "numberOfEntries"],
                [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("anonymous_records.respondent_id"))), "numberOfParticipants"]
            ],
            include: [{
                model: AnonymousRecord,
                attributes: []
            }],
            group: ['survey.id']
        }).then(tempSurveys => {
            console.log(JSON.stringify(tempSurveys))
            var surveys = JSON.parse(JSON.stringify(tempSurveys))
            var surveysLength = surveys.length - 1

            surveys.forEach((survey, i) => {
                AnonymousRecord.findAll({
                    where: { survey_id: survey.id },
                    attributes: [
                        [Sequelize.fn('date_format', Sequelize.col('timestamp'), '%b %d'), 'x'],
                        //[Sequelize.literal(`DATE(timestamp)`), 'x'],
                        [Sequelize.literal(`COUNT(*)`), 'y']
                    ],
                    order: [[Sequelize.literal('x'), 'ASC']],
                    group: ['x']
                }).then(rec => {
                    survey.records = rec
                    if (i == surveysLength) {
                        return res.send(surveys)
                    }
                })
            })
        })
    })
        .catch(err => {
            return res.status(500).send(err);
        })
}

//overview of client surveys (for Dashboard)
exports.view_client_surveys_overview = (req, res) => {
    /*Collaboration.findAll({
        where: { user_id: req.currentUser.id }
    }).then(collab => {
        var surveyIDs = []
        collab.forEach(c => {
            surveyIDs.push(c.survey_id)
        })*/
    Survey.findAll({
        where: {
            [Op.and]: [
                { anonymity: 0 }, { //client surveys
                    [Op.or]: [
                        { creator_id: req.currentUser.id }, //own surveys
                        { is_shared: 1 } // public surveys
                    ]
                }
            ]
        }
    }).then(result => {
        var surveyIDs = []
        result.forEach(r => {
            surveyIDs.push(r.id)
        })
        if (surveyIDs.length < 1) {
            return res.status(404).send('Surveys not found')
        }
        
        Survey.findAll({
            where: { id: surveyIDs },
            attributes: ['id', 'title', 'is_shared',
                [Sequelize.fn('date_format', Sequelize.col('updatedAt'), '%d %b %Y'), 'updatedAt'],
                [Sequelize.fn("COUNT", Sequelize.col("client_records.id")), "numberOfEntries"],
                [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("client_records.respondent_id"))), "numberOfParticipants"]
            ],
            include: [{
                model: ClientRecord,
                attributes: []
            }],     
            group: ['survey.id']
        }).then(tempSurveys => {
            console.log(JSON.stringify(tempSurveys))
            var surveys = JSON.parse(JSON.stringify(tempSurveys))
            var surveysLength = surveys.length - 1

            surveys.forEach((survey, i) => {
                ClientRecord.findAll({
                    where: { survey_id: survey.id },
                    attributes: [
                        [Sequelize.fn('date_format', Sequelize.col('timestamp'), '%b %d'), 'x'],
                        //[Sequelize.literal(`DATE(timestamp)`), 'x'],
                        [Sequelize.literal(`COUNT(*)`), 'y']
                    ],
                    order: [[Sequelize.literal('x'), 'ASC']],
                    group: ['x']
                }).then(rec => {
                    survey.records = rec
                    if (i == surveysLength) {
                        return res.send(surveys)
                    }
                })
            })  
        })
    })
        .catch(err => {
            return res.status(500).send(err);
        })
}

//view all surveys (w/ sections & questions)
exports.view_all_survey = (req, res) => {
    /*Collaboration.findAll({
        where: { user_id: req.currentUser.id }
    }).then(collab => {
        var surveyIDs = []
        collab.forEach(c => {
            surveyIDs.push(c.survey_id)
        })*/
    
    Survey.findAll({
        include: [{
            model: Section,
            include: [{
                model: Question,
            }]
        }], order: [
            [Section, Question, 'order_id', 'ASC'],
        ], where: {
            [Op.or]: [
                        { creator_id: req.currentUser.id }, //own surveys
                        { is_shared: 1 } // public surveys
                    ]
        }
    }).then(tempSurveys => {
        if (!tempSurveys || tempSurveys.length < 1) {
            res.status(404).send('Surveys not found')
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
    })
    .catch(err => {
        return res.status(500).send(err);
    })  
   
}

//add collaborators (these users can view the survey & its responses)
exports.add_collaborators = (req, res) => {
    Survey.findOne({
        where: { id: req.params.survey_id }
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found')
        }

        survey.update({
            is_shared: 1
        })
        SurveyCreator.findAll({
            where: { email: req.body }
        }).then(users => {
            if (!users || users.length < 1) {
                return res.status(404).send('Users not found')
            }
            users.forEach(user => {
                Collaboration.create({
                    user_id: user.id,
                    survey_id: req.params.survey_id
                }).then(collab => {
                    Log.create({
                        user_id: req.currentUser.id,
                        change_type: "add",
                        table_name: "collaboration",
                        table_id: collab.id
                    })
                })
            })  
            return res.send('Successfully added collaborators!')
        })
    })
        .catch(err => {
            return res.status(500).send(err);
        })
}

//remove collaborators
exports.delete_collaborators = (req, res) => {
    Collaboration.findOne({
        where: { 
            survey_id: req.params.survey_id,
            user_id: req.params.user_id
        }
    }).then(collab => {
        var collabID = collab.id
        if (!collab) {
            return res.status(404).send('Survey or user does not exist');
        }

        Collaboration.destroy({
            where: { id: collabID }
        }).then(
            Log.create({
                user_id: req.currentUser.id,
                change_type: "delete",
                table_name: "collaboration",
                table_id: collabID
            }).then(res.send("Successfully removed user from the collaboration!"))
        )
    })
        .catch(err => {
            return res.status(500).send(err);
        })
}

/*
    Mobile application functionalities:
    1. view survey (for both anonymous users & clients)
*/

//get survey from mobile via access code
exports.view_survey_mobile = (req, res) => {
    Survey.findOne({
        where: { access_code: req.params.access_code }
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found')
        }
        
        Survey.findOne({
            where: { access_code: req.params.access_code },
            attributes: { exclude: ['creator_id', 'createdAt', 'updatedAt', 'is_shared'] },
            include: [{
                model: Section,
                include: [{
                    model: Question
                }],
            }], order: [
                [Section, Question, 'order_id', 'ASC'],
            ]
        }).then(tempSurvey => {
            if (!tempSurvey) {
                return res.status(404).send('Survey not found')
            }
            var survey = tempSurvey.toJSON()
            survey.survey_sections.forEach((sec, i) => {
                sec.survey_questions.forEach((q, j) => {
                    if (q.type == 0 || q.type == 3) {
                        var x = JSON.parse(q.choices)
                        q.choices = JSON.parse(q.choices)
                        q.choices = []
                        q.choices.push(x.min, x.max)
                    } else {
                        if (q.choices != null)
                            q.choices = JSON.parse(q.choices)
                    }
                })
            })
            return res.send(survey)
        })
    }).catch(err => {
        return res.status(500).send(err);
    })
}

exports.view_all_survey_mobile = (req, res) => {
    Survey.findAll({
        where: { anonymity: 1 },
        attributes: { exclude: ['creator_id', 'createdAt', 'updatedAt', 'is_shared'] },
        include: [{
            model: Section,
            include: [{
                model: Question
            }],
        }], order: [
            [Section, Question, 'order_id', 'ASC'],
        ]
    }).then(tempSurveys => {
        if (!tempSurveys || tempSurveys.length < 1) {
            return res.status(404).send('Surveys not found')
        }
        //var survey = tempSurveys.toJSON()
        tempSurveys.forEach(survey => {
            survey.survey_sections.forEach(sec => {
                sec.survey_questions.forEach(q=> {
                    if (q.type == 0 || q.type == 3) {
                        var x = JSON.parse(q.choices)
                        q.choices = JSON.parse(q.choices)
                        q.choices = []
                        q.choices.push(x.min, x.max)
                    } else {
                        if (q.choices != null)
                            q.choices = JSON.parse(q.choices)
                    }
                })
            })
        })
        return res.send(tempSurveys)
    }).catch(err => {
        return res.status(500).send(err);
    })
}