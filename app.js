/**
 * Moe Szyslak
 *
 * December, 2014 --- send-off
 *
 * PEPL
 */

var http = require('http');
var path = require('path');
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var compression = require('compression');
var pg = require('pg');
var nodemailer = require('nodemailer');
var socket = require('socket.io');
var connectPgSimple = require('connect-pg-simple');
var socketHandshake = require('socket.io-handshake');
var moment = require('moment');
var sha1 = require('./lib/cyper');

var login = require('./routers/login');
var signup = require('./routers/signup');
var players = require('./routers/players');
var fixtures = require('./routers/fixtures');
var predictions = require('./routers/predictions');
var wall = require('./routers/wall');

// PG Session store
var pgStore = new (connectPgSimple(expressSession))({
  pg: pg,
  conString: process.env.DATABASE_URL || 'tcp://postgres:password@127.0.0.1:5432/pepl'
});

// sockets is where we're going to keep all those sockets that are connected
// {username: socket}
var sockets = {};
var cookieSignature = 'signature';
var emailConfig = {
  service: 'platform',
  auth: {
    user: 'email',
    pass: 'password'
  },
  from: 'name <admin-email>',
  adminEmail: 'admin-email'
};

var emailTransporter = nodemailer.createTransport({
  service: emailConfig.service,
  auth: emailConfig.auth
});

var pgClient = new pg.Client(process.env.DATABASE_URL || 'tcp://postgres:password@127.0.0.1:5432/pepl');
pgClient.connect();

var app = express();
app.set('port', process.env.PORT || 8000);



// Guinness are you watching?
var bootSQL = "CREATE TABLE IF NOT EXISTS players (player_id serial NOT NULL, player_username character varying(128) NOT NULL, player_password character varying(128) NOT NULL, player_suspended boolean NOT NULL DEFAULT false, player_email character varying(1024), player_type character varying(32) NOT NULL DEFAULT 'NORMAL'::character varying, CONSTRAINT player_pk PRIMARY KEY (player_id), CONSTRAINT player_email_unique UNIQUE (player_email), CONSTRAINT player_username_unique UNIQUE (player_username)); CREATE TABLE IF NOT EXISTS fixtures (fixture_id serial NOT NULL, fixture_team_home character varying(128) NOT NULL DEFAULT 'HOME TEAM'::character varying, fixture_team_away character varying(128) NOT NULL DEFAULT 'AWAY TEAM'::character varying, fixture_time timestamp with time zone NOT NULL DEFAULT now(), fixture_team_home_score integer DEFAULT (-1), fixture_team_away_score integer DEFAULT (-1), CONSTRAINT fixture_pk PRIMARY KEY (fixture_id)); CREATE TABLE IF NOT EXISTS predictions (prediction_id serial NOT NULL, prediction_fixture integer NOT NULL, prediction_player integer NOT NULL, prediction_home_team integer NOT NULL, prediction_away_team integer NOT NULL, prediction_timestamp timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT prediction_pk PRIMARY KEY (prediction_id), CONSTRAINT prediction_fixture_fk FOREIGN KEY (prediction_fixture) REFERENCES fixtures (fixture_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, CONSTRAINT prediction_player_fk FOREIGN KEY (prediction_player) REFERENCES players (player_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, CONSTRAINT prediction_unique UNIQUE (prediction_fixture, prediction_player)); CREATE TABLE IF NOT EXISTS wall (wall_id serial NOT NULL, wall_player integer, wall_message text NOT NULL, wall_timestamp timestamp with time zone NOT NULL DEFAULT now(), CONSTRAINT wall_pk PRIMARY KEY (wall_id), CONSTRAINT wall_player_fk FOREIGN KEY (wall_player) REFERENCES players (player_id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE); CREATE TABLE IF NOT EXISTS session (sid character varying NOT NULL, sess json NOT NULL, expire timestamp(6) without time zone NOT NULL, CONSTRAINT session_pkey PRIMARY KEY (sid));";
pgClient.query(bootSQL, [], function (error, result) {
  if (error === null) {
    // console.log(result);

    pgClient.query('INSERT INTO players (player_username, player_password, player_suspended, player_email, player_type) VALUES ($1, $2, $3, $4, $5);', ['moe', '4706da2001c4b6b8dcecafa27c5c4155fc265ee7', false, 'moe.duffdude@gmail.com', 'ADMINISTRATOR'], function (error, result) {
      if (error === null) {
        // console.log(result);
      } else {
        // console.log(error);
      }
    });
  } else {
    // console.log(error);
  }
});



/**
 * HTTPS
 */
app.use(function (request, response, next) {
  request.headers['x-forwarded-proto'] === 'https' ? next() : response.redirect('https://pepl.herokuapp.com');
});
app.use(compression());
/**
 * i don't know if this "works" or not
 */
app.use('/app\.cache$', function (request, response, next) {
  response.setHeader('Content-Type', 'text/cache-manifest');
  next();
});
app.use(serveFavicon(path.join(__dirname, 'public/assets/images/favicon.ico')));
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({
  name: 'pepl',
  store: pgStore,
  secret: cookieSignature,
  cookie: {
    maxAge: 30 * 86400000, // 30 days
    secure: false,
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
app.use('/api/fixtures/:id?', fixtures({pgClient: pgClient, moment: moment}));
app.use('/api/predictions/:anonymous?', predictions({pgClient: pgClient, moment: moment}));
app.use('/api/wall', wall({pgClient: pgClient, sockets: sockets, moment: moment}));



// this makes sure angular is in-charge of routing
app.use(function (request, response) {
  response.sendFile(path.join(__dirname, '/public/index.html'));
});



var server = http.createServer(app);
server.listen(app.get('port'));


// socket.io will be piggy-back riding on Express
var io = socket(server);
io.use(socketHandshake({
  store: pgStore,
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
