/**
 * Low level server count functionality.
 */

const axios = require('axios')

const utils = require('../utils.js')
const { log, err } = require('../utils.js')
const constants = require('../constants.js')
const commandsInfo = require('../commands-info.js')

const config = require('../../config.json')

module.exports = {
    getSortedServerStatsMessage: async function () {
        let sortedServerStatsMessage = ''
        let sortedServerStats = await getSortedServerStats()
        let largestPlayerCountDigits = getLargestPlayerCount(sortedServerStats).toString().length
        let largestGameCountDigits = getLargestGameCount(sortedServerStats).toString().length
        for (let i = 0; i < sortedServerStats.length; i++) {
            sortedServerStatsMessage = sortedServerStatsMessage.concat(
                formatServerStats(sortedServerStats[i], largestPlayerCountDigits, largestGameCountDigits) +
                ' <' + constants.serverAddresses[sortedServerStats[i][0]] + '>',
            )
            if (i !== sortedServerStats.length - 1) {
                sortedServerStatsMessage = sortedServerStatsMessage.concat('\n')
            }
        }
        return sortedServerStatsMessage
    },

    setUpIntervalUpdates: function (bot) {
        let oltpGuild
        let tagbroBotChannel
        let existingServerStatsMessage
        log(bot.guilds)
        if (bot.guilds.has(constants.oltpDiscId)) {
            oltpGuild = bot.guilds.get(constants.oltpDiscId)
            if (oltpGuild.channels.has(constants.tagbrobotChannelId)) {
                tagbroBotChannel = oltpGuild.channels.get(constants.tagbrobotChannelId)
                tagbroBotChannel.fetchMessage(constants.serverStatsMessageId)
                    .then(message => {
                        existingServerStatsMessage = message
                        updateServerStatsMessage(existingServerStatsMessage)
                    })
                    .catch(err)
            }
        }
        let minutes = 2, the_interval = minutes * 60 * 1000
        setInterval(function () {
            if (existingServerStatsMessage !== undefined) {
                updateServerStatsMessage(existingServerStatsMessage)
            }
        }, the_interval)
    },
}

async function getSortedServerStats() {
    try {
        const response = await axios['get'](`${constants.tpa}stats`)
        const data = response.data
        return constants.servers.map(server => [server, data[server].ingame, data[server].games])
    } catch (error) {
        err('Failed axios get.')
        return []
    }
}

function updateServerStatsMessage(existingServerStatsMessage) {
    log('Updating server counts message.')
    module.exports.getSortedServerStatsMessage().then(response => {
        let sortedServerStatsMessage = response
        let diamSplitIndex = sortedServerStatsMessage.indexOf('>\n') + '>\n'.length
        let newServerStatsMessage = 'Server counts:\n\n'
        newServerStatsMessage = newServerStatsMessage.concat(sortedServerStatsMessage.slice(0, diamSplitIndex))
        newServerStatsMessage = newServerStatsMessage.concat('\n*Other servers:*\n')
        newServerStatsMessage = newServerStatsMessage.concat(sortedServerStatsMessage.slice(diamSplitIndex))
        newServerStatsMessage = newServerStatsMessage.concat(
            '\n*updated every 2 minutes. use `' + config.prefix + commandsInfo.commands.server_stats.alias + '` to manually check.*',
        )
        existingServerStatsMessage.edit(newServerStatsMessage)
    }).catch(err)
}

function sortServerStats(serverStats) {
    let sortedServerStats = []
    for (let i = 0; i < constants.servers.length; i++) {
        let server = constants.servers[i]
        let serverData = serverStats[server]
        sortedServerStats.push([server, serverData[0], serverData[1]])
    }
    return sortedServerStats
}

function formatServerStats(serverStats, playerCountPadSize, gameCountPadSize) {
    let server = serverStats[0]
    let serverPlayers = serverStats[1]
    let serverGames = serverStats[2]
    let playersWord = 'player'
    let gamesWord = 'game'
    if (serverPlayers !== 1) {
        playersWord = playersWord.concat('s')
    } else {
        playersWord = playersWord.concat(constants.spaceZws)
    }
    if (serverGames !== 1) {
        gamesWord = gamesWord.concat('s')
    } else {
        gamesWord = gamesWord.concat(constants.spaceZws)
    }
    return '`' + utils.pad(' '.repeat(10), server + ':', false) +
        utils.pad(' '.repeat(playerCountPadSize), serverPlayers, true) + ' ' + playersWord + ' and ' +
        utils.pad(' '.repeat(gameCountPadSize), serverGames, true) + ' ' + gamesWord + '`'
}

function getLargestPlayerCount(serverStats) {
    return getLargestServerStat(serverStats, 1)
}

function getLargestGameCount(serverStats) {
    return getLargestServerStat(serverStats, 2)
}

function getLargestServerStat(serverStats, index) {
    let maxSoFar = -1
    for (let i = 0; i < serverStats.length; i++) {
        let serverStat = serverStats[i]
        for (let j = 0; j < serverStat.length; j++) {
            maxSoFar = Math.max(maxSoFar, serverStat[index])
        }
    }
    return maxSoFar
}