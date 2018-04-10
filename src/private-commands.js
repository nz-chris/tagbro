/**
 * Commands only usable by Zagd.
 */

const {log, err} = require("./utils.js");
const constants = require("./constants.js");

exports.echo = function(message, argsString) {
    if (notZagd(message)) return;
    message.delete().catch(err);
    message.channel.send(argsString);
};

function notZagd(message) {
    return message.author.tag !== constants.zagdTag;
}