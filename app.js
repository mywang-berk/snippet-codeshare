const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const createRouter = require('./routes/create');
const viewRouter = require('./routes/view');
const deleteRouter = require('./routes/delete');
const db = require('./database/db');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(express.json())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/create', createRouter);
app.use('/view', viewRouter);
app.use('/delete', deleteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

db.query('SHOW TABLES;', function (err, rows, fields) {
  if (err) throw err;
  console.log('First Row:', rows[0]);
});

db.query('SELECT URIKey FROM Snip WHERE URIKey=\'ABSCD\'', 
                function (err, rows, fields) {
                    console.log(rows[0] != undefined && 
                      rows[0].URIKey == 'ABSCD');
                });

module.exports = app;
