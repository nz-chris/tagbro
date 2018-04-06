const axios = require("axios");
const config = require("./config.json");
const prefix = config.prefix;

function main() {
    giveServerCounts()
}

const servers = [
    "Diameter",
    "Centra",
    "Sphere",
    "Origin",
    "Radius",
    "Pi",
    "Orbit",
    "Chord",
];

const serverAddresses = {
    "Diameter": "http://tagpro-diameter.koalabeast.com/",
    "Centra": "http://tagpro-centra.koalabeast.com/",
    "Sphere": "http://tagpro-sphere.koalabeast.com/",
    "Origin": "http://tagpro-origin.koalabeast.com/",
    "Radius": "http://tagpro-radius.koalabeast.com/",
    "Pi": "http://tagpro-pi.koalabeast.com/",
    "Orbit": "http://tagpro-orbit.koalabeast.com/",
    "Chord": "http://tagpro-chord.koalabeast.com/"
};

function giveServerCounts() {
    log("Responding to " + prefix + "server count.");
    let serverCounts = "";
    let count = 0;  // Amount of completed axios gets.
    for (let i = 0; i < servers.length; i++) {
        let server = servers[i];
        let address = serverAddresses[server];
        axios.get(address + "stats").then(function (response) {
            count++;
            let data = response.data;
            serverCounts = serverCounts.concat(
                pad(" ".repeat(10), server + ":", false) +
                pad("00", data.players, true) +
                " players and " +
                pad("00", data.games, true) +
                " games.\n"
            );
            if (count === servers.length) {
                log(serverCounts);
            }
        }).catch(function (error) {
            console.log(error);
        });
    }
}

function pad(pad, str, padLeft) {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

function log(message) {
    console.log(message);
}

main();