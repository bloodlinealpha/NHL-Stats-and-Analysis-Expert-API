const express = require('express');
const router = express.Router();
const webapiController = require('../controllers/nhlWebAPIController');


/**
 * @swagger
 * /nhl-GPT/api/game-log/{playerId}/{seasonId}/{gameTypeId}:
 *   get:
 *     summary: Get game logs
 *     operationId: NHL_Player_game_logs
 *     description: Retrieve game log data for a specific player, season, and game type.
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         description: The ID of the player.
 *         schema:
 *          type: string
 *       - in: path
 *         name: seasonId
 *         required: true
 *         description: The ID of the season.
 *         schema:
 *          type: string
 *          default: 20232024
 *       - in: path
 *         name: gameTypeId
 *         required: true
 *         description: The ID of the game type. gameTypeId=2 is regular season, gameTypeId=3 is playoffs
 *         schema:
 *          type: string
 *          default: 2
 *       - in: query
 *         name: properties
 *         required: false
 *         description: Comma-separated list of properties to include in the response. Returns all properties, if not used. Possible values are "gameId", "goals", "assists", "commonName", "opponentCommonName", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi".
 *         schema:
 *          type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Limit the number of game logs returned. Order of game logs is from most recent to least recent. Can be used with the "isAggregate" query parameter.
 *         schema:
 *          type: integer
 *          default: 82
 *       - in: query
 *         name: isAggregate
 *         required: true
 *         description: Summarizes values from many game logs into a gamelog. If true, this will aggregate game log values for the following properties "goals", "assists", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi". If false, the game logs will be returned without aggregation.
 *         schema:
 *          type: boolean
 *          default: true
 */
router.get('/game-log/:playerId/:seasonId/:gameTypeId', webapiController.getGameLog);


module.exports = router;