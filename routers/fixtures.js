module.exports = function (dependency) {
  var client = dependency.client;

  return function (request, response, next) {
    switch(request.method) {
      case 'GET':
        if (request.params.id === undefined) {
          client.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time FROM fixtures;', [], function (error, result) {
            response.status(error === null ? 200 : 409);
            response.json(error === null ? result.rows : 200);
          });
        } else {
          if (request.session.player_type === 'ADMINISTRATOR') {
            client.query('SELECT fixture_id, fixture_team_home, fixture_team_away, fixture_time FROM fixtures WHERE fixture_id=$1;', [request.params.id], function (error, result) {
              response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 404);
              response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
            });
          } else {
            response.status(401);
            response.json({});
          }
        }
      break;

      case 'POST':
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('INSERT INTO fixtures (fixture_team_home, fixture_team_away, fixture_time) VALUES ($1, $2, $3) RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time], function (error, result) {
            response.status(error === null ? 202 : 409);
            response.json(error === null ? result.rows[0] : {});
          });
        } else {
          response.status(401);
          response.json({});
        }
      break;

      case 'PUT':
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('UPDATE fixtures SET fixture_team_home=$1, fixture_team_away=$2, fixture_time=$3 WHERE fixture_id=$4 RETURNING fixture_id, fixture_team_home, fixture_team_away, fixture_time;', [request.body.fixture_team_home, request.body.fixture_team_away, request.body.fixture_time, request.params.id], function (error, result) {
            response.status(error === null ? (result.rowCount === 1 ? 200 : 404) : 400);
            response.json(error === null ? (result.rowCount === 1 ? result.rows[0] : {}) : {});
          });
        } else {
          response.status(401);
          response.json({});
        }
      break;

      case 'DELETE':
        if (request.session.player_type === 'ADMINISTRATOR') {
          client.query('DELETE FROM fixtures where fixture_id=$1', [request.params.id], function (error, result) {
            response.status(error === null ? 202 : 409);
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
