module.exports = function (dependency) {
  var client = dependency.client,
      emailTransporter = dependency.emailTransporter,
      emailConfig = dependency.emailConfig,
      sha1 = dependency.sha1;

  return function (request, response, next) {
    switch(request.method) {
      case 'GET':
        if (request.params.id === undefined) {
          client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players;', [], function (error, result) {
            response.status(error === null ? 200 : 400);
            response.json(error === null ? result.rows : []);
          });
        } else {
          client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE player_id=$1;', [request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 400);
            response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
          });
        }
      break;

      /**
       * api/players/id/suspend --- suspends a players suspends by :id
       * api/players/id/activate --- anything other than 'suspend' is passed as an argument, player is activated
       */
      case 'PUT':
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('UPDATE players SET player_suspended=$1 WHERE player_id=$2 RETURNING player_id, player_username, player_suspended, player_email, player_type;', [request.params.status === 'suspend' ? true : false, request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 400);
            response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});

            if (result && result.rowCount === 1) {
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
          });
        } else {
          response.status(401);
          response.json({});
        }
      break;

      case 'DELETE':
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('DELETE FROM players where player_id=$1', [request.params.id], function (error, result) {
            response.status(error === null ? 202 : 400);
            response.json({});
          });
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
  };
};
