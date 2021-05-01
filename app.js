const pmx = require('pmx').init({
  http: true,
  errors: true,
  network: true,
  ports: true,
});

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const fs = require('fs');
const expressSession = require('express-session');
const FileStore = require('session-file-store')(expressSession);
const config = require('./config');

const app = express();

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());
app.use(favicon(path.join(__dirname, '/public/img/favicon.ico')));

app.use(expressSession({
  store: new FileStore({}),
  saveUninitialized: true,
  resave: true,
  secret: process.env.COOKIE_SECRET || config.secret,
  cookie: {
    secure: false,
  },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Connect to mongo.
try {
  mongoose.connect(config.databaseUrl || process.env.DATABASE_URL || 'mongodb://127.0.0.1/grime', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  });
} catch (err) {
  console.error('Connection error:' + err);
}

/* eslint-disable, no-unused-vars */

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

// Load models.
const modelsPath = path.join(__dirname, '/models');
fs.readdirSync(modelsPath).forEach((file) => {
  if (~file.indexOf('.js')) {
    require(path.join(modelsPath, '/', file));
  }
});

// Load routes.
const routesPath = path.join(__dirname, '/routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (~file.indexOf('.js')) {
    const route = require(path.join(routesPath, file));

    route.routes(app);
  }
});

// Render 404 page
app.use((req, res, next) => {
  res.status(404).render('404.jade', { title: 'Not Found' });
  next();
});

/* eslint-enable, no-unused-vars */

app.use(pmx.expressErrorHandler());

module.exports = app;
