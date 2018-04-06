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
    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
    giveServerCounts(message);
}
});

const servers = {
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
    let count = 0;
    for (let server in servers) {
        if (servers.hasOwnProperty(server)) {
            axios.get("http://tagpro-" + server + ".koalabeast.com/stats").then(function (response) {
                count += 1;
                let data = response.data;
                serverCounts = serverCounts.concat(
                    pad(" ".repeat(10), server + ":", false) +
                    pad("00", data.players, true) +
                    " players and " +
                    pad("00", data.games, true) +
                    " games.\n"
                );
                if (count >= Object.keys(servers).length) {
                    message.channel.send("```" + serverCounts + "```");
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
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