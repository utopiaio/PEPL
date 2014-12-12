/**
 * Moe Szyslak
 *
 * December, 2014 --- send-off
 *
 * P-EPL
 */

var http = require('http');
var path = require('path');
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var pg = require('pg');
var nodemailer = require('nodemailer');
var socket = require('socket.io');
var sessionStore = require('sessionstore').createSessionStore(); // Memory
var socketHandshake = require('socket.io-handshake');
var moment = require('moment');
var sha1 = require('./lib/cyper');

var login = require('./routers/login');
var signup = require('./routers/signup');
var players = require('./routers/players');
var fixtures = require('./routers/fixtures');
var predictions = require('./routers/predictions');

// sockets is where we're going to keep all those sockets that are connected
// {username: socket}
var sockets = {};
var cookieSignature = 'Svi#isdf!93|4{5msVldx!fks(8}';
var emailConfig = {
  service: 'Gmail',
  auth: {
    user: 'moe.duffdude@gmail.com',
    pass: 'aardruybakmgbpmq'
  },
  from: 'Mamoe <moe.duffdude@gmail.com>',
  adminEmail: 'moe.duffdude@gmail.com'
};

var emailTransporter = nodemailer.createTransport({
  service: emailConfig.service,
  auth: emailConfig.auth
});

var pgClient = new pg.Client(process.env.DATABASE_URL || 'tcp://postgres:password@127.0.0.1:5432/pepl');
pgClient.connect();

var app = express();
app.set('port', process.env.PORT || 8000);

app.use(serveFavicon(path.join(__dirname, 'public/assets/images/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({
  name: 'pepl',
  store: sessionStore,
  secret: cookieSignature,
  cookie: {
    maxAge: 604800000, // 7 days
    secure: false, // BUY me an SSL and we can set this to true
    httpOnly: true
  },
  rolling: true,
  resave: true,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));



app.use('/api/login', login({pgClient: pgClient, sha1: sha1}));
app.use('/api/signup', signup({pgClient: pgClient, sha1: sha1, emailTransporter: emailTransporter, emailConfig: emailConfig}));



/**
 * this middle fellow will check for authentication (i.e. session)
 * and will take the appropriate measures
 */
app.use(/^\/api\/.*/, function (request, response, next) {
  if (request.session.loggedIn === true) {
    next();
  } else {
    response.status(412);
    response.json({});
  }
});



app.use('/api/players/:id?', players({pgClient: pgClient, emailTransporter: emailTransporter, emailConfig: emailConfig}));
app.use('/api/fixtures/:id?', fixtures({pgClient: pgClient}));
app.use('/api/predictions', predictions({pgClient: pgClient, moment: moment}));



// this makes sure angular is in-charge of routing
app.use(function (request, response) {
  response.sendFile(path.join(__dirname, '/public/index.html'));
});



var server = http.createServer(app);
server.listen(app.get('port'), '0.0.0.0');


// socket.io will be piggy-back riding on Express
var io = socket(server);
io.use(socketHandshake({
  store: sessionStore,
  key: 'pepl',
  secret: cookieSignature,
  parser: cookieParser()
}));


// yet another middle fellow that authenticates session
io.use(function(socket, next) {
  socket.handshake.session.loggedIn === true ? next() : next(new Error('not authorized'));
});

// if a socket connection has established connection that means it's legit
io.on('connection', function (socket) {
  // we have a connection
  sockets[socket.handshake.session.player_username] = socket;

  // telling ERYone the good news
  // socket.broadcast.json.send({});

  // this tells everyone the sad news
  socket.on('disconnect', function () {
    delete sockets[socket.handshake.session.player_username];
    // yet another a bit too much info
    // io.emit('message', {});
  });
});
