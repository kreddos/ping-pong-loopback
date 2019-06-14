const createError = require('http-errors');

module.exports = function (Game) {
  Game.newGame = async (data) => {
    const { firstPlayerId, secondPlayerId } = data.players;

    if (!firstPlayerId || !secondPlayerId) {
      throw createError(400, 'fields "firstPlayerId" and "secondPlayerId" are required');
    }

    const newGame = await Game.create(data.game);
    await newGame.players.add(firstPlayerId);
    await newGame.players.add(secondPlayerId);
    await newGame.save();

    return newGame;
  };
  Game.remoteMethod('newGame', {
    accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
    returns: { arg: 'game', type: 'object', root: true },
    http: { path: '/new-game', verb: 'post' },
  });

  Game.prototype.addSet = async function addSet(set) {
    const setsCount = await this.gameSets.count();
    if (this.maxSets <= setsCount) {
      throw createError(400, 'you can\'t create set. The game have all sets');
    }

    if (this.status === 'end') {
      throw createError(400, 'you can\'t create set. The game is end');
    }


    this.gameSets.create(set);
    const gameSets = await this.gameSets.find();
    if (this.maxSets === gameSets.length) {
      this.status = 'end';
      await this.save();
    }

    const game = this.toJSON();
    return { ...game, gameSets };
  };

  Game.remoteMethod('prototype.addSet', {
    accepts: { arg: 'data', type: 'GameSet', http: { source: 'body' } },
    returns: { arg: 'game', type: 'object', root: true },
    http: { path: '/add-set', verb: 'post' },
  });
};
