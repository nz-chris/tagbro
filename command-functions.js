const axios = require("axios");

const constants = require("./constants.js");
const utils = require("./utils.js");
const {log} = require("./utils.js");

const config = require("./config.json");
const prefix = config.prefix;

exports.echo = function(message, argsString) {
    if (message.author.tag === "Zagd#6682") {
        message.delete().catch(O_o=>{});
        message.channel.send(argsString);
    }
};

exports.giveServerCounts = async function(message) {
    let sortedServerCounts = await getSortedServerCounts();
    let serverCountsMessage = getServerCountsMessage(sortedServerCounts);
    message.channel.send(serverCountsMessage);
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
        } catch (err) {
            log(err)
        }
    }
    return sortServerCounts(serverCounts);
}
exports.getSortedServerCounts = getSortedServerCounts;

function getServerCountsMessage(sortedServerCounts) {
    let serverCountsMessage = "";
    let largestServerStat = getLargestServerStat(sortedServerCounts);
    for (let i = 0; i < sortedServerCounts.length; i++) {
        serverCountsMessage = serverCountsMessage.concat(
            "`" + padServerStats(sortedServerCounts[i], largestServerStat) + "` <" +
            constants.serverAddresses[sortedServerCounts[i][0]] + ">\n"
        );
    }
    return serverCountsMessage;
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

function getLargestServerStat(serverStats) {
    let maxSoFar = -1;
    for (let i = 0; i < serverStats.length; i++) {
        let serverStat = serverStats[i];
        for (let j = 0; j < serverStat.length; j++) {
            maxSoFar = Math.max(maxSoFar, serverStat[1], serverStat[2]);
        }
    }
    return maxSoFar;
}
exports.getLargestServerStat = getLargestServerStat;

function padServerStats(serverStats, numberPadSize) {
    let server = serverStats[0];
    let serverPlayers = serverStats[1];
    let serverGames = serverStats[2];
    return utils.pad(" ".repeat(10), server + ":", false) +
        utils.pad(" ".repeat(numberPadSize), serverPlayers, true) + " players and " +
        utils.pad(" ".repeat(numberPadSize), serverGames, true) + " games";
}
exports.padServerStats = padServerStats;