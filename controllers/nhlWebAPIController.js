
exports.getGameLog = async (req, res) => {
    const { playerId, seasonId, gameTypeId } = req.params;
    const queryProperties = req.query?.properties?.split(',') ?? [];
    const queryLimit = req.query?.limit;
    let isAggregate = req.query?.isAggregate;
    if(isAggregate === undefined ){
        return res.status(400).json({error: 'isAggregate query parameter is required'});
    }else if(isAggregate !== 'true' && isAggregate !== 'false'){
        return res.status(400).json({error: 'isAggregate query parameter must be true or false'});
    }else{
        isAggregate = isAggregate === 'true';
    }

    
    const gameLogs = await gameLogRequest(playerId, seasonId, gameTypeId);
    if(gameLogs.error){
        return res.status(500).json(gameLogs);
    }

    // transform game log data using query properties
    const transformGameLogs = await transformGameLog(gameLogs, queryProperties, queryLimit, isAggregate);
    if(transformGameLogs.error){
        return res.status(500).json(transformGameLogs);
    }

    return res.status(200).json(transformGameLogs);
};

// helper functions

// fetch game log data from NHL API and remove unnecessary properties
async function gameLogRequest(playerId, seasonId, gameTypeId=2){
    const url = `https://api-web.nhle.com/v1/player/${playerId}/game-log/${seasonId}/${gameTypeId}`;
    const options = {
        method: 'GET'
    };
    try{
        const response = await fetch(url, options);
        // check status code
        if(response.status !== 200){
            throw new Error('Error: ' + response.status);
        }
        const data = await response.json();
        // remove playerStatsSeasons property and keep gameLog, gameTypeId, and seasonId
        const newData = {gameLog: data.gameLog, gameTypeId: data.gameTypeId, seasonId: data.seasonId};
        return newData;
    } catch (error) {
        console.log(error);
        return {error};
    }
}

async function transformGameLog(gameLogs, queryProperties, queryLimit, isAggregate){
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
    let properties = defaultProperties.concat(queryProperties);
    // add all properties if the properties param is not used
    if(queryProperties.length === 0){
        properties = defaultProperties.concat(allowedProperties);
    }
    
    const transformedGameLog = gameLogs.gameLog.map(game => {
        const transformedGame = {};
        properties.forEach(property => {
            transformedGame[property] = game[property];
        });
        return transformedGame;
    });

    // create a copy of gameLogs and update gameLog property
    const newGameLogs = { ...gameLogs, gameLog: transformedGameLog, gameCount: gameCount, isAggregate: false};
    // limit the number of game logs
    if(queryLimit){
        newGameLogs.gameLog = newGameLogs.gameLog.slice(0, queryLimit);
        newGameLogs.gameCount = parseInt(queryLimit);
    }

    // aggregate game logs
    if(isAggregate){
        const aggregateGameLogs = aggregateGameLog(newGameLogs);
        newGameLogs.gameLog = aggregateGameLogs;
        newGameLogs.isAggregate = true;
    }    
    return newGameLogs;
}

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