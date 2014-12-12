module.exports = function (dependency) {
  var pgClient = dependency.pgClient,
      moment = dependency.moment,
      BAD_REQUEST = function () {
        response.status(400);
        response.json({});
      };

  /**
   * prediction's API
   * this is the main reason i can't use firebase
   * i need to filter predictions, else all you Mitches will...well..
   *
   * also we're going to return ALL references, just like Heroku says to do
   */
  return function (request, response, next) {
    switch(request.method) {
      /**
       * returns all predictions that are time-locked
       * also returns predictions of the CURRENT player --- ONLY for viewing
       * PUT request is not acceptable here :)
       *
       * 200 --- accepted
       * 400 --- bad
       */
      case 'GET':
        var players = [],
            fixtures = [],
            predictions = [],
            coolPredictions = [];

        pgClient.query('SELECT player_id, player_username, player_suspended FROM players;', [], function (error, result) {
          if (error === null) {
            players = result.rows;

            pgClient.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time, fixture_team_home_score, fixture_team_away_score FROM fixtures;', [], function (error, result) {
              if (error === null) {
                fixtures = result.rows;

                pgClient.query('SELECT prediction_id, prediction_fixture, prediction_player, prediction_home_team, prediction_away_team, prediction_timestamp FROM predictions;', [], function (error, result) {
                  if (error === null) {
                    predictions = result.rows;
                    var iPredictions = 0,
                        lPredictions = result.rows.length,
                        iPlayers = 0,
                        lPlayers = players.length,
                        iFixtures = 0,
                        lFixtures = fixtures.length;

                    for (; iPredictions < lPredictions; iPredictions++) {
                      iFixtures = 0;
                      lFixtures = fixtures.length;
                      for (; iFixtures < lFixtures; iFixtures++) {
                        if (fixtures[iFixtures].fixture_id === predictions[iPredictions].prediction_fixture) {
                          predictions[iPredictions].prediction_fixture = fixtures[iFixtures];
                        }
                      }

                      iPlayers = 0;
                      lPlayers = players.length;
                      for (; iPlayers < lPlayers; iPlayers++) {
                        if (predictions[iPredictions].prediction_player === players[iPlayers].player_id) {
                          predictions[iPredictions].prediction_player = players[iPlayers];
                        }
                      }

                      if (moment(predictions[iPredictions].prediction_timestamp).add(30, 'minutes').isAfter(moment(predictions[iPredictions].prediction_fixture.fixture_time)) || predictions[iPredictions].prediction_player === request.session.player_id) {
                        coolPredictions.push(predictions[iPredictions]);
                      }
                    }

                    response.status(200);
                    response.json(coolPredictions);
                  } else {
                    BAD_REQUEST();
                  }
                });
              } else {
                BAD_REQUEST();
              }
            });
          } else {
            BAD_REQUEST();
          }
        });
      break;

      /**
       * this is where the "time-lock" happens!
       *
       * 202 --- it's all good
       * 400 --- bad request
       * 404 --- prediction fixture doesn't exist
       * 408 --- sending prediction after time lock
       * 409 --- trying to "change" a prediction
       */
      case 'POST':
        pgClient.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time, fixture_team_home_score, fixture_team_away_score FROM fixtures WHERE fixture_id=$1;', [request.body.prediction_fixture], function (error, result) {
          if (error === null) {
            if (result.rowCount === 1) {
              if (moment().add(30, 'minutes').isAfter(moment(result.rows[0].fixture_time)) || moment(result.rows[0].fixture_time).isAfter(moment().add(1, 'days'))) {
                response.status(408);
                response.json({});
              } else {
                pgClient.query('INSERT INTO predictions (prediction_fixture, prediction_player, prediction_home_team, prediction_away_team, prediction_timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING prediction_id, prediction_fixture, prediction_player, prediction_home_team, prediction_away_team, prediction_timestamp;', [request.body.prediction_fixture, request.session.player_id, request.body.prediction_home_team, request.body.prediction_away_team, moment().toDate()], function (error, result) {
                  response.status(error === null ? 202 : 409);
                  response.json(error === null ? result.rows[0] : {});
                });
              }
            } else {
              response.status(404);
              response.json({});
            }
          } else {
            BAD_REQUEST();
          }
        });
      break;

      default:
        response.status(405);
        response.json({});
      break;
    }
  };
};
