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

    // Set up server count message updating.
    let oltpGuild;
    let tagbroBotChannel;
    let serverCountsMessage;
    if (bot.guilds.has(constants.oltpDiscId)) {
        oltpGuild = bot.guilds.get(constants.oltpDiscId);
        if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
            tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
            tagbroBotChannel.fetchMessage(constants.serverCountsMessageId)
                .then(message => {
                    serverCountsMessage = message;
                    updateServerCountsMessage(serverCountsMessage);
                })
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
});

function updateServerCountsMessage(serverCountsMessage) {
    commands.getSortedServerCounts().then(response => {
        let newServerCountsMessage = "Server counts:\n\n";
        let sortedServerCounts = response;
        newServerCountsMessage = newServerCountsMessage.concat(
            "`" + commands.padServerStats(sortedServerCounts.slice(0, 1)) + "` " +
            constants.serverAddresses[sortedServerCounts[0][0]] + "\n\n*Other servers:*\n"
        );
        for (let i = 0; i < sortedServerCounts.slice(1).length; i++) {
            newServerCountsMessage = newServerCountsMessage.concat(
                "`" + commands.padServerStats(sortedServerCounts.slice(i, i + 1)) + "` " +
                constants.serverAddresses[sortedServerCounts[0][0]] + "\n"
            );
        }
        newServerCountsMessage = newServerCountsMessage.concat("\n**updated every 2 minutes**");
        log(newServerCountsMessage);
    }).catch(console.error);
}