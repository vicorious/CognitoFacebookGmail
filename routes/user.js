const express = require('express')
const asyncify = require('express-asyncify')
const route = asyncify(express.Router())
const UserController = require('../controllers/userController')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook')
const AWS = require('aws-sdk')
require('colors')

const AWS_ACCOUNT_ID = '***********'
const COGNITO_IDENTITY_POOL_ID = 'us-east-1:******************************'
let COGNITO_IDENTITY_ID
let AWS_TEMP_CREDENTIALS
let COGNITO_SYNC_TOKEN
let cognitosync
const IAM_ROLE_ARN = 'arn:aws:iam::*************:role/Cognito_TestFacebookAuth_Role'
let COGNITO_SYNC_COUNT
const COGNITO_DATASET_NAME = 'TEST_DATASET'
const FACEBOOK_APP_ID = '******************'
const FACEBOOK_APP_SECRET = '****************************'
let FACEBOOK_TOKEN
let FACEBOOK_USER = {
  id: '',
  first_name: '',
  gender: '',
  last_name: '',
  link: '',
  locale: '',
  name: '',
  timezone: 0,
  updated_time: '',
  verified: false
}
let userLoggedIn = false
const cognitoidentity = new AWS.CognitoIdentity()

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: 'http://localhost:4200/v1/user/auth/facebook/callback'
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    FACEBOOK_TOKEN = accessToken
    FACEBOOK_USER = profile._json
    userLoggedIn = true
    done(null, profile)
  })
}))

function getCognitoID () {
  var params = {
    AccountId: AWS_ACCOUNT_ID,
    RoleARN: IAM_ROLE_ARN,
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
    Logins: {
      'graph.facebook.com': FACEBOOK_TOKEN
    }
  }
  AWS.config.region = 'us-east-1'
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(params)
  AWS.config.credentials.get(function (err) {
    if (err) console.log('credentials.get: '.red + err, err.stack)
    else {
      AWS_TEMP_CREDENTIALS = AWS.config.credentials.data.Credentials
      COGNITO_IDENTITY_ID = AWS.config.credentials.identityId
      console.log('Cognito Identity Id: '.green + COGNITO_IDENTITY_ID)
      getCognitoSynToken()
    }
  })
}

function getCognitoSynToken () {
  cognitosync = new AWS.CognitoSync()
  cognitosync.listRecords({
    DatasetName: COGNITO_DATASET_NAME,
    IdentityId: COGNITO_IDENTITY_ID,
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID
  }, function (err, data) {
    if (err) console.log('listRecords: '.red + err, err.stack)
    else {
      console.log('listRecords: '.green + JSON.stringify(data))
      COGNITO_SYNC_TOKEN = data.SyncSessionToken
      COGNITO_SYNC_COUNT = data.DatasetSyncCount
      console.log('SyncSessionToken: '.green + COGNITO_SYNC_TOKEN)
      console.log('DatasetSyncCount: '.green + COGNITO_SYNC_COUNT)
      addRecord()
    }
  })
}

function addRecord () {
  const params = {
    DatasetName: COGNITO_DATASET_NAME,
    IdentityId: COGNITO_IDENTITY_ID,
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
    SyncSessionToken: COGNITO_SYNC_TOKEN,
    RecordPatches: [
      {
        Key: 'USER_ID',
        Op: 'replace',
        SyncCount: COGNITO_SYNC_COUNT,
        Value: FACEBOOK_USER.id
      }
    ]
  }
  console.log('UserID: '.cyan + FACEBOOK_USER.id)
  cognitosync.updateRecords(params, function (err, data) {
    if (err) console.log('updateRecords: '.red + err, err.stack)
    else console.log('Value: '.green + JSON.stringify(data))
  })
}

route.get('/auth/facebook', passport.authenticate('facebook'))

route.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/v1/user/success',
  failureRedirect: '/error'
}))

route.get('/success', function (req, res, next) {
  console.log('FACEBOOK_TOKEN:'.green + FACEBOOK_TOKEN)
  getCognitoID()
  res.send('Logged in as ' + FACEBOOK_USER.name + ' (id:' + FACEBOOK_USER.id + ').')
})

route.get('/error', function (req, res, next) {
  res.send('Unable to access Facebook servers. Please check internet connection or try again later.')
})

route.get('/aws', (req, res) => {
  res.json('gg')
})

route.post('/create', async (request, response) => {
  const create = await UserController.create(request.body)
  response.status(201).json(create)
})

module.exports = route
