global.rootPath = __dirname;
global.rootRequire = name => require(`${__dirname}/${name}`);

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const yaml = require('./utils/yaml');

const indexRouter = require('./routes/index');
const charactersRouter = require('./routes/characters');

const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

const app = express();
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.xml());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/characters', charactersRouter);

// Error handler.
app.use(function(err, req, res, next)
{
  res.status(err.status || 500);
  res.send({
    errorCode: err.status,
    errorMessage: err.message,
    errorCause: JSON.stringify(err.cause)
  });
  res.end();
});

module.exports = app;
