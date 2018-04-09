/**
 * Directly user-facing functionality, called via chat commands.
 * High level.
 */

const serverCounts = require("./depths/server-counts.js");
const constants = require("./constants.js");

exports.giveSortedServerCounts = async function(message) {
    let sortedServerCountsMessage = await serverCounts.getSortedServerCountsMessage();
    if (message.guild.id === constants.oltpDiscId) {
        message.channel.send(sortedServerCountsMessage + "\n*also see #tagbro-bot channel*");
    } else {
        message.channel.send(sortedServerCountsMessage);
    }
};

exports.giveRankedPugsMatchmakingLink = function(message) {
    message.channel.send("<" + constants.rpugsAddress + ">");
};

//TODO: ..help