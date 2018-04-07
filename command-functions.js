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

exports.giveServerCounts = function(message) {
    let serverCounts = {};
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i];
        let address = constants.serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts.[server] = [data.players, data.games];
            if (count === constants.servers.length) {
                createServerCountsMessage(serverCounts);
            }
        }).catch(function (error) {
            log(error);
        });
    }
};

function createServerCountsMessage(serverCounts) {
    log(serverCounts);
}

/* string build
serverCounts = serverCounts.concat(
    utils.pad(" ".repeat(10), server + ":", false) +
    utils.pad("00", data.players, true) +
    " players and " +
    utils.pad("00", data.games, true) +
    " games.\n"
);
*/