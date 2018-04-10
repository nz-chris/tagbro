/**
 * Directly user-facing functionality, called via chat commands.
 * High level.
 */

const serverCounts = require("./depths/server-stats.js");
const {log, err} = require("./utils.js");
const constants = require("./constants.js");
const commandsInfo = require("./commands-info.js");

const config = require("../config.json");
const prefix = config.prefix;

// Map full command names to relevant functions.
const commandFunctions = {
    [commandsInfo.info.server_stats]: giveSortedServerStats,
    [commandsInfo.info.rpugs_matchmaking]: giveRankedPugsMatchmakingLink
};
//TODO: incorporate private commands into this delegate, but still keep the actual functions in their own module.
//tagbro.js shudnt have to import private-functions.js

exports.delegateCommandMessage = async function(message) {
    const args = message.content.slice(config.prefix.length).trim().split(/[ |\t]+/g);
    const command = args.shift().toLowerCase();
    if (commandFunctions.has(command) || commandsInfo.commandAliases.has(command)) {
        log("Responding to `" + prefix + command + "`.");
        let commandFunction = null;
        commandFunction = commandFunctions.has(command) ? commandFunctions[command] : commandFunction;
        commandFunction = commandsInfo.commandAliases.has(command) ? commandsInfo.commandAliases[command] : commandFunction;
        if (commandsInfo.info[command].args) commandFunction(message, args);
        else commandFunction(message);
    }
};

giveSortedServerStats = async function(message) {
    let sortedServerCountsMessage = await serverCounts.getSortedServerStatsMessage();
    if (message.guild.id === constants.oltpDiscId) {
        message.channel.send(sortedServerCountsMessage + "\n*also see #tagbro-bot channel*");
    } else {
        message.channel.send(sortedServerCountsMessage);
    }
};

giveRankedPugsMatchmakingLink = function(message) {
    message.channel.send("<" + constants.rpugsAddress + ">");
};

//TODO: ..help