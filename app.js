/**
 * Moe Szyslak <moe.duffdude@gmail.com>
 *
 * July, 2016
 *
 * PEPL
 */

const http = require('http');
const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const compression = require('compression');
const pg = require('pg');
const nodemailer = require('nodemailer');
const moment = require('moment');
const sha512 = require('./lib/cyper');

// app configurations
const CONFIG = {
  pgDevConnectionString: 'tcp://moe:@127.0.0.1:5432/pepl',
  email: {
    service: 'Gmail',
    auth: {
      user: 'moe.duffdude@gmail.com',
      pass: 'acwlumyyqrnmetpb', // has been revoked --- i think
    },
    from: 'MaMoe <moe.duffdude@gmail.com>',
    adminEmail: 'moe.duffdude@gmail.com',
  },
};

// email transport
const emailTransporter = nodemailer.createTransport({
  service: CONFIG.email.service,
  auth: CONFIG.email.auth,
});

const pgClient = new pg.Client(process.env.DATABASE_URL || CONFIG.pgDevConnectionString);
pgClient.connect();

const app = express();
app.set('port', process.env.PORT || 8000);

// HTTPS
app.use((request, response, next) => {
  request.headers['x-forwarded-proto'] === 'https'
    ? next()
    : response.redirect(301, 'https://pepl.herokuapp.com');
});
app.use(compression());
app.use(favicon(path.join(__dirname, 'public/static/images/favicon.ico')));
app.use('/app.cache$', (request, response, next) => {
  response.setHeader('Content-Type', 'text/cache-manifest');
  next();
});
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// app.use('/api/login', login({pgClient: pgClient, sha1: sha1}));
// app.use('/api/signup', signup({pgClient: pgClient, sha1: sha1, emailTransporter: emailTransporter, emailConfig: emailConfig}));



/**
 * this middle fellow will check for authentication (i.e. session)
 * and will take the appropriate measures
 */
app.use(/^\/api\/.*/, (request, response, next) => {
  // if(request.session.loggedIn === true) {
  //   next();
  // } else {
  //   response.status(412).end();
  // }
});

// app.use('/api/players/:id?', players({pgClient: pgClient, emailTransporter: emailTransporter, emailConfig: emailConfig}));
// app.use('/api/fixtures/:id?', fixtures({pgClient: pgClient, moment: moment}));
// app.use('/api/predictions/:anonymous?', predictions({pgClient: pgClient, moment: moment}));

const server = http.createServer(app);
server.listen(app.get('port'));
