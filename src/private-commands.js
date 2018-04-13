/**
 * Commands only usable by Zagd.
 */

const {log, err} = require("./utils.js");
const constants = require("./constants.js");
const commandsInfo = require("./commands-info.js");

exports.functions = {
    [commandsInfo.names.echo]: echo,
};

function echo(message, argsString) {
    if (notZagd(message)) return;
    message.delete().catch(log("Could not delete the message."));
    message.channel.send(argsString.join(" "));
}

function notZagd(message) {
    return message.author.tag !== constants.zagdTag;
}