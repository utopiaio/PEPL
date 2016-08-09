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

const config = require('./config');

const moedoo = require('./rock/moedoo')(config);
const mail = require('./util/mail')(config.email);
const pgClient = moedoo.pgClient();

const login = require('./routes/login');

const app = express();
app.set('port', process.env.PORT || 8000);

// // force HTTPS
// app.use((request, response, next) => {
//   request.headers['x-forwarded-proto'] === 'https'
//     ? next()
//     : response.redirect(301, 'https://pepl.herokuapp.com');
// });
app.use(compression());
app.use(favicon(path.join(__dirname, 'public/static/images/favicon.ico')));
app.use('/app.cache$', (request, response, next) => {
  response.setHeader('Content-Type', 'text/cache-manifest');
  next();
});
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use('/api/login', login({ pgClient, config }));
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
