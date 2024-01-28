const express = require('express');
const router = express.Router();
const webapiController = require('../controllers/nhlWebAPIController');


/**
 * @swagger
 * /nhl-GPT/api/game-log:
 *   get:
 *     operationId: get_NHL_Player_game_logs
 *     summary: Get game logs
 *     description: Retrieve game log data for a specific player, season, and game type.
 *     parameters:
 *       - name: playerId
 *         in: query
 *         required: true
 *         description: The ID of the player.
 *         schema:
 *          type: string
 *       - name: seasonId
 *         in: query
 *         required: true
 *         description: The ID of the season.
 *         schema:
 *          type: string
 *          default: 20232024
 *       - name: gameTypeId
 *         in: query
 *         required: true
 *         description: The ID of the game type. gameTypeId=2 is regular season, gameTypeId=3 is playoffs
 *         schema:
 *          type: string
 *          default: 2
 *       - name: properties
 *         in: query
 *         required: false
 *         description: Comma-separated list of properties to include in the response. Returns all properties, if not used. Possible values are gameId, goal, assists, commonName, opponentCommonName, points, plusMinus, powerPlayGoals, powerPlayPoints, gameWinningGoals, otGoals, shots, shifts, shorthandedGoals, shorthandedPoints, pim, toi.
 *         schema:
 *          type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Limit the number of game logs returned. Order of game logs is from most recent to least recent. Can be used with the isAggregate query parameter.
 *         schema:
 *          type: integer
 *          default: 82
 *       - name: isAggregate
 *         in: query
 *         required: true
 *         description: Summarizes values from many game logs into a gamelog. If true, this will aggregate game log values for the following properties goals, assists, points, plusMinus, powerPlayGoals, powerPlayPoints, gameWinningGoals, otGoals, shots, shifts, shorthandedGoals, shorthandedPoints, pim, toi. If false, the game logs will be returned without aggregation.
 *         schema:
 *          type: boolean
 *          default: true
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
 *          type: boolean
 *          default: true
 */
router.get('/game-log', webapiController.getGameLog);


module.exports = router;