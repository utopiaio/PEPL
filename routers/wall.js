module.exports = function (dependency) {
  var pgClient = dependency.pgClient,
      sockets = dependency.sockets,
      moment = dependency.moment;

  return function (request, response, next) {
    switch(request.method) {
      /**
       * 200 --- accepted
       * 400 --- bad request
       */
      case 'GET':
        var players = [],
            messages = [];
        pgClient.query('SELECT player_id, player_username FROM players;', [], function (error, result) {
          if (error === null) {
            players = result.rows;

            pgClient.query('SELECT wall_id, wall_player, wall_message, wall_timestamp FROM wall;', [], function (error, result) {
              if (error === null) {
                messages = result.rows;
                var iMessages = 0,
                    lMessages = messages.length,
                    iPlayers = 0,
                    lPlayers = players.length;

                for (; iMessages < lMessages; iMessages++) {
                  if (moment(messages[iMessages].wall_timestamp).add(14, 'days').isAfter(moment()) === true) {
                    iPlayers = 0;
                    for (; iPlayers < lPlayers; iPlayers++) {
                      if (messages[iMessages].wall_player === players[iPlayers].player_id) {
                        messages[iMessages].wall_player = players[iPlayers];
                        break;
                      }
                    }
                  } else {
                    // wall messages older than 2 weeks are deleted!
                    // PS:
                    // all messages will be returned (stored before deletion)
                    pgClient.query('DELETE FROM wall WHERE wall_id=$1', [messages[iMessages].wall_id]);
                  }
                }

                response.status(200);
                response.json(messages);
              } else {
                response.status(400);
                response.json({});
              }
            });
          } else {
            response.status(400);
            response.json({});
          }
        });
      break;

      /**
       * to get around the stability issue of Internet connection *here*
       * we're going to use the good ol' requests for post and delete
       * we'll only use socket to broadcast new posts
       */
      case 'POST':
        if (request.body.message.length > 2 && request.body.message.length < 500) {
          pgClient.query('INSERT INTO wall (wall_player, wall_message, wall_timestamp) VALUES ($1, $2, $3) RETURNING wall_id, wall_player, wall_message, wall_timestamp;', [request.session.player_id, request.body.message, moment().toDate()], function (error, result) {
            if (error === null) {
              var message = result.rows[0];
              message.wall_player = {
                player_id: request.session.player_id,
                player_username: request.session.player_username
              };

              // broadcasting to whoever is `connected`
              sockets[request.session.player_username].broadcast.emit('message', {mode: 'NEW_MESSAGE', message: message});
            }

            response.status(error === null ? 202 : 409);
            response.json(error === null ? message : {});
          });
        } else {
          response.status(400);
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
