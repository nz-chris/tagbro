const Discord = require("discord.js");

const commands = require("./command-functions.js");
const {log} = require("./utils.js");
const constants = require("./constants.js");

const config = require("./config.json");
const prefix = config.prefix;

const bot = new Discord.Client({
    disableEveryone: true
});

bot.destroy();
bot.login(process.env.BOT_TOKEN);

bot.on("ready", function () {
    log("Bot connected.");
    log("Connected to Guilds: " + bot.guilds.array());
    bot.user.setActivity("out for you.", {type: "WATCHING"});

    let oltpGuild;
    let tagbroBotChannel;
    let serverCountsMessage;
    // Fetch the server counts message in OLTP #tagbro-bot.
    if (bot.guilds.has(constants.oltpDiscId)) {
        oltpGuild = bot.guilds.get(constants.oltpDiscId);
        if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
            tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
            tagbroBotChannel.fetchMessage(constants.serverCountsMessageId)
                .then(message => serverCountsMessage = message)
                .catch(console.error);
        }
    }
    let minutes = 2, the_interval = minutes * 60 * 1000;
    setInterval(function() {
        if (serverCountsMessage !== undefined) {
            log("Updating server counts message.");
            updateServerCountsMessage(serverCountsMessage);
        }
    }, the_interval);

});

bot.on("message", message => {
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argsString = message.content.slice((prefix + command + " ").length);
    const regex = new RegExp("^" + prefix);
    log("Responding to " + prefix + command + ".");

    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
        commands.giveServerCounts(message);
    }
    if (new RegExp(regex.source.concat("echo" + " .+")).test(message.content)) {
        commands.echo(message, argsString);
    }
    if (message.content === prefix + "sinfo") {  // Temp.
        let guild = message.channel.guild;
        message.channel.send("Guild: " + guild + ". ID: " + guild.id + ".\n" +
            "Channels: " + guild.channels + ".");
    }
    if (message.content === prefix + "cinfo") {  // Temp.
        let channel = message.channel;
        message.channel.send("Name: " + channel.name + ". ID: " + channel.id + ".");
    }
});

function updateServerCountsMessage(serverCountsMessage) {
    log(commands.getSortedServerCounts());
}