/**
 * Low level server count functionality.
 */

const axios = require("axios");

const constants = require("../constants.js");
const utils = require("../utils.js");
const {log, err} = require("../utils.js");

exports = {
    getSortedServerCountsMessage: async function () {
        let sortedServerCountsMessage = "";
        let sortedServerCounts = await getSortedServerCounts();
        let largestPlayerCountDigits = getLargestPlayerCount(sortedServerCounts).toString().length;
        let largestGameCountDigits = getLargestGameCount(sortedServerCounts).toString().length;
        for (let i = 0; i < sortedServerCounts.length; i++) {
            sortedServerCountsMessage = sortedServerCountsMessage.concat(
                "`" + padServerStats(sortedServerCounts[i], largestPlayerCountDigits, largestGameCountDigits) +
                "` <" + constants.serverAddresses[sortedServerCounts[i][0]] + ">"
            );
            if (i !== sortedServerCounts.length - 1) {
                sortedServerCountsMessage = sortedServerCountsMessage.concat("\n");
            }
        }
        return sortedServerCountsMessage;
    },

    setUpIntervalUpdates: function (bot) {
        let oltpGuild;
        let tagbroBotChannel;
        let existingServerCountsMessage;
        if (bot.guilds.has(constants.oltpDiscId)) {
            oltpGuild = bot.guilds.get(constants.oltpDiscId);
            if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
                tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
                tagbroBotChannel.fetchMessage(constants.serverCountsMessageId)
                    .then(message => {
                        existingServerCountsMessage = message;
                        updateServerCountsMessage(existingServerCountsMessage);
                    })
                    .catch(err);
            }
        }
        let minutes = 2, the_interval = minutes * 60 * 1000;
        setInterval(function () {
            if (existingServerCountsMessage !== undefined) {
                updateServerCountsMessage(existingServerCountsMessage);
            }
        }, the_interval);
    }
};

async function getSortedServerCounts() {
    let serverCounts = {};
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let address = constants.serverAddresses[server];
        let response;
        try {
            response = await axios.get(address + "stats");
            let data = response.data;
            serverCounts[server] = [data.players, data.games];
        } catch (error) {
            err(error);
        }
    }
    return sortServerCounts(serverCounts);
}

function updateServerCountsMessage(existingServerCountsMessage) {
    log("Updating server counts message.");
    module.exports.getSortedServerCountsMessage().then(response => {
        let sortedServerCountsMessage = response;
        let diamSplitIndex = sortedServerCountsMessage.indexOf("games`") + "games`".length;
        let newServerCountsMessage = "Server counts:\n\n";
        newServerCountsMessage = newServerCountsMessage.concat(sortedServerCountsMessage.slice(0, diamSplitIndex));
        newServerCountsMessage = newServerCountsMessage.concat("\n\n*Other servers:*\\n");
        newServerCountsMessage = newServerCountsMessage.concat(sortedServerCountsMessage.slice(diamSplitIndex));
        newServerCountsMessage = newServerCountsMessage.concat("\n*updated every 2 minutes. use `..sc` to manually check.*");
        existingServerCountsMessage.edit(newServerCountsMessage);
    }).catch(err);
}

function sortServerCounts(serverCounts) {
    let sortedServerCounts = [];
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let serverData = serverCounts[server];
        sortedServerCounts.push([server, serverData[0], serverData[1]]);
    }
    return sortedServerCounts;
}

function padServerStats(serverStats, playerCountPadSize, gameCountPadSize) {
    let server = serverStats[0];
    let serverPlayers = serverStats[1];
    let serverGames = serverStats[2];
    return utils.pad(" ".repeat(10), server + ":", false) +
        utils.pad(" ".repeat(playerCountPadSize), serverPlayers, true) + " players and " +
        utils.pad(" ".repeat(gameCountPadSize), serverGames, true) + " games";
}

function getLargestPlayerCount(serverStats) {
    return getLargestServerStat(serverStats, 1)
}
function getLargestGameCount(serverStats) {
    return getLargestServerStat(serverStats, 2)
}
function getLargestServerStat(serverStats, index) {
    let maxSoFar = -1;
    for (let i = 0; i < serverStats.length; i++) {
        let serverStat = serverStats[i];
        for (let j = 0; j < serverStat.length; j++) {
            maxSoFar = Math.max(maxSoFar, serverStat[index]);
        }
    }
    return maxSoFar;
}