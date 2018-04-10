const Discord = require("discord.js");

const commands = require("./commands.js");
const privateCommands = require("./private-commands.js");
const serverCounts = require("./depths/server-stats.js");
const {log, err} = require("./utils.js");

const config = require("../config.json");
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

    serverCounts.setUpIntervalUpdates(bot);
});

bot.on("message", message => {
    if (message.content.indexOf(config.prefix) !== 0) return;
    if (!commands.delegateCommandMessage(message));
    return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const argsString = message.content.slice((prefix + command + " ").length);
    const regex = new RegExp("^" + prefix);
    log("Responding to " + prefix + command + ".");

    if (message.content === prefix + "server-count" || message.content === prefix + "sc" ) {
        commands.giveSortedServerStats(message).catch(err);
    }
    if (new RegExp(regex.source.concat("echo" + " .+")).test(message.content)) {
        privateCommands.echo(message, argsString);
    }
    if (message.content === prefix + "rpugs-matchmaking" || message.content === prefix + "rpm" ) {
        commands.giveRankedPugsMatchmakingLink(message);
    }
    //TODO: abstractify below to handle any userscript name of mine. also put install links in constants.js
    // map userscript nicknames to full names. e.g superextend: Lej's Ranked PUGs Super Extend
    if (message.content === prefix + "install-link superextend" || message.content === prefix + "il superextend" ) {
        message.channel.startTyping();
        message.channel.send("*Lej's Ranked PUGs Super Extend, two click install link:* <https://github.com/zagd/tagpro-scripts/raw/master/lej-rpugs-super-extend.user.js>");
        message.channel.stopTyping(true);
    }
});

//TODO: misuse of command response. "Usage: .."
//TODO: