const pluralize = require('pluralize');

const constants = require('../constants');
const { err } = require('../utils/logging');
const {
    getLatestPubId,
    getMatchData,
    getMatchDurationString,
    getMatchTimeStampString,
    getPlayers,
} = require('../data/tagproEu');
const { getHouses } = require('../utils/guilds');
const table = require('../utils/table');
const serverStats = require('../messages/serverStats');

const messageUpdateIntervals = {};

module.exports = {
    updateMessageOnInterval: (messagePrefix, minutes) => {
        if (messageUpdateIntervals.hasOwnProperty(messagePrefix)) {
            err(`Already updating the message with the prefix: ${messagePrefix.replace(new RegExp('\n', 'g'), '')}`);
        }

        const updateFunction = async () => {
            const newContent = await contentCallbacksByPrefix[messagePrefix](minutes);
            if (!newContent) return;

            for (const house of getHouses()) {
                getExistingMessageByPrefix(house, messagePrefix).then(existingMessage => {
                    if (existingMessage) existingMessage.edit(newContent).catch(err);
                    else house.send(newContent).catch(err);
                });
            }
        };

        updateFunction().then(() => {
            messageUpdateIntervals[messagePrefix] = setInterval(updateFunction, minutes * 60_000);
            intervals.add(Object.values(messageUpdateIntervals));
        });
    },
};

const getExistingMessageByPrefix = (house, prefix) => new Promise(resolve => {
    const filter = message => (
        message.author.id === bot.user.id &&
        message.content.startsWith(prefix) &&
        !message.deleted
    );
    const message = house.messages.cache.find(filter);
    if (message) resolve(message);
    else house.messages.fetch().then(collected => {
        collected = collected.filter(filter);
        resolve(collected.first());
    });
});

const getNewStatsMessageContent = async (updateMinutesPeriod) => {
    const baseMessage = await serverStats.getMessage();

    if (baseMessage) {
        return `${constants.serverStatsMessagePrefix}${baseMessage}${getUpdatePeriodString(updateMinutesPeriod)}`;
    }
};

const getNewLastMatchMessageContent = async (updateMinutesPeriod) => {
    const matchId = await getLatestPubId();
    if (!matchId) return;

    const matchData = await getMatchData(matchId);
    if (!matchData) return;

    const messageStart = `${constants.lastMatchMessagePrefix} ${getMatchTimeStampString(matchData)}:\n`;

    const players = await getPlayers(matchData);

    const wasSubs = players.red.subs.length || players.blue.subs.length;

    const tableData = [
        ['Map', { span: 2, text: matchData.map.name }],
        ['Duration', { span: 2, text: getMatchDurationString(matchData) }],
        ['Score', { text: `Red ${matchData.teams[0].score}`, align: 'r' }, `${matchData.teams[1].score} Blue`],
        [
            wasSubs ? 'Starters' : 'Players',
            { text: getPlayersListString(players.red.starters), align: 'r' },
            getPlayersListString(players.blue.starters),
        ],
        ...wasSubs ? [
            [
                'Subs',
                { text: getPlayersListString(players.red.subs), align: 'r' },
                getPlayersListString(players.blue.subs)],
        ] : [],
    ];

    return `${messageStart}\`\`\`${table(tableData)}\`\`\`` +
        `\n*according to ${constants.eua}${constants.euaMatchSuffix}${matchId}*` +
        getUpdatePeriodString(updateMinutesPeriod);
};

const getPlayersListString = players => players
    .map(player => `${player.auth ? '√ ' : ''}${player.name}`)
    .join('\n');

const contentCallbacksByPrefix = Object.freeze({
    [constants.serverStatsMessagePrefix]: getNewStatsMessageContent,
    [constants.lastMatchMessagePrefix]: getNewLastMatchMessageContent,
});

const getUpdatePeriodString = updateMinutesPeriod => `\n*updated every ${getMinutesString(updateMinutesPeriod)}*`

const getMinutesString = minutes => minutes === 1 ? 'minute' : pluralize('minutes', minutes, true);
