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
    let serverCounts = await getServerCounts();
    let serverCountsMessage = getServerCountsMessage(serverCounts);
    message.channel.send("```" + serverCountsMessage + "```");
};

exports.getSortedServerCounts = async function() {
    return getSortedServerCounts(await getServerCounts());
};

async function getServerCounts() {
    let serverCounts = {};
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let address = constants.serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts[server] = [data.players, data.games];
            if (count === constants.servers.length) {
                return serverCounts;
            }
        }).catch(function (error) {
            log(error);
        });
    }
}

function getServerCountsMessage(serverCounts) {
    let serverCountsMessage = "";
    let sortedServerCounts = getSortedServerCounts(serverCounts);
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

function getSortedServerCounts(serverCounts) {
    let sortedServerCounts = [];
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let serverData = serverCounts[server];
        sortedServerCounts.push([server, serverData[0], serverData[1]]);
    }
    return sortedServerCounts;
}