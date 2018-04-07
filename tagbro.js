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

    // Find tagbro-bot channel in OLTP discord.
    log("Guild IDs: " + bot.guilds.keyArray() + ". Looking for: " + constants.oltpDiscId + ".");
    if (bot.guilds.has(constants.oltpDiscId)) {
        log("found oltp discord");
        let oltpGuild = bot.guilds.get(constants.oltpDiscId);
        if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
            log("found tagbro-bot channel");
            let tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId);
            tagbroBotChannel.fetchMessages({ limit: 25 })
                .then(messages => {
                    log("found " + messages.size + " messages. bot.user.id = " + bot.user.id);
                    for (let i = 0; i < messages.entries().length; i++) {
                        log("bing");
                        let messageId = messages.entries.get(i)[0];
                        let message = messages.entries.get(i)[1];
                        log("got a message from id: " + message.author.id);
                        if (message.author.id === bot.user.id) {
                            log(message.content);
                            log(message.id);
                        }
                    }
                })
                .catch(console.error);
        }
    }

});

bot.on("message", message => {
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argsString = message.content.slice((prefix + command + " ").length);
    const regex = new RegExp("^" + prefix);
    log("Responding to " + prefix + command + ".");

    if (message.content === prefix + "server count" || message.content === prefix + "sc" ) {
        commands.giveServerCounts(message, command);
    }
    if (new RegExp(regex.source.concat("echo" + " .+")).test(message.content)) {
        commands.echo(message, command, argsString);
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