const express = require('express');
const router = express.Router();
const webapiController = require('../controllers/nhlWebAPIController');


/**
 * @swagger
 * /nhl-GPT/api/game-log/{playerId}/{seasonId}/{gameTypeId}:
 *   get:
 *     summary: Get game logs
 *     description: Retrieve game log data for a specific player, season, and game type.
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         type: string
 *         description: The ID of the player.
 *       - in: path
 *         name: seasonId
 *         required: true
 *         type: string
 *         description: The ID of the season.
 *       - in: path
 *         name: gameTypeId
 *         required: true
 *         type: string
 *         description: The ID of the game type. gameTypeId=2 is regular season, gameTypeId=3 is playoffs
 *       - in: query
 *         name: properties
 *         required: false
 *         type: string
 *         description: Comma-separated list of properties to include in the response. Returns all properties, if not used. Possible values are "gameId", "goals", "assists", "commonName", "opponentCommonName", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi".
 *       - in: query
 *         name: limit
 *         required: false
 *         type: integer
 *         description: Limit the number of game logs returned. Order of game logs is from most recent to least recent. Can be used with the "isAggregate" query parameter.
 *       - in: query
 *         name: isAggregate
 *         required: true
 *         type: boolean
 *         description: Summarizes values from many game logs into a gamelog. If true, this will aggregate game log values for the following properties "goals", "assists", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi". If false, the game logs will be returned without aggregation.
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/GameLog'
 *       500:
 *         description: Internal Server Error
 * definitions:
 *   GameLog:
 *     type: object
 *     properties:
 *       # Define the properties of a GameLog here
 */
router.get('/game-log/:playerId/:seasonId/:gameTypeId', webapiController.getGameLog);


module.exports = router;