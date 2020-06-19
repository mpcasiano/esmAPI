const express = require('express');
const router = express.Router();
const webAuth = require('../middleware/webAuth');
const mobileAuth = require('../middleware/mobileAuth');
const UserController = require('../controllers/UserController');
const SurveyController = require('../controllers/SurveyController');
const AdminController = require('../controllers/AdminController');
const ResponseController = require('../controllers/ResponseController');
const multer = require("multer");
var upload = multer({ dest: "uploads/" });

router.get('/home', UserController.home);

//Web App
router.post('/signin', UserController.signin);
router.post('/signup', UserController.signup);
router.post('/client/signup', webAuth, UserController.client_signup);
router.get('/view-surveybuilder-profile', webAuth, UserController.view_surveybuilder_profile)
router.get('/view-clients', webAuth, UserController.view_clients);
router.delete('/delete-client/:user_id', webAuth, UserController.delete_client);

router.post('/create-survey', [webAuth, upload.single("descMedia")], SurveyController.create_survey);
router.put('/edit-survey/:survey_id', SurveyController.edit_survey);
router.delete('/delete-survey/:survey_id', webAuth, SurveyController.delete_survey);
router.get('/view-survey/web/:survey_id', webAuth, SurveyController.view_survey);
router.get('/view-anonymous-surveys-overview', webAuth, SurveyController.view_anonymous_surveys_overview);
router.get('/view-client-surveys-overview', webAuth, SurveyController.view_client_surveys_overview);
router.get('/view-all-survey', webAuth, SurveyController.view_all_survey);
router.post('/add-collaborators/:survey_id', webAuth, SurveyController.add_collaborators);
router.delete('/delete-collaborators/:survey_id/:user_id', webAuth, SurveyController.delete_collaborators);

router.get('/view-answers/:survey_id', webAuth, ResponseController.view_answers);
//router.get('/view-answers-per-timestamp/:survey_id', webAuth, ResponseController.view_answers_per_timestamp);


//Mobile App
router.post('/client/signin', UserController.client_signin);
router.put('/update-client-profile', mobileAuth, UserController.update_client_profile);
router.put('/update-client-password', mobileAuth, UserController.update_client_password)
router.get('/view-client-profile', mobileAuth, UserController.view_client_profile)
router.get('/get-userID', UserController.get_userID);

router.get('/view-survey/:access_code', SurveyController.view_survey_mobile);
router.get('/mobile/view-all-survey', mobileAuth, SurveyController.view_all_survey_mobile);
router.get('/view-survey/client/:access_code', mobileAuth, SurveyController.view_survey_mobile);

router.post('/save-anonymous-answers', ResponseController.save_anonymous_answers);
router.post('/save-client-answers', mobileAuth, ResponseController.save_client_answers);
router.get('/view-anonymous-answers/:survey_id/:user_id', ResponseController.view_answers_per_userID);
router.get('/view-client-answers/:survey_id', mobileAuth, ResponseController.view_client_answers);

//Admin
router.get('/admin/view-all-survey', AdminController.view_all_survey);
router.get('/admin/view-all-clients', AdminController.view_all_clients);
router.get('/admin/view-all-survey-builders', AdminController.view_survey_builders);
router.get('/admin/view-all-log', AdminController.view_all_log);

module.exports = router;