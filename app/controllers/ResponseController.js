const Survey = require('../models/Survey');
const Section = require('../models/Section');
const Question = require('../models/Question');

const AnonymousUser = require("../models/AnonymousUser");
const AnonymousAnswer = require("../models/AnonymousAnswer");
const AnonymousRecord = require("../models/AnonymousRecord");

const ClientUser = require("../models/ClientUser");
const ClientRecord = require("../models/ClientRecord");
const ClientAnswer = require("../models/ClientAnswer");

const Log = require('../models/Log');

/*
    Web application functionalities:
    1. view summary responses
    2. view individual responses (by user ID)
*/

//view answers (for both anonymous users & clients)
exports.view_answers = (req, res) => {
    Survey.findOne({
        where: { id: req.params.survey_id },
        attributes: ['anonymity']
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found')
        }
        //if the survey is for anonymous users
        if (survey.anonymity == 1 || survey.anonymity == null) {
            //to group answers by respondents (used for viewing individual responses)
            AnonymousUser.findAll({
                include: [{
                    model: AnonymousRecord,
                    where: {
                        survey_id: req.params.survey_id
                    },
                    attributes: ['id', 'timestamp']
                }],
                attributes: ['user_id']
            }).then(tempUsers => {
                if (!tempUsers || tempUsers.length < 1) {
                    return res.status(404).send('Records not found');
                }
                
                var recordIDs = []
                var users = JSON.parse(JSON.stringify(tempUsers))
                users.forEach(user => {
                    user.records = []
                    user.records = user.anonymous_records
                    user.records.forEach(record => {
                        recordIDs.push(record.id)
                    })
                    delete user.anonymous_records
                })

                //fetch all answers in each question (used for viewing summary responses)
                Section.findAll({
                    where: { survey_id: req.params.survey_id }
                }).then(sections => {
                    var sectionsID = []
                    sections.forEach(sec => {
                        sectionsID.push(sec.id)
                    })
                    Question.findAll({
                        where: { section_id: sectionsID },
                        order: [
                            ['order_id', 'ASC'],
                        ],
                        include: [{
                            model: AnonymousAnswer,
                            attributes: ['record_id', 'question_id', 'answer'],
                            where: { record_id: recordIDs }
                        }],
                        attributes: ['id', 'question', 'type', 'choices']
                    }).then(tempQuestions => {
                        questions = JSON.parse(JSON.stringify(tempQuestions))
                        questions.forEach(question => {
                            question.answers = question.anonymous_answers
                            delete question.anonymous_answers
                        })
                        var dataToSend = {
                            questions: questions, //for viewing of summary responses
                            users: users //for viewing of individual responses
                        }
                        return res.send(dataToSend)
                    })
                })
            }).catch(err => {
                return res.status(500).send(err);
            })
        } 
        //if the survey is for clients
        else if (survey.anonymity == 0) { 
            //to group answers by respondents (used for viewing individual responses)
            ClientUser.findAll({
                include: [{
                    model: ClientRecord,
                    where: {
                        survey_id: req.params.survey_id
                    },
                    attributes: ['id', 'timestamp']
                }],
                attributes: ['id', 'first_name']
            }).then(tempUsers => {
                if (!tempUsers || tempUsers.length < 1) {
                    return res.status(404).send('Records not found');
                }

                var recordIDs = []
                var users = JSON.parse(JSON.stringify(tempUsers))
                users.forEach(user => {
                    user.records = []
                    user.records = user.client_records
                    user.records.forEach(record => {
                        recordIDs.push(record.id)
                    })
                    delete user.client_records
                })

                //fetch all answers in each question (used for viewing summary responses)
                Section.findAll({
                    where: { survey_id: req.params.survey_id }
                }).then(sections => {
                    var sectionsID = []
                    sections.forEach(sec => {
                        sectionsID.push(sec.id)
                    })
                    Question.findAll({
                        where: { section_id: sectionsID },
                        order: [
                            ['order_id', 'ASC'],
                        ],
                        include: [{
                            model: ClientAnswer,
                            attributes: ['record_id', 'question_id', 'answer'],
                            where: { record_id: recordIDs }
                        }],
                        attributes: ['id', 'question', 'type', 'choices']
                    }).then(tempQuestions => {
                        questions = JSON.parse(JSON.stringify(tempQuestions))
                        questions.forEach(question => {
                            question.answers = question.client_answers
                            delete question.client_answers
                        })
                        var dataToSend = {
                            questions: questions, //for viewing of summary responses
                            users: users //for viewing of individual responses
                        }
                        return res.send(dataToSend)
                    })
                })
            }).catch(err => {
                return res.status(500).send(err);
            })
        }
    })
}

