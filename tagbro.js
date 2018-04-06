const Discord = require("discord.js");
const commands = require("./command-functions.js");
const utils = require("./utils.js");
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
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argsString = message.content.slice((prefix + command + " ").length);
    const regex = new RegExp("^" + prefix);

    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
        commands.giveServerCounts(message, command);
    }
    if (new RegExp(regex.source.concat("echo" + " .+")).test(message.content)) {
        commands.echo(message, command, argsString);
    }
});

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

function log(message) {
    console.log(message);
}

exports.log = log;
exports.servers = servers;
exports.serverAddresses = serverAddresses;
