const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');

const contractsRouter = require('./routes/contracts');
const jobsRouter = require('./routes/jobs');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


app.use(getProfile);
app.use('/contracts', contractsRouter);
app.use('/jobs', jobsRouter);

module.exports = app;