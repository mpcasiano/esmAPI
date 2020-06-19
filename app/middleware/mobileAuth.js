const ClientUser = require("../models/ClientUser");
const jwt = require('jsonwebtoken');

module.exports = function mobileAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader.split(' ')[1];
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY_SESSION, (err, authData) => {
                if (err) {
                    return res.sendStatus(401);
                } else {
                    ClientUser.findOne({
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