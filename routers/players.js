module.exports = function (dependency) {
  var pgClient = dependency.pgClient,
      emailTransporter = dependency.emailTransporter,
      emailConfig = dependency.emailConfig;

  return function (request, response, next) {
    /**
     * this is the FULL rest implementation of players table
     * with a couple of functions added
     *
     * new player is created at /api/signup
     */
    switch(request.method) {
      case 'GET':
        if (request.params.id === undefined) {
          // returning ALL PLAYERS
          pgClient.query('SELECT player_id, player_username, player_suspended, player_type FROM players;', [], function (error, result) {
            response.status(error === null ? 200 : 406);
            response.json(error === null ? result.rows : []);
          });
        } else if (request.session.player_id === Number(request.params.id)) {
          // FULL player info is returned IFF the user requesting the info is the OWNER
          pgClient.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE player_id=$1;', [request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 400);
            response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
          });
        } else {
          // player trying to access someone's else info
          response.status(403);
          response.json({})
        }
      break;

      case 'PUT':
        if (request.session.player_type === 'ADMINISTRATOR') {
          // someone needs to look after you mitches!
          pgClient.query('UPDATE players SET player_suspended=$1 WHERE player_id=$2 RETURNING player_id, player_username, player_suspended, player_type;', [request.body.player_suspended, request.params.id], function (error, result) {
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
          pgClient.query('DELETE FROM players where player_id=$1', [request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 202 : 404) : 406);
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
