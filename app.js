/**
 * Moe Szyslak
 *
 * December, 2014 --- send-off
 *
 * P-EPL
 */

var http = require('http');
var path = require('path');
var fs = require('fs');
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
var sha1 = require('./lib/cyper.js');

// sockets is where we're going to keep all those sockets that are connected
// {username: socket}
var sockets = {};
var cookieSignature = 'Svi#isdf!93|4{5msVldx!fks(8}';
var emailConfig = {
  service: 'Gmail',
  auth: {
    user: 'gmail.user@gmail.com',
    pass: 'userpass'
  },
  from: 'Mamoe <moe.duffdude@gmail.com>',
  adminEmail: 'moe.duffdude@gmail.com'
};

var emailTransporter = nodemailer.createTransport({
  service: emailConfig.service,
  auth: emailConfig.auth
});

var client = new pg.Client(process.env.DATABASE_URL || 'tcp://postgres:password@127.0.0.1:5432/pepl');
client.connect();

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



app.use('/api/login', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      response.status(request.session.loggedIn === true ? 200 : 412);
      response.json({
        player_id: request.session.player_id,
        player_username: request.session.player_username,
        player_email: request.session.player_email,
        player_type: request.session.player_type,
        player_suspended: request.session.player_suspended
      });
    break;

    case 'POST':
      client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE (player_username=$1 OR player_email=$1) AND player_password=$2 AND player_suspended=$3',
                   [request.body.ID.toLowerCase(), sha1.sha1(String(request.body.password)), false],
                   function (error, result) {
        if (error) {
          response.status(409);
          response.json({});
        } else {
          if (result.rowCount === 1) {
            request.session.loggedIn = true;
            request.session.player_id = result.rows[0].player_id;
            request.session.player_username = result.rows[0].player_username;
            request.session.player_email = result.rows[0].player_email;
            request.session.player_type = result.rows[0].player_type;
            request.session.player_suspended = result.rows[0].player_suspended;
            response.status(200);
            response.json({
              player_id: result.rows[0].player_id,
              player_username: result.rows[0].player_username,
              player_email: result.rows[0].player_email,
              player_type: result.rows[0].player_type,
              player_suspended: result.rows[0].player_suspended
            });
          } else {
            response.status(401);
            response.json({});
          }
        }
      });
    break;

    case 'DELETE':
      if (request.session.loggedIn === true) {
        delete request.session.loggedIn;
        response.status(202);
        response.json({});
      } else {
        response.status(401);
        response.json({});
      }
    break;

    default:
      response.status(405);
      response.json({});
    break;
  }
});



app.use('/api/signup', function (request, response, next) {
  switch(request.method) {
    case 'POST':
      // this measure is next to nothing
      // but it'll keep out the Mitches out for at-least a second
      // and not to mention Dyno --- 720
      if (request.session.blockForAWeek === true) {
        response.status(403);
        response.json({});
      } else {
        client.query('INSERT INTO players (player_username, player_password, player_suspended, player_email, player_type) VALUES ($1, $2, $3, $4, $5) RETURNING player_id, player_username, player_suspended, player_email, player_type;', [request.body.player_username, sha1.sha1(String(request.body.player_password)), true, request.body.player_email, 'NORMAL'], function (error, result) {
          if (error) {
            console.log(error);
            response.status(409);
            response.json({});
          } else {
            request.session.blockForAWeek = true;
            response.status(202);
            response.json({});

            var mailOptions = {
              from: emailConfig.from,
              to: emailConfig.adminEmail,
              subject: 'New User',
              text: 'you have a new user Mitche, approve or decline that Mitch',
              html: 'you have a new user Mitche, approve or decline that Mitch'
            };

            emailTransporter.sendMail(mailOptions, function (error, info) {
              console.log(error === null ? info : error);
            });
          }
        });
      }
    break;

    default:
      response.status(405);
      response.json({});
    break;
  }
});



// this middle fellow will check for authentication (i.e. session)
// and will take the appropriate measures
app.use(/^\/api\/.*/, function (request, response, next) {
  if (request.session.loggedIn === true) {
    next();
  } else {
    response.status(412);
    response.json({});
  }
});



app.use(/^\/api\/players\/.*/, function (request, response, next) {
  if (request.session.player_type === 'ADMINISTRATOR') {
    next();
  } else {
    response.status(412);
    response.json({});
  }
});



