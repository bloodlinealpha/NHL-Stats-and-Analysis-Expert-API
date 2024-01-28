const fetch = require('node-fetch');

// GET /nhl-GPT/api/game-log route to retrieve game log data for a specific player, season, and game type.
// Overrides the existing NHL Web API game log data to remove unnecessary properties and add additional properties.
exports.getGameLog = async (req, res) => {
    const playerId = req.query?.playerId;
    const seasonId = req.query?.seasonId;
    const gameTypeId  = req.query?.gameTypeId;
    const queryProperties = req.query?.properties?.split(',') ?? [];
    const queryLimit = req.query?.limit;
    
    let isAggregate = req.query?.isAggregate;
    let isAscending = req.query?.isAscending;
    

    // check required query parameters
    if(!playerId || !seasonId || !gameTypeId || !isAggregate || !isAscending ){
        return res.status(400).json({error: 'playerId, seasonId, gameTypeId, isAggregate, and isAscending query parameters are required'});
    }
    
    if(isAggregate !== 'true' && isAggregate !== 'false'){
        return res.status(400).json({error: 'isAggregate query parameter must be true or false'});
    }else{
        isAggregate = isAggregate === 'true';
    }

    if(isAscending !== 'true' && isAscending !== 'false'){
        return res.status(400).json({error: 'isAscending query parameter must be true or false'});
    }else{
        isAscending = isAscending === 'true';
    }

    // request game log data from NHL Web API
    const gameLogs = await gameLogRequest(playerId, seasonId, gameTypeId);
    if(gameLogs.error){
        console.log(gameLogs.error);
        return res.status(500).json(gameLogs);
    }

    // transform game log data using query properties
    const transformGameLogs = await transformGameLog(gameLogs, queryProperties, queryLimit, isAggregate, isAscending);
    if(transformGameLogs.error){
        return res.status(500).json(transformGameLogs);
    }

    return res.status(200).json(transformGameLogs);
};

// helper functions

/**
 * Fetches the game log data for a specific player, season, and game type from the NHL Web API. Removes unnecessary properties from request.
 *
 * @param {number} playerId - The ID of the player.
 * @param {number} seasonId - The ID of the season.
 * @param {number} [gameTypeId=2] - The ID of the game type. Defaults to 2.
 * @returns {Promise<Object>} A promise that resolves to an object containing the game log, game type ID, and season ID. If an error occurs, it resolves to an object with an error message.
 * @throws {Error} If the HTTP status code of the response is not 200.
 */
async function gameLogRequest(playerId, seasonId, gameTypeId=2){
    const url = `https://api-web.nhle.com/v1/player/${playerId}/game-log/${seasonId}/${gameTypeId}`;
    const options = {
        method: 'GET'
    };
    try{
        const response = await fetch(url, options);
        // check status code
        if(response.status !== 200){
            console.error(response.status);
            console.error(response.statusText);
            throw new Error('Error: ' + response.status);
        }
        const data = await response.json();
        // remove playerStatsSeasons property and keep gameLog, gameTypeId, and seasonId
        const newData = {gameLog: data.gameLog, gameTypeId: data.gameTypeId, seasonId: data.seasonId};
        return newData;
    } catch (error) {
        console.error(error);
        return {error: "Error: Could not fetch game log data from server"};
    }
}

/**
 * Transforms the game log based on the provided query properties, limit, and aggregation flag.
 *
 * @param {Object[]} gameLogs - The game logs to be transformed.
 * @param {string[]} queryProperties - The properties to be included in the transformed game logs.
 * @param {number} queryLimit - The maximum number of game logs to be returned.
 * @param {boolean} isAggregate - A flag indicating whether the game logs should be aggregated into a single log.
 * @param {boolean} isAscending - A flag indicating whether the game logs should be returned in ascending order.
 * @returns {Object} The transformed game logs. If invalid properties are provided, an error object is returned.
 * @throws {Error} If the queryProperties include properties not allowed.
 */
