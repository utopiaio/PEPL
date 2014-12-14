module.exports = function (dependency) {
  var pgClient = dependency.pgClient;

  return function (request, response, next) {
    switch(request.method) {
      /**
       * 200 --- all good
       * 400 --- bad request
       * 404 --- match doesn't exist
       * 401 --- unauthorized attempt to access fixture data
       */
      case 'GET':
        if (request.params.id === undefined) {
          pgClient.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time, fixture_team_home_score, fixture_team_away_score FROM fixtures;', [], function (error, result) {
            response.status(error === null ? 200 : 400);
            response.json(error === null ? result.rows : 200);
          });
        } else {
          if (request.session.player_type === 'ADMINISTRATOR') {
            pgClient.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time, fixture_team_home_score, fixture_team_away_score FROM fixtures WHERE fixture_id=$1;', [request.params.id], function (error, result) {
              response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 404);
              response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
            });
          } else {
            response.status(401);
            response.json({});
          }
        }
      break;

      /**
       * 202 --- fixture added
       * 401 --- what the fugg!
       * 409 --- conflict with constraint
       */
      case 'POST':
        if (request.session.player_type === 'ADMINISTRATOR') {
          pgClient.query('INSERT INTO fixtures (fixture_team_home, fixture_team_away, fixture_time) VALUES ($1, $2, $3) RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time], function (error, result) {
            response.status(error === null ? 202 : 409);
            response.json(error === null ? result.rows[0] : {});
          });
        } else {
          response.status(401);
          response.json({});
        }
      break;

      /**
       * 202 --- fixture updated
       * 400 --- bad request
       * 401 --- comeback when you're 21
       * 404 --- trying to update a record that does not exist
       */
      case 'PUT':
        if (request.session.player_type === 'ADMINISTRATOR') {
          pgClient.query('UPDATE fixtures SET fixture_team_home=$1, fixture_team_away=$2, fixture_time=$3, fixture_team_home_score=$4, fixture_team_away_score=$5 WHERE fixture_id=$6 RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time, fixture_team_home_score, fixture_team_away_score;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time, request.body.fixture_team_home_score, request.body.fixture_team_away_score, request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 202 : 404) : 400);
            response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
          });
        } else {
          response.status(401);
          response.json({});
        }
      break;

      /**
       * 202 --- deleted
       * 400 --- bad request
       * 401 --- like i said, comeback when you're 21
       * 404 --- trying to delete a record that doesn't exist
       */
      case 'DELETE':
        if (request.session.player_type === 'ADMINISTRATOR') {
          pgClient.query('DELETE FROM fixtures where fixture_id=$1', [request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 202 : 404) : 400);
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
