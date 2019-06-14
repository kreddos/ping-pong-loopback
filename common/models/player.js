const createError = require('http-errors');

module.exports = function (Player) {
  Player.getPlayerByToken = async (req) => {
    const token = req.headers.authorization || req.query.access_token;

    if (!token) {
      throw createError(400, 'token is required');
    }

    const tokenData = await Player.app.models.AccessToken.findById(token);
    if (!tokenData) {
      throw createError(400, 'token is not valid');
    }

    const player = await Player.findById(tokenData.userId);
    if (!player) {
      throw createError(400, 'player not found');
    }
    return player;
  };

  Player.remoteMethod('getPlayerByToken', {
    accepts: [
      { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'res', type: 'object', http: { source: 'res' } },
    ],
    returns: { arg: 'game', type: 'object', root: true },
    http: { path: '/get-player', verb: 'get' },
  });
};
