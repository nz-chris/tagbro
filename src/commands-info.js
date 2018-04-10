const config = require("../config.json");
const prefix = config.prefix;

exports.info = {
    "server_stats": {
        "alias": "ss",
        "description": "Get a reply in the same channel with the amount of players and games on every server, with " +
        "links to each server.",
        "args:": null,
        "validArgValues": null,
        "argDescriptions": null,
        "validArgValueDescriptions": null
    },
    "rpugs_matchmaking": {
        "alias": "rpm",
        "description": "Get a reply in the same channel with a link to Lej's Ranked PUGs matchmaking.",
        "args:": null,
        "validArgValues": null,
        "argDescriptions": null,
        "validArgValueDescriptions": null
    },
    "install_link": {
        "alias": "il",
        "description": "Get a reply in the same channel with a two-click install link for a given user-script.",
        "args:": ["SCRIPT-NICKNAME"],
        "validArgValues": Math.POSITIVE_INFINITY,
        "argDescriptions": [
            "The reference nickname of the user-script. Use `" + prefix + "install_links` to discover nicknames."
        ],
        "validArgValueDescriptions": null
    },
    "install_links": {
        "alias": "ils",
        get description() {
            return "Get a reply with a list of potential user-scripts that can be obtained via" +
                " `" + prefix +"install_link " + this.install_link.args.join(" ") + "`."
        },
        "args": ["REPLY-DESTINATION"],
        "validArgValues": [["here", "me"]],
        "argDescriptions": ["Where the reply should be sent."],
        "validArgValueDescriptions": [["In the same channel", "In direct message to the command's user."]]
    }
};

// Map command aliases to full command names.
exports.commandAliases = {
    [exports.info.server_stats.alias]: exports.info.server_stats,
    [exports.info.rpugs_matchmaking.alias]: exports.info.rpugs_matchmaking,
    [exports.info.install_link.alias]: exports.info.install_link
};

//TODO: create sanity/error check for above object
/*
Example assertions:
- commandsInfo["command-name"].args.length === commandsInfo["command-name"].argDescriptions.length
- validArgValues.forEach(ele => typeof ele === list)
 */