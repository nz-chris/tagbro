/**
 * Low level server count functionality.
 */

const axios = require("axios");

const utils = require("../utils.js");
const {log, err} = require("../utils.js");
const constants = require("../constants.js");

const config = require("../../config.json");
const prefix = config.prefix;

module.exports = {
    getSortedServerStatsMessage: async function () {
        let sortedServerStatsMessage = "";
        let sortedServerStats = await getSortedServerStats();
        let largestPlayerCountDigits = getLargestPlayerCount(sortedServerStats).toString().length;
        let largestGameCountDigits = getLargestGameCount(sortedServerStats).toString().length;
        for (let i = 0; i < sortedServerStats.length; i++) {
            sortedServerStatsMessage = sortedServerStatsMessage.concat(
                "`" + padServerStats(sortedServerStats[i], largestPlayerCountDigits, largestGameCountDigits) +
                "` <" + constants.serverAddresses[sortedServerStats[i][0]] + ">"
            );
            if (i !== sortedServerStats.length - 1) {
                sortedServerStatsMessage = sortedServerStatsMessage.concat("\n");
            }
        }
        return sortedServerStatsMessage;
    },

    setUpIntervalUpdates: function (bot) {
        let oltpGuild;
        let tagbroBotChannel;
        let existingServerStatsMessage;
        if (bot.guilds.has(constants.oltpDiscId)) {
            oltpGuild = bot.guilds.get(constants.oltpDiscId);
            if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
                tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
                tagbroBotChannel.fetchMessage(constants.serverStatsMessageId)
                    .then(message => {
                        existingServerStatsMessage = message;
                        updateServerStatsMessage(existingServerStatsMessage);
                    })
                    .catch(err);
            }
        }
        let minutes = 2, the_interval = minutes * 60 * 1000;
        setInterval(function () {
            if (existingServerStatsMessage !== undefined) {
                updateServerStatsMessage(existingServerStatsMessage);
            }
        }, the_interval);
    }
};

async function getSortedServerStats() {
    let serverStats = {};
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let address = constants.serverAddresses[server];
        let response;
        try {
            response = await axios.get(address + "stats");
            let data = response.data;
            serverStats[server] = [data.players, data.games];
        } catch (error) {
            err("Failed axios get.");
        }
    }
    return sortServerStats(serverStats);
}

function updateServerStatsMessage(existingServerStatsMessage) {
    log("Updating server counts message.");
    module.exports.getSortedServerStatsMessage().then(response => {
        let sortedServerStatsMessage = response;
        let diamSplitIndex = sortedServerStatsMessage.indexOf(">\n") + ">\n".length;
        let newServerStatsMessage = "Server counts:\n\n";
        newServerStatsMessage = newServerStatsMessage.concat(sortedServerStatsMessage.slice(0, diamSplitIndex));
        newServerStatsMessage = newServerStatsMessage.concat("\n*Other servers:*\n");
        newServerStatsMessage = newServerStatsMessage.concat(sortedServerStatsMessage.slice(diamSplitIndex));
        newServerStatsMessage = newServerStatsMessage.concat(
            "\n*updated every 2 minutes. use `" + prefix + "sc` to manually check.*"
        );
        existingServerStatsMessage.edit(newServerStatsMessage);
    }).catch(err);
}

function sortServerStats(serverStats) {
    let sortedServerStats = [];
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let serverData = serverStats[server];
        sortedServerStats.push([server, serverData[0], serverData[1]]);
    }
    return sortedServerStats;
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