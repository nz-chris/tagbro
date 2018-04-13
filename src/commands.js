/**
 * Directly user-facing functionality, called via chat commands.
 * High level.
 */

const privateCommands = require("./private-commands.js");
const serverCounts = require("./depths/server-stats.js");
const {log, err} = require("./utils.js");
const constants = require("./constants.js");
const commandsInfo = require("./commands-info.js");

const config = require("../config.json");
const prefix = config.prefix;

// Map full command names to relevant functions.
const commandFunctions = {
    [commandsInfo.names.help]: giveHelp,
    [commandsInfo.names.server_stats]: giveSortedServerStats,
    [commandsInfo.names.rpugs_matchmaking]: giveRankedPugsMatchmakingLink
};

exports.delegateCommandMessage = async function(message) {
    const args = message.content.slice(prefix.length).trim().split(/\s+/g);
    let command = args.shift().toLowerCase();
    if (commandsInfo.commands.hasOwnProperty(command) || commandsInfo.aliases.hasOwnProperty(command)) {
        log("Responding to `" + prefix + command + "`.");

        // If the given command was an alias, convert it to the full name.
        command = commandsInfo.names.hasOwnProperty(command) ? commandsInfo.names[command] : command;
        command = commandsInfo.aliases.hasOwnProperty(command) ? commandsInfo.aliases[command] : command;

        let commandFunction = null;
        commandFunction = commandFunctions.hasOwnProperty(command) ? commandFunctions[command] : commandFunction;
        commandFunction = privateCommands.functions.hasOwnProperty(command) ? privateCommands.functions[command] : commandFunction;

        message.channel.startTyping();
        try {
            await commandFunction(message, args, command);
        } catch (error) {
            err(error)
        }
        message.channel.stopTyping(true);
    }
};

function giveHelp(message) {
    let helpMessage = "__**Help**__\n**Prefix**: `" + prefix + "`\n";
    helpMessage = helpMessage.concat("**Usage**: `" + prefix + "(command|alias) [ARGUMENTS...]`\n");
    helpMessage = helpMessage.concat(
        "*`[ARGUMENTS...]` are space separated. If you require a space to be a part of a " +
        "single argument, encase the argument in double quotes: `\"SINGLE ARGUMENT\"`.*\n\n");
    let commandHelps = [];
    for (let i = 0; i < Object.keys(commandsInfo.commands).length; i++) {
        let commandName = Object.keys(commandsInfo.commands)[i];
        let commandHelp = getCommandHelp(commandName);
        if (commandHelp) {
            commandHelp = commandHelp.concat("\n\n");
            // Remove extra two newlines at the end.
            if (i === Object.keys(commandsInfo.commands).length - 1) {
                commandHelp = commandHelp.slice(0, -2);
            }

            commandHelps[commandsInfo.commands[commandName].index] = commandHelp;
        }
    }
    helpMessage = helpMessage.concat(commandHelps.join(""));
    message.author.send(helpMessage).catch(err);
    message.react("✅").catch(err);
}

function getCommandHelp(commandName) {
    let command = commandsInfo.commands[commandName];
    if (command.private) return false;

    // Build first line "`prefix(command) [ARGUMENTS...]`".
    let commandHelp = "**`" + prefix + commandName;
    if (command.args !== null && command.args.length > 0) {
        commandHelp = commandHelp.concat(" " + command.args.join(" ") + "`**\n");
    } else {
        commandHelp = commandHelp.concat("`**\n")
    }

    if (command.alias !== null) {
        commandHelp = commandHelp.concat("__*Alias*__: `" + command.alias + "`\n");
    }
    commandHelp = commandHelp.concat("__*Description*__: " + command.description);

    // Build arguments lines.
    if (command.args !== null) {
        commandHelp = commandHelp.concat("\n__*Arguments*__:\n");
        for (let i = 0; i < command.args.length; i++) {
            let argName = command.args[i];
            let argDescription = command.argDescriptions[i];
            let validArgValues = command.validArgValues[i];
            commandHelp = commandHelp.concat("`" + argName + "` " + argDescription + "\n");
            commandHelp = commandHelp.concat("*Valid values*: ");
            for (let j = 0; j < validArgValues.length; j++) {
                let value = validArgValues[j][0];
                let isExact = validArgValues[j][1];
                if (command.validArgValueDescriptions !== null && command.validArgValueDescriptions[i] !== null) {
                    let validArgValueDescription = command.validArgValueDescriptions[i][j];
                    commandHelp = commandHelp.concat(
                        "`".repeat(isExact) + value + "`".repeat(isExact) + " (" + validArgValueDescription + "), "
                    );
                } else {
                    commandHelp = commandHelp.concat("`".repeat(isExact) + value + "`".repeat(isExact) + ", ");
                }
                // Remove extra comma and space at the end.
                if (j === validArgValues.length - 1) {
                    commandHelp = commandHelp.slice(0, -2);
                }
            }
        }
    }
    return commandHelp;
}

async function giveSortedServerStats(message) {
    try {
        let sortedServerCountsMessage = await serverCounts.getSortedServerStatsMessage();
        if (message.guild.id === constants.oltpDiscId) {
            message.channel.send(sortedServerCountsMessage + "\n*also see #tagbro-bot channel*");
        } else {
            message.channel.send(sortedServerCountsMessage);
        }
    } catch (error) {
        err(error);
    }
}

function giveRankedPugsMatchmakingLink(message) {
    message.channel.send("<" + constants.rpugsAddress + ">");
}