module.exports = function (dependency) {
  var client = dependency.client,
      emailTransporter = dependency.emailTransporter,
      emailConfig = dependency.emailConfig,
      sha1 = dependency.sha1;

  return function (request, response, next) {
    switch(request.method) {
      case 'POST':
        /**
         * this measure is next to nothing
         * but it'll keep out the Mitches out for at-least a second :)
         * and not to mention Dyno --- 720
         */
        if (request.session.blockForAWeek === true) {
          response.status(403);
          response.json({});
        } else {
          client.query('INSERT INTO players (player_username, player_password, player_suspended, player_email, player_type) VALUES ($1, $2, $3, $4, $5) RETURNING player_id, player_username, player_suspended, player_email, player_type;', [request.body.player_username, sha1.sha1(String(request.body.player_password)), true, request.body.player_email, 'NORMAL'], function (error, result) {
            response.status(error === null ? 202 : 409);
            response.json({});

            if (error === null) {
              var mailOptions = {
                from: emailConfig.from,
                to: emailConfig.adminEmail,
                subject: 'New User',
                text: 'approve or decline this Mitch',
                html: 'approve or decline this Mitch'
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
  };
}
