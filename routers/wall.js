module.exports = function (dependency) {
  var pgClient = dependency.pgClient,
      sockets = dependency.sockets;

  return function (request, response, next) {
    switch(request.method) {
      /**
       *
       * 200 --- accepted
       * 400 --- bad request
       */
      case 'GET':
        pgClient.query('SELECT wall_id, wall_player, wall_message, wall_timestamp FROM wall;', [], function (error, result) {
          response.status(error === null ? 200 : 400);
          response.json(error === null ? result.rows : []);
        });
      break;

      default:
        response.status(405);
        response.json({});
      break;
    }
  };
};
