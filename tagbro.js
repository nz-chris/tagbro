const Discord = require("discord.js");
const axios = require("axios");
const config = require("./config.json");
const prefix = config.prefix;

const bot = new Discord.Client({
    disableEveryone: true
});

bot.destroy();
bot.login(process.env.BOT_TOKEN);

bot.on("ready", function () {
    log("Bot connected.");
});

bot.on("message", message => {
    let regex = new RegExp("^" + prefix);
    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
        giveServerCounts(message);
    }
    let commandWithArgs = "echo";
    if (new RegExp(regex.source.concat(commandWithArgs + " .+")).test(message.content)) {
        let commandStart = prefix + commandWithArgs + " ";
        let argsString = message.content.slice(message.content.indexOf(commandStart) + commandStart.length);
        echo(message, argsString);
    }
});

function echo(message) {
    if (message.author.tag === "Zagd#6682") {
        message.channel.send("Author: " + message.author + "\nID: " + message.author.id + "\nUsername: " + message.author.username + "\nTag: " + message.author.tag);
    }
}

const servers = [
    "Diameter",
    "Centra",
    "Sphere",
    "Origin",
    "Radius",
    "Pi",
    "Orbit",
    "Chord",
];

const serverAddresses = {
    "Diameter": "http://tagpro-diameter.koalabeast.com/",
    "Centra": "http://tagpro-centra.koalabeast.com/",
    "Sphere": "http://tagpro-sphere.koalabeast.com/",
    "Origin": "http://tagpro-origin.koalabeast.com/",
    "Radius": "http://tagpro-radius.koalabeast.com/",
    "Pi": "http://tagpro-pi.koalabeast.com/",
    "Orbit": "http://tagpro-orbit.koalabeast.com/",
    "Chord": "http://tagpro-chord.koalabeast.com/"
};

function giveServerCounts(message) {
    log("Responding to " + prefix + "server count.");
    let serverCounts = "";
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < servers.length; i++) {
        let server = servers[i];
        let address = serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts = serverCounts.concat(
                pad(" ".repeat(10), server + ":", false) +
                pad("00", data.players, true) +
                " players and " +
                pad("00", data.games, true) +
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

function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

function log(message) {
    console.log(message);
}