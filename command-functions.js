const tagbro = require("./tagbro.js");
const log = tagbro.log;
const utils = require("./utils.js");
const config = require("./config.json");
const prefix = config.prefix;

const axios = require("axios");

exports.echo = function(message, command, argsString) {
    log("Responding to " + prefix + command + ".");
    if (message.author.tag === "Zagd#6682") {
        message.delete().catch(O_o=>{});
        message.channel.send(argsString);
    }
}

exports.giveServerCounts = function(message, command) {
    log("Responding to " + prefix + command + ".");
    let serverCounts = "";
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < servers.length; i++) {
        let server = tagbro.servers[i];
        let address = tagbro.serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts = serverCounts.concat(
                utils.pad(" ".repeat(10), server + ":", false) +
                utils.pad("00", data.players, true) +
                " players and " +
                utils.pad("00", data.games, true) +
                " games.\n"
            );
            if (count === servers.length) {
                message.channel.send("```" + serverCounts + "```");
            }
        }).catch(function (error) {
            log(error);
        });
    }
}