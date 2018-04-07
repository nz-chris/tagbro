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
    message.channel.send("```" + serverCountsMessage + "```");
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
    for (let i = 0; i < sortedServerCounts.length; i++) {
        let server = sortedServerCounts[i][0];
        let serverPlayers = sortedServerCounts[i][1];
        let serverGames = sortedServerCounts[i][2];
        serverCountsMessage = serverCountsMessage.concat(
            utils.pad(" ".repeat(10), server + ":", false) +
            utils.pad("00", serverPlayers, true) +
            " players and " +
            utils.pad("00", serverGames, true) +
            " games.\n"
        );
    }
    return serverCountsMessage;
}
exports.getServerCountsMessage = getServerCountsMessage;

function sortServerCounts(serverCounts) {
    let sortedServerCounts = [];
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let serverData = serverCounts[server];
        sortedServerCounts.push([server, serverData[0], serverData[1]]);
    }
    return sortedServerCounts;
}