async function transformGameLog(gameLogs, queryProperties, queryLimit, isAggregate, isAscending){
    // get the number of games
    let gameCount = gameLogs?.gameLog?.length;
    // these are properties that are always returned
    const defaultProperties = ["teamAbbrev", "homeRoadFlag", "gameDate", "opponentAbbrev"];
    // these are properties that can be queried
    const allowedProperties = ["gameId", "goals", "assists", "commonName", "opponentCommonName", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi"];
    
    // check if query properties are allowed
    const invalidProperties = queryProperties.filter(property => !allowedProperties.includes(property));
    if(invalidProperties.length > 0){
        return {error: `Invalid properties: ${invalidProperties}`};
    }

    // combine default properties and query properties
    let propertiesToInclude = defaultProperties.concat(queryProperties);
    // add all properties if the properties param is not used
    if(queryProperties.length === 0){
        propertiesToInclude = defaultProperties.concat(allowedProperties);
    }
    
    // re-map game log data to only include the properties specified
    const transformedGameLog = gameLogs.gameLog.map(game => {
        const transformedGame = {};
        propertiesToInclude.forEach(property => {
            transformedGame[property] = game[property];
        });
        return transformedGame;
    });

    // create a copy of gameLogs and update gameLog property
    const newGameLogs = { ...gameLogs, gameLog: transformedGameLog, gameCount: gameCount, isAggregate: false, isAscending: isAscending};

    // reverse the order of the game logs if necessary
    if(isAscending){// needs to be performer before queryLimit
        // update the order to oldest-newest
        newGameLogs.gameLog = newGameLogs.gameLog.reverse();
    }

    // limit the number of game logs
    if(queryLimit){
        newGameLogs.gameLog = newGameLogs.gameLog.slice(0, queryLimit);
        newGameLogs.gameCount = parseInt(queryLimit);
    }

    // combine game logs if necessary
    if(isAggregate){
        const aggregateGameLogs = aggregateGameLog(newGameLogs);
        newGameLogs.gameLog = aggregateGameLogs;
        newGameLogs.isAggregate = true;
    }

    return newGameLogs;
}


/**
 * Aggregates the game logs into a single game log.
 * 
 * @param {Object} gameLogs - The game logs to be aggregated.
 * @returns {Object} The aggregated game logs.
 * @throws {Error} If the game logs are not valid.
 * @throws {Error} If the game logs cannot be aggregated.
*/
function aggregateGameLog(gameLogs){
    const aggregateProperties = ["goals", "assists", "points", "plusMinus", "powerPlayGoals", "powerPlayPoints", "gameWinningGoals", "otGoals", "shots", "shifts", "shorthandedGoals", "shorthandedPoints", "pim", "toi"];
    const gameLogProperties = Object.keys(gameLogs.gameLog[0]);
    const aggregateGameLogs = gameLogs.gameLog.reduce((acc, game) => {
        aggregateProperties.forEach(property => {
            if(gameLogProperties.includes(property)){
                // add property to accumulator if it doesn't exist
                if(!acc[property]){
                    acc[property] = 0;
                }

                // time on ice is in 'minutes:seconds' format, so convert to seconds
                if(property === 'toi'){                   
                    const timeParts = game[property].split(':');
                    const gameSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
                    acc[property] += gameSeconds;
                } else { // add property to accumulator
                    acc[property] += game[property];
                }
            }
        });
        return acc;
    }, {});

    // Convert 'toi' back to 'minutes:seconds' format
    if(aggregateGameLogs.toi){
        const minutes = Math.floor(aggregateGameLogs.toi / 60);
        const seconds = aggregateGameLogs.toi % 60;
        aggregateGameLogs.toi = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    return aggregateGameLogs;
}



// sample game log data
// {
//     "gameId": 2023020749,
//     "teamAbbrev": "BOS",
//     "homeRoadFlag": "R",
//     "gameDate": "2024-01-25",
//     "goals": 1,
//     "assists": 1,
//     "commonName": {
//         "default": "Bruins"
//     },
//     "opponentCommonName": {
//         "default": "Senators",
//         "fr": "Sénateurs"
//     },
//     "points": 2,
//     "plusMinus": 1,
//     "powerPlayGoals": 1,
//     "powerPlayPoints": 1,
//     "gameWinningGoals": 0,
//     "otGoals": 0,
//     "shots": 2,
//     "shifts": 25,
//     "shorthandedGoals": 0,
//     "shorthandedPoints": 0,
//     "pim": 4,
//     "opponentAbbrev": "OTT",
//     "toi": "17:50"
// }