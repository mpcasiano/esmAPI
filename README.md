###### Documentation

# ESM API

## Overview

This API manages the ESM database and handles the HTTP requests from web and mobile applications. It accepts JSON as well as form-data format in request bodies and returns JSON-encoded responses with standard HTTP response codes.

* [Authentication](#Authentication)
* [HTTP Response Status Codes](#HTTP-Response-Status-Code)
* [Web App Requests](#Web-App-Requests)
* [Mobile App Requests](#Mobile-App-Requests)

## Authentication
ESM API uses token-based authentication to authenticate users and verify HTTP requests. 

When users log in to the app, the API returns a token. Users must include this token in the Authorization header when making requests:
```
Authorization: Bearer <token>
```

## HTTP Response Status Code
* 200 `OK`
 The request was successful.
* 401 `Unauthorized` Authentication failed. This could happen when a request does not include a verified token.
* 403 `Forbidden` - Access denied. The user does not have permission to execute the request.
* 404 `Not Found` - Resource was not found. This could happen when users fetch data not available in the database or the database table has currently no data. 
* 409 `Conflict` - Conflict with the server. This could happen when the request conflicts with the state of the database. For instance, this status will be returned when a user registers with a username or email that already exists. 
* 500 `Internal Server Error`

## Web App Requests
Each request requires a token (except for sign in and sign up)


### Sign in 
> `POST` https://esm-api.herokuapp.com/api/signin
* Log in to the app
* Returns a token

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "username": "sampleuser",
        "password": "sampleuser"
    }
    ```
----
### Sign Up

> `POST` https://esm-api.herokuapp.com/api/signup 

* Register to the app

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "first_name": "first",
        "last_name": "last",
        "email": "name@gmail.com",
        "username": "username",
        "password": "password"
    }
    ```
----
### View Profile

> `GET` https://esm-api.herokuapp.com/api/view-surveybuilder-profile 
* Returns user account details

    `Authorization` Bearer Token
----
### Create Client Account

> `POST` https://esm-api.herokuapp.com/api/client/signup

* Users can create accounts for their clients

    `Authorization` Bearer Token

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "first_name": "sample",
        "last_name": "client",
        "email": "sampleclient@gmail.com",
        "username": "sampleclient",
        "password": "password"
    }
    ```
----
### Delete Client Account
> `DELETE` https://esm-api.herokuapp.com/api/delete-client/:user_id 

* Users can only delete the account they created.
* URL parameters:

    | Name | Type | Description |
    | - | -  | -|
    | user_id | integer | user_id of the client |

    `Authorization` Bearer Token

----
### View Clients
> `GET` https://esm-api.herokuapp.com/api/view-clients 
* Users can only view their own clients
* Returns the list of clients

    `Authorization` Bearer Token
----
### Create Survey
> `POST` https://esm-api.herokuapp.com/api/create-survey

* Users can create a survey

    `Authorization` Bearer Token

    `Headers` Content-Type: multipart/form-data

    `Body` form-data

    | Key | Type |
    | -- | --  |
    | survey | text / string |
    | descMedia | file (image) | 

    ```json
    survey: {
        "title": "Sample survey",
        "desc":"This survey is for testing purposes only",
        "frequency": 0,
        "is_test": 0,
        "start": "2020-12-18",
        "end": "2020-12-19",
        "is_shared": 1,
        "anonymity": 1,
        "sections": [
            {
                "title": "Section",
                "desc": "description",
                "is_random": 0,
                "order_id": 0,
                "questions": [
                    {
                        "inputType": 2,
                        "question": "Question ",
                        "description": null,
                        "is_required": 1,
                        "order_id": 0,
                        "choices": [
                            "choice1",
                            "choice2"
                        ]
                    }
                ]
            }
        ]
    }
    ```
----
### Delete Survey
> `DELETE` https://esm-api.herokuapp.com/api/delete-survey/:survey_id

* Users can only delete the survey they created
* URL parameters:

    | Name | Type | Description |
    | - | -  | -|
    | survey_id | integer | id of the survey |

    `Authorization` Bearer Token

----
### View Survey
> `GET` https://esm-api.herokuapp.com/api/view-survey/web/:survey_id
* Returns a survey
* URL parameters:
    | Name | Type | Description |
    | - | -  | -|
    | survey_id | integer | id of the survey |

    `Authorization` Bearer Token

----
### View All Survey
> `GET` https://esm-api.herokuapp.com/api/view-all-survey 
* Returns all surveys

    `Authorization` Bearer Token

----
### View Responses
> `GET` https://esm-api.herokuapp.com/api/view-answers/:survey_id
* Returns both summary and individual responses in a survey
* URL parameters:
    | Name | Type | Description |
    | - | -  | -|
    | survey_id | integer | id of the survey 
    `Authorization` Bearer Token

----
## Mobile App Requests
When fetching data from the API, consider these two cases:
1. **userID** must be included if the user is supposed to be **anonymous**.
2. a **token** must be included if the user is supposed to be a **client**.

For example, the clients (users with account) use their userIDs when they answer a survey that collects data from anonymous respondents. In this case, clients can be anonymized by using the userID instead of the token.

### Sign in 
> `POST` https://esm-api.herokuapp.com/api/client/signin
* Clients log in to the app
* Returns a token
* Note: the token is used only for functionalities involving CLIENTS (e.g answering/viewing a survey for clients, updating client's profile)

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "username": "sampleclient",
        "password": "password"
    }
    ```
----
### Update Profile
> `PUT` https://esm-api.herokuapp.com/api/update-client-profile 
* Clients can update details in their profile

    `Authorization` Bearer Token

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "first_name": "first",
        "last_name":  "last",
        "email": "test@gmail.com",
        "username": "test"
    }
    ```

----
### Update Password
> `PUT` https://esm-api.herokuapp.com/api/update-client-password
* Old password must be correct in order to save the new password

    `Authorization` Bearer Token

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "old_password": "q",
        "new_password": "test"
    }
    ```
----
### View Profile

> `GET` https://esm-api.herokuapp.com/api/view-client-profile 
* Returns user account details

    `Authorization` Bearer Token

----
### Get userID

> `GET` https://esm-api.herokuapp.com/api/get-userID 
* Returns a **userID** which serves as an identity for each mobile app user. It is fetched only **ONCE** per mobile app otherwise it will generate multiple userIDs for only one user/mobile.
* Note: The userID should be saved **locally** since it will be used every time the respondent post answers to surveys (if intended for anonymous users)


----
### Get Survey via Access Code
> `GET` https://esm-api.herokuapp.com/api/view-survey/:access_code
* Returns a survey
* URL parameters:
    | Name | Type | Description |
    | - | -  | -|
    | access_code | string | Must be valid to get the survey |

    Sample link:  https://esm-api.herokuapp.com/api/view-survey/L6ow8pND

----
### Get All Surveys

> `GET` https://esm-api.herokuapp.com/api/mobile/view-all-survey 
* Returns all surveys

    `Authorization` Bearer Token

----
### Save Responses (for anonymous respondents)
> `POST` https://esm-api.herokuapp.com/api/save-anonymous-answers
* Save the responses with the userID (in the field respondent_id)

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "respondent_id": "43e5c60b-1fd2-4977-bca3-a286661d568f",
        "survey_id": 1401,
        "timestamp": "2020-05-12 10:30",    
        "answers": [
            {
                "question_id": 3001,
                "answer": [
                    "choice1"
                ]
            }
        ]
    }
    ```

----
### View responses (for anonymous respondents)

> `GET` https://esm-api.herokuapp.com/api/view-anonymous-answers/:survey_id/:user:id

* Returns the survey responses
* URL parameters:
    | Name | Type | Description |
    | - | -  | -|
    | survey_id | integer | First parameter |
    | user_id | string | Second parameter |

    Sample link: https://esm-api.herokuapp.com/api/view-anonymous-answers/1401/43e5c60b-1fd2-4977-bca3-a286661d568f 

----
### Save Responses (for clients)
> `POST` https://esm-api.herokuapp.com/api/save-client-answers 
* This request requires an authentication token (the user_id is not needed since the survey in this request is intended for clients and not for anonymous respondents).

    `Authorization` Bearer Token

    `Headers` Content-Type: application/json

    `Body` raw JSON

    ```json
    {
        "survey_id": 1401,
        "timestamp": "2020-05-12 10:32",
        "answers": [
            {
                "question_id": 3001,
                "answer": [
                    "choice2"
                ]
            }
        ]
    }
    ```

----
### View responses (for clients)

> `GET` https://esm-api.herokuapp.com/api/view-client-answers/:survey_id

* Returns the survey responses
* URL parameters:
    | Name | Type | Description |
    | - | -  | -|
    | survey_id | integer | id of the survey |

    `Authorization` Bearer Token

    Sample link: https://esm-api.herokuapp.com/api/view-client-answers/1401

---

# Running ESM API with localhost
## Installation

> Clone the files
```shell
$ git clone https://github.com/mpcasiano/esmAPI.git
$ cd esmAPI
```
> Install dependencies
```shell
$ npm install
```

## Database Setup
> Create database in localhost (change root to your MySQL username)
```shell
$ mysql -u root -p
$ create database esm_db;

# To check if the database is created:
$ show databases;

# Go to esm_db and import the sql file:
$ use esm_db;
$ source esm_db.sql;

# To check if the sql file is imported successfully:
$ show tables;
```

## Run app
```shell
$ nodemon web.js
```