app.use('/api/players/:id?/:status?', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      if (request.params.id === undefined) {
        client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players;', [], function (error, result) {
          if (error) {
            response.status(409);
            response.json({});
          } else {
            response.status(200);
            response.json(result.rows);
          }
        });
      } else {
        client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE player_id=$1;', [request.params.id], function (error, result) {
          if (error) {
            response.status(409);
            response.json({});
          } else {
            response.status(result.rowCount === 1 ? 200 : 404);
            response.json(result.rowCount === 1 ? result.rows[0] : {});
          }
        });
      }
    break;

    case 'PUT':
      client.query('UPDATE players SET player_suspended=$1 WHERE player_id=$2 RETURNING player_id, player_username, player_suspended, player_email, player_type;', [request.params.status === 'suspend' ? true : false, request.params.id], function (error, result) {
        if (error) {
          response.status(409);
          response.json({});
        } else {
          response.status(result.rowCount === 1 ? 200 : 404);
          response.json(result.rowCount === 1 ? result.rows[0] : {});

          if (result.rowCount === 1) {
            var mailOptions = {
              from: emailConfig.from,
              to: result.rows[0].player_email,
              subject: request.params.status === 'suspend' ? 'Account SUSPEND' : 'Account Activated ✔',
              text: request.params.status === 'suspend' ? 'your account has been suspended' : 'your account @PEPL has been activated ✔',
              html: request.params.status === 'suspend' ? 'your account has been suspended' : 'your account @PEPL has been activated ✔'
            };

            emailTransporter.sendMail(mailOptions, function (error, info) {
              console.log(error === null ? info : error);
            });
          }
        }
      });
    break;

    case 'DELETE':
      client.query('DELETE FROM players where player_id=$1', [request.params.id], function (error, result) {
        if (error) {
          response.status(409);
          response.json({});
        } else {
          response.status(202);
          response.json({});
        }
      });
    break;

    default:
      response.status(405);
      response.json({});
    break;
  }
});



app.use('/api/fixtures/:id?', function (request, response, next) {
  switch(request.method) {
    case 'GET':
      if (request.params.id === undefined) {
        client.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time FROM fixtures;', [], function (error, result) {
          response.status(error === null ? 200 : 409);
          response.json(error === null ? result.rows : 200);
        });
      } else {
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time FROM fixtures WHERE fixture_id=$1;', [request.params.id], function (error, result) {
            if (error) {
              response.status(409);
              response.json({});
            } else {
              response.status(result.rowCount === 1 ? 200 : 404);
              response.json(result.rowCount === 1 ? result.rows[0] : {});
            }
          });
        } else {
          response.status(412);
          response.json({});
        }
      }
    break;

    case 'POST':
      if (request.session.player_type === 'ADMINISTRATOR') {
        client.query('INSERT INTO fixtures (fixture_team_home, fixture_team_away, fixture_time) VALUES ($1, $2, $3) RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time], function (error, result) {
          response.status(error === null ? 202 : 409);
          response.json(error === null ? result.rows[0] : {});
        });
      } else {
        response.status(412);
        response.json({});
      }
    break;

    case 'PUT':
      if (request.session.player_type === 'ADMINISTRATOR') {
        client.query('UPDATE fixtures SET fixture_team_home=$1, fixture_team_away=$2, fixture_time=$3 WHERE fixture_id=$4 RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time, request.params.id], function (error, result) {
          if (error) {
            response.status(409);
            response.json({});
          } else {
            response.status(result.rowCount === 1 ? 200 : 404);
            response.json(result.rowCount === 1 ? result.rows[0] : {});
          }
        });
      } else {
        response.status(412);
        response.json({});
      }
    break;

    case 'DELETE':
      if (request.session.player_type === 'ADMINISTRATOR') {
        client.query('DELETE FROM fixtures where fixture_id=$1', [request.params.id], function (error, result) {
          response.status(error === null ? 202 : 409);
          response.json({});
        });
      } else {
        response.status(412);
        response.json({});
      }
    break;

    default:
      response.status(405);
      response.json({});
    break;
  }
});



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
  if (socket.handshake.session.loggedIn === true) {
    next();
  } else {
    next(new Error('not authorized'));
  }
});

// if a socket connection has established connection that means it's legit
io.on('connection', function (socket) {
  // we have a connection
  sockets[socket.handshake.session.player_username] = socket;

  // telling ERYone the good news
  socket.broadcast.json.send({});

  // this tells everyone the sad news
  socket.on('disconnect', function () {
    delete sockets[socket.handshake.session.player_username];
    // yet another a bit too much info
    io.emit('message', {});
  });
});
