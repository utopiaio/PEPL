module.exports = function(dependency) {
  var pgClient = dependency.pgClient,
      sha1 = dependency.sha1;

  return function(request, response, next) {
    switch(request.method) {
      /**
       * tells the status of the current user
       * if session is found, current info is returned
       * which can be accessed via Auth.info()
       *
       * 200 --- session exists
       * 404 --- fresh-out the lot
       */
      case 'GET':
        response.status(request.session.loggedIn === true ? 200 : 401);
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
       *
       * 202 --- credentials accepted, session created
       * 400 --- start praying to Megan Fox
       * 401 --- username/email or/and password don't match
       * 406 --- weired credentials
       */
      case 'POST':
        if(request.body.ID.search(/[a-zA-Z0-9\.]+@[a-zA-Z]+\.[a-zA-Z\.]+/) === -1 && request.body.ID.toLowerCase().length < 3) {
          response.status(406).end();
        } else {
          pgClient.query('SELECT player_id, player_username, player_suspended, player_email, player_type FROM players WHERE (player_username=$1 OR player_email=$1) AND player_password=$2 AND player_suspended=$3', [request.body.ID.toLowerCase(), sha1(String(request.body.password)), false], function (error, result) {
            if(error) {
              response.status(400).end();
            } else {
              if(result.rowCount === 1) {
                request.session.loggedIn = true;
                request.session.player_id = result.rows[0].player_id;
                request.session.player_username = result.rows[0].player_username;
                request.session.player_email = result.rows[0].player_email;
                request.session.player_type = result.rows[0].player_type;
                request.session.player_suspended = result.rows[0].player_suspended;

                response.status(202);
                response.json({
                  player_id: result.rows[0].player_id,
                  player_username: result.rows[0].player_username,
                  player_email: result.rows[0].player_email,
                  player_type: result.rows[0].player_type,
                  player_suspended: result.rows[0].player_suspended
                });
              } else {
                response.status(401).end();
              }
            }
          });
        }
      break;

      /**
       * logout
       * 202 --- session deleted
       * 404 --- there's no session to delete
       */
      case 'DELETE':
        if(request.session.loggedIn === true) {
          delete request.session.loggedIn;
          response.status(202).end();
        } else {
          response.status(404).end();
        }
      break;

      default:
        response.status(405).end();
      break;
    }
  };
};
