module.exports = function(dependency) {
  var pgClient = dependency.pgClient,
      emailTransporter = dependency.emailTransporter,
      emailConfig = dependency.emailConfig,
      sessionStore = dependency.sessionStore,
      sha1 = dependency.sha1;

  return function(request, response, next) {
    switch(request.method) {
      case 'POST':
        /**
         * this measure is next to nothing
         * but it'll keep out the Mitches out for at-least a second :)
         * and not to mention Dyno --- 720
         *
         * 202 --- accepted
         * 403 --- blocked for a week
         * 409 --- conflict, username or password taken
         * 400 --- bad request
         * 406 --- invalid input
         */
        if(request.session.blockForAWeek === true) {
          response.status(403).end();
        } else if(request.body.player_username.length < 2 || request.body.player_username.length > 10 ||  request.body.player_password < 3 || request.body.player_email.search(/[a-zA-Z0-9\.]+@[a-zA-Z]+\.[a-zA-Z\.]+/) === -1) {
          response.status(406).end();
        } else {
          pgClient.query('INSERT INTO players (player_username, player_password, player_suspended, player_email, player_type) VALUES ($1, $2, $3, $4, $5) RETURNING player_id, player_username, player_suspended, player_email, player_type;', [request.body.player_username, sha1(String(request.body.player_password)), true, request.body.player_email, 'NORMAL'], function(error, result) {
            if(error === null) {
              var mailOptions = {
                from: emailConfig.from,
                to: emailConfig.adminEmail,
                subject: 'New User',
                text: 'username: '+ request.body.player_username +'\nemail: '+ request.body.player_email,
                html: '@<b>'+ request.body.player_username +'</b><br><i>'+ request.body.player_email +'</i>'
              };

              emailTransporter.sendMail(mailOptions, function(error, info) {
                console.log(error === null ? info : error);
              });

              request.session.blockForAWeek = true;
              response.status(202).end();
            } else if(error.code === '23505') {
              response.status(409).end();
            } else {
              response.status(400).end();
            }
          });
        }
      break;

      default:
        response.status(405).end();
      break;
    }
  };
}
