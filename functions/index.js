const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const { routesConfig } = require('./routes/routes-config');
app.use(cors({ origin: true }));
routesConfig(app);

exports.api = functions.region('europe-west1').https.onRequest(app);