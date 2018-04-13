if (process.env.NODE_ENV !== "production") {
    require("dotenv").load();
}

const Discord = require("discord.js");

const commands = require("./commands.js");
const serverCounts = require("./depths/server-stats.js");
const {log, err} = require("./utils.js");
const commandsInfo = require("./commands-info.js");

const config = require("../config.json");

const bot = new Discord.Client({
    disableEveryone: true
});

bot.destroy().catch(err);
bot.login(process.env.BOT_TOKEN).catch(err);

bot.on("ready", function () {
    log("Bot connected.");
    log("Connected to Guilds: " + bot.guilds.array());
    bot.user.setActivity("out for you | '" + config.prefix + commandsInfo.names.help + "'", {type: "WATCHING"}).catch(err);

    serverCounts.setUpIntervalUpdates(bot);
});

bot.on("message", message => {
    if (message.content.indexOf(config.prefix) !== 0) return;
    commands.delegateCommandMessage(message).catch(err);
    /*
    //TODO: abstractify below to handle any userscript name of mine. also put install links in constants.js
    // map userscript nicknames to full names. e.g superextend: Lej's Ranked PUGs Super Extend
    if (message.content === config.prefix + "install-link superextend" || message.content === config.prefix + "il superextend" ) {
        message.channel.startTyping();
        message.channel.send("*Lej's Ranked PUGs Super Extend, two click install link:* <https://github.com/zagd/tagpro-scripts/raw/master/lej-rpugs-super-extend.user.js>");
        message.channel.stopTyping(true);
    }
    */
});

//TODO: misuse of command response. "Usage: .."