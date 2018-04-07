const Discord = require("discord.js");

const commands = require("./command-functions.js");
const {log} = require("./utils.js");

const config = require("./config.json");
const prefix = config.prefix;

const bot = new Discord.Client({
    disableEveryone: true
});

bot.destroy();
bot.login(process.env.BOT_TOKEN);

bot.on("ready", function () {
    log("Bot connected.");
    bot.user.setActivity("out for you.", {type: "WATCHING"});


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
});