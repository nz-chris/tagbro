const axios = require('axios');
const { JSDOM } = require('jsdom');
const { range } = require('lodash');
const pluralize = require('pluralize');

const constants = require('../constants');
const { err } = require('../utils/logging');
const { getHouses } = require('../utils/guilds');
const table = require('../utils/table');

const messageUpdateIntervals = {};

module.exports = {
    updateMessageOnInterval: (messagePrefix, time) => {
        if (messageUpdateIntervals.hasOwnProperty(messagePrefix)) {
            err(`Already updating the message with the prefix: ${messagePrefix.replace(new RegExp('\n', 'g'), '')}`)
        }
        const updateFunction = async () => {
            const newContent = await contentCallbacksByPrefix[messagePrefix]();
            if (!newContent) return;
            for (const house of getHouses()) {
                getExistingMessageByPrefix(house, messagePrefix).then(existingMessage => {
                    if (existingMessage) existingMessage.edit(newContent).catch(err);
                    else house.send(newContent).catch(err);
                });
            }
        };
        updateFunction().then(() => {
            messageUpdateIntervals[messagePrefix] = setInterval(updateFunction, time);
            intervals.add(Object.values(messageUpdateIntervals));
        })
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

const getNewStatsMessageContent = async () => {
    const data = await getStatsData();
    if (!data) return;
    const oceData = data.Oceania;
    return constants.serverStatsMessagePrefix +
        `**__${oceData.ingame}__** ${pluralize('players', oceData.ingame)} in ` +
        `**__${oceData.games}__** ${pluralize('games', oceData.games)} ` +
        `(**__${oceData.matchmaking}__** in matchmaking).` +
        `\n*updated every minute*`;
};

const getNewLastMatchMessageContent = async () => {
    const matchId = await getLastPublicMatchId();
    if (!matchId) return;

    const matchResponse = await axios.get(`${constants.eua}${constants.euaMatchDataSuffix}${matchId}`);
    const matchData = matchResponse.data;

    const matchDuration = matchData.duration / 60;

    const messageStart = `${constants.lastMatchMessagePrefix} <t:${Math.round(matchData.date + matchDuration)}:R>:\n`;

    const myTickPrefix = '√ ';

    const hhmmssDuration = new Date(matchDuration * 1_000).toISOString().substr(11, 8);
    const trimmedDuration = hhmmssDuration.slice(hhmmssDuration.match(/[1-9]/).index);
    const getTeamPlayers = team => matchData.players
        .filter(player => player.team === team)
        .map(player => `${player.auth ? myTickPrefix : ''}${player.name}`)
        .join('\n');
    const redPlayers = getTeamPlayers(1);
    const bluePlayers = getTeamPlayers(2);

    const matchAddress = `${constants.eua}${constants.euaMatchSuffix}${matchId}`;

    const matchHtmlResponse = await axios.get(matchAddress);
    const dom = new JSDOM(matchHtmlResponse.data);
    const tbody = dom.window.document.body.querySelector('tbody');
    const subsRow = [...tbody.rows].find(row => row.querySelector('th')?.textContent === 'Substitutes');
    const euAuthTick = '✓';
    const [redSubs, blueSubs] = [...subsRow.querySelectorAll('td')]
        .map(cell => {
            const players = [];
            let currentPlayer = '';
            [...cell.childNodes].forEach(node => {
                if (node.nodeName === 'BR' && currentPlayer) {
                    players.push(currentPlayer);
                    currentPlayer = '';
                } else if (node.nodeName === 'SMALL' && node.textContent.trim() === euAuthTick) {
                    currentPlayer = `${myTickPrefix}${currentPlayer}`;
                } else if (node.nodeName !== 'SMALL') {
                    currentPlayer += node.textContent.trim();
                }
            });

            return players.join('\n');
        });

    const wasSubs = redSubs || blueSubs;

    const tableData = [
        ['Map', { span: 2, text: matchData.map.name }],
        ['Duration', { span: 2, text: trimmedDuration }],
        ['Score', { text: `Red ${matchData.teams[0].score}`, align: 'r' }, `${matchData.teams[1].score} Blue` ],
        [wasSubs ? 'Starters' : 'Players', { text: redPlayers, align: 'r' }, bluePlayers],
        ...wasSubs ? [['Subs', { text: redSubs, align: 'r' }, blueSubs]] : [],
    ];

    return `${messageStart}\`\`\`${table(tableData)}\`\`\`` +
        `\n*according to ${matchAddress}*` +
        `\n*updated every 2 minutes*`;
};

const contentCallbacksByPrefix = Object.freeze({
    [constants.serverStatsMessagePrefix]: getNewStatsMessageContent,
    [constants.lastMatchMessagePrefix]: getNewLastMatchMessageContent,
});

const getStatsData = async () => {
    try {
        const response = await axios.get(`${constants.tpa}stats`);
        return response.data;
    } catch (e) {
        err('Failed to get server stats.');
        err(e);
    }
};

const getLastPublicMatchId = () => new Promise(async resolve => {
    const maxPages = 10;
    for (let page of range(maxPages)) {
        page += 1;
        const matchesResponse = await axios.get(`${constants.eua}${constants.euaSydneyMatchesSuffix}${page}`);
        const dom = new JSDOM(matchesResponse.data);
        const tbody = dom.window.document.body.querySelector('tbody');
        const rows = [...tbody.rows];
        const firstPubRow = rows.find(row => row.querySelector('td.matches-public'));
        if (firstPubRow) resolve(firstPubRow.cells[0].textContent.slice(1));
        else if (page === maxPages) resolve(undefined);
    }
});
