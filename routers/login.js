module.exports = function (dependency) {
  var client = dependency.client;
  var sha1 = dependency.sha1;

  return function (request, response, next) {
    switch(request.method) {
      /**
       * tells the status of the current user
       * if session is found, current info is returned
       * which can be accessed via Auth.info()
       */
      case 'GET':
        response.status(request.session.loggedIn === true ? 200 : 412);
        response.json(request.session.loggedIn === true ? {
          player_id: request.session.player_id,
          player_username: request.session.player_username,
          player_email: request.session.player_email,
          player_type: request.session.player_type,
          player_suspended: request.session.player_suspended
        } : {});
      break;

      /**
       * login request
       * if it's all good, session is created and info is returned
       * which can be accessed via Auth.info()
       */
      case 'POST':
        client.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE (player_username=$1 OR player_email=$1) AND player_password=$2 AND player_suspended=$3', [request.body.ID.toLowerCase(), sha1.sha1(String(request.body.password)), false], function (error, result) {
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

      /**
       * logout
       */
      case 'DELETE':
        if (request.session.loggedIn === true) {
          delete request.session.loggedIn;
          response.status(202);
        } else {
          response.status(401);
        }

        response.json({});
      break;

      default:
        response.status(405);
        response.json({});
      break;
    }
  };
};
