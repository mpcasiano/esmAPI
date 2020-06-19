const { Op } = require("sequelize");
const SurveyCreator = require('../models/SurveyCreator');
const ClientUser = require("../models/ClientUser");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Log = require('../models/Log');
const AnonymousUser = require('../models/AnonymousUser');
const uuid = require("uuid");

exports.home = (req, res) => {
    res.send('Welcome to Home page\nPls log in to continue using the app');
}

/*
    Web application functionalities:
    1. sign up
    2. sign in
    3. view profile
    4. create account for clients
    5. view all clients
    6. delete client's account
*/

//sign up for survey builders
exports.signup = (req, res) => {
    SurveyCreator.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user) {
            return res.status(409).send("Username already exists");
        }
        else {
            if (req.body.email) {
                SurveyCreator.findOne({
                    where: {
                        email: req.body.email
                    }
                }).then(user => {
                    if (user) {
                        return res.status(409).send("Email already exists");
                    }
                })
            }
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send(err)
                }
                SurveyCreator.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                }).then(user => {
                    Log.create({
                        user_id: user.id,
                        change_type: "add",
                        table_name: "survey_creator",
                        table_id: user.id
                    })
                    return res.status(200).send("Successfully created the account!")
                })
            })
        } 
    }).catch(err => {
        return res.status(500).send(err)
    })
}

//sign in for survey builders
exports.signin = (req, res) => {
    SurveyCreator.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(401).send('Wrong username or password')
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Wrong username or password')
        }

        let token = jwt.sign(user.dataValues, process.env.SECRET_KEY_SESSION, {
            expiresIn: "24h"
        })
        return res.send(token);

    }).catch(err => {
        return res.status(500).send(err);
    });
}

//view profile
exports.view_surveybuilder_profile = (req, res) => {
    SurveyCreator.findOne({
        where: {
            id: req.currentUser.id,
        }, attributes: ['first_name', 'last_name', 'username', 'email']
    }).then(user => {
        if (!user) {
            return res.status(404).send('User not found');
        }
        user = JSON.stringify(user);
        return res.send(JSON.parse(user));
    }).catch(err => {
        return res.status(500).send(err);
    });
}

//create accounts for clients
exports.client_signup = (req, res) => {
    ClientUser.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user) {
            return res.status(409).send("Username already exists");
        }
        else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).send(err)
                }
                ClientUser.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash,
                    therapist_id: req.currentUser.id
                }).then(user => {
                    Log.create({
                        user_id: req.currentUser.id,
                        change_type: "add",
                        table_name: "client_users",
                        table_id: user.id
                    })
                    return res.send("Successfully created the account!")
                })      
            });
        }
    }).catch(err => {
        return res.status(500).send(err)
    })
}

//view clients
exports.view_clients = (req, res) => {
    ClientUser.findAll({
        //clients can only be viewed by the user (therapist) who created their accounts
        where: {
            therapist_id: req.currentUser.id,
        },
        attributes: ['id', 'first_name', 'last_name', 'username']
    }).then(users => {
        if (!users || users.length < 1) {
            return res.status(404).send('Clients not found');
        }
        users = JSON.stringify(users);
        return res.send(JSON.parse(users));
    }).catch(err => {
        return res.status(500).send(err);
    });
}

//delete client's account with all the records associated to it
exports.delete_client = (req, res) => {
    var user_id = req.params.user_id;
    ClientUser.findOne({
        where: {
            id: user_id,
            therapist_id: req.currentUser.id
        }
    }).then(user => {
        if (!user) {
            return res.status(403).send('Forbidden');
        }
        ClientUser.destroy({
            where: { id: user_id }
        })
        Log.create({
                user_id: req.currentUser.id,
                change_type: "delete",
                table_name: "client_users",
                table_id: user_id
        })
        return res.send("Successfully deleted the user!")
        
    }).catch(err => {
        return res.status(500).send(err);
    })
}

/*
    Mobile application functionalities:
    1. get userID
    2. sign in
    3. update profile (for clients)
    4. update password (for clients)
    5. view profile (for clients)
*/

//get user ID 
exports.get_userID = (req, res) => {
    AnonymousUser.create({
        user_id: uuid.v4()
    }).then(user => {
        return res.send(user.user_id)
    }).catch(err => {
        return res.status(500).send(err);
    })
}

//sign in for clients
exports.client_signin = (req, res) => {
    ClientUser.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (!user) {
            return res.status(401).send('Wrong username or password')
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Wrong username or password')
        }

        let token = jwt.sign(user.dataValues, process.env.SECRET_KEY_SESSION, {
            expiresIn: "24h"
        })
        return res.send(token);

    }).catch(err => {
        return res.status(500).send(err);
    });
}

//update profile for clients
exports.update_client_profile = (req, res) => {
    ClientUser.findOne({
        where: {
            username: req.body.username,
            [Op.not] : [
                { username: req.currentUser.username }
            ]
        }
    }).then(user => {
        if (user) {
            return res.status(409).send("Username already exists");
        }
        ClientUser.findOne({
            where: {
                email: req.body.email,
                [Op.not]: [
                    { email: req.currentUser.email }
                ]
            }
        }).then(user => {
            if (user) {
                return res.status(409).send("Email already exists");
            }
            ClientUser.findOne({
                where: {
                    id: req.currentUser.id
                }
            }).then(user => {
                if (!user) {
                    return res.status(403).send('User not found')
                }
                user.update({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    username: req.body.username,
                    email: req.body.email
                })
                    
                Log.create({
                    user_id: user.id,
                    change_type: "edit",
                    table_name: "client_users",
                    table_id: user.id
                })
                return res.send("Successfully updated the profile!")
                
            })
        })
    }).catch(err => {
        return res.status(500).send(err)
    })
}

//update password for clients
exports.update_client_password = (req, res) => {
    ClientUser.findOne({
        where: {
            id: req.currentUser.id
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send('User not found')
        }

        var passwordIsValid = bcrypt.compareSync(req.body.old_password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Wrong password')
        }

        bcrypt.hash(req.body.new_password, 10, (err, hash) => {
            if (err) {
                return res.status(400).send(err)
            }
            user.update({
                password: hash
            })
            Log.create({
                user_id: user.id,
                change_type: "edit",
                table_name: "client_users",
                table_id: user.id
            })
            return res.send("Successfully updated the password!")
            
        })
    }).catch(err => {
        return res.status(500).send(err);
    })
}

//view profile for clients
exports.view_client_profile = (req, res) => {
    ClientUser.findOne({
        where: {
            id: req.currentUser.id,
        }, attributes: ['first_name', 'last_name', 'username','email']
    }).then(user => {
        if (!user) {
            return res.status(404).send('User not found');
        }
        user = JSON.stringify(user);
        return res.send(JSON.parse(user));
    }).catch(err => {
        return res.status(500).send(err);
    });
}