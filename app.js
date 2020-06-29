global.rootPath = __dirname;
global.rootRequire = name => require(`${__dirname}/${name}`);

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const yaml = require('./utils/yaml');

const indexRouter = require('./routes/index');

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

// Error handler.
app.use(function(err, req, res, next)
{
    console.log('Error handler...');

    // Set res.locals, only providing error in development.
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page.
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
