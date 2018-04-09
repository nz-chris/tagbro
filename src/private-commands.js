/**
 * Commands only usable by Zagd.
 */

const constants = require("./constants.js")
const {log, err} = require("./utils.js");

exports.echo = function(message, argsString) {
    if (notZagd(message)) return;
    message.delete().catch(err);
    message.channel.send(argsString);
};

function notZagd(message) {
    return message.author.tag !== constants.zagdTag;
}