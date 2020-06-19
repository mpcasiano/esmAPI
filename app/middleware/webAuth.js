const SurveyCreator = require('../models/SurveyCreator');
const jwt = require('jsonwebtoken');

module.exports = function webAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY_SESSION, (err, authData) => {
                if (err) {
                    res.sendStatus(401);
                } else {
                    SurveyCreator.findOne({
                        where: {
                            id: authData.id
                        }
                    }).then(user => {
                        if (!user) {
                            res.status(404).send('User not found');
                        } else {
                            req.currentUser = user;
                            next();
                        }
                    })
                }
            });

        }
    }
    else {
        // Forbidden
        res.sendStatus(403);
    }
};