/*
    Mobile application functionalities:
    1. save answers
    2. view answers
*/

//save answers (for anonymous users)
exports.save_anonymous_answers = (req, res) => {
    //check if survey exists
    Survey.findOne({
        id: req.body.survey_id
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found')
        }
        //check if userID exists
        AnonymousUser.findOne({ 
            where: { user_id: req.body.respondent_id }
        }).then(user => {
            if (!user) {
                return res.status(403).send("Forbidden");
            }
            
            //create a record
            AnonymousRecord.create({
                respondent_id: req.body.respondent_id,
                survey_id: req.body.survey_id,
                timestamp: req.body.timestamp
            }).then(record => {
                recordID = record.id
                req.body.answers.forEach((item) => {
                    var answer
                    if (item.answer != null) { answer = item.answer.join() }
                    else (answer = null)
                    AnonymousAnswer.create({
                        record_id: record.id,
                        question_id: item.question_id,
                        answer: answer,
                    })
                })
                //save change log
                Log.create({
                    user_id: null,
                    change_type: "add",
                    table_name: "anonymous_record",
                    table_id: recordID
                })
                return res.send("Successfully saved the answers!")
            })
        })             
    })
    .catch(err => {
        return res.status(500).send(err);
    })
}

//save answers (for clients)
exports.save_client_answers = (req, res) => {
    //check if survey exists
    Survey.findOne({
        id: req.body.survey_id
    }).then(survey => {
        if (!survey) {
            return res.status(404).send('Survey not found')
        }
        //no need to verify the user since it was already handled by the middleware
        //create a record
        ClientRecord.create({
            respondent_id: req.currentUser.id,
            survey_id: req.body.survey_id,
            timestamp: req.body.timestamp
        }).then(record => {
            recordID = record.id
            req.body.answers.forEach((item) => {
                var answer
                if (item.answer != null) { answer = item.answer.join() }
                else (answer = null)
                ClientAnswer.create({
                    record_id: record.id,
                    question_id: item.question_id,
                    answer: answer,
                })
            })
            //save change log
            Log.create({
                user_id: req.currentUser.id,
                change_type: "add",
                table_name: "client_record",
                table_id: recordID
            })
            return res.send("Successfully saved the answers!")
        })   
                     
    })
    .catch(err => {
        return res.status(500).send(err);
    })
}

//view answers (for anonymous users)
exports.view_answers_per_userID = (req, res) => {
    AnonymousRecord.findAll({
        where: {
            respondent_id: req.params.user_id,
            survey_id: req.params.survey_id
        }
    }).then(records => {
        if (!records || records.length < 1) {
            return res.status(404).send('Records not found');
        }

        var recordIDs = []
        records.forEach(record => {
            recordIDs.push(record.id)
        })

        Section.findAll({
            where: { survey_id: req.params.survey_id }
        }).then(sections => {
            var sectionsID = []
            sections.forEach(sec => {
                sectionsID.push(sec.id)
            })
            //fetch questions with answers
            Question.findAll({
                where: { section_id: sectionsID },
                include: [{
                    model: AnonymousAnswer,
                    attributes: ['id', 'answer'],
                    where: { record_id: recordIDs }
                }],
                order: [
                    ['id', 'ASC'],
                ], attributes: ['id', 'question', 'type', 'choices'],
            }).then(data => {
                return res.send(data)
            })
        })
    }).catch(err => {
        return res.status(500).send(err);
    })
}

//view answers (for clients)
exports.view_client_answers = (req, res) => {
    ClientRecord.findAll({
        where: {
            respondent_id: req.currentUser.id,
            survey_id: req.params.survey_id
        }
    }).then(records => {
        if (!records || records.length < 1) {
            return res.status(404).send('Records not found');
        }

        var recordIDs = []
        records.forEach(record => {
            recordIDs.push(record.id)
        })

        Section.findAll({
            where: { survey_id: req.params.survey_id }
        }).then(sections => {
            var sectionsID = []
            sections.forEach(sec => {
                sectionsID.push(sec.id)
            })
            //fetch questions with answers
            Question.findAll({
                where: { section_id: sectionsID },
                include: [{
                    model: ClientAnswer,
                    attributes: ['id', 'answer'],
                    where: { record_id: recordIDs }
                }],
                order: [
                    ['id', 'ASC'],
                ], attributes: ['id', 'question', 'type'],
            }).then(questions => {
                return res.send(questions)
            })
        })
    }).catch(err => {
        return res.status(500).send(err);
    })
}