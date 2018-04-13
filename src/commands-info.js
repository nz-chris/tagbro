const config = require("../config.json");

exports.commands = {
    "help": {
        "index": 0,
        "alias": null,
        "description": "Get a direct message containing helpful information on how to use TagBro.",
        "args": null,
        "validArgValues": null,
        "argDescriptions": null,
        "validArgValueDescriptions": null
    },
    "server_stats": {
        "index": 1,
        "alias": "ss",
        "description": "Get a reply in the same channel with the amount of players and games on every server, with " +
        "links to each server.",
        "args": null,
        "validArgValues": null,
        "argDescriptions": null,
        "validArgValueDescriptions": null
    },
    "rpugs_matchmaking": {
        "index": 2,
        "alias": "rpm",
        "description": "Get a reply in the same channel with a link to Lej's Ranked PUGs matchmaking.",
        "args": null,
        "validArgValues": null,
        "argDescriptions": null,
        "validArgValueDescriptions": null
    },
    "install_link": {
        "index": 3,
        "alias": "il",
        "description": "Get a reply in the same channel with a two-click install link for a given user-script.",
        "args": ["SCRIPT-NICKNAME"],
        get validArgValues() {
            return [[
                ["Any user-script nickname from the results of `" + config.prefix + exports.names.install_links + " " +
                exports.commands.install_links.args.join(" ") + "`", false]
            ]];
        },
        "argDescriptions": ["The reference nickname of the user-script."],
        "validArgValueDescriptions": null
    },
    "install_links": {
        "index": 4,
        "alias": "ils",
        get description() {
            return "Get a reply with a list of potential user-scripts that can be obtained via" +
                " `" + config.prefix + exports.names.install_link + " " + exports.commands.install_link.args.join(" ") + "`."
        },
        "args": ["REPLY-DESTINATION"],
        "validArgValues": [[["here", true], ["me", true]]],
        "argDescriptions": ["Where the reply should be sent."],
        "validArgValueDescriptions": [["In the same channel", "In direct message to the command's user."]]
    },
    "echo": {
        "index": 5,
        "private": true,
        "alias": "e",
        "description": "Get a reply in the same channel, with the same message contents (excluding the command itself).",
        "args": ["MESSAGE"],
        "validArgValues": [[["Anything. Encase in double quotes to include spaces.", false]]],
        "argDescriptions": ["The message to be sent."],
        "validArgValueDescriptions": null
    }
};

// Create an object with command names as keys and values, like {"name1": "name1"}.
// Think of it as an enum.
exports.names = Object.freeze(Object.keys(exports.commands).reduce(function(result, item) {
    result[item] = item;
    return result;
}, {}));

// Map command aliases to full command names.
aliases = {};
for (let i = 0; i < Object.keys(exports.commands).length; i++) {
    let fullName = Object.keys(exports.commands)[i];
    let alias = exports.commands[fullName].alias;
    if (alias !== null) {
        aliases[alias] = fullName;
    }
}
exports.aliases = aliases;

//TODO: create sanity/error check for above stuff
/*
Example assertions:
- indexes go from 0-len, no repeats
- commands["command-name"].args.length === commandsInfo["command-name"].argDescriptions.length for all command names
- validArgValues.forEach(ele => typeof ele === list)
- set(names) completely disjoint from set(aliases)
- len set(names) === len names, same for aliases.
